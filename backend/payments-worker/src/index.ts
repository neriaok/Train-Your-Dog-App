import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export interface Env {
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_URL: string;
  STRIPE_PRICE_ID: string;
  APP_SUCCESS_URL: string;
  APP_CANCEL_URL: string;
}

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);

    if (request.method === 'POST' && url.pathname === '/create-checkout-session') {
      return createCheckoutSession(request, env, stripe);
    }

    if (request.method === 'POST' && url.pathname === '/webhook') {
      return handleWebhook(request, env, stripe);
    }

    return new Response('Not found', { status: 404, headers: CORS_HEADERS });
  },
};

/**
 * Called from the app's Upgrade screen with the signed-in user's id. Returns
 * a Stripe Checkout URL to open (e.g. via Linking.openURL / a WebView).
 */
async function createCheckoutSession(request: Request, env: Env, stripe: Stripe): Promise<Response> {
  try {
    const { userId, email } = (await request.json()) as { userId: string; email?: string };
    if (!userId) {
      return json({ error: 'userId is required' }, 400);
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: env.STRIPE_PRICE_ID, quantity: 1 }],
      customer_email: email,
      success_url: env.APP_SUCCESS_URL,
      cancel_url: env.APP_CANCEL_URL,
      // Carried through to the webhook so we know which Supabase user to
      // upgrade once payment succeeds.
      client_reference_id: userId,
      metadata: { userId },
    });

    return json({ url: session.url });
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
}

/**
 * Stripe calls this after checkout completes. Verifies the signature, then
 * flips is_premium on the matching Supabase profile using the service role
 * key (bypasses RLS - never expose this key to the app).
 */
async function handleWebhook(request: Request, env: Env, stripe: Stripe): Promise<Response> {
  const signature = request.headers.get('Stripe-Signature');
  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature ?? '', env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return json({ error: `Invalid signature: ${err}` }, 400);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id ?? session.metadata?.userId;
    if (userId) {
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
      await supabase.from('profiles').update({ is_premium: true }).eq('id', userId);
    }
  }

  // Optional but recommended for real production use: also handle
  // 'customer.subscription.deleted' / '.updated' here to set is_premium
  // back to false when a subscription is canceled or payment fails.

  return json({ received: true });
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}
