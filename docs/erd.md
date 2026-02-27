# Prompt Hub — Entity Relationship (ERD)

## Entities

### User
- `id` (PK)
- `email` (unique, nullable for wallet-only)
- `username` (unique, nullable)
- `walletSolana` (nullable)
- `walletEvm` (nullable)
- `earningsCents` (default 0)
- `referralCode` (unique, optional)
- `createdAt`, `updatedAt`

### Prompt
- `id` (PK)
- `title`, `slug` (unique)
- `description`, `content` (text/markdown)
- `isPremium` (boolean), `priceUsdCents` (nullable)
- `submitterId` (FK → User)
- `status` (draft | pending | approved | rejected)
- `downloads` (int, default 0)
- `category` (optional)
- `createdAt`, `updatedAt`

### Skill
- `id` (PK)
- `name`, `slug` (unique)
- `description`, `skillMd` (text or path)
- `integrations` (JSON: compatible agents, allowed-tools)
- `submitterId` (FK → User)
- `status`, `downloads`, `isPremium`, `priceUsdCents`
- `createdAt`, `updatedAt`

### Transaction
- `id` (PK)
- `userId` (FK → User)
- `itemType` (prompt | skill | tip)
- `itemId` (prompt/skill id or recipient user id for tip)
- `amountCents`, `chain` (solana | evm), `txHash`, `status`
- `createdAt`

### Submission
- `id` (PK)
- `userId` (FK → User)
- `itemType` (prompt | skill)
- `itemId` (FK to Prompt or Skill)
- `status` (pending | approved | rejected)
- `createdAt`

### Vote (optional)
- `id` (PK)
- `userId` (FK → User)
- `itemType` (prompt | skill), `itemId`
- `value` (e.g. 1 for upvote or 1–5 rating)
- `createdAt`

## Relationships
- User 1 → N Prompt, Skill, Transaction, Submission, Vote
- Prompt/Skill N → 1 User (submitter)
- Transaction N → 1 User
