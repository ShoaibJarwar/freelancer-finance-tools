import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Alert } from "@/components/ui/Alert";

export const metadata: Metadata = {
  title: "Freelancer Fee Calculator",
  description:
    "Estimate how much of a client payment you actually receive after platform, withdrawal, and currency-conversion costs.",
};

// Placeholder route shell only. Calculator logic and financial data are
// built in a later phase (Phase F/G) — this page exists so the homepage
// CTA links somewhere real instead of a broken or disabled route.
export default function FreelancerFeeCalculatorPage() {
  return (
    <div className="py-12 sm:py-16">
      <Container>
        <div className="max-w-[640px]">
          <h1 className="text-[1.75rem] font-semibold leading-tight text-foreground sm:text-[2rem]">
            Freelancer Fee Calculator
          </h1>
          <p className="mt-3 text-[1.0625rem] leading-relaxed text-muted-foreground">
            This tool is under active development.
          </p>

          <Alert variant="info" label="Coming soon" className="mt-6">
            The calculator itself — platform fee, withdrawal cost, and
            currency-conversion breakdown — is being built next. Verified
            fee data isn&apos;t in place yet, so no calculation runs here
            today.
          </Alert>
        </div>
      </Container>
    </div>
  );
}
