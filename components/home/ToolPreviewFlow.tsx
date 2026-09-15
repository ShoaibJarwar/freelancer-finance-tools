const steps = [
  { label: "Client payment", detail: "What your client sends" },
  { label: "Platform fee", detail: "Charged by Upwork, Fiverr, etc." },
  { label: "Withdrawal cost", detail: "Charged by your payment provider" },
  { label: "Currency conversion", detail: "If you're paid in a different currency" },
];

export function ToolPreviewFlow() {
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6">
      <p className="text-[0.8125rem] font-medium text-muted-foreground">
        Example calculation structure — not real figures
      </p>

      <ol className="mt-4 space-y-0">
        {steps.map((step, i) => (
          <li key={step.label}>
            <div className="flex items-baseline justify-between gap-4 py-2.5">
              <div>
                <p className="text-[0.9375rem] text-foreground">
                  {step.label}
                </p>
                <p className="text-[0.8125rem] text-muted-foreground">
                  {step.detail}
                </p>
              </div>
              <span className="font-figures text-[0.9375rem] text-muted-foreground">
                − $XX
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="border-t border-border" />
            )}
          </li>
        ))}
      </ol>

      <div className="mt-2 border-t border-border pt-4">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-[0.9375rem] font-medium text-foreground">
            Estimated amount received
          </p>
          <span className="font-figures text-xl font-semibold text-foreground">
            $XXX
          </span>
        </div>
      </div>
    </div>
  );
}
