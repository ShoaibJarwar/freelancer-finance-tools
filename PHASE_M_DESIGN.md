# Phase M — Design

## Pages (all use the existing `GuideLayout`)
| Route | Purpose |
|---|---|
| `/about` | What the site is, how it treats numbers (verified/reference/ceiling/unresolved), what it is not. No named person or entity — none exists in the repo. |
| `/contact` | **No contact mechanism exists.** The page says so plainly and points users to the official provider sources for pricing questions. No invented address, no inert form. Reported as `CONTACT_INFRASTRUCTURE_REQUIRED`. |
| `/privacy` | Describes only what the audit verified: no accounts, cookies, storage, analytics, ads, database, or network calls from app code; query-string input mirroring; clipboard copy is local; hosting infrastructure caveat; outbound source links; Search Console verification tag. No legal-framework claims, no retention periods. |
| `/terms` | Short: informational tool, no advice, no accuracy guarantee, provider pricing changes, reference rates, acceptable use, content, changes. No entity, no jurisdiction. |
| `/affiliate-disclosure` | States that there are currently **no** affiliate links or relationships, and what would happen if that changes. |

## Actual practices (source for the Privacy page)
See `PHASE_M_AUDIT.md` §5. Nothing in the policy goes beyond that list.

## Contact decision
Classification C. The page is kept short and honest rather than faking a form. It stays indexable and in the sitemap as the brief specifies; thinness is flagged as a launch issue.

## Footer
Four columns, all real links: Tools (2), Guides (4), Company (About, Contact), Legal (Privacy, Terms, Affiliate Disclosure). Adds one visible informational-only line linking to Terms. The "working title" copyright suffix is removed.

## Header
Adds the two tools to `nav-items.ts`. No guides index page exists, so guides stay reachable via footer/homepage rather than a dead nav item.

## Metadata fixes
Layout title template/description cleaned of "working title"/"Placeholder"; homepage gets a real `metadata` export (absolute title).

## Copy fixes
Homepage calculator card and two CTAs reworded to match the project's "amount after platform fee" language. H1 and preview wording left for an owner decision.

## Sitemap
12 entries: the 7 existing + the 5 new pages. No query strings.

## Robots
Not created: an `app/robots.ts` that advertises the sitemap needs an absolute production URL, and the only available fallback is localhost. Absence does not block crawling. Revisit when the domain is chosen.

## Unresolved launch issues
Contact channel; final brand/domain; robots/sitemap URL; homepage positioning copy; guides index; calculator heading skip; whether the operator wants the stated affiliate commitments.
