# Dog Training Agent - backend

A Cloudflare Worker that holds your Anthropic API key and runs the real
agent loop, so the key never sits inside the mobile/web app. Until you
deploy this and point the app at it, the app keeps using the free local
mock agent in `src/agent/mockPlanner.ts` - nothing changes on its own.

## What this is

One endpoint, `POST /chat`, that takes `{ messages: [{role, content}, ...] }`
and returns `{ steps: [...] }` in the exact same shape the app's mock
planner already produces (`thinking` / `tool_call` / `tool_result` /
`final`) - so the chat screen doesn't need any changes when you switch it
on. Internally it runs the real Claude tool-use loop (`src/index.ts`)
against the same four tools the mock planner has (`src/tools.ts`), reading
from a copy of the app's localized level content (`src/data.ts` here -
mirrors `src/data.ts` + `src/i18n/content.ts` in the app). The request body
also carries a `language: 'he' | 'en'` field so the worker answers in
whichever language the app is currently set to.

## One-time setup

```bash
cd backend/agent-worker
npm install
npm install -g wrangler   # if you don't have it yet
wrangler login
```

## Give it your API key (never committed, never in app code)

```bash
wrangler secret put ANTHROPIC_API_KEY
```
Paste your key from console.anthropic.com when prompted.

## Try it locally first (optional)

```bash
npm run dev
```
This prints a local URL. Test it:
```bash
curl -X POST http://localhost:8787/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"מה זה שב?"}]}'
```

## Deploy

```bash
npm run deploy
```
Wrangler prints your live URL, something like:
```
https://dog-training-agent.YOUR-SUBDOMAIN.workers.dev
```

## Flip the app over to it

Open `src/agent/realAgent.ts` in the app and set:
```ts
export const AGENT_BACKEND_URL = 'https://dog-training-agent.YOUR-SUBDOMAIN.workers.dev';
```
That's it - `runAgent()` (`src/agent/runAgent.ts`) automatically prefers the
real backend once this is non-empty, and falls back to the mock planner if
the request ever fails, so the assistant never just breaks.

## Cost

Hosting on Cloudflare Workers' free tier costs nothing at this scale. What
does cost money is each call to the Claude API itself, billed by
Anthropic per token - separate from any hosting bill, and unrelated to a
Claude Pro subscription. This worker defaults to `claude-opus-5`
(`src/index.ts`, `MODEL` constant); switch it to `claude-haiku-4-5` there
for much cheaper testing while you're getting this running.

## Keeping level data in sync

`src/data.ts` here is a plain copy of the app's localized level content
(no shared package between the two projects) - `getLevels('he' | 'en')`
mirrors `LEVEL_SKELETONS` in the app's `src/data.ts` merged with the `he`/
`en` entries in `src/i18n/content.ts`. If you add or edit a level (or a
translation) in the app, copy the updated content over here too, for both
languages.
