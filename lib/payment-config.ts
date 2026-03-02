/**
 * x402 / USDC payment config: networks (CAIP-2), USDC contract addresses, RPC URLs.
 * All transactions use USDC. Default EVM chain: Base (low fees).
 */

export const EVM_NETWORKS = {
  base: { caip2: "eip155:8453", name: "Base" },
  baseSepolia: { caip2: "eip155:84532", name: "Base Sepolia" },
  ethereum: { caip2: "eip155:1", name: "Ethereum" },
  polygon: { caip2: "eip155:137", name: "Polygon" },
  bnb: { caip2: "eip155:56", name: "BNB Chain" },
} as const;

export const SOLANA_NETWORKS = {
  mainnet: { caip2: "solana:5eykt4SsFv8VHZbfC", name: "Solana" },
  devnet: { caip2: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1", name: "Solana Devnet" },
} as const;

/** USDC contract address per EVM chain (mainnet). Testnet uses different addresses. */
export const USDC_EVM: Record<string, string> = {
  "eip155:8453": process.env.USDC_BASE ?? "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "eip155:1": process.env.USDC_ETHEREUM ?? "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "eip155:137": process.env.USDC_POLYGON ?? "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
  "eip155:56": process.env.USDC_BNB ?? "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
  "eip155:84532": process.env.USDC_BASE_SEPOLIA ?? "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
};

/** Platform owner wallets (tips + 25% of vendor sales). Configurable via env. */
export function getOwnerWallets(): { evm: string; solana: string } {
  return {
    evm: process.env.NEXT_PUBLIC_TIP_WALLET_EVM ?? process.env.X402_PAY_TO_EVM ?? process.env.RECEIVER_WALLET_EVM ?? "",
    solana: process.env.NEXT_PUBLIC_TIP_WALLET_SOL ?? process.env.X402_PAY_TO_SOLANA ?? process.env.RECEIVER_WALLET_SOL ?? "",
  };
}

export const PLATFORM_FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT ?? "25");
export const VENDOR_PERCENT = 100 - PLATFORM_FEE_PERCENT;
