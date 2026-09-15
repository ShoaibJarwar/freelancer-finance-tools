import Link from "next/link";
import { Container } from "./Container";

// Items without an href are planned pages that don't exist yet — shown as
// plain text (not links) so the footer previews the future structure
// without ever pointing to a broken route.
const columns: {
  heading: string;
  items: { label: string; href?: string }[];
}[] = [
  {
    heading: "Product",
    items: [{ label: "Tools" }, { label: "Guides" }],
  },
  {
    heading: "Company",
    items: [{ label: "About" }, { label: "Contact" }],
  },
  {
    heading: "Legal",
    items: [
      { label: "Privacy" },
      { label: "Terms" },
      { label: "Affiliate Disclosure" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <Container className="py-10">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {columns.map((column) => (
            <div key={column.heading}>
              <p className="text-[0.8125rem] font-medium text-foreground">
                {column.heading}
              </p>
              <ul className="mt-3 space-y-2">
                {column.items.map((item) =>
                  item.href ? (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-[0.8125rem] text-muted-foreground hover:text-foreground"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ) : (
                    <li
                      key={item.label}
                      className="text-[0.8125rem] text-muted-foreground"
                    >
                      {item.label}
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-10 text-[0.8125rem] text-muted-foreground">
          © {new Date().getFullYear()} Freelancer Finance Tools. Working title
          — not a final brand.
        </p>
      </Container>
    </footer>
  );
}
