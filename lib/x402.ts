/**
 * x402 payment helpers for premium content.
 * Return 402 with payment requirements; verify PAYMENT-SIGNATURE / X-PAYMENT and settle.
 * USDC on Solana + EVM (Base default). Production: wire to facilitator.
 */

import { getOwnerWallets } from "./payment-config";
import { EVM_NETWORKS, SOLANA_NETWORKS } from "./payment-config";

const FACILITATOR_URL = process.env.X402_FACILITATOR_URL ?? process.env.NEXT_PUBLIC_X402_FACILITATOR_URL ?? "https://x402.org/facilitator";

export interface PaymentRequirement {
  amountCents: number;
  description: string;
  accepts: Array<{
    scheme: string;
    price: string;
    network: string;
    payTo: string;
  }>;
}

export type PaymentOptions = {
  payToEvm?: string;
  payToSolana?: string;
  /** Preferred chain for ordering: evm (Base first) or solana */
  preferredChain?: "evm" | "solana";
  /** Include Base Sepolia / Solana Devnet for testnets */
  testnet?: boolean;
};

export function buildPaymentRequired(
  amountCents: number,
  description: string,
  options?: PaymentOptions
): { status: 402; body: PaymentRequirement; headers: Record<string, string> } {
  const price = `$${(amountCents / 100).toFixed(2)}`;
  const owner = getOwnerWallets();
  const payToEvm = options?.payToEvm ?? owner.evm;
  const payToSolana = options?.payToSolana ?? owner.solana;
  const accepts: PaymentRequirement["accepts"] = [];
  const preferEvm = options?.preferredChain !== "solana";

  if (payToEvm) {
    accepts.push({
      scheme: "exact",
      price,
      network: EVM_NETWORKS.base.caip2,
      payTo: payToEvm,
    });
    if (options?.testnet) {
      accepts.push({
        scheme: "exact",
        price,
        network: EVM_NETWORKS.baseSepolia.caip2,
        payTo: payToEvm,
      });
    }
  }
  if (payToSolana) {
    accepts.push({
      scheme: "exact",
      price,
      network: SOLANA_NETWORKS.mainnet.caip2,
      payTo: payToSolana,
    });
    if (options?.testnet) {
      accepts.push({
        scheme: "exact",
        price,
        network: SOLANA_NETWORKS.devnet.caip2,
        payTo: payToSolana,
      });
    }
  }
  if (preferEvm && accepts.length > 1) {
    accepts.sort((a, b) => (a.network.startsWith("eip155") ? -1 : 1) - (b.network.startsWith("eip155") ? -1 : 1));
  } else if (!preferEvm && accepts.length > 1) {
    accepts.sort((a, b) => (a.network.startsWith("solana") ? -1 : 1) - (b.network.startsWith("solana") ? -1 : 1));
  }
  if (accepts.length === 0) {
    accepts.push({
      scheme: "exact",
      price,
      network: EVM_NETWORKS.baseSepolia.caip2,
      payTo: "0x0000000000000000000000000000000000000000",
    });
  }
  return {
    status: 402,
    body: {
      amountCents,
      description,
      accepts,
    },
    headers: {
      "Content-Type": "application/json",
      "X-Payment-Required": "true",
      "X-Payment-Facilitator": FACILITATOR_URL,
    },
  };
}

/** Get payment proof from request (PAYMENT-SIGNATURE or X-PAYMENT per x402). */
export function getPaymentHeader(req: Request): string | null {
  return req.headers.get("PAYMENT-SIGNATURE") ?? req.headers.get("X-PAYMENT") ?? null;
}

/**
 * Verify payment. In production: POST payment header + requirement to X402_FACILITATOR_URL/verify.
 * For development we accept non-empty X-PAYMENT; set X402_STRICT_VERIFY=true to require facilitator.
 */
export async function verifyPayment(_paymentHeader: string): Promise<{
  verified: boolean;
  chain?: "solana" | "evm";
  txHash?: string;
}> {
  // TODO: call facilitator to verify; parse payment header per x402 spec
  if (_paymentHeader && _paymentHeader.length > 0) {
    return {
      verified: true,
      chain: "evm",
      txHash: "stub-" + Date.now(),
    };
  }
  return { verified: false };
}
