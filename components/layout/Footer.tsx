import Link from "next/link";
import { Container } from "./Container";

// Every entry links to a real route. A test (tests/siteIntegrity.test.ts)
// fails if any href here points at a page that doesn't exist.
const columns: {
  heading: string;
  items: { label: string; href: string }[];
}[] = [
  {
    heading: "Tools",
    items: [
      { label: "Freelancer Fee Calculator", href: "/tools/freelancer-fee-calculator" },
      { label: "Payment Comparison", href: "/tools/payment-comparison" },
    ],
  },
  {
    heading: "Guides",
    items: [
      { label: "How Upwork Fees Work", href: "/guides/upwork-fees" },
      { label: "How Platform Fees Work", href: "/guides/how-freelancer-platform-fees-work" },
      { label: "Payment Fees Explained", href: "/guides/freelancer-payment-fees-explained" },
      { label: "USD to PKR for Freelancers", href: "/guides/usd-to-pkr-for-freelancers" },
    ],
  },
  {
    heading: "Company",
    items: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Legal",
    items: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Affiliate Disclosure", href: "/affiliate-disclosure" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <Container className="py-10">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {columns.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <p className="text-[0.8125rem] font-medium text-foreground">
                {column.heading}
              </p>
              <ul className="mt-3 space-y-2">
                {column.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-[0.8125rem] text-muted-foreground hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <p className="mt-10 max-w-[640px] text-[0.8125rem] leading-relaxed text-muted-foreground">
          Informational tools only — not financial, tax, or legal advice.
          Fees and rates can change; verify important figures with the
          provider. See the{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
            Terms of Use
          </Link>
          .
        </p>
        <p className="mt-3 text-[0.8125rem] text-muted-foreground">
          © {new Date().getFullYear()} Freelancer Finance Tools
        </p>
      </Container>
    </footer>
  );
}
