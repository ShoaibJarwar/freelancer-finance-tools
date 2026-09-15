import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Alert } from "@/components/ui/Alert";
import { SourceNote } from "@/components/ui/SourceNote";
import { Button } from "@/components/ui/Button";
import { upworkFeeScenarios } from "@/data/providers/upwork";

export const metadata: Metadata = {
  title: "How Upwork Freelancer Fees Work",
  description:
    "A plain-language guide to how Upwork's freelancer service fee works for Marketplace and Direct Contracts, based on Upwork's official documentation.",
};

const marketplace = upworkFeeScenarios.find(
  (s) => s.id === "upwork-marketplace-standard"
)!;
const direct = upworkFeeScenarios.find((s) => s.id === "upwork-direct-contracts")!;
const directPlus = upworkFeeScenarios.find(
  (s) => s.id === "upwork-direct-contracts-freelancer-plus"
)!;

function pct(decimal: number): string {
  return `${decimal * 100}%`;
}

export default function UpworkFeesGuidePage() {
  return (
    <div className="py-12 sm:py-16">
      <Container className="max-w-[720px]">
        <p className="text-[0.8125rem] text-muted-foreground">
          <Link
            href="/"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Home
          </Link>{" "}
          / How Upwork Freelancer Fees Work
        </p>

        <h1 className="mt-3 text-[1.75rem] font-semibold leading-tight text-foreground sm:text-[2rem]">
          How Upwork Freelancer Fees Work
        </h1>

        <p className="mt-4 text-[1.0625rem] leading-relaxed text-muted-foreground">
          When a client pays you on Upwork, the amount you invoiced isn&apos;t
          the amount you end up with — Upwork&apos;s freelancer service fee
          comes out first. This guide explains how that fee actually works,
          so the number you enter into the{" "}
          <Link
            href="/tools/freelancer-fee-calculator"
            className="text-primary underline underline-offset-2 hover:no-underline"
          >
            Freelancer Fee Calculator
          </Link>{" "}
          means what you think it means.
        </p>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-foreground">
            How the Upwork freelancer service fee works
          </h2>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
            Upwork doesn&apos;t charge every freelancer the same rate. The fee
            depends on the type of contract and, for standard Marketplace
            contracts, on the specific contract itself. There isn&apos;t one
            &ldquo;Upwork fee&rdquo; you can look up and apply everywhere — which is why
            this site asks you for a number instead of assuming one.
          </p>
          <Alert variant="info" label="Why the calculator asks for your fee" className="mt-4">
            The calculator doesn&apos;t guess your Marketplace fee. Enter the
            percentage Upwork shows you for your specific contract — it can
            legitimately be different from another freelancer&apos;s, even on
            a similar job.
          </Alert>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-foreground">
            Marketplace contracts
          </h2>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
            A standard hourly, fixed-price, or Project Catalog contract found
            through the Upwork marketplace uses a variable freelancer service
            fee, currently ranging from {pct(marketplace.percentageRange!.min)}{" "}
            to {pct(marketplace.percentageRange!.max)}. The exact rate is set
            per contract — based on factors like supply and demand — and is
            shown to you before you submit a proposal or accept an offer.
            Once the contract begins, that rate is fixed for its lifetime.
          </p>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
            Because the rate can be anywhere in that range, a generic
            &ldquo;Upwork fee calculator&rdquo; that assumes one fixed percentage for
            every contract will be wrong for most people. The only reliable
            source for your rate is the one Upwork shows you on the contract
            itself.
          </p>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
            Have that percentage handy?{" "}
            <Link
              href="/tools/freelancer-fee-calculator"
              className="text-primary underline underline-offset-2 hover:no-underline"
            >
              Calculate your amount after the Upwork service fee
            </Link>
            .
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-foreground">
            Direct Contracts
          </h2>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
            Direct Contracts work differently — this is for a client you
            bring to Upwork yourself, rather than one found through the
            marketplace. Instead of a variable per-contract rate, Direct
            Contracts use a flat {pct(direct.percentage!)} freelancer service
            fee.
          </p>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
            If you have an active Freelancer Plus subscription, that rate
            drops to {pct(directPlus.percentage!)} instead of{" "}
            {pct(direct.percentage!)} for Direct Contracts. This guide
            doesn&apos;t cover Freelancer Plus&apos;s subscription pricing or
            other benefits — only how it affects this specific fee, since
            that&apos;s the only part backed by verified data in this
            project.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-foreground">
            Example calculation
          </h2>
          <Alert variant="info" label="Example only" className="mt-3">
            The numbers below are a hypothetical example to show the
            arithmetic — they are not a typical or recommended rate. Your
            actual Marketplace fee can be anywhere from{" "}
            {pct(marketplace.percentageRange!.min)} to{" "}
            {pct(marketplace.percentageRange!.max)}; always use the
            percentage shown for your own contract.
          </Alert>
          <div className="mt-4 rounded-[var(--radius-card)] border border-border p-4">
            <p className="font-figures text-[0.9375rem] text-foreground">
              Client payment: $1,000.00
            </p>
            <p className="font-figures text-[0.9375rem] text-foreground">
              × example service fee: 10%
            </p>
            <p className="font-figures text-[0.9375rem] text-foreground">
              = service fee: $100.00
            </p>
            <p className="font-figures mt-2 text-[0.9375rem] font-medium text-foreground">
              $1,000.00 − $100.00 = $900.00 after the platform fee
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-foreground">
            How to calculate your amount after the Upwork fee
          </h2>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
            In plain terms:
          </p>
          <p className="font-figures mt-2 text-[0.9375rem] text-foreground">
            Amount after platform fee = Client payment − platform service fee
          </p>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
            The calculator does exactly this, using the contract type and
            fee percentage you enter — no rate is assumed on your behalf.
          </p>
          <div className="mt-4">
            <Link href="/tools/freelancer-fee-calculator">
              <Button variant="outline">Open the Freelancer Fee Calculator</Button>
            </Link>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-foreground">
            What this calculator does not include
          </h2>
          <Alert variant="warning" label="What this does not include" className="mt-3">
            The calculator only accounts for Upwork&apos;s freelancer service
            fee. It does not subtract withdrawal or payment-provider fees
            (for example Payoneer, Wise, or a bank transfer), currency-
            conversion spreads charged by a provider, or any taxes.
            &ldquo;Amount after platform fee&rdquo; is not necessarily the same as the
            exact amount that lands in your bank account.
          </Alert>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-foreground">
            Data sources
          </h2>
          <div className="mt-3 space-y-4">
            <SourceNote
              source={marketplace.source.name}
              sourceUrl={marketplace.source.url}
              lastVerified={marketplace.source.verifiedAt}
            />
            <SourceNote
              source={direct.source.name}
              sourceUrl={direct.source.url}
              lastVerified={direct.source.verifiedAt}
            />
          </div>
        </section>

        <section className="mt-12 border-t border-border pt-8">
          <p className="text-[1.0625rem] font-medium text-foreground">
            Enter your client payment and contract fee to see the amount
            remaining after the platform fee.
          </p>
          <div className="mt-4">
            <Link href="/tools/freelancer-fee-calculator">
              <Button>Open the Freelancer Fee Calculator</Button>
            </Link>
          </div>
        </section>
      </Container>
    </div>
  );
}
