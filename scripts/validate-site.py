from pathlib import Path
import re
import sys
from html import unescape

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://www.hubcarbon.com"
LANGS = {"en": "", "pt": "pt", "es": "es", "fr": "fr"}

errors = []

def fail(path, message):
    errors.append(f"{path}: {message}")

pages = sorted(ROOT.rglob("*.html"))
for path in pages:
    text = path.read_text(encoding="utf-8")
    rel = path.relative_to(ROOT).as_posix()
    if path.name == "404.html":
        continue

    m = re.search(r'<html[^>]+lang="([^"]+)"', text, re.I)
    if not m:
        fail(rel, "missing html lang")
    lang = m.group(1) if m else ""

    if not re.search(r"<title>\s*.+?\s*</title>", text, re.I | re.S):
        fail(rel, "missing title")
    if not re.search(r'<meta name="description" content="[^"]+">', text, re.I):
        fail(rel, "missing meta description")
    if not re.search(r'<link rel="canonical" href="https://www\.hubcarbon\.com/[^"]*">', text, re.I):
        fail(rel, "missing canonical")
    if 'property="og:image"' not in text:
        fail(rel, "missing og:image")
    if 'name="twitter:card"' not in text:
        fail(rel, "missing twitter card")
    if 'application/ld+json' not in text:
        fail(rel, "missing JSON-LD")
    for hreflang in ("en", "pt", "es", "fr", "x-default"):
        if f'hreflang="{hreflang}"' not in text:
            fail(rel, f"missing hreflang={hreflang}")
    if "/favicon.png" not in text and "/favicon.ico" not in text:
        fail(rel, "missing favicon reference")

# Ensure each localized page has a matching page in all four languages.
stems = {}
for path in pages:
    if path.name == "404.html":
        continue
    rel = path.relative_to(ROOT).as_posix()
    parts = rel.split("/")
    if parts[0] in ("pt", "es", "fr"):
        stem = "/".join(parts[1:])
        stems.setdefault(stem, set()).add(parts[0])
    elif parts[0] == "pages":
        stems.setdefault(rel, set()).add("en")
    elif rel == "index.html":
        stems.setdefault("index.html", set()).add("en")
    else:
        continue

for stem, present in stems.items():
    if present != set(LANGS):
        fail(stem, "language parity incomplete: " + ",".join(sorted(present)))

if errors:
    print("\n".join(errors))
    sys.exit(1)

print(f"Site validation passed: {len(pages)} HTML files checked.")
