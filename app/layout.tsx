import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "Freelancer Finance Tools",
    template: "%s | Freelancer Finance Tools",
  },
  description:
    "Calculators and guides showing what freelancers paid by international clients can and can't calculate about platform fees, payment-provider costs, and currency conversion — with sources and uncertainty labeled.",
  verification: {
    google: "_RMV8KdV4mNO6DLVBaabSzaUqIU9-zh5jr2l_2oEOTM",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
