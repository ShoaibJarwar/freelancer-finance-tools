import type { Metadata } from "next";
import Link from "next/link";
import { GuideLayout } from "@/components/content/GuideLayout";
import { Alert } from "@/components/ui/Alert";
import { SourceNote } from "@/components/ui/SourceNote";
import { Button } from "@/components/ui/Button";
import { upworkFeeScenarios } from "@/data/providers/upwork";
import { payoneerFeeScenarios, payoneerEligibility } from "@/data/providers/payoneer";
import { wiseEligibility } from "@/data/providers/wise";

export const metadata: Metadata = {
  title: "Freelancer Payment Fees Explained",
  description:
    "The five cost categories a cross-border freelancer may encounter — platform fee, payment-provider fee, currency conversion, bank charges, and taxes — and why a calculator may show a result as a reference or a ceiling rather than an exact payout.",
};

const marketplace = upworkFeeScenarios.find((s) => s.id === "upwork-marketplace-standard")!;
const crossCurrency = payoneerFeeScenarios.find(
  (s) => s.id === "payoneer-withdrawal-cross-currency-variable"
)!;
const payoneerPakistan = payoneerEligibility.find(
  (r) => r.capability === "receiveMarketplacePayouts" && r.country === "Pakistan"
)!;
const wiseMarketplace = wiseEligibility.find(
  (r) => r.capability === "receiveMarketplacePayouts"
)!;

function pct(decimal: number): string {
  return `${decimal * 100}%`;
}

export default function PaymentFeesExplainedPage() {
  return (
    <GuideLayout
      breadcrumbLabel="Freelancer Payment Fees Explained"
      title="Freelancer Payment Fees Explained"
      intro={
        <>
          A cross-border freelancer can encounter up to five separate cost
          categories between a client&apos;s payment and their own bank
          account. Not everyone pays all five — it depends on the platform,
          payment provider, account, currency, and country involved. This
          page walks through each category and explains why some of them
          can be calculated exactly and others can&apos;t.
        </>
      }
    >
      <section>
        <h2 className="text-xl font-semibold text-foreground">
          The five potential cost categories
        </h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-[0.9375rem] leading-relaxed text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">Platform/service fee</span> —
            what the freelance marketplace itself keeps, before you receive
            anything.
          </li>
          <li>
            <span className="font-medium text-foreground">Payment-provider fee</span> —
            what a service like Payoneer or Wise charges to move or
            withdraw the remaining money.
          </li>
          <li>
            <span className="font-medium text-foreground">Currency conversion</span> —
            a cost that applies when money changes currency, separate from
            the provider&apos;s withdrawal fee itself.
          </li>
          <li>
            <span className="font-medium text-foreground">Bank/withdrawal charges</span> —
            a receiving bank&apos;s own fee, on top of whatever the payment
            provider charges.
          </li>
          <li>
            <span className="font-medium text-foreground">Taxes or other obligations</span> —
            whatever a freelancer&apos;s own country requires, entirely
            separate from any of the above.
          </li>
        </ol>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          None of these categories are guaranteed to apply to every
          transaction. A freelancer paid directly, in their own currency,
          with no intermediary provider, might only ever encounter the
          first category.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-foreground">
          How this site describes certainty
        </h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          Rather than guess at a number when the real answer is uncertain,
          this site&apos;s tools label every figure with one of five
          statuses:
        </p>
        <dl className="mt-3 space-y-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          <div>
            <dt className="font-medium text-foreground">Exact</dt>
            <dd>Calculated precisely from verified, official data.</dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Reference</dt>
            <dd>
              A real, calculated figure — but explicitly not a guaranteed
              final amount (for example, a currency conversion using a
              published benchmark rate rather than a provider&apos;s own
              rate).
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Ceiling</dt>
            <dd>
              No exact figure exists; only a published upper limit does.
              The real number could be lower, but this site won&apos;t
              guess where.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Unresolved</dt>
            <dd>
              Whether or how this cost applies isn&apos;t established from
              official sources yet — not calculated at all, rather than
              calculated incorrectly.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Not calculable</dt>
            <dd>
              The cost is known to exist, but nothing in the available
              official data lets it be pinned to a number or even a bound.
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-foreground">
          What&apos;s actually known: Upwork and Payoneer to Pakistan
        </h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          As a concrete, verified example: for an Upwork Marketplace
          contract, the platform fee is <span className="font-medium text-foreground">exact</span> once
          you know the contract&apos;s own rate ({pct(marketplace.percentageRange!.min)}–
          {pct(marketplace.percentageRange!.max)}, contract-specific — see{" "}
          <Link
            href="/guides/upwork-fees"
            className="text-primary underline underline-offset-2 hover:no-underline"
          >
            how Upwork freelancer fees work
          </Link>
          ). Withdrawing that amount to a Pakistani bank account through
          Payoneer is confirmed available, but the currency-conversion fee
          for that specific route is only published as a{" "}
          <span className="font-medium text-foreground">ceiling</span> — up
          to {pct(crossCurrency.maxPercentage!)} — not an exact rate.
          Wise&apos;s marketplace-payout capability for Pakistan is{" "}
          <span className="font-medium text-foreground">unresolved</span> in
          this project&apos;s own research — not because Wise states it
          doesn&apos;t work, but because the underlying facts needed to
          confirm it aren&apos;t established. Bank charges beyond Payoneer,
          and taxes, are not modeled at all — nothing here claims a number
          for either.
        </p>
        <div className="mt-3 space-y-2">
          <SourceNote
            source={payoneerPakistan.sources[0].name}
            sourceUrl={payoneerPakistan.sources[0].url}
            lastVerified={payoneerPakistan.sources[0].verifiedAt}
          />
          <SourceNote
            source={crossCurrency.source.name}
            sourceUrl={crossCurrency.source.url}
            lastVerified={crossCurrency.source.verifiedAt}
          />
          <SourceNote
            source={wiseMarketplace.sources[0].name}
            sourceUrl={wiseMarketplace.sources[0].url}
            lastVerified={wiseMarketplace.sources[0].verifiedAt}
          />
        </div>
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
          The{" "}
          <Link
            href="/tools/payment-comparison"
            className="text-primary underline underline-offset-2 hover:no-underline"
          >
            Payment Comparison tool
          </Link>{" "}
          runs this exact breakdown for your own numbers, with each stage
          labeled the way it&apos;s described above.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-foreground">
          What this doesn&apos;t include
        </h2>
        <Alert variant="warning" label="What this does not include" className="mt-3">
          This project does not calculate Payoneer&apos;s exact cross-currency
          fee, any bank&apos;s own charges, or any taxes. Where a cost
          category can&apos;t be calculated from verified official data,
          the tools say so explicitly rather than estimating.
        </Alert>
      </section>

      <section className="mt-10 border-t border-border pt-8">
        <p className="text-[1.0625rem] font-medium text-foreground">
          See this breakdown calculated for your own client payment.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/tools/payment-comparison">
            <Button>Open the Payment Comparison tool</Button>
          </Link>
          <Link href="/tools/freelancer-fee-calculator">
            <Button variant="outline">Open the Freelancer Fee Calculator</Button>
          </Link>
        </div>
        <p className="mt-6 text-[0.9375rem]">
          <Link
            href="/guides/usd-to-pkr-for-freelancers"
            className="text-primary underline underline-offset-2 hover:no-underline"
          >
            Read about USD to PKR reference rates for freelancers
          </Link>
        </p>
      </section>
    </GuideLayout>
  );
}
