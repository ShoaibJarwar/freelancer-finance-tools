# Phase J — Payment Comparison UI Design

Status: first user-facing comparison page, built entirely on the Phase I engine.

## 1. Page purpose

`/tools/payment-comparison` lets a freelancer enter a client payment and see, stage by stage, what can actually be calculated about an Upwork contract and a Payoneer withdrawal to Pakistan.

## 2. Supported scenarios

- Platform: Upwork only (Marketplace, Direct Contracts, Direct Contracts + Freelancer Plus)
- Provider: Payoneer only, cross-currency withdrawal to Pakistan
- Optional reference conversion: USD → PKR via the SBP reference rate
- Wise: shown as a static, non-interactive note explaining why it isn't calculable (unresolved eligibility)

## 3. UI-to-calculation architecture

```
app/tools/payment-comparison/page.tsx   Server Component — metadata, static copy, Wise note
    ↓
components/comparison/PaymentComparisonForm.tsx   Client Component — the only one
    ↓
lib/calculations/comparison.ts (Phase I, untouched)
```

The reference conversion is deliberately built from the platform stage's result directly (not chained through the provider stage), since the provider stage is always `"ceiling"` and composing it would hide the reference figure too. The full `[platform, provider]` chain is still composed separately to surface its `not_calculable` status.

## 4. Status presentation

Every stage renders a `StatusTag` — plain text, never color-only.

## 5. Payoneer limitation

The Payoneer section never shows a dollar fee — only "Published ceiling: up to 2%" plus the stage's own `explanation` string from the data layer.

## 6. Reference FX limitation

Labeled "Reference PKR equivalent (of the amount after Upwork's fee)" — never "you receive"/"final payout".

## 7. Sources

Every result section renders a `SourceNote` reading `stage.sources[0]`.

## 8. Accessibility

Labels, `aria-describedby` error linking, `aria-live="polite"` result region, status always conveyed as text.

## 9. SEO

Single H1. Found and fixed a real gap: the shared `CardTitle` always renders `<h3>`, which would skip from `<h1>` straight to `<h3>` — fixed by adding a genuine `<h2>` ("Run the comparison") before the form, scoped to this new page only.

## 10. Intentionally unsupported

No Wise calculation, no exact Payoneer fee ever, no provider ranking, no withdrawal-method selector beyond Payoneer, no live FX, no accounts.
