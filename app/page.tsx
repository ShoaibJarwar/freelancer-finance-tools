import Link from "next/link";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { ToolPreviewFlow } from "@/components/home/ToolPreviewFlow";

export default function Home() {
  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto w-full max-w-[1120px] px-5 sm:px-8">
        <div className="max-w-[640px]">
          <h1 className="text-[2rem] font-semibold leading-tight text-foreground sm:text-[2.25rem]">
            See how much you&apos;ll actually receive, before you invoice.
          </h1>
          <p className="mt-3 text-[1.0625rem] leading-relaxed text-muted-foreground">
            Platform fees, withdrawal costs, and currency conversion all
            take a share before a payment reaches you. This site helps
            freelancers and remote workers with international clients see
            the real number, not just the invoice total.
          </p>
          <div className="mt-6">
            <Link
              href="/tools/freelancer-fee-calculator"
              className="inline-flex h-11 items-center justify-center rounded-[var(--radius-control)] bg-primary px-4 text-[0.9375rem] font-medium text-primary-foreground hover:bg-primary-hover"
            >
              Calculate your net amount
            </Link>
          </div>
        </div>

        <Card className="mt-10 max-w-[640px]">
          <CardHeader>
            <CardTitle>Example calculation (not real figures)</CardTitle>
          </CardHeader>
          <CardBody>
            <ToolPreviewFlow />
          </CardBody>
        </Card>

        <div className="mt-12 max-w-[640px]">
          <h2 className="text-xl font-semibold text-foreground">
            How we approach the numbers
          </h2>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
            Provider fees are sourced from official documentation where
            possible. Every important assumption is shown, with a
            verification date. Where provider-specific conditions can
            vary — a currency conversion rate, for example — the
            calculation is labeled as an estimate rather than presented as
            exact. If something can&apos;t be verified, we say so instead
            of guessing.
          </p>
        </div>

        <div className="mt-10 max-w-[640px]">
          <h2 className="text-xl font-semibold text-foreground">
            What clients pay isn&apos;t always what you receive
          </h2>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
            A freelancer might see a $500 client payment, but the actual
            amount that lands in their account can be affected by platform
            fees, payment or withdrawal charges, and exchange-rate
            differences. Each of these is a separate deduction, and none of
            them are guaranteed to be the same from one platform or
            provider to the next.
          </p>
        </div>

        <div className="mt-10 max-w-[640px]">
          <h2 className="text-xl font-semibold text-foreground">Tools</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Card className="max-w-[560px]">
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
            <Card className="max-w-[560px]">
              <CardBody>
                <p className="text-[0.9375rem] font-medium text-foreground">
                  Payment Comparison
                </p>
                <p className="mt-1 text-[0.875rem] text-muted-foreground">
                  See what&apos;s calculable about an Upwork payment through
                  Payoneer to Pakistan — and what isn&apos;t.
                </p>
                <Link
                  href="/tools/payment-comparison"
                  className="mt-3 inline-block text-[0.875rem] font-medium text-primary hover:underline"
                >
                  Open the comparison tool
                </Link>
              </CardBody>
            </Card>
          </div>
          <p className="mt-4 text-[0.875rem] text-muted-foreground">
            A freelancer rate calculator is planned next.
          </p>
        </div>

        <div className="mt-10 max-w-[640px]">
          <h2 className="text-xl font-semibold text-foreground">Guides</h2>
          <ul className="mt-5 space-y-3">
            <li>
              <Link
                href="/guides/upwork-fees"
                className="text-[0.9375rem] font-medium text-primary hover:underline"
              >
                How Upwork Freelancer Fees Work
              </Link>
            </li>
            <li>
              <Link
                href="/guides/how-freelancer-platform-fees-work"
                className="text-[0.9375rem] font-medium text-primary hover:underline"
              >
                How Freelancer Platform Fees Work
              </Link>
            </li>
            <li>
              <Link
                href="/guides/freelancer-payment-fees-explained"
                className="text-[0.9375rem] font-medium text-primary hover:underline"
              >
                Freelancer Payment Fees Explained
              </Link>
            </li>
            <li>
              <Link
                href="/guides/usd-to-pkr-for-freelancers"
                className="text-[0.9375rem] font-medium text-primary hover:underline"
              >
                USD to PKR for Freelancers
              </Link>
            </li>
          </ul>
        </div>

        <div className="mt-10 max-w-[640px]">
          <h2 className="text-xl font-semibold text-foreground">Who this is for</h2>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
            Freelancers, remote employees, and independent consultants —
            developers, designers, writers, and others — who bill
            international clients and want to know what a payment is
            actually worth once the dust settles.
          </p>
        </div>

        <div className="mt-10 max-w-[640px]">
          <h2 className="text-xl font-semibold text-foreground">
            An independent project
          </h2>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
            This site is independently built with a focus on transparency —
            sourced assumptions, visible verification dates, and estimates
            labeled as estimates. It&apos;s a working project, not a
            finished product.
          </p>
        </div>

        <Alert variant="info" label="Before you go" className="mt-10 max-w-[640px]">
          Know what you&apos;ll actually receive before you send the
          invoice.
        </Alert>
        <div className="mt-4">
          <Link
            href="/tools/freelancer-fee-calculator"
            className="inline-flex h-11 items-center justify-center rounded-[var(--radius-control)] bg-primary px-4 text-[0.9375rem] font-medium text-primary-foreground hover:bg-primary-hover"
          >
            Calculate your net amount
          </Link>
        </div>
      </div>
    </div>
  );
}
