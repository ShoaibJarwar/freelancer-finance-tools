import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "Freelancer Finance Tools (working title)",
    template: "%s | Freelancer Finance Tools (working title)",
  },
  description:
    "Placeholder metadata — to be replaced once the brand and site copy are finalized.",
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
