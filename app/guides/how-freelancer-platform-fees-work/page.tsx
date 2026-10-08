import type { Metadata } from "next";
import Link from "next/link";
import { GuideLayout } from "@/components/content/GuideLayout";
import { Alert } from "@/components/ui/Alert";
import { SourceNote } from "@/components/ui/SourceNote";
import { Button } from "@/components/ui/Button";
import { upworkFeeScenarios } from "@/data/providers/upwork";

export const metadata: Metadata = {
  title: "How Freelancer Platform Fees Work",
  description:
    "A general explanation of how freelance-platform service fees work, why they're rarely one fixed percentage, and the difference between a client payment and the amount after a platform fee.",
};

const marketplace = upworkFeeScenarios.find((s) => s.id === "upwork-marketplace-standard")!;

function pct(decimal: number): string {
  return `${decimal * 100}%`;
}

export default function PlatformFeesGuidePage() {
  return (
    <GuideLayout
      breadcrumbLabel="How Freelancer Platform Fees Work"
      title="How Freelancer Platform Fees Work"
      intro={
        <>
          A freelance platform&apos;s service fee is what the platform keeps
          from a client payment before the rest reaches you. It&apos;s
          rarely one fixed number across an entire platform, and it&apos;s
          never the only cost in the chain — payment-provider fees and
          currency conversion are separate layers on top of it.
        </>
      }
    >
      <section>
        <h2 className="text-xl font-semibold text-foreground">
          What a platform fee actually is
        </h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          When you&apos;re paid through a freelance marketplace rather than
          directly, the platform usually takes a service fee — a percentage
          of the payment, a fixed amount, or sometimes a combination —
          before passing the remainder to you. This fee is the platform&apos;s
          charge for matching you with the client, processing the contract,
          and handling the payment.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-foreground">
          Why you shouldn&apos;t assume a single, standard rate
        </h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          It&apos;s tempting to assume &ldquo;the platform takes X%&rdquo;
          and price your work around that one number. In practice, the rate
          often depends on the specific contract, the type of engagement,
          or account-level factors — not one blanket figure that applies
          to everyone on the platform.
        </p>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          As one concrete, verified example: Upwork&apos;s Marketplace
          freelancer service fee is not fixed — it varies per contract from{" "}
          {pct(marketplace.percentageRange!.min)} to{" "}
          {pct(marketplace.percentageRange!.max)}, set individually and shown
          before you accept an offer.{" "}
          <Link
            href="/guides/upwork-fees"
            className="text-primary underline underline-offset-2 hover:no-underline"
          >
            Read the full breakdown of how Upwork&apos;s fees work
          </Link>{" "}
          for the platform-specific detail — this page stays general on
          purpose.
        </p>
        <SourceNote
          className="mt-3"
          source={marketplace.source.name}
          sourceUrl={marketplace.source.url}
          lastVerified={marketplace.source.verifiedAt}
        />
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-foreground">
          Gross payment vs. amount after platform fee
        </h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          The client payment (the gross amount) and the amount after the
          platform fee are two different numbers. The difference is exactly
          the platform&apos;s service fee for that transaction — nothing
          else has been subtracted yet at this stage.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-foreground">
          Why payment and currency-conversion costs are separate
        </h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          The platform fee only covers the platform&apos;s own cut. Getting
          that remaining amount into your bank account usually involves a
          separate payment provider (like Payoneer or Wise), which can have
          its own withdrawal fee — and if you&apos;re converting to a
          different currency, a currency-conversion cost that&apos;s
          separate again. These are distinct layers, charged by different
          parties, and a platform&apos;s fee schedule says nothing about
          what a payment provider will charge.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-foreground">
          Example calculation
        </h2>
        <Alert variant="info" label="Example only" className="mt-3">
          The numbers below are a hypothetical example to show the
          arithmetic. They are not a specific platform&apos;s real rate —
          actual platform fees vary, as explained above.
        </Alert>
        <div className="mt-4 rounded-[var(--radius-card)] border border-border p-4">
          <p className="font-figures text-[0.9375rem] text-foreground">
            Client payment: $1,000.00
          </p>
          <p className="font-figures text-[0.9375rem] text-foreground">
            × example platform fee: 10%
          </p>
          <p className="font-figures text-[0.9375rem] text-foreground">
            = platform fee: $100.00
          </p>
          <p className="font-figures mt-2 text-[0.9375rem] font-medium text-foreground">
            $1,000.00 − $100.00 = $900.00 after the platform fee
          </p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-foreground">
          What this doesn&apos;t include
        </h2>
        <Alert variant="warning" label="What this does not include" className="mt-3">
          This page only explains the platform-fee concept. It does not
          cover payment-provider fees, currency-conversion costs, bank
          charges, or taxes — those are separate categories, covered in{" "}
          <Link
            href="/guides/freelancer-payment-fees-explained"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Freelancer Payment Fees Explained
          </Link>
          .
        </Alert>
      </section>

      <section className="mt-10 border-t border-border pt-8">
        <p className="text-[1.0625rem] font-medium text-foreground">
          Want to calculate your own amount after a platform fee?
        </p>
        <div className="mt-4">
          <Link href="/tools/freelancer-fee-calculator">
            <Button>Open the Freelancer Fee Calculator</Button>
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
