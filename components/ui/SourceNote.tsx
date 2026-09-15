import { HTMLAttributes } from "react";

export interface SourceNoteProps extends HTMLAttributes<HTMLDivElement> {
  /** Human-readable source description, e.g. "Official provider documentation". */
  source: string;
  /** Human-readable verification date, e.g. "September 2026". */
  lastVerified: string;
  /** Optional link to the source. */
  sourceUrl?: string;
}

/**
 * Presentational only — every value is passed in via props. No financial
 * data, provider names, or dates are hardcoded here.
 */
export function SourceNote({
  source,
  lastVerified,
  sourceUrl,
  className = "",
  ...props
}: SourceNoteProps) {
  return (
    <div
      className={`space-y-0.5 text-[0.8125rem] text-muted-foreground ${className}`}
      {...props}
    >
      <p>
        Source:{" "}
        {sourceUrl ? (
          <a
            href={sourceUrl}
            className="underline underline-offset-2 hover:text-foreground"
          >
            {source}
          </a>
        ) : (
          source
        )}
      </p>
      <p>Last verified: {lastVerified}</p>
    </div>
  );
}
