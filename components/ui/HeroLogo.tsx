"use client";

/**
 * Hero wordmark: "Prompt" (white) + "hub" (white text in orange badge).
 * Renders full "PromptHub" without relying on image assets.
 */
export function HeroLogo() {
  return (
    <div
      className="flex items-center justify-center gap-0 font-display font-extrabold tracking-tight"
      style={{ fontFamily: "var(--font-display)" }}
    >
      <span className="text-4xl text-[var(--color-text)] md:text-5xl lg:text-6xl">
        Prompt
      </span>
      <span
        className="ml-1 rounded-md px-2 py-0.5 text-4xl text-white md:ml-1.5 md:px-2.5 md:text-5xl lg:text-6xl"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        hub
      </span>
    </div>
  );
}
