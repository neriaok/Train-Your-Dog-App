import { Level } from '../data';
import { Language } from '../i18n/LanguageContext';

/**
 * The actual capabilities the assistant has, regardless of who is deciding
 * when to call them (the keyword-based mock planner, or a real Claude
 * agent talking to backend/agent-worker). Operate on whichever localized
 * `levels` array the caller passes in, so answers match the app's current
 * language.
 */

export function getKnownCommands(levels: Level[]): string[] {
  return Array.from(new Set(levels.flatMap(l => l.steps.flatMap(s => s.commands))));
}

export function searchCommand(levels: Level[], language: Language, command: string): string {
  for (const level of levels) {
    for (const step of level.steps) {
      if (step.commands.some(c => c.toLowerCase() === command.toLowerCase())) {
        return language === 'he'
          ? `הפקודה "${command}" נלמדת ברמה ${level.id} (${level.emoji} ${level.title}), שלב ${step.id}. טיפ: ${step.tip}`
          : `The command "${command}" is taught in level ${level.id} (${level.emoji} ${level.title}), step ${step.id}. Tip: ${step.tip}`;
      }
    }
  }
  const known = getKnownCommands(levels).join(', ');
  return language === 'he'
    ? `לא מצאתי את הפקודה "${command}" באפליקציה. הפקודות הקיימות: ${known}.`
    : `I couldn't find the command "${command}" in the app. Available commands: ${known}.`;
}

export function getLevelOverview(levels: Level[], language: Language, levelId: number): string {
  const level = levels.find(l => l.id === levelId);
  if (!level) {
    return language === 'he'
      ? `אין רמה מספר ${levelId}. באפליקציה יש ${levels.length} רמות (1 עד ${levels.length}).`
      : `There's no level ${levelId}. The app has ${levels.length} levels (1 to ${levels.length}).`;
  }
  const cmds = level.steps.map(s => s.commands[s.commands.length - 1]).join(', ');
  return language === 'he'
    ? `רמה ${level.id}: ${level.emoji} ${level.title} - ${level.subtitle}. ${level.steps.length} שלבים, פקודות שנלמדות: ${cmds}.`
    : `Level ${level.id}: ${level.emoji} ${level.title} - ${level.subtitle}. ${level.steps.length} steps, commands taught: ${cmds}.`;
}

export function getRandomTip(levels: Level[], language: Language): string {
  const allSteps = levels.flatMap(l => l.steps);
  const step = allSteps[Math.floor(Math.random() * allSteps.length)];
  return language === 'he' ? `טיפ: ${step.tip}` : `Tip: ${step.tip}`;
}

export function listCommands(levels: Level[], language: Language): string {
  const known = getKnownCommands(levels).join(', ');
  return language === 'he'
    ? `הפקודות שנלמדות באפליקציה, לפי סדר הרמות: ${known}.`
    : `Commands taught in the app, in level order: ${known}.`;
}
