import type { Metadata } from "next";
import Link from "next/link";
import { GuideLayout } from "@/components/content/GuideLayout";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "The basic terms for using this site's calculators and guides: informational use only, no guarantee of accuracy, and no financial, tax, or legal advice.",
};

export default function TermsPage() {
  return (
    <GuideLayout
      breadcrumbLabel="Terms of Use"
      title="Terms of Use"
      intro={
        <>
          By using this site you agree to these short terms. If you
          don&apos;t agree, please don&apos;t use it.
        </>
      }
    >
      <section>
        <h2 className="text-xl font-semibold text-foreground">Informational tools only</h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          The calculators and guides are provided for general information.
          They are not financial, tax, legal, investment, or other
          professional advice, and the site is not a regulated financial
          service. Make your own decisions, and consult a qualified
          professional where it matters.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-foreground">No guarantee of accuracy</h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          Figures come from public documentation that the site tries to cite
          and date, but they may be incomplete, out of date, or
          misunderstood. Platform and provider fees and policies change,
          and a fee that applies to you may differ from what is shown. Some
          costs are deliberately shown as ceilings, references, or
          unresolved rather than as exact amounts, and some costs (such as
          bank charges and taxes) are not modeled at all. Verify any
          important figure with the relevant provider before relying on it.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-foreground">Reference exchange rates</h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          Exchange rates shown are dated reference figures, not live rates
          and not the rate any bank or payment provider will apply to your
          transaction. A currency conversion shown here is a benchmark, not
          a payout.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-foreground">Limits of responsibility</h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          The site is provided as is, without warranties of any kind. To
          the extent permitted by applicable law, its operator is not
          responsible for losses or decisions arising from use of, or
          reliance on, the tools or content. Nothing here limits any right
          you have that cannot be limited by law.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-foreground">Acceptable use</h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          Use the site lawfully and don&apos;t try to disrupt it, overload
          it, or access it by means other than normal browsing. Don&apos;t
          present the site&apos;s figures as official statements of any
          platform, provider, or institution.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-foreground">Content and third parties</h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          The site&apos;s own text, design, and code may not be copied or
          republished wholesale without permission; short quotations with
          attribution are fine. Names such as Upwork, Payoneer, and Wise
          belong to their owners and are used only to describe their
          publicly documented services. This site is not affiliated with
          them.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-foreground">Changes</h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          The site and these terms may change. Continued use after a change
          means you accept the updated terms. See also the{" "}
          <Link href="/privacy" className="text-primary underline underline-offset-2 hover:no-underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/affiliate-disclosure" className="text-primary underline underline-offset-2 hover:no-underline">
            Affiliate Disclosure
          </Link>
          .
        </p>
      </section>
    </GuideLayout>
  );
}
