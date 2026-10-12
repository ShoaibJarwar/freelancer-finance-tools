// Only routes that exist today. There is no /guides or /tools index page,
// so guides are reached from the homepage and footer rather than a nav
// item that would have nowhere to point.
export const navItems = [
  { href: "/", label: "Home" },
  { href: "/tools/freelancer-fee-calculator", label: "Fee Calculator" },
  { href: "/tools/payment-comparison", label: "Payment Comparison" },
] as const;
