import { type ReactNode } from "react";

export function PageHeader({
  title,
  action,
  showStatusDot = true,
}: {
  title: string;
  action?: ReactNode;
  showStatusDot?: boolean;
}) {
  return (
    <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-white">
          {title}
        </h1>
        {showStatusDot && (
          <span
            className="status-dot flex-shrink-0"
            aria-hidden
          />
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </header>
  );
}
