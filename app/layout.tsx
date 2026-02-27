import type { Metadata } from "next";
import { SessionProvider } from "@/components/providers/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Prompt Hub — MCP Tools, Prompts & Skills for AI Agents",
    template: "%s | Prompt Hub",
  },
  description: "Directory of MCP tools, prompts, and SKILL.md files. Search, submit, one-click install. Free and premium with x402 payments.",
  openGraph: {
    title: "Prompt Hub — MCP Tools, Prompts & Skills for AI Agents",
    description: "Directory of MCP tools, prompts, and SKILL.md files for AI agents.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
