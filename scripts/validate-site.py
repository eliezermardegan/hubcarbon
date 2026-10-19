"""Validate metadata, language reciprocity, internal links and conversion paths.

CI checks files on disk. A read-only GitHub tree inventory may supplement binary
asset existence for connector-only local checkouts; it never substitutes HTML.
"""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote, parse_qs
import argparse
import json
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SITE = 'https://www.hubcarbon.com'
LANGS = {'en': '', 'pt': 'pt/', 'es': 'es/', 'fr': 'fr/'}
parser = argparse.ArgumentParser()
parser.add_argument('--asset-inventory', type=Path)
args = parser.parse_args()
inventory = set(json.loads(args.asset_inventory.read_text())) if args.asset_inventory else set()
errors = []

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.tags = []
        self.ids = set()
        self.json_blocks = []
        self.json_text = None
        self.title = ''
        self.in_title = False
        self.h1_count = 0
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        self.tags.append((tag, a))
        if 'id' in a:
            if a['id'] in self.ids: errors.append(f'{self.path}: duplicate id {a["id"]}')
            self.ids.add(a['id'])
        if tag == 'h1': self.h1_count += 1
        if tag == 'title': self.in_title = True
        if tag == 'script' and a.get('type') == 'application/ld+json': self.json_text = ''
    def handle_endtag(self, tag):
        if tag == 'title': self.in_title = False
        if tag == 'script' and self.json_text is not None:
            try: self.json_blocks.append(json.loads(self.json_text))
            except ValueError: errors.append(f'{self.path}: invalid JSON-LD')
            self.json_text = None
    def handle_data(self, text):
        if self.in_title: self.title += text
        if self.json_text is not None: self.json_text += text
    def attrs(self, tag): return [a for t, a in self.tags if t == tag]

pages = {}
for path in sorted(ROOT.rglob('*.html')):
    rel = path.relative_to(ROOT).as_posix()
    page = Page(rel)
    page.feed(path.read_text(encoding='utf-8'))
    pages[rel] = page

def fail(rel, message): errors.append(f'{rel}: {message}')
def canon(rel): return SITE + '/' + (rel[:-10] if rel.endswith('index.html') else rel)
titles = set()
for rel, page in pages.items():
    if rel == '404.html': continue
    if page.h1_count != 1: fail(rel, 'expected one h1')
    if not page.title.strip(): fail(rel, 'missing title')
    title_key = (page.attrs('html')[0].get('lang'), page.title)
    if title_key in titles: fail(rel, 'duplicate title within a language')
    titles.add(title_key)
    if not any(a.get('lang') for a in page.attrs('html')): fail(rel, 'missing language')
    meta = {a.get('name', a.get('property')): a.get('content') for a in page.attrs('meta')}
    for key in ['description', 'og:title', 'og:description', 'og:url', 'og:image', 'twitter:card']:
        if not meta.get(key): fail(rel, 'missing '+key)
    canonical = [a.get('href') for a in page.attrs('link') if a.get('rel') == 'canonical']
    if canonical != [canon(rel)]: fail(rel, 'incorrect canonical')
    if meta.get('og:url') != canon(rel): fail(rel, 'incorrect og:url')
    if not page.json_blocks: fail(rel, 'missing structured data')
    if 'main-content' not in page.ids: fail(rel, 'missing main skip target')
    parts = rel.split('/')
    stem = '/'.join(parts[1:]) if parts[0] in ('pt', 'es', 'fr') else rel
    alts = {a.get('hreflang'): a.get('href') for a in page.attrs('link') if a.get('rel') == 'alternate'}
    for lang, prefix in LANGS.items():
        peer = prefix + stem
        if peer not in pages: fail(rel, 'missing language peer '+peer)
        if alts.get(lang) != canon(peer): fail(rel, 'incorrect hreflang '+lang)
    if alts.get('x-default') != canon(stem): fail(rel, 'incorrect x-default')
    for a in page.attrs('img'):
        if 'alt' not in a: fail(rel, 'image missing alt')
    if rel.endswith('contact.html'):
        forms = page.attrs('form')
        if len(forms) != 1 or forms[0].get('action') != 'https://formspree.io/f/xppzgddy': fail(rel, 'unexpected contact endpoint')
        options = [a.get('value') for a in page.attrs('option')]
        if 'platform' in options: fail(rel, 'deferred platform enquiry must not be published')

for rel, page in pages.items():
    for tag, a in page.tags:
        for attr in ('href', 'src'):
            target = a.get(attr)
            if not target: continue
            url = urlsplit(target)
            if url.scheme or url.netloc:
                if url.scheme not in ('http', 'https') or url.netloc != 'www.hubcarbon.com': continue
            clean = unquote(url.path)
            dest = (ROOT / clean.lstrip('/')) if clean.startswith('/') else (ROOT / rel).parent / clean
            if not clean: dest = ROOT / rel
            if clean.endswith('/') or dest.is_dir(): dest = dest / 'index.html'
            dest = dest.resolve()
            try: resolved = dest.relative_to(ROOT).as_posix()
            except ValueError: fail(rel, 'link escapes root: '+target); continue
            exists = dest.exists() or (resolved in inventory and dest.suffix != '.html')
            if not exists: fail(rel, 'missing '+attr+': '+target); continue
            if url.fragment and resolved in pages and unquote(url.fragment) not in pages[resolved].ids:
                fail(rel, 'missing anchor: '+target)
            topic = parse_qs(url.query).get('topic', [])
            if topic and resolved in pages:
                options = [v.get('value') for v in pages[resolved].attrs('option')]
                if topic[0] not in options: fail(rel, 'unknown enquiry topic: '+target)
try:
    sitemap = ET.parse(ROOT / 'sitemap.xml')
    locs = {n.text for n in sitemap.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')}
    expected = {canon(rel) for rel in pages if rel != '404.html'}
    if locs != expected: errors.append('sitemap: URLs differ from canonical HTML pages')
except (OSError, ET.ParseError) as exc: errors.append('sitemap: '+str(exc))
if errors:
    print('\n'.join(errors)); sys.exit(1)
print(f'PASS: {len(pages)} HTML files; metadata, language peers, links, anchors, enquiry topics and sitemap.')
