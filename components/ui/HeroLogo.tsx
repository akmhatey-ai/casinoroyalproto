"use client";

import { useState } from "react";

const HEADLINE_IMAGE = "/headline.jpg";
const FALLBACK = "/prompthub-wordmark.png";

export function HeroLogo() {
  const [src, setSrc] = useState(HEADLINE_IMAGE);
  return (
    <img
      src={src}
      alt="PromptHub"
      className="h-auto max-h-20 w-full max-w-md object-contain md:max-h-24"
      onError={() => setSrc(FALLBACK)}
    />
  );
}
