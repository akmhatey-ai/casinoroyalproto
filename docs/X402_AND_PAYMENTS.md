# x402 protocol and payments

This app implements the **x402** payment protocol (HTTP 402 Payment Required) for micropayments in USDC on Solana and EVM (Base, Ethereum, Polygon, BNB). Platform owner wallets are configurable via env; vendor services use a **25% platform / 75% vendor** revenue split.

## Environment (payments)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_TIP_WALLET_SOL` | Platform Solana address (tips + 25% of vendor sales) |
| `NEXT_PUBLIC_TIP_WALLET_EVM` | Platform EVM address (tips + 25% of vendor sales) |
| `X402_FACILITATOR_URL` | x402 facilitator (testnet: `https://x402.org/facilitator`) |
| `PLATFORM_FEE_PERCENT` | Platform share of vendor sales (default 25) |
| `USDC_*` | Optional USDC contract addresses per chain (see `lib/payment-config.ts`) |

## API routes

| Route | Method | Description |
|-------|--------|--------------|
| `/api/payments` | GET | Get payment requirement (402). Query: `type=service&id=...` or `type=tip&amountCents=1-500&toUserId=...` |
| `/api/services` | GET | List active services. POST: create (auth). |
| `/api/services/[id]` | GET, PATCH | Get or update service (PATCH: vendor only). |
| `/api/services/[id]/access` | GET | Pay for service: 402 with requirement, or with `PAYMENT-SIGNATURE` returns success and records 25/75 split. |
| `/api/tips` | POST | Tip: body `{ amountCents, toUserId? }`. Returns 402 or, with payment header, records tip. |
| `/api/tickets` | GET | List current user's support tickets (auth). |
| `/api/tickets/create` | POST | Create ticket (auth). Body: `{ title, description }`. |
| `/api/tickets/[id]` | GET, PATCH | Get or update ticket (auth). |
| `/api/tickets/[id]/comments` | GET, POST | List or add comments (auth). Staff set via `ADMIN_USER_ID`. |

## Payment flow (x402)

1. Client requests a paid resource (e.g. `GET /api/services/SERVICE_ID/access` or `POST /api/tip` with body).
2. Server responds **402** with JSON body: `amountCents`, `description`, `accepts` (network, payTo, price in USD).
3. Client pays via wallet (Phantom, MetaMask, WalletConnect) with USDC to the given `payTo` on the chosen network.
4. Client retries the same request with header **`PAYMENT-SIGNATURE`** (or `X-PAYMENT`) containing the payment proof.
5. Server verifies (stub or facilitator), records transaction and splits (for vendor services: 25% platform, 75% vendor), returns 200.

## Support tickets

- **Create:** Dashboard → Support tickets → New ticket (title + description).
- **Email:** If `RESEND_API_KEY` is set, a confirmation email is sent on ticket creation.
- **Admin:** Set `ADMIN_USER_ID` to a comma-separated list of user IDs; those users can reply as staff and see all tickets.

## Vendor services

- **Create:** Dashboard → My services → Create (name, description, price USD, preferred chain, optional payout wallets).
- **Payout:** If the vendor has EVM/Solana wallet in profile or on the service, 75% goes there; otherwise 100% goes to platform but vendor earnings are tracked in dashboard for later claiming.
- **Access:** `GET /api/services/[id]/access` returns 402 until payment is sent with `PAYMENT-SIGNATURE`.

## Testing

- Use testnet facilitator and Base Sepolia / Solana Devnet for low-cost testing.
- Set `X402_STRICT_VERIFY=true` to require facilitator verification (otherwise non-empty payment header is accepted for development).
