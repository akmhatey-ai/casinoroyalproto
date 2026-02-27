import type { ReactNode } from "react";

export function GlassPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "rounded-[32px] border border-white/10 bg-[rgba(255,255,255,0.04)] p-8 backdrop-blur-[16px] " +
        className
      }
    >
      {children}
    </div>
  );
}
