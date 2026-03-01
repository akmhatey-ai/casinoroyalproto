"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { SiweMessage } from "siwe";

export function WalletConnectButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    const ethereum = typeof window !== "undefined" ? (window as unknown as { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum : undefined;
    if (!ethereum) {
      setError("No wallet found. Install MetaMask or another Web3 wallet.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      const [account] = (await ethereum.request({ method: "eth_requestAccounts" })) as string[];
      if (!account) throw new Error("No account selected");
      const res = await fetch("/api/auth/siwe-nonce");
      const { nonce } = (await res.json()) as { nonce: string };
      const domain = typeof window !== "undefined" ? window.location.host : "";
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const message = new SiweMessage({
        domain,
        address: account,
        statement: "Sign in to PromptHub",
        uri: origin,
        version: "1",
        chainId: 1,
        nonce,
        issuedAt: new Date().toISOString(),
      });
      const messageToSign = message.prepareMessage();
      const signature = (await ethereum.request({
        method: "personal_sign",
        params: [messageToSign, account],
      })) as string;
      const result = await signIn("credentials", {
        message: messageToSign,
        signature,
        chain: "evm",
        redirect: true,
        callbackUrl: "/dashboard",
      });
      const err = (result as { error?: string } | undefined)?.error;
      if (err) {
        setError("Sign-in failed. Try again.");
        setStatus("error");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Wallet sign-in failed");
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={handleConnect}
        disabled={status === "loading"}
        className="w-full rounded-full border border-white/10 bg-white/5 px-8 py-2.5 text-sm font-medium text-[#A0A0A0] transition-colors hover:border-white/20 hover:text-white disabled:opacity-50 sm:w-auto"
      >
        {status === "loading" ? "Connecting…" : "Connect Wallet (EVM)"}
      </button>
      {error && <p className="text-xs text-amber-400">{error}</p>}
    </div>
  );
}
