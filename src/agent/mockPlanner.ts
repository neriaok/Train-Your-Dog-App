import { AgentStep } from './types';
import { Level } from '../data';
import { Language } from '../i18n/LanguageContext';
import { getKnownCommands, searchCommand, getLevelOverview, getRandomTip, listCommands } from './tools';
import { matchSmallTalk, matchFAQ } from './knowledgeBase';

const THINKING_TEXT: Record<Language, string> = {
  he: 'מנתח את ההודעה ומחפש כלי מתאים...',
  en: 'Analyzing the message and looking for a matching tool...',
};

const FALLBACK_TEXT: Record<Language, string> = {
  he: 'לא הצלחתי למצוא תשובה מדויקת לשאלה הזו 🤔 נסה לנסח אותה קצת אחרת, או שאל על נושא כמו נביחות, נשיכות, לימוד ניקיון, חרדת פרידה, פקודה ספציפית (למשל "שב"), או רמה ("מה יש ברמה 2").',
  en: 'I couldn\'t find a precise answer to that 🤔 Try rephrasing, or ask about a topic like barking, biting, potty training, separation anxiety, a specific command (e.g. "sit"), or a level ("what\'s in level 2?").',
};

const LEVEL_WORD: Record<Language, RegExp> = { he: /רמה/, en: /level/i };
const TIP_WORD: Record<Language, RegExp> = { he: /טיפ|עצה|עזר/, en: /tip|advice|help/i };
const COMMANDS_WORD: Record<Language, RegExp> = { he: /פקוד/, en: /command/i };

/**
 * Free, local, offline stand-in for the "which tool should I call" decision
 * a real model makes - keyword matching instead of understanding. Talks to
 * the exact same tools (./tools.ts) as the real agent does, so the only
 * thing that changes when you switch to the real API is *who decides*.
 */
export function runMockAgent(userMessage: string, levels: Level[], language: Language): AgentStep[] {
  const steps: AgentStep[] = [];
  const msg = userMessage.trim();
  const known = getKnownCommands(levels);

  steps.push({ type: 'thinking', text: THINKING_TEXT[language] });

  const smallTalk = matchSmallTalk(msg, language);
  if (smallTalk) {
    steps.push({ type: 'final', text: smallTalk });
    return steps;
  }

  const matchedCommand = known.find(c => msg.toLowerCase().includes(c.toLowerCase()));
  if (matchedCommand) {
    steps.push({ type: 'tool_call', tool: 'searchCommand', args: { command: matchedCommand } });
    const result = searchCommand(levels, language, matchedCommand);
    steps.push({ type: 'tool_result', result });
    steps.push({ type: 'final', text: result });
    return steps;
  }

  const levelMatch = msg.match(/(\d)/);
  if (LEVEL_WORD[language].test(msg) && levelMatch) {
    const levelId = parseInt(levelMatch[1], 10);
    steps.push({ type: 'tool_call', tool: 'getLevelOverview', args: { levelId } });
    const result = getLevelOverview(levels, language, levelId);
    steps.push({ type: 'tool_result', result });
    steps.push({ type: 'final', text: result });
    return steps;
  }

  const faqAnswer = matchFAQ(msg, language);
  if (faqAnswer) {
    steps.push({ type: 'tool_call', tool: 'searchKnowledgeBase', args: { query: msg } });
    steps.push({ type: 'tool_result', result: faqAnswer });
    steps.push({ type: 'final', text: faqAnswer });
    return steps;
  }

  if (TIP_WORD[language].test(msg)) {
    steps.push({ type: 'tool_call', tool: 'getRandomTip', args: {} });
    const result = getRandomTip(levels, language);
    steps.push({ type: 'tool_result', result });
    steps.push({ type: 'final', text: result });
    return steps;
  }

  if (COMMANDS_WORD[language].test(msg)) {
    steps.push({ type: 'tool_call', tool: 'listCommands', args: {} });
    const result = listCommands(levels, language);
    steps.push({ type: 'tool_result', result });
    steps.push({ type: 'final', text: result });
    return steps;
  }

  steps.push({ type: 'final', text: FALLBACK_TEXT[language] });
  return steps;
}
