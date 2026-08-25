import { AgentStep } from './types';
import { KNOWN_COMMANDS, searchCommand, getLevelOverview, getRandomTip, listCommands } from './tools';

/**
 * Free, local, offline stand-in for the "which tool should I call" decision
 * a real model makes - keyword matching instead of understanding. Talks to
 * the exact same tools (./tools.ts) as the real agent does, so the only
 * thing that changes when you switch to the real API is *who decides*.
 */
export function runMockAgent(userMessage: string): AgentStep[] {
  const steps: AgentStep[] = [];
  const msg = userMessage.trim();

  steps.push({ type: 'thinking', text: 'מנתח את ההודעה ומחפש כלי מתאים...' });

  const matchedCommand = KNOWN_COMMANDS.find(c => msg.includes(c));
  if (matchedCommand) {
    steps.push({ type: 'tool_call', tool: 'searchCommand', args: { command: matchedCommand } });
    const result = searchCommand(matchedCommand);
    steps.push({ type: 'tool_result', result });
    steps.push({ type: 'final', text: result });
    return steps;
  }

  const levelMatch = msg.match(/(\d)/);
  if (msg.includes('רמה') && levelMatch) {
    const levelId = parseInt(levelMatch[1], 10);
    steps.push({ type: 'tool_call', tool: 'getLevelOverview', args: { levelId } });
    const result = getLevelOverview(levelId);
    steps.push({ type: 'tool_result', result });
    steps.push({ type: 'final', text: result });
    return steps;
  }

  if (/טיפ|עצה|עזר/.test(msg)) {
    steps.push({ type: 'tool_call', tool: 'getRandomTip', args: {} });
    const result = getRandomTip();
    steps.push({ type: 'tool_result', result });
    steps.push({ type: 'final', text: result });
    return steps;
  }

  if (/פקוד/.test(msg)) {
    steps.push({ type: 'tool_call', tool: 'listCommands', args: {} });
    const result = listCommands();
    steps.push({ type: 'tool_result', result });
    steps.push({ type: 'final', text: result });
    return steps;
  }

  steps.push({
    type: 'final',
    text: 'לא הצלחתי למצוא תשובה לשאלה הזו 🤔 נסה לשאול על פקודה ספציפית (למשל "שב"), על רמה ("מה יש ברמה 2"), לבקש "טיפ", או לשאול "אילו פקודות יש".',
  });
  return steps;
}
