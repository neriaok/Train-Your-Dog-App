// Local dev entrypoint. index.ts targets Cloudflare Workers, which cannot
// spawn child processes - so it can't run `claude -p` via claudeService.ts.
// This runs the same /chat logic on plain Node (http), where child_process
// actually works, so you can test the CLI-backed agent locally.
import { createServer } from 'http';
import { runClaudeCli } from './claudeService';
import { Language } from './data';

const PORT = Number(process.env.PORT) || 8787;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AgentStep {
  type: 'thinking' | 'final';
  text?: string;
}

const SYSTEM_PROMPT: Record<Language, string> = {
  he: 'את/ה עוזר אילוף כלבים ידידותי בתוך אפליקציית "Train Your Dog App". ענה/י בעברית בלבד, בקצרה ובידידותיות.',
  en: 'You are a friendly dog training assistant inside the "Train Your Dog App". Reply in English only, briefly and warmly.',
};

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  if (req.method !== 'POST' || req.url !== '/chat') {
    res.writeHead(404, CORS_HEADERS);
    res.end('Not found');
    return;
  }

  try {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    const body = JSON.parse(Buffer.concat(chunks).toString('utf-8')) as {
      messages: ChatMessage[];
      language?: Language;
    };
    const language: Language = body.language === 'en' ? 'en' : 'he';

    const lastUserMessage = body.messages.filter(m => m.role === 'user').pop()?.content || '';
    const fullPrompt = `${SYSTEM_PROMPT[language]}\n\nUser: ${lastUserMessage}`;

    const cliResponse = await runClaudeCli(fullPrompt);

    const steps: AgentStep[] = [
      { type: 'thinking', text: language === 'he' ? 'מעבד את הבקשה...' : 'Processing request...' },
      { type: 'final', text: cliResponse },
    ];

    res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ steps }));
  } catch (err) {
    res.writeHead(500, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: String(err) }));
  }
});

server.listen(PORT, () => {
  console.log(`Agent worker (local) listening on http://localhost:${PORT}`);
});
