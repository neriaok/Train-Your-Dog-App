import { AgentStep, AgentMessage } from './types';

/**
 * Fill this in with your deployed backend/agent-worker URL to switch the
 * app over to a real Claude-powered agent, e.g.:
 *   'https://dog-training-agent.YOUR-SUBDOMAIN.workers.dev'
 * Leave empty to keep using the free local mock planner (mockPlanner.ts).
 * Deployment steps: backend/agent-worker/README.md
 */
export const AGENT_BACKEND_URL = '';

export function isRealAgentConfigured(): boolean {
  return AGENT_BACKEND_URL.trim().length > 0;
}

export async function runRealAgent(userMessage: string, history: AgentMessage[]): Promise<AgentStep[]> {
  const res = await fetch(`${AGENT_BACKEND_URL.replace(/\/$/, '')}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [...history, { role: 'user', content: userMessage }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Agent backend responded with ${res.status}`);
  }

  const data = (await res.json()) as { steps: AgentStep[] };
  return data.steps;
}
