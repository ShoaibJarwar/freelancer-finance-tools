import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { ToolPreviewFlow } from "@/components/home/ToolPreviewFlow";

// No metadataBase/canonical set yet — the production domain isn't chosen
// (see Phase D report). Once it is, set metadataBase in the root layout
// and this page will inherit a correct canonical automatically.
export const metadata: Metadata = {
  title: "Freelancer Finance Tools",
  description:
    "See how much of a client payment you actually receive after platform fees, withdrawal costs, and currency conversion.",
};

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <Container className="pt-12 pb-10 sm:pt-16 sm:pb-14">
        <div className="max-w-[640px]">
          <h1 className="text-[2rem] font-semibold leading-tight text-foreground sm:text-[2.25rem]">
            See how much you&apos;ll actually receive, before you invoice.
          </h1>
          <p className="mt-4 text-[1.0625rem] leading-relaxed text-muted-foreground">
            Platform fees, withdrawal costs, and currency conversion all take
            a share before a payment reaches you. This site helps
            freelancers and remote workers with international clients see
            the real number, not just the invoice total.
          </p>
          <div className="mt-7">
            <Link href="/tools/freelancer-fee-calculator">
              <Button className="px-6">Calculate your net amount</Button>
            </Link>
          </div>
        </div>
      </Container>

      {/* Tool preview */}
      <Container className="pb-14 sm:pb-20">
        <div className="grid gap-8 sm:grid-cols-[minmax(0,1fr)_360px] sm:items-start">
          <div className="max-w-[520px]">
            <h2 className="text-xl font-semibold text-foreground">
              Freelancer Fee Calculator
            </h2>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">
              Enter what a client is paying you and see it broken down step
              by step: platform fee, withdrawal cost, currency conversion,
              and what&apos;s actually left. Still in development, this is
              what the breakdown will look like.
            </p>
          </div>
          <ToolPreviewFlow />
        </div>
      </Container>

      {/* Trust / transparency */}
      <div className="border-t border-border bg-surface">
        <Container className="py-12 sm:py-16">
          <div className="max-w-[640px]">
            <h2 className="text-xl font-semibold text-foreground">
              How we handle the numbers
            </h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
              Fees and rates come from official provider documentation where
              it&apos;s available. Every figure the calculator uses will
              show what it&apos;s based on and when it was last checked.
              Provider terms vary by account, region, and time, so results
              are estimates — always confirm the exact charge with your
              provider before relying on it.
            </p>
          </div>
        </Container>
      </div>

      {/* Why this matters */}
      <Container className="py-12 sm:py-16">
        <div className="max-w-[640px]">
          <h2 className="text-xl font-semibold text-foreground">
            What a client pays isn&apos;t what you keep
          </h2>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
            A $500 payment rarely arrives as $500. Along the way, a platform
            service fee, a withdrawal or payout charge, and the cost of
            converting currencies can each take a share. Most freelancers
            only find out the real total after the money lands — this site
            is built to show it beforehand.
          </p>
        </div>
      </Container>

      {/* Tools + guide */}
      <div className="border-t border-border">
        <Container className="py-12 sm:py-16">
          <h2 className="text-xl font-semibold text-foreground">Tools</h2>
          <Card className="mt-5 max-w-[560px]">
            <CardBody>
              <p className="text-[0.9375rem] font-medium text-foreground">
                Freelancer Fee Calculator
              </p>
              <p className="mt-1 text-[0.875rem] text-muted-foreground">
                See what you&apos;ll actually receive from a client payment.
              </p>
              <Link
                href="/tools/freelancer-fee-calculator"
                className="mt-3 inline-block text-[0.875rem] font-medium text-primary hover:underline"
              >
                Open the calculator
              </Link>
            </CardBody>
          </Card>
          <p className="mt-4 text-[0.875rem] text-muted-foreground">
            A payment-method comparison tool and a rate calculator are
            planned next.
          </p>

          <p className="mt-8 text-[0.8125rem] text-muted-foreground">
            Not sure which fee applies to you?{" "}
            <Link
              href="/guides/upwork-fees"
              className="font-medium text-primary hover:underline"
            >
              Read how Upwork freelancer fees work
            </Link>
            .
          </p>
        </Container>
      </div>

      {/* Audience */}
      <Container className="py-12 sm:py-16">
        <div className="max-w-[640px]">
          <h2 className="text-xl font-semibold text-foreground">
            Who it&apos;s for
          </h2>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
            Freelancers, remote workers, and independent consultants —
            developers, designers, writers, and small agencies — who bill
            clients abroad and get paid in a currency other than the one
            they spend day to day.
          </p>
        </div>
      </Container>

      {/* About preview */}
      <div className="border-t border-border bg-surface">
        <Container className="py-12 sm:py-16">
          <div className="max-w-[640px]">
            <h2 className="text-xl font-semibold text-foreground">
              Built independently
            </h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
              This is an independent project, not run by a bank or payment
              provider. It exists to make fee and payment information easier
              to see clearly in one place.
            </p>
          </div>
        </Container>
      </div>

      {/* Final CTA */}
      <Container className="py-14 sm:py-20">
        <div className="max-w-[560px]">
          <p className="text-xl font-semibold text-foreground">
            Know what you&apos;ll actually receive before you send the
            invoice.
          </p>
          <Link href="/tools/freelancer-fee-calculator">
            <Button className="mt-6">Calculate your net amount</Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
