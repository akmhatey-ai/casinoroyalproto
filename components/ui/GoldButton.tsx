"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";

export const GoldButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean; href?: string }
>(function GoldButton({ className = "", children, asChild, href, ...props }, ref) {
  const classes =
    "inline-flex items-center justify-center rounded-full bg-[length:200%_100%] bg-[linear-gradient(135deg,#D4A84B_0%,#F3D081_50%,#B88E36_100%)] px-6 py-2.5 text-sm font-bold text-[#09090B] shadow-[0_4px_15px_rgba(212,168,75,0.3)] transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:shadow-[0_4px_25px_rgba(212,168,75,0.25)] active:scale-95 disabled:pointer-events-none disabled:opacity-50 " +
    className;

  if (asChild && href !== undefined) {
    return (
      <a href={href} className={classes} ref={ref as React.Ref<HTMLAnchorElement>}>
        {children}
      </a>
    );
  }
  return (
    <button ref={ref} className={classes} {...props}>
      {children}
    </button>
  );
});

export function GoldLink({
  href,
  className = "",
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <a
      href={href}
      className={
        "inline-flex items-center justify-center rounded-full bg-[length:200%_100%] bg-[linear-gradient(135deg,#D4A84B_0%,#F3D081_50%,#B88E36_100%)] px-6 py-2.5 text-sm font-bold text-[#09090B] shadow-[0_4px_15px_rgba(212,168,75,0.3)] transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:shadow-[0_4px_25px_rgba(212,168,75,0.25)] active:scale-95 " +
        className
      }
      {...props}
    >
      {children}
    </a>
  );
}
