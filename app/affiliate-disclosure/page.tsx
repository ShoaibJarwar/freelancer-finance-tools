import type { Metadata } from "next";
import Link from "next/link";
import { GuideLayout } from "@/components/content/GuideLayout";
import { Alert } from "@/components/ui/Alert";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description:
    "This site currently has no affiliate links or affiliate relationships. How that would be disclosed if it ever changes.",
};

export default function AffiliateDisclosurePage() {
  return (
    <GuideLayout
      breadcrumbLabel="Affiliate Disclosure"
      title="Affiliate Disclosure"
      intro={
        <>
          As of October 2026, this site has no affiliate links, no
          affiliate relationships, and earns no commissions.
        </>
      }
    >
      <section>
        <Alert variant="info" label="Current status">
          Nothing on this site is paid placement or a referral link. The
          platforms and providers it mentions are described from their
          public documentation, and none of them has asked for or paid for
          that coverage.
        </Alert>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-foreground">If that changes</h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          The operator may add affiliate links in the future. If that
          happens, this page will be updated first or at the same time, and
          any link that could earn a commission will be marked as such near
          the link. Affiliate relationships would not change any
          calculated figure or its exact, reference, ceiling, or unresolved
          label.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-foreground">Related</h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          See{" "}
          <Link href="/about" className="text-primary underline underline-offset-2 hover:no-underline">
            About this site
          </Link>{" "}
          for how figures are sourced, and the{" "}
          <Link href="/terms" className="text-primary underline underline-offset-2 hover:no-underline">
            Terms of Use
          </Link>
          .
        </p>
      </section>
    </GuideLayout>
  );
}
