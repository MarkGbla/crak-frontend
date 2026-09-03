# CRAK Frontend

The web experience for CRAK: referral campaigns, wallet funding, reward payouts and workspace controls for growing businesses.

This repository is intentionally separate from [`zNi0q/crak-backend`](https://github.com/zNi0q/crak-backend). No backend source was changed while creating it.

## What is included


- Responsive dashboard for overview, referrals, rewards, wallet, API keys and settings
- Interactive referral-creation and wallet-funding demos
- Driver.js onboarding tour
- Typed client for the existing CRAK FastAPI endpoints
- Social sharing metadata and a custom 1200×630 Open Graph image
- Desktop and mobile layouts

The interface currently uses representative preview data so it can be reviewed without credentials. The API client in `src/lib/crak-api.ts` is ready for the Clerk-authenticated integration phase.

## Stack

- Next.js 16 App Router
- React 19 and TypeScript
- Tailwind CSS 4
- Driver.js
- Lucide icons

## Local development

Use Node.js 20 LTS or Node.js 22+.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The product preview is available at [http://localhost:3000/dashboard](http://localhost:3000/dashboard).

## Environment

```env
CRAK_API_URL=http://localhost:8000
NEXT_PUBLIC_CRAK_API_URL=http://localhost:8000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

Prefer `CRAK_API_URL` for server-side requests. Financial responses are requested with `cache: "no-store"`, and all allocation, release, reward and funding helpers accept an idempotency key.

## Commands

```bash
npm run dev
npm run lint
npm run build
npm start
```

## Integration notes

- CRAK money values are integers in minor units; use the API-provided `display` value for human-readable amounts.
- Referral mutations require `business_id` as a query parameter.
- Wallet funding supports `ussd` and `payment_link`.
- Roles are `viewer`, `member`, `admin` and `owner`; the UI should hide actions a role cannot perform, but the backend remains the authority.
- The existing API does not expose public referral links, click/conversion analytics, member listing/removal or business editing yet. The frontend does not invent calls for those capabilities.

## Image credits

Merchant photography by [Ali Mkumbwa on Unsplash](https://unsplash.com/photos/a-woman-standing-in-front-of-a-store-holding-a-cell-phone-H1KbBGUs4bM), used under the Unsplash License. The social preview is an original generated CRAK asset.
