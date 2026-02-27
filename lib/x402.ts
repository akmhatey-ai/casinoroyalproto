/**
 * x402 payment helpers for premium content.
 * Return 402 with payment requirements; verify X-PAYMENT header and settle.
 * For production, wire to @x402/core facilitator and @x402/evm, @x402/svm.
 */

const FACILITATOR_URL = process.env.X402_FACILITATOR_URL ?? "https://x402.org/facilitator";

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

export function buildPaymentRequired(
  amountCents: number,
  description: string,
  options?: { payToEvm?: string; payToSolana?: string }
): { status: 402; body: PaymentRequirement; headers: Record<string, string> } {
  const price = `$${(amountCents / 100).toFixed(2)}`;
  const payToEvm = options?.payToEvm ?? process.env.X402_PAY_TO_EVM ?? "";
  const payToSolana = options?.payToSolana ?? process.env.X402_PAY_TO_SOLANA ?? "";
  const accepts: PaymentRequirement["accepts"] = [];
  if (payToEvm) {
    accepts.push({
      scheme: "exact",
      price,
      network: "eip155:8453", // Base mainnet; use eip155:84532 for Base Sepolia
      payTo: payToEvm,
    });
  }
  if (payToSolana) {
    accepts.push({
      scheme: "exact",
      price,
      network: "solana:5eykt4SsFv8VHZbfC", // Solana mainnet
      payTo: payToSolana,
    });
  }
  if (accepts.length === 0) {
    accepts.push({
      scheme: "exact",
      price,
      network: "eip155:84532",
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

/**
 * Verify X-PAYMENT header. In production, use facilitator client to verify.
 * For development, optional bypass if X-PAYMENT is a known dev token.
 */
export function getPaymentHeader(req: Request): string | null {
  return req.headers.get("X-PAYMENT") ?? null;
}

/**
 * Stub: in production, verify payment with facilitator and return tx hash + chain.
 * For now we accept any non-empty X-PAYMENT as "paid" for development.
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
