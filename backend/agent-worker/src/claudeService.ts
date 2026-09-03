import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';

/**
 * מוצא את claude.exe האמיתי במקום להשתמש ב-shim (claude / claude.cmd).
 * על Windows, כל הרצה שעוברת דרך cmd.exe (exec, execFile+shell:true, או
 * קריאת פלט של תת-תהליך כמו `where`) מפרשת טקסט לפי code page לא-UTF8
 * ומשבשת עברית - גם בפרומפט וגם בנתיב עצמו (כמו שם המשתמש "הדר גז").
 * process.env, לעומת זאת, מגיע ל-Node כבר מפוענח נכון מה-Unicode
 * environment block של Windows, אז בונים את הנתיב משם ולא מ-`where`.
 */
let cachedExePath: string | null | undefined;
function resolveClaudeExe(): string | null {
  if (cachedExePath !== undefined) return cachedExePath;
  const appData = process.env.APPDATA;
  if (!appData) {
    cachedExePath = null;
    return cachedExePath;
  }
  const exePath = path.join(
    appData, 'npm', 'node_modules', '@anthropic-ai', 'claude-code', 'bin', 'claude.exe'
  );
  cachedExePath = fs.existsSync(exePath) ? exePath : null;
  return cachedExePath;
}

/**
 * מריצה את Claude CLI עם הפרומפט המבוקש ומחזירה את התשובה.
 * לא מזריקים כאן ANTHROPIC_API_KEY בכוונה - כך ה-CLI משתמש בהתחברות
 * הקיימת שלך (מנוי Pro), במקום לחייב לפי טוקנים על מפתח API נפרד.
 * הפרומפט נשלח דרך stdin (לא כארגומנט) כדי לא לתלות בשום shell quoting.
 */
export function runClaudeCli(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const exePath = resolveClaudeExe();
    const child = exePath
      ? execFile(exePath, ['-p'], { maxBuffer: 1024 * 1024 * 10, encoding: 'utf-8' }, cb)
      : execFile('claude', ['-p'], { maxBuffer: 1024 * 1024 * 10, encoding: 'utf-8', shell: true }, cb);

    child.stdin?.end(prompt, 'utf-8');

    function cb(error: Error | null, stdout: string, stderr: string) {
      if (error) {
        return reject(new Error(stderr || error.message));
      }
      resolve(stdout.trim());
    }
  });
}