import { AgentStep, AgentMessage } from './types';
import { Level } from '../data';
import { Language } from '../i18n/LanguageContext';
import { runMockAgent } from './mockPlanner';
import { runRealAgent, isRealAgentConfigured } from './realAgent';

/**
 * Single entry point the UI calls. Uses the real backend once
 * AGENT_BACKEND_URL (realAgent.ts) is filled in, and transparently falls
 * back to the free local mock otherwise - or if the real backend errors -
 * so the assistant never just breaks.
 */
export async function runAgent(
  userMessage: string,
  levels: Level[],
  language: Language,
  history: AgentMessage[] = []
): Promise<AgentStep[]> {
  if (isRealAgentConfigured()) {
    try {
      return await runRealAgent(userMessage, history, language);
    } catch {
      return runMockAgent(userMessage, levels, language);
    }
  }
  return runMockAgent(userMessage, levels, language);
}
