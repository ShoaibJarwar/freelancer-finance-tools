export function ToolPreviewFlow() {
  const steps = [
    { label: "Client payment", value: "$XX" },
    { label: "Platform fee", value: "− $X" },
    { label: "Payment/withdrawal cost", value: "− $X" },
    { label: "Currency conversion", value: "± $X" },
    { label: "Estimated amount received", value: "$XX" },
  ];

  return (
    <div className="space-y-2">
      {steps.map((step, i) => (
        <div key={step.label}>
          <div className="flex items-center justify-between rounded-[var(--radius-control)] border border-border bg-surface-muted px-4 py-3">
            <span className="text-[0.875rem] text-muted-foreground">{step.label}</span>
            <span className="font-figures text-[0.875rem] font-medium text-foreground">
              {step.value}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="flex justify-center py-1 text-muted-foreground" aria-hidden="true">
              ↓
            </div>
          )}
        </div>
      ))}
      <p className="pt-2 text-[0.8125rem] text-muted-foreground">
        Example calculation structure — not real figures. Still in
        development; this is what the breakdown will look like.
      </p>
    </div>
  );
}
