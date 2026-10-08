# Phase K — Comparison UX, Shareable State & SEO Content

Status: UX/discoverability improvements to the existing comparison page. No new financial rules.

## 1. URL-state schema

| Param | Meaning | Values | Default |
|---|---|---|---|
| `amount` | Client payment, raw string | any string | `""` |
| `contract` | Upwork contract type | `marketplace` \| `direct` | `marketplace` |
| `fee` | Marketplace fee percentage, raw string | any string | `""` |
| `plus` | Freelancer Plus checkbox | `1` = on | off |
| `reference` | PKR reference conversion toggle | `pk` = on | off |

No result amount, fee amount, exchange-rate output, or timestamp is ever encoded.

## 2. Parsing/validation

`parseComparisonUrlState` never throws. `amount`/`fee` pass through as raw strings into the same `validateAmountInput`/`validatePercentageInput` functions typed input uses — no second, weaker validation path.

## 3. Share / Reset

Share copies the URL via Clipboard API with accessible feedback, no third-party service. Reset clears state and strips the query string.

## 4. Browser/history behavior

URL syncs via a debounced (400ms) `useEffect` calling `router.replace` (never `push`).

## 5. UX restructuring

Input card retitled "Your inputs"; results open with a "Calculation" heading and one dynamically-generated summary sentence, replacing two previously near-duplicate disclaimer paragraphs.

## 6. SEO content

Added "Understanding this comparison" (3 short Q&A paragraphs) and "Related tools and guides".

## 7. Canonical / query-string behavior

Static `metadata` export means every query-string variation renders identical title/description — verified by diffing the base route against a populated query URL.

## 8. Tests

18 new tests in `comparisonUrlState.test.ts`.

## 9. Total test count

150 at the time (132 existing + 18 new).
