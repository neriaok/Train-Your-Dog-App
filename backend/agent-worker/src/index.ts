import Anthropic from '@anthropic-ai/sdk';
import { TOOL_DEFINITIONS, executeTool } from './tools';
import { Language } from './data';

export interface Env {
  ANTHROPIC_API_KEY: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AgentStep {
  type: 'thinking' | 'tool_call' | 'tool_result' | 'final';
  text?: string;
  tool?: string;
  args?: Record<string, string | number>;
  result?: string;
}

const SYSTEM_PROMPT: Record<Language, string> = {
  he:
    'את/ה עוזר אילוף כלבים ידידותי בתוך אפליקציית "Train Your Dog App". ' +
    'ענה/י בעברית בלבד, בקצרה ובידידותיות. השתמש/י תמיד בכלים שברשותך כדי ' +
    'לענות על שאלות לגבי פקודות אילוף ורמות ספציפיות באפליקציה, במקום ' +
    'להמציא תשובה.',
  en:
    'You are a friendly dog training assistant inside the "Train Your Dog App". ' +
    'Reply in English only, briefly and warmly. Always use your tools to ' +
    'answer questions about training commands and specific levels in the ' +
    'app, instead of making up an answer.',
};

// Defaults to Claude Opus 5. Swap to 'claude-haiku-4-5' for far cheaper
// testing while you're wiring this up - that's your call, not a default
// this file should silently make for you.
const MODEL = 'claude-opus-5';

const MAX_TOOL_ITERATIONS = 5;

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
      const steps = await runAgentLoop(body.messages, language, env.ANTHROPIC_API_KEY);
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

async function runAgentLoop(history: ChatMessage[], language: Language, apiKey: string): Promise<AgentStep[]> {
  const client = new Anthropic({ apiKey });
  const steps: AgentStep[] = [
    {
      type: 'thinking',
      text: language === 'he'
        ? 'מנתח את ההודעה ומחליט אילו כלים להפעיל...'
        : 'Analyzing the message and deciding which tools to use...',
    },
  ];

  const messages: Anthropic.MessageParam[] = history.map(m => ({
    role: m.role,
    content: m.content,
  }));

  for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT[language],
      tools: TOOL_DEFINITIONS,
      messages,
    });

    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
    );

    if (toolUseBlocks.length === 0) {
      const textBlock = response.content.find(
        (b): b is Anthropic.TextBlock => b.type === 'text'
      );
      steps.push({ type: 'final', text: textBlock?.text ?? '' });
      return steps;
    }

    messages.push({ role: 'assistant', content: response.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of toolUseBlocks) {
      const args = block.input as Record<string, string | number>;
      steps.push({ type: 'tool_call', tool: block.name, args });
      const result = executeTool(block.name, language, args);
      steps.push({ type: 'tool_result', result });
      toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result });
    }
    messages.push({ role: 'user', content: toolResults });
  }

  steps.push({
    type: 'final',
    text: language === 'he'
      ? 'מצטער, לא הצלחתי לענות על השאלה הזו כרגע.'
      : "Sorry, I couldn't answer that question right now.",
  });
  return steps;
}
