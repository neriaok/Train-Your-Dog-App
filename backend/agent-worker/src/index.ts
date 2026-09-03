import { runClaudeCli } from './claudeService';
import { Language } from './data';

export interface Env {
  ANTHROPIC_API_KEY: string;
}

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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    if (request.method !== 'POST' || url.pathname !== '/chat') {
      return new Response('Not found', { status: 404, headers: CORS_HEADERS });
    }

    try {
      const body = (await request.json()) as { messages: ChatMessage[]; language?: Language };
      const language: Language = body.language === 'en' ? 'en' : 'he';

      // חילוץ ההודעה האחרונה של המשתמש
      const lastUserMessage = body.messages.filter(m => m.role === 'user').pop()?.content || '';

      // בניית הפרומפט המלא כולל ה-System Prompt
      const fullPrompt = `${SYSTEM_PROMPT[language]}\n\nUser: ${lastUserMessage}`;

      // הרצת ה-CLI דרך ה-Helper
      const cliResponse = await runClaudeCli(fullPrompt);

      const steps: AgentStep[] = [
        {
          type: 'thinking',
          text: language === 'he' ? 'מעבד את הבקשה...' : 'Processing request...',
        },
        {
          type: 'final',
          text: cliResponse,
        },
      ];

      return new Response(JSON.stringify({ steps }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
  },
};