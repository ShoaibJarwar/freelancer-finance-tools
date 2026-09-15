import Link from "next/link";
import { Container } from "./Container";
import { MobileNav } from "./MobileNav";
import { navItems } from "./nav-items";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface relative">
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="text-[0.9375rem] font-semibold text-foreground"
        >
          Freelancer Finance Tools
        </Link>

        <nav aria-label="Primary" className="hidden sm:block">
          <ul className="flex items-center gap-6">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-[0.9375rem] text-muted-foreground hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <MobileNav />
      </Container>
    </header>
  );
}
