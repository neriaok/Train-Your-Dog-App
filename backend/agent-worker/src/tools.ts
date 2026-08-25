import type Anthropic from '@anthropic-ai/sdk';
import { getLevels, Language } from './data';

function getKnownCommands(language: Language): string[] {
  return Array.from(new Set(getLevels(language).flatMap(l => l.steps.flatMap(s => s.commands))));
}

function searchCommand(language: Language, command: string): string {
  for (const level of getLevels(language)) {
    for (const step of level.steps) {
      if (step.commands.some(c => c.toLowerCase() === command.toLowerCase())) {
        return language === 'he'
          ? `הפקודה "${command}" נלמדת ברמה ${level.id} (${level.emoji} ${level.title}), שלב ${step.id}. טיפ: ${step.tip}`
          : `The command "${command}" is taught in level ${level.id} (${level.emoji} ${level.title}), step ${step.id}. Tip: ${step.tip}`;
      }
    }
  }
  const known = getKnownCommands(language).join(', ');
  return language === 'he'
    ? `לא מצאתי את הפקודה "${command}" באפליקציה. הפקודות הקיימות: ${known}.`
    : `I couldn't find the command "${command}" in the app. Available commands: ${known}.`;
}

function getLevelOverview(language: Language, levelId: number): string {
  const levels = getLevels(language);
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

function getRandomTip(language: Language): string {
  const allSteps = getLevels(language).flatMap(l => l.steps);
  const step = allSteps[Math.floor(Math.random() * allSteps.length)];
  return language === 'he' ? `טיפ: ${step.tip}` : `Tip: ${step.tip}`;
}

function listCommands(language: Language): string {
  const known = getKnownCommands(language).join(', ');
  return language === 'he'
    ? `הפקודות שנלמדות באפליקציה, לפי סדר הרמות: ${known}.`
    : `Commands taught in the app, in level order: ${known}.`;
}

// Same four capabilities as the app's src/agent/tools.ts, exposed here as
// real Claude tool definitions so the model can decide when to call them.
export const TOOL_DEFINITIONS: Anthropic.Tool[] = [
  {
    name: 'searchCommand',
    description: 'Looks up a specific training command (e.g. sit, leave it, heel) and returns a tip and where it appears in the app.',
    input_schema: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'The command name, exactly as it appears in the app' },
      },
      required: ['command'],
    },
  },
  {
    name: 'getLevelOverview',
    description: 'Returns information about a specific training level by number.',
    input_schema: {
      type: 'object',
      properties: {
        levelId: { type: 'number', description: 'The level number (1 to 4)' },
      },
      required: ['levelId'],
    },
  },
  {
    name: 'getRandomTip',
    description: 'Returns one random training tip from across all levels and steps.',
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'listCommands',
    description: 'Returns the list of every command taught in the app, in level order.',
    input_schema: { type: 'object', properties: {} },
  },
];

export function executeTool(name: string, language: Language, args: Record<string, unknown>): string {
  switch (name) {
    case 'searchCommand': return searchCommand(language, String(args.command));
    case 'getLevelOverview': return getLevelOverview(language, Number(args.levelId));
    case 'getRandomTip': return getRandomTip(language);
    case 'listCommands': return listCommands(language);
    default: return language === 'he' ? `כלי לא מוכר: ${name}` : `Unknown tool: ${name}`;
  }
}
