import type Anthropic from '@anthropic-ai/sdk';
import { LEVELS } from './data';

const KNOWN_COMMANDS = Array.from(
  new Set(LEVELS.flatMap(l => l.steps.flatMap(s => s.commands)))
);

function searchCommand(command: string): string {
  for (const level of LEVELS) {
    for (const step of level.steps) {
      if (step.commands.includes(command)) {
        return `הפקודה "${command}" נלמדת ברמה ${level.id} (${level.emoji} ${level.title}), שלב ${step.id}. טיפ: ${step.tip}`;
      }
    }
  }
  return `לא מצאתי את הפקודה "${command}" באפליקציה. הפקודות הקיימות: ${KNOWN_COMMANDS.join(', ')}.`;
}

function getLevelOverview(levelId: number): string {
  const level = LEVELS.find(l => l.id === levelId);
  if (!level) {
    return `אין רמה מספר ${levelId}. באפליקציה יש ${LEVELS.length} רמות (1 עד ${LEVELS.length}).`;
  }
  const cmds = level.steps.map(s => s.commands[s.commands.length - 1]).join(', ');
  return `רמה ${level.id}: ${level.emoji} ${level.title} - ${level.subtitle}. ${level.steps.length} שלבים, פקודות שנלמדות: ${cmds}.`;
}

function getRandomTip(): string {
  const allSteps = LEVELS.flatMap(l => l.steps);
  const step = allSteps[Math.floor(Math.random() * allSteps.length)];
  return `טיפ: ${step.tip}`;
}

function listCommands(): string {
  return `הפקודות שנלמדות באפליקציה, לפי סדר הרמות: ${KNOWN_COMMANDS.join(', ')}.`;
}

// Same four capabilities as the app's src/agent/tools.ts, exposed here as
// real Claude tool definitions so the model can decide when to call them.
export const TOOL_DEFINITIONS: Anthropic.Tool[] = [
  {
    name: 'searchCommand',
    description: 'מחפש מידע על פקודת אילוף ספציפית (למשל שב, עזוב, לידי) ומחזיר טיפ ואת מיקומה באפליקציה.',
    input_schema: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'שם הפקודה בעברית, בדיוק כפי שהיא מופיעה באפליקציה' },
      },
      required: ['command'],
    },
  },
  {
    name: 'getLevelOverview',
    description: 'מחזיר מידע על רמת אילוף ספציפית לפי מספרה.',
    input_schema: {
      type: 'object',
      properties: {
        levelId: { type: 'number', description: 'מספר הרמה (1 עד 4)' },
      },
      required: ['levelId'],
    },
  },
  {
    name: 'getRandomTip',
    description: 'מחזיר טיפ אילוף אקראי אחד מתוך כל הרמות והשלבים.',
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'listCommands',
    description: 'מחזיר את רשימת כל הפקודות שנלמדות באפליקציה, לפי סדר הרמות.',
    input_schema: { type: 'object', properties: {} },
  },
];

export function executeTool(name: string, args: Record<string, unknown>): string {
  switch (name) {
    case 'searchCommand': return searchCommand(String(args.command));
    case 'getLevelOverview': return getLevelOverview(Number(args.levelId));
    case 'getRandomTip': return getRandomTip();
    case 'listCommands': return listCommands();
    default: return `כלי לא מוכר: ${name}`;
  }
}
