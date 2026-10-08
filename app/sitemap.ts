import type { MetadataRoute } from "next";

// No production domain has been chosen yet (see Phase D/O). Once one is,
// set NEXT_PUBLIC_SITE_URL and every URL below updates automatically —
// nothing here invents a public domain. The localhost fallback is correct
// for local/dev use only.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Exactly the real, canonical routes — no query-string calculator states,
// no duplicate variants. This list is hand-maintained, not derived from
// any dynamic/user state, so there is no way for a parameterized URL to
// end up here.
const ROUTES: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/tools/freelancer-fee-calculator", priority: 0.8 },
  { path: "/tools/payment-comparison", priority: 0.8 },
  { path: "/guides/upwork-fees", priority: 0.6 },
  { path: "/guides/how-freelancer-platform-fees-work", priority: 0.6 },
  { path: "/guides/freelancer-payment-fees-explained", priority: 0.6 },
  { path: "/guides/usd-to-pkr-for-freelancers", priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly",
    priority,
  }));
}
