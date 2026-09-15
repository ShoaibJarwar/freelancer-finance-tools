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
    google: "orqsH3Gz3_w2F6JbqzZu7uACcO80HtKWNsGTN0iqkUE",
  },
};

{/* <meta name="google-site-verification" content="orqsH3Gz3_w2F6JbqzZu7uACcO80HtKWNsGTN0iqkUE" /> */}
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
