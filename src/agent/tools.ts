import { LEVELS } from '../data';

/**
 * The actual capabilities the assistant has, regardless of who is deciding
 * when to call them (the keyword-based mock planner, or a real Claude
 * agent talking to backend/agent-worker). Keeping these here means both
 * paths give identical answers for the same tool call.
 */

export const KNOWN_COMMANDS = Array.from(
  new Set(LEVELS.flatMap(l => l.steps.flatMap(s => s.commands)))
);

export function searchCommand(command: string): string {
  for (const level of LEVELS) {
    for (const step of level.steps) {
      if (step.commands.includes(command)) {
        return `הפקודה "${command}" נלמדת ברמה ${level.id} (${level.emoji} ${level.title}), שלב ${step.id}. טיפ: ${step.tip}`;
      }
    }
  }
  return `לא מצאתי את הפקודה "${command}" באפליקציה. הפקודות הקיימות: ${KNOWN_COMMANDS.join(', ')}.`;
}

export function getLevelOverview(levelId: number): string {
  const level = LEVELS.find(l => l.id === levelId);
  if (!level) {
    return `אין רמה מספר ${levelId}. באפליקציה יש ${LEVELS.length} רמות (1 עד ${LEVELS.length}).`;
  }
  const cmds = level.steps.map(s => s.commands[s.commands.length - 1]).join(', ');
  return `רמה ${level.id}: ${level.emoji} ${level.title} - ${level.subtitle}. ${level.steps.length} שלבים, פקודות שנלמדות: ${cmds}.`;
}

export function getRandomTip(): string {
  const allSteps = LEVELS.flatMap(l => l.steps);
  const step = allSteps[Math.floor(Math.random() * allSteps.length)];
  return `טיפ: ${step.tip}`;
}

export function listCommands(): string {
  return `הפקודות שנלמדות באפליקציה, לפי סדר הרמות: ${KNOWN_COMMANDS.join(', ')}.`;
}
