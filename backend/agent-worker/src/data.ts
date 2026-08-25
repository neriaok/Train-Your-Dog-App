// Mirrors the LEVELS content in the app's own src/data.ts. Kept as a plain
// copy (no shared package/monorepo setup) since this worker is a separate
// deployable project - if you add or edit a level in the app, copy the
// updated LEVELS array over here too.

export interface Step {
  id: number;
  commands: string[];
  emoji: string;
  tip: string;
}

export interface Level {
  id: number;
  title: string;
  subtitle: string;
  emoji: string;
  steps: Step[];
}

export const LEVELS: Level[] = [
  {
    id: 1,
    title: "פקודות בסיסיות",
    subtitle: "הצעדים הראשונים",
    emoji: "🐾",
    steps: [
      { id: 1, commands: ["שב"], emoji: "🪑",
        tip: "החזיקו חטיף מעל ראש הכלב ואמרו שב בטון רגוע. כשישב - תגמלו מיד!" },
      { id: 2, commands: ["אליי", "שב"], emoji: "🏃",
        tip: "קראו לכלב בשמו ואז אמרו אליי. כשיגיע - בקשו שב. תרגלו בחלל פתוח." },
      { id: 3, commands: ["אליי", "שב", "ארצה"], emoji: "⬇️",
        tip: "לאחר שהכלב יושב, הנמיכו את ידכם לאט לרצפה תוך אמירת ארצה. היו סבלניים!" },
    ],
  },
  {
    id: 2,
    title: "עבודה עם כלוב",
    subtitle: "אילוף מקום מנוחה",
    emoji: "🏠",
    steps: [
      { id: 1, commands: ["מקום"], emoji: "🏠",
        tip: "הניחו חטיף בתוך הכלוב, הצביעו פנימה ואמרו מקום. כשיכנס וישכב - שבחו בהתלהבות!" },
      { id: 2, commands: ["אליי", "מקום"], emoji: "🔄",
        tip: "קראו אליי מחוץ לכלוב, חכו שיגיע, ואז הצביעו לכלוב ואמרו מקום. חזרו 5 פעמים." },
      { id: 3, commands: ["אליי", "שב", "ארצה", "מקום"], emoji: "⭐",
        tip: "סדרת פקודות מלאה! אליי, שב, ארצה, מקום. זו הכנה מצוינת לשגרת ערב." },
    ],
  },
  {
    id: 3,
    title: "פקודת עזוב",
    subtitle: "שליטה עצמית ודחיית פיתוי",
    emoji: "🍖",
    steps: [
      { id: 1, commands: ["עזוב"], emoji: "🍖",
        tip: "הניחו חטיף על הרצפה. כשהכלב מתקרב - אמרו עזוב בטון נחרץ. כשיפרוש - תגמלו מחטיף אחר!" },
      { id: 2, commands: ["עזוב"], emoji: "🔄",
        tip: "אמרו עזוב, עמדו במקומכם והסתובבו גב לכלב. אל תתרחקו! אם מחזיק - סובבו ותגמלו." },
      { id: 3, commands: ["עזוב"], emoji: "👣",
        tip: "רק כשהכלב מצליח בשלב 2 - צעדו 3 צעדים אחורה. אם נשאר - חזרו אליו ותגמלו שם." },
    ],
  },
  {
    id: 4,
    title: "טיול עם רצועה",
    subtitle: "הליכה בלי משיכות",
    emoji: "🦮",
    steps: [
      { id: 1, commands: ["לידי"], emoji: "🔄",
        tip: "שימו רצועה וצאו לטיול. ברגע שהכלב מושך - עצרו במקום והתחילו ללכת לכיוון ההפוך. חזרו על כך בכל פעם שהוא מושך, כדי שילמד שהוא זה שצריך לעקוב אחריכם." },
      { id: 2, commands: ["לידי", "שב"], emoji: "🪑",
        tip: "תרגלו את העצירה-והיפוך פעמיים. בכל פעם שעוצרים, בקשו מהכלב שב. כשיושב בלי למשוך - תגמלו מיד בחטיף ושבח." },
      { id: 3, commands: ["לידי", "שב", "הישאר"], emoji: "✋",
        tip: "תרגלו פעמיים נוספות, ולפני שממשיכים בהליכה הוסיפו את פקודת הישאר. זה מלמד את הכלב לחכות בסבלנות לפני שיוצאים לדרך." },
    ],
  },
];
