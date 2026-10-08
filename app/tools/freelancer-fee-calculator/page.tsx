import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Alert } from "@/components/ui/Alert";
import { FeeCalculatorForm } from "@/components/calculator/FeeCalculatorForm";

export const metadata: Metadata = {
  title: "Freelancer Fee Calculator",
  description:
    "Calculate how much of a client payment remains after Upwork's freelancer service fee, for Marketplace and Direct Contracts. Platform fee only — not a full payout estimate.",
};

export default function FreelancerFeeCalculatorPage() {
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
          / Freelancer Fee Calculator
        </p>

        <h1 className="mt-3 text-[1.75rem] font-semibold leading-tight text-foreground sm:text-[2rem]">
          Freelancer Fee Calculator
        </h1>
        <p className="mt-3 text-[1.0625rem] leading-relaxed text-muted-foreground">
          Enter a client payment to see how much of it goes to Upwork&apos;s
          freelancer service fee, and how much is left before any other
          costs.
        </p>

        <Alert
          variant="warning"
          label="What this does not include"
          className="mt-6"
        >
          This tool only calculates Upwork&apos;s freelancer service fee. It
          does not subtract withdrawal or payment-provider fees (for example
          Payoneer, Wise, or a bank transfer), currency-conversion spreads
          charged by a provider, or any taxes. The amount shown is not the
          amount that will land in your bank account.
        </Alert>

        <FeeCalculatorForm />

        <p className="mt-4 text-[0.8125rem] text-muted-foreground">
          Not sure which fee applies?{" "}
          <Link
            href="/guides/upwork-fees"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Learn how Upwork freelancer fees work
          </Link>
          . Want to see this converted to PKR through Payoneer too?{" "}
          <Link
            href="/tools/payment-comparison"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Try the Payment Comparison tool
          </Link>
          .
        </p>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">
            How this calculation works
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-[0.9375rem] leading-relaxed text-muted-foreground">
            <li>Start with your client payment.</li>
            <li>
              Apply the Upwork service fee for the selected contract.
            </li>
            <li>Subtract that fee from the gross payment.</li>
            <li>
              The result is your amount after the platform fee.
            </li>
            <li>
              If a reference currency conversion is selected, convert that
              amount using the dated reference rate.
            </li>
          </ol>
        </section>
      </Container>
    </div>
  );
}
