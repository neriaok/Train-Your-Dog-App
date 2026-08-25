import { LEVELS } from '../data';

/**
 * Educational simulation of an agentic tool-use loop - NO real LLM call.
 * Mirrors the shape of a real agent's response content blocks
 * (thinking -> tool_use -> tool_result -> final text), but the "reasoning"
 * here is plain keyword matching instead of a language model.
 */
export interface AgentStep {
  type: 'thinking' | 'tool_call' | 'tool_result' | 'final';
  text?: string;
  tool?: string;
  args?: Record<string, string | number>;
  result?: string;
}

const KNOWN_COMMANDS = Array.from(
  new Set(LEVELS.flatMap(l => l.steps.flatMap(s => s.commands)))
);

// ---- "Tools" - the same functions a real agent would expose to the model ----

function toolSearchCommand(command: string): string {
  for (const level of LEVELS) {
    for (const step of level.steps) {
      if (step.commands.includes(command)) {
        return `הפקודה "${command}" נלמדת ברמה ${level.id} (${level.emoji} ${level.title}), שלב ${step.id}. טיפ: ${step.tip}`;
      }
    }
  }
  return `לא מצאתי את הפקודה "${command}" באפליקציה. הפקודות הקיימות: ${KNOWN_COMMANDS.join(', ')}.`;
}

function toolGetLevelOverview(levelId: number): string {
  const level = LEVELS.find(l => l.id === levelId);
  if (!level) {
    return `אין רמה מספר ${levelId}. באפליקציה יש ${LEVELS.length} רמות (1 עד ${LEVELS.length}).`;
  }
  const cmds = level.steps.map(s => s.commands[s.commands.length - 1]).join(', ');
  return `רמה ${level.id}: ${level.emoji} ${level.title} - ${level.subtitle}. ${level.steps.length} שלבים, פקודות שנלמדות: ${cmds}.`;
}

function toolRandomTip(): string {
  const allSteps = LEVELS.flatMap(l => l.steps);
  const step = allSteps[Math.floor(Math.random() * allSteps.length)];
  return `טיפ: ${step.tip}`;
}

function toolListCommands(): string {
  return `הפקודות שנלמדות באפליקציה, לפי סדר הרמות: ${KNOWN_COMMANDS.join(', ')}.`;
}

// ---- "Planner" - stands in for the model's decision of which tool to call ----

export function runAgent(userMessage: string): AgentStep[] {
  const steps: AgentStep[] = [];
  const msg = userMessage.trim();

  steps.push({ type: 'thinking', text: 'מנתח את ההודעה ומחפש כלי מתאים...' });

  const matchedCommand = KNOWN_COMMANDS.find(c => msg.includes(c));
  if (matchedCommand) {
    steps.push({ type: 'tool_call', tool: 'searchCommand', args: { command: matchedCommand } });
    const result = toolSearchCommand(matchedCommand);
    steps.push({ type: 'tool_result', result });
    steps.push({ type: 'final', text: result });
    return steps;
  }

  const levelMatch = msg.match(/(\d)/);
  if (msg.includes('רמה') && levelMatch) {
    const levelId = parseInt(levelMatch[1], 10);
    steps.push({ type: 'tool_call', tool: 'getLevelOverview', args: { levelId } });
    const result = toolGetLevelOverview(levelId);
    steps.push({ type: 'tool_result', result });
    steps.push({ type: 'final', text: result });
    return steps;
  }

  if (/טיפ|עצה|עזר/.test(msg)) {
    steps.push({ type: 'tool_call', tool: 'getRandomTip', args: {} });
    const result = toolRandomTip();
    steps.push({ type: 'tool_result', result });
    steps.push({ type: 'final', text: result });
    return steps;
  }

  if (/פקוד/.test(msg)) {
    steps.push({ type: 'tool_call', tool: 'listCommands', args: {} });
    const result = toolListCommands();
    steps.push({ type: 'tool_result', result });
    steps.push({ type: 'final', text: result });
    return steps;
  }

  steps.push({
    type: 'final',
    text: 'לא זיהיתי כלי מתאים לשאלה הזו 🤔 נסה לשאול על פקודה ספציפית (למשל "שב"), על רמה ("מה יש ברמה 2"), לבקש "טיפ", או לשאול "אילו פקודות יש".',
  });
  return steps;
}
