import type { Metadata } from "next";
import Link from "next/link";
import { GuideLayout } from "@/components/content/GuideLayout";

export const metadata: Metadata = {
  title: "About",
  description:
    "What this independent site is, who it's for, and how its tools separate verified figures from reference conversions, published ceilings, and unresolved costs.",
};

export default function AboutPage() {
  return (
    <GuideLayout
      breadcrumbLabel="About"
      title="About this site"
      intro={
        <>
          This is an independent set of calculators and guides for
          freelancers and remote workers who are paid by international
          clients. It helps you see what happens to a payment between the
          client&apos;s invoice and your own account — and, just as
          importantly, which parts of that can be calculated and which
          can&apos;t.
        </>
      }
    >
      <section>
        <h2 className="text-xl font-semibold text-foreground">
          The problem it addresses
        </h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          The amount a client pays is rarely the amount that arrives.
          Platform fees, payment-provider charges, and currency conversion
          each take a share, set by different companies, often in ways that
          vary by contract, account, or country. The tools here lay those
          layers out one at a time instead of hiding them in a single
          number.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-foreground">
          How it treats numbers
        </h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          Every figure is tied to a named source and a verification date,
          and is labeled for what it is: <span className="font-medium text-foreground">exact</span>,{" "}
          <span className="font-medium text-foreground">reference</span> (for example a benchmark exchange
          rate), <span className="font-medium text-foreground">ceiling</span> (only an upper limit is
          published), <span className="font-medium text-foreground">unresolved</span>, or{" "}
          <span className="font-medium text-foreground">not calculable</span>. When a cost can&apos;t be
          pinned down from official documentation, the tools say so rather
          than guess.{" "}
          <Link
            href="/guides/freelancer-payment-fees-explained"
            className="text-primary underline underline-offset-2 hover:no-underline"
          >
            Freelancer Payment Fees Explained
          </Link>{" "}
          describes these labels in full.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-foreground">
          What this site is not
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-[0.9375rem] leading-relaxed text-muted-foreground">
          <li>It is not a financial adviser, bank, or regulated financial service, and it gives no financial, tax, or legal advice.</li>
          <li>It is not affiliated with, endorsed by, or partnered with Upwork, Payoneer, Wise, the State Bank of Pakistan, or any other company or institution it mentions. It reads their public documentation.</li>
          <li>It does not control any platform or payment provider. Their fees and policies can change at any time, and the figures here may lag behind.</li>
          <li>It does not guarantee accuracy or completeness. For any amount that matters, check the current figure with the provider itself.</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-foreground">Where to start</h2>
        <ul className="mt-3 space-y-2 text-[0.9375rem]">
          <li>
            <Link href="/tools/freelancer-fee-calculator" className="text-primary underline underline-offset-2 hover:no-underline">
              Freelancer Fee Calculator
            </Link>{" "}
            <span className="text-muted-foreground">— the amount after Upwork&apos;s platform fee.</span>
          </li>
          <li>
            <Link href="/tools/payment-comparison" className="text-primary underline underline-offset-2 hover:no-underline">
              Payment Comparison
            </Link>{" "}
            <span className="text-muted-foreground">— what can and can&apos;t be calculated about a Payoneer withdrawal to Pakistan.</span>
          </li>
          <li>
            <Link href="/guides/upwork-fees" className="text-primary underline underline-offset-2 hover:no-underline">
              How Upwork Freelancer Fees Work
            </Link>
          </li>
        </ul>
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
          See also the{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">Privacy Policy</Link>,{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">Terms of Use</Link>, and{" "}
          <Link href="/affiliate-disclosure" className="underline underline-offset-2 hover:text-foreground">Affiliate Disclosure</Link>.
        </p>
      </section>
    </GuideLayout>
  );
}
