import type { Metadata } from "next";
import Link from "next/link";
import { GuideLayout } from "@/components/content/GuideLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What this site does and doesn't do with information: no accounts, cookies, analytics, or advertising in the site's own code, and how calculator inputs appear in the page URL.",
};

export default function PrivacyPage() {
  return (
    <GuideLayout
      breadcrumbLabel="Privacy Policy"
      title="Privacy Policy"
      intro={
        <>
          This page describes what the site itself does with information, as
          of October 2026. It reflects how the site is built today and will
          be updated if that changes.
        </>
      }
    >
      <section>
        <h2 className="text-xl font-semibold text-foreground">
          What the site does not do
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-[0.9375rem] leading-relaxed text-muted-foreground">
          <li>It has no accounts, sign-in, or user profiles.</li>
          <li>It has no database and does not store what you enter.</li>
          <li>It has no contact form and collects no names, emails, or addresses.</li>
          <li>Its own code sets no cookies and uses no browser storage (neither local nor session storage).</li>
          <li>It includes no analytics, advertising, or affiliate-tracking scripts.</li>
          <li>It does not send your calculator inputs to any server or third party. Calculations run in your browser.</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-foreground">
          Calculator inputs and the page URL
        </h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          On the Payment Comparison tool, what you enter (the payment
          amount, contract type, fee percentage, and options you switch on)
          is mirrored into the address bar as query parameters so a
          comparison can be shared. Calculated results are never put in the
          URL. Because those inputs are part of the address, they can appear
          in your browser history and anywhere you paste or share the link.
          The Share button copies the link to your own clipboard using your
          browser; nothing is sent anywhere. Use Reset to clear the inputs
          and the parameters.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-foreground">
          Hosting and technical data
        </h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          Like any website, this one is delivered through a hosting provider
          and network infrastructure that can process technical request
          information, such as IP address, browser type, and the pages
          requested, and may keep server logs. That happens outside this
          site&apos;s own code, and this page doesn&apos;t describe those
          providers&apos; practices or retention periods.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-foreground">
          Search Console verification
        </h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          The site&apos;s pages include a verification meta tag that lets its
          operator prove ownership to Google Search Console. It is a passive
          tag in the page head and does not run a script in your browser.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-foreground">
          Links to other sites
        </h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          Source notes link to the official pages of platforms, providers,
          and institutions. Once you follow one, that site&apos;s own
          privacy practices apply, not this page.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-foreground">Changes and questions</h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          If the site starts using analytics, cookies, accounts, or similar,
          this page will be updated before or when that happens. This page
          is a plain description of current practice and does not claim
          compliance with any particular privacy law. See{" "}
          <Link href="/contact" className="text-primary underline underline-offset-2 hover:no-underline">
            Contact
          </Link>{" "}
          for the current contact status.
        </p>
      </section>
    </GuideLayout>
  );
}
