# Website improvements — 19 October 2026

## Scope and release decision

The owner authorised clear commercial, usability and technical improvements for production. The platform announcement is explicitly deferred. Keep the pre-existing infrastructure section unchanged; do not publish launch dates, feature lists, early-access offers or platform enquiries until the owner requests them.

## Seven workstreams

| Workstream | Delivered | Remaining evidence or operational dependency |
| --- | --- | --- |
| Positioning | Task-led homepage and routes for companies, developers, buyers/investors and technology partners | Choose a narrower acquisition priority using qualified opportunities and revenue evidence |
| Copy | Matching English, Portuguese, Spanish and French narratives; five solution pages with prospective scope, inputs and next steps | Commercial team should confirm contracted deliverables for each enquiry; no pricing or response SLA is invented |
| Trust | Working approach, responsibilities, verified existing company identity and explicit engagement boundaries | Add named team members, authorised partner relationships and customer cases only when supplied and verified |
| Conversion and engagement | Direct enquiry CTAs, allowlisted topic selection, required interest prompt, translated status messages, no-JS native submission and preparation resources | Verify mailbox delivery with an owner-authorised test; no real enquiry was submitted during development |
| Technical quality | Shared desktop/mobile navigation, accessible disclosure, cookie-dialog focus management, visible no-JS content, 404 root links and stronger CI validation | Browser/device visual QA remains outstanding; no supported browser skill was available in this managed session |
| SEO | Unique metadata within each language, reciprocal language URLs, sitemap, page and breadcrumb structured data, internal links and reference-based resource content | Verify Search Console ownership, indexing and real-user Core Web Vitals; no ranking or traffic gain is claimed |
| Rollout and measurement | Production checks, inactive metric integration hook and this follow-through plan | Select analytics/CRM destinations and review privacy/consent before activating collection |

## Measurement specification

The `window.hubCarbonMetrics` callback is undefined by default. No analytics provider, data layer, cookies, local analytics storage or tracking request is installed. Optional future adapters may receive:

- `cta_click`: an authored CTA identifier and language.
- `form_start`: language only.
- `form_success`: language and an allowlisted business topic, only after an accepted HTTP response.
- `form_error`: language only.

Do not send names, email addresses, message text, company names, query strings or full URLs through this hook. Update the notice and consent controls before enabling a provider. Formspree continues to process deliberately submitted business enquiries as described in the existing privacy notice.

The primary business measure should be qualified opportunities attributable to the website, connected to enquiries in the selected CRM. Supporting measures: CTA clicks, form starts, successful enquiries, meetings and proposals. Establish a baseline before proposing numeric improvement targets. Low traffic should favour qualitative enquiry review over underpowered A/B tests.

## Editorial and acquisition sequence

1. Use the existing resource page for practical, ungated inventory, project and credit-assessment checklists.
2. After team review, distribute one topic at a time through the company's approved LinkedIn account, linking to the relevant language/resource anchor. Nothing was posted or sent by this change.
3. Publish a case only after the client approves the relationship, scope, measured result, date and supporting evidence. An illustrative example must be labelled as such.
4. Prioritise further content using Search Console queries and actual sales questions. Avoid repeating generic climate narratives across pages.
5. Reassess after a meaningful enquiry sample; compare qualification and progression, not only page views.

## Source references for preparation resources

- https://ghgprotocol.org/corporate-standard
- https://ghgprotocol.org/scope-2-guidance
- https://ghgprotocol.org/corporate-value-chain-scope-3-standard
- https://icvcm.org/core-carbon-principles/

Checklists are introductory preparation aids, not certification, methodology implementation or legal advice. The site makes no claim of regulatory approval, guaranteed financing, independent verification or platform production readiness.

## Validation and rollback

Run `python3 scripts/validate-site.py`, `node --check js/main.js` and `node scripts/check-contact.js`. The contact checks mock HTTP and send no messages. CI validates actual repository assets; connector-only local checks can supply a read-only GitHub file inventory for binary asset existence.

Revert the release commit normally if needed; do not rewrite branch history. Preserve subsequent owner changes and the current GitHub Pages domain configuration.
