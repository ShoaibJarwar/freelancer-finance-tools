import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Alert } from "@/components/ui/Alert";
import { SourceNote } from "@/components/ui/SourceNote";
import { PaymentComparisonForm } from "@/components/comparison/PaymentComparisonForm";
import { wiseEligibility } from "@/data/providers/wise";
import { gateOnEligibility } from "@/lib/calculations/comparison";

// No metadataBase/canonical set yet — the production domain isn't chosen
// (see Phase D report), consistent with every other page in this project.
// This page's metadata is static (no generateMetadata reading
// searchParams), so a shared/query-string URL like ?amount=1000&fee=10
// renders with the exact same title/description as the base route —
// there is no separate indexable page per input combination.
export const metadata: Metadata = {
  title: "Freelancer Payment Comparison",
  description:
    "Compare what can actually be calculated about an Upwork payment and a Payoneer withdrawal to Pakistan — clearly separating exact figures from reference conversions and published fee ceilings, never presenting either as a guaranteed payout.",
};

const wiseMarketplaceRecord = wiseEligibility.find(
  (r) => r.capability === "receiveMarketplacePayouts"
)!;
const wiseGate = gateOnEligibility(wiseMarketplaceRecord, 0, "USD");

export default function PaymentComparisonPage() {
  return (
    <div className="py-12 sm:py-16">
      <Container className="max-w-[720px]">
        <p className="text-[0.8125rem] text-muted-foreground">
          <Link href="/" className="underline underline-offset-2 hover:text-foreground">
            Home
          </Link>{" "}
          / Payment Comparison
        </p>

        <h1 className="mt-3 text-[1.75rem] font-semibold leading-tight text-foreground sm:text-[2rem]">
          Compare freelancer payment costs
        </h1>
        <p className="mt-3 text-[1.0625rem] leading-relaxed text-muted-foreground">
          Enter a client payment to see what can actually be calculated about
          an Upwork contract and a Payoneer withdrawal to Pakistan — and,
          just as importantly, what can&apos;t be. Some figures below are
          exact, some are reference-only, and some are only known as an
          upper limit. Each is labeled as what it is.
        </p>

        <Alert
          variant="warning"
          label="What this does not include"
          className="mt-6"
        >
          This tool does not know your exact Payoneer withdrawal fee, any
          bank charges, Payoneer&apos;s own currency-conversion rate, or any
          taxes. Where a figure can&apos;t be calculated from verified
          official data, this page says so explicitly instead of guessing.
          Nothing here is a final bank payout.
        </Alert>

        <h2 className="mt-8 text-lg font-semibold text-foreground">
          Run the comparison
        </h2>
        <Suspense fallback={null}>
          <PaymentComparisonForm />
        </Suspense>

        <section className="mt-10 rounded-[var(--radius-card)] border border-border p-5">
          <h2 className="text-lg font-semibold text-foreground">Wise</h2>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">
            Wise isn&apos;t shown as a calculable option here. This
            isn&apos;t Wise saying marketplace payouts don&apos;t work in
            Pakistan — it&apos;s this project&apos;s own conclusion, from
            two things Wise does state directly: a Pakistan resident can&apos;t
            hold a Wise balance or get receiving account details, which are
            what a marketplace like Upwork would need to pay out to.
          </p>
          <p className="mt-2 text-[0.8125rem] font-medium text-foreground">
            Status: Unresolved
          </p>
          <p className="mt-1 text-[0.875rem] text-muted-foreground">
            {wiseGate.blockedResult?.limitations[0]}
          </p>
          <div className="mt-3 space-y-2">
            {wiseMarketplaceRecord.sources.map((source, i) => (
              <SourceNote
                key={source.url + i}
                source={source.name}
                sourceUrl={source.url}
                lastVerified={source.verifiedAt}
              />
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">
            Understanding this comparison
          </h2>
          <div className="mt-3 space-y-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">
                What does &ldquo;amount after platform fee&rdquo; mean?{" "}
              </span>
              The client payment minus Upwork&apos;s freelancer service fee
              for the contract type you select — nothing more is subtracted
              at that step.
            </p>
            <p>
              <span className="font-medium text-foreground">
                Why can&apos;t the exact Payoneer Pakistan fee be calculated
                here?{" "}
              </span>
              Payoneer&apos;s own documentation states this fee is
              &ldquo;up to 2%&rdquo; for a currency-converting withdrawal,
              not one fixed rate — the exact figure depends on
              account/territory terms Payoneer only shows inside a logged-in
              account.
            </p>
            <p>
              <span className="font-medium text-foreground">
                Why is the PKR amount called a reference conversion?{" "}
              </span>
              It&apos;s calculated using a dated State Bank of Pakistan
              exchange rate, not Payoneer&apos;s own conversion rate — the
              two will differ, so it&apos;s a benchmark, not a payout
              figure.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">
            How this calculation works
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-[0.9375rem] leading-relaxed text-muted-foreground">
            <li>Start with the client payment you enter.</li>
            <li>
              Apply Upwork&apos;s freelancer service fee for the contract
              type you select. This is an exact figure once a valid
              percentage is known.
            </li>
            <li>
              Check Payoneer&apos;s withdrawal fee for sending that amount
              to a Pakistani bank account. Because this is a currency
              conversion (USD to PKR), Payoneer&apos;s own documentation
              gives only a ceiling — &ldquo;up to 2%&rdquo; — not one exact
              rate, so this step is shown as a limit, not a fee.
            </li>
            <li>
              If you turn on the reference conversion, the amount after
              Upwork&apos;s fee (not after Payoneer&apos;s, since that
              figure isn&apos;t known) is converted to PKR using a dated
              State Bank of Pakistan reference rate — shown separately and
              labeled as a reference, not a payout.
            </li>
          </ol>
        </section>

        <section className="mt-10 border-t border-border pt-8">
          <h2 className="text-lg font-semibold text-foreground">
            Related tools and guides
          </h2>
          <ul className="mt-3 space-y-2 text-[0.9375rem]">
            <li>
              <Link
                href="/tools/freelancer-fee-calculator"
                className="text-primary underline underline-offset-2 hover:no-underline"
              >
                Freelancer Fee Calculator
              </Link>{" "}
              <span className="text-muted-foreground">
                — just Upwork&apos;s fee, without the Payoneer/PKR view.
              </span>
            </li>
            <li>
              <Link
                href="/guides/upwork-fees"
                className="text-primary underline underline-offset-2 hover:no-underline"
              >
                How Upwork Freelancer Fees Work
              </Link>{" "}
              <span className="text-muted-foreground">
                — not sure which fee applies to your contract?
              </span>
            </li>
            <li>
              <Link
                href="/guides/freelancer-payment-fees-explained"
                className="text-primary underline underline-offset-2 hover:no-underline"
              >
                Freelancer Payment Fees Explained
              </Link>{" "}
              <span className="text-muted-foreground">
                — the five cost categories, and this project&apos;s exact/reference/ceiling/unresolved vocabulary.
              </span>
            </li>
            <li>
              <Link
                href="/guides/usd-to-pkr-for-freelancers"
                className="text-primary underline underline-offset-2 hover:no-underline"
              >
                USD to PKR for Freelancers
              </Link>{" "}
              <span className="text-muted-foreground">
                — why a reference rate isn&apos;t the same as a provider&apos;s rate.
              </span>
            </li>
          </ul>
        </section>
      </Container>
    </div>
  );
}
