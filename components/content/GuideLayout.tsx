import type { ReactNode } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";

export function GuideLayout({
  breadcrumbLabel,
  title,
  intro,
  children,
}: {
  /** Text shown after "Home / " in the breadcrumb. */
  breadcrumbLabel: string;
  /** Rendered as the page's single H1. */
  title: string;
  /** Short intro paragraph(s) rendered directly under the H1. */
  intro: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="py-12 sm:py-16">
      <Container className="max-w-[720px]">
        <p className="text-[0.8125rem] text-muted-foreground">
          <Link href="/" className="underline underline-offset-2 hover:text-foreground">
            Home
          </Link>{" "}
          / {breadcrumbLabel}
        </p>

        <h1 className="mt-3 text-[1.75rem] font-semibold leading-tight text-foreground sm:text-[2rem]">
          {title}
        </h1>

        <div className="mt-4 text-[1.0625rem] leading-relaxed text-muted-foreground">
          {intro}
        </div>

        <div className="mt-8">{children}</div>
      </Container>
    </div>
  );
}
