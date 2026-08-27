# Dog Training payments - backend

A Cloudflare Worker that talks to Stripe and Supabase so real payments
never touch the app or its secrets. Not deployed yet - until you finish
setup below, the app has no way to reach this, and stays in "no accounts /
no gating" or "accounts, manual premium toggle" mode (see
`backend/supabase/README.md`).

## What this is

Two endpoints:
- `POST /create-checkout-session` - the app calls this (with the signed-in
  user's id) to get a Stripe Checkout URL to open.
- `POST /webhook` - Stripe calls this when a payment succeeds. It verifies
  the signature, then sets `is_premium = true` on that user's Supabase
  profile using the Supabase **service role** key (bypasses row-level
  security - this key must only ever live here, never in the app).

## One-time setup

```bash
cd backend/payments-worker
npm install
wrangler login   # if you haven't already for backend/agent-worker
```

1. **Stripe**: create an account at [stripe.com](https://stripe.com), create
   a Product with a recurring Price (your premium plan), copy its **Price
   ID** (`price_...`).
2. Fill in `wrangler.toml`'s `[vars]`:
   - `SUPABASE_URL` - same as `src/auth/supabaseClient.ts` in the app.
   - `STRIPE_PRICE_ID` - from step 1.
   - `APP_SUCCESS_URL` / `APP_CANCEL_URL` - where to send the user back to
     after Stripe Checkout (a URL your app can handle, e.g. a deep link).
3. Set the secrets (never go in `wrangler.toml`):
   ```bash
   wrangler secret put STRIPE_SECRET_KEY          # Stripe dashboard -> Developers -> API keys
   wrangler secret put SUPABASE_SERVICE_ROLE_KEY  # Supabase -> Settings -> API -> service_role
   ```
4. Deploy once to get a URL, then finish the webhook setup:
   ```bash
   npm run deploy
   ```
   Stripe dashboard -> Developers -> Webhooks -> Add endpoint -> your
   worker's URL + `/webhook`, listening for `checkout.session.completed`.
   Copy the **signing secret** it gives you:
   ```bash
   wrangler secret put STRIPE_WEBHOOK_SECRET
   ```
   Re-deploy (`npm run deploy`) after adding secrets so the Worker picks
   them up.

## Wiring the app to it

The Upgrade screen (`src/screens/UpgradeScreen.tsx`) has a
`PAYMENTS_BACKEND_URL` constant at the top, empty by default (same pattern
as `AGENT_BACKEND_URL`). Fill it in with this worker's deployed URL and
the "Upgrade" button starts actually creating real Stripe Checkout
sessions instead of showing the "not connected yet" placeholder state.

## Cost

Same shape as `backend/agent-worker`: Cloudflare Workers' free tier costs
nothing at this scale. Stripe charges its standard processing fee only on
successful payments (no monthly fee) - nothing is charged for having this
deployed and unused.
