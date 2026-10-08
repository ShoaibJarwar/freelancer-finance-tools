import type { Metadata } from "next";
import Link from "next/link";
import { GuideLayout } from "@/components/content/GuideLayout";
import { Alert } from "@/components/ui/Alert";
import { SourceNote } from "@/components/ui/SourceNote";
import { Button } from "@/components/ui/Button";
import { fxReferenceRates } from "@/data/fx/reference-rates";
import { payoneerFeeScenarios } from "@/data/providers/payoneer";

export const metadata: Metadata = {
  title: "USD to PKR for Freelancers",
  description:
    "What a USD to PKR reference exchange rate is, why it isn't the same as what a payment provider actually gives you, and why this site labels its SBP-based conversion a reference rather than a payout.",
};

const usdToPkr = fxReferenceRates.find((r) => r.base === "USD" && r.quote === "PKR")!;
const crossCurrency = payoneerFeeScenarios.find(
  (s) => s.id === "payoneer-withdrawal-cross-currency-variable"
)!;

function pct(decimal: number): string {
  return `${decimal * 100}%`;
}

export default function UsdToPkrGuidePage() {
  return (
    <GuideLayout
      breadcrumbLabel="USD to PKR for Freelancers"
      title="USD to PKR for Freelancers"
      intro={
        <>
          If you&apos;re paid in USD and need PKR, the exchange rate you see
          quoted publicly — including the one this site uses — is usually a{" "}
          <span className="font-medium text-foreground">reference rate</span>,
          not the rate your payment provider will actually apply. This page
          explains the difference, without quoting today&apos;s actual
          number here — that lives in the calculator, where it stays
          current.
        </>
      }
    >
      <section>
        <h2 className="text-xl font-semibold text-foreground">
          What a reference exchange rate is
        </h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          A reference rate is a published benchmark conversion figure — for
          example, one issued by a central bank — that reflects a
          particular market snapshot at a particular time. It&apos;s a
          real, sourced number, but it&apos;s a benchmark, not a rate any
          specific provider is obligated to give you.
        </p>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          This site&apos;s USD→PKR conversion uses the State Bank of
          Pakistan&apos;s own published rate, dated to the day it was
          fetched, and is always labeled a reference conversion —
          never presented as a guaranteed or live rate.
        </p>
        <SourceNote
          className="mt-3"
          source={usdToPkr.source.name}
          sourceUrl={usdToPkr.source.url}
          lastVerified={`${usdToPkr.source.verifiedAt} (rate as of ${usdToPkr.asOf})`}
        />
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-foreground">
          What a provider conversion rate is, and why it differs
        </h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          When a payment provider actually converts your USD balance to
          PKR — for example, during a Payoneer withdrawal to a Pakistani
          bank account — it applies its own rate, not the published
          reference rate. Providers typically build a margin into that
          conversion rather than itemizing it as a separate line, which is
          exactly why it&apos;s difficult to know the exact cost in
          advance.
        </p>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          As a verified example: Payoneer&apos;s own documentation states
          that a currency-converting withdrawal (like USD to a PKR bank
          account) carries a fee of up to {pct(crossCurrency.maxPercentage!)},
          built into the conversion rate it gives you — described as a
          ceiling, not one fixed number, because the exact rate depends on
          account and territory terms Payoneer only shows inside a
          logged-in account.
        </p>
        <SourceNote
          className="mt-3"
          source={crossCurrency.source.name}
          sourceUrl={crossCurrency.source.url}
          lastVerified={crossCurrency.source.verifiedAt}
        />
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-foreground">
          Why this matters for what you actually receive
        </h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          Because the reference rate and the provider&apos;s own rate are
          two different things, a PKR figure calculated from the reference
          rate is useful as a benchmark — it tells you roughly what USD is
          worth right now — but it is not a prediction of your actual
          Payoneer payout. The gap between the two is exactly the kind of
          cost this site won&apos;t guess at: it&apos;s real, it&apos;s
          just not publicly pinned to one number.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-foreground">
          What this doesn&apos;t include
        </h2>
        <Alert variant="warning" label="What this does not include" className="mt-3">
          Nothing on this site calculates Payoneer&apos;s (or any
          provider&apos;s) actual conversion rate for a specific
          transaction. The reference PKR figure shown in the tools is
          always a benchmark conversion of the amount after Upwork&apos;s
          fee, not a projection of your final payout.
        </Alert>
      </section>

      <section className="mt-10 border-t border-border pt-8">
        <p className="text-[1.0625rem] font-medium text-foreground">
          See a live reference PKR conversion calculated for your own
          numbers.
        </p>
        <div className="mt-4">
          <Link href="/tools/payment-comparison">
            <Button>Open the Payment Comparison tool</Button>
          </Link>
        </div>
        <p className="mt-6 text-[0.9375rem]">
          <Link
            href="/guides/freelancer-payment-fees-explained"
            className="text-primary underline underline-offset-2 hover:no-underline"
          >
            See the full picture of freelancer payment costs
          </Link>
        </p>
      </section>
    </GuideLayout>
  );
}
