import type { Metadata } from "next";
import Link from "next/link";
import { GuideLayout } from "@/components/content/GuideLayout";
import { Alert } from "@/components/ui/Alert";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact status for this site, and where to confirm current fees and policies directly with the platforms and providers it covers.",
};

export default function ContactPage() {
  return (
    <GuideLayout
      breadcrumbLabel="Contact"
      title="Contact"
      intro={
        <>
          This site does not currently have a public contact channel. There
          is no contact form or published email address, and none is being
          implied here.
        </>
      }
    >
      <section>
        <Alert variant="info" label="Contact status">
          When a way to reach the site&apos;s operator is set up, it will be
          listed on this page. Until then, please don&apos;t look for a
          hidden form or address — there isn&apos;t one.
        </Alert>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-foreground">
          Questions about a specific fee or payout
        </h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          This site doesn&apos;t control any platform or payment provider and
          can&apos;t see your account. For the fee that applies to your own
          contract or account, check the platform or provider directly —
          each figure on this site links to the official page it came from,
          with the date it was last verified.
        </p>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          To see how figures are sourced and labeled, read{" "}
          <Link href="/about" className="text-primary underline underline-offset-2 hover:no-underline">
            About this site
          </Link>
          .
        </p>
      </section>
    </GuideLayout>
  );
}
