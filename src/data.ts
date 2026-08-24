export type IllustrationKey =
  | 'sit' | 'come' | 'down'
  | 'crate_enter' | 'crate_return' | 'crate_full'
  | 'leave_close' | 'leave_back' | 'leave_walk'
  | 'walk_pull' | 'walk_sit' | 'walk_stay';

export interface Step {
  id: number;
  commands: string[];
  emoji: string;
  illustration: IllustrationKey;
  tip: string;
}

export interface Level {
  id: number;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  colorLight: string;
  colorMid: string;
  steps: Step[];
}

export const LEVELS: Level[] = [
  {
    id: 1,
    title: "פקודות בסיסיות",
    subtitle: "הצעדים הראשונים",
    emoji: "🐾",
    color: "#FF6B35",
    colorLight: "#FFF0EA",
    colorMid: "#FFCDB2",
    steps: [
      { id: 1, commands: ["שב"], emoji: "🪑", illustration: "sit",
        tip: "החזיקו חטיף מעל ראש הכלב ואמרו שב בטון רגוע. כשישב - תגמלו מיד!" },
      { id: 2, commands: ["אליי", "שב"], emoji: "🏃", illustration: "come",
        tip: "קראו לכלב בשמו ואז אמרו אליי. כשיגיע - בקשו שב. תרגלו בחלל פתוח." },
      { id: 3, commands: ["אליי", "שב", "ארצה"], emoji: "⬇️", illustration: "down",
        tip: "לאחר שהכלב יושב, הנמיכו את ידכם לאט לרצפה תוך אמירת ארצה. היו סבלניים!" },
    ],
  },
  {
    id: 2,
    title: "עבודה עם כלוב",
    subtitle: "אילוף מקום מנוחה",
    emoji: "🏠",
    color: "#2EC4B6",
    colorLight: "#E8FAF9",
    colorMid: "#A8EDE9",
    steps: [
      { id: 1, commands: ["מקום"], emoji: "🏠", illustration: "crate_enter",
        tip: "הניחו חטיף בתוך הכלוב, הצביעו פנימה ואמרו מקום. כשיכנס וישכב - שבחו בהתלהבות!" },
      { id: 2, commands: ["אליי", "מקום"], emoji: "🔄", illustration: "crate_return",
        tip: "קראו אליי מחוץ לכלוב, חכו שיגיע, ואז הצביעו לכלוב ואמרו מקום. חזרו 5 פעמים." },
      { id: 3, commands: ["אליי", "שב", "ארצה", "מקום"], emoji: "⭐", illustration: "crate_full",
        tip: "סדרת פקודות מלאה! אליי, שב, ארצה, מקום. זו הכנה מצוינת לשגרת ערב." },
    ],
  },
  {
    id: 3,
    title: "פקודת עזוב",
    subtitle: "שליטה עצמית ודחיית פיתוי",
    emoji: "🍖",
    color: "#9B5DE5",
    colorLight: "#F3EDFF",
    colorMid: "#D4B8F8",
    steps: [
      { id: 1, commands: ["עזוב"], emoji: "🍖", illustration: "leave_close",
        tip: "הניחו חטיף על הרצפה. כשהכלב מתקרב - אמרו עזוב בטון נחרץ. כשיפרוש - תגמלו מחטיף אחר!" },
      { id: 2, commands: ["עזוב"], emoji: "🔄", illustration: "leave_back",
        tip: "אמרו עזוב, עמדו במקומכם והסתובבו גב לכלב. אל תתרחקו! אם מחזיק - סובבו ותגמלו." },
      { id: 3, commands: ["עזוב"], emoji: "👣", illustration: "leave_walk",
        tip: "רק כשהכלב מצליח בשלב 2 - צעדו 3 צעדים אחורה. אם נשאר - חזרו אליו ותגמלו שם." },
    ],
  },
  {
    id: 4,
    title: "טיול עם רצועה",
    subtitle: "הליכה בלי משיכות",
    emoji: "🦮",
    color: "#06D6A0",
    colorLight: "#E6FBF5",
    colorMid: "#8FE3C5",
    steps: [
      { id: 1, commands: ["לידי"], emoji: "🔄", illustration: "walk_pull",
        tip: "שימו רצועה וצאו לטיול. ברגע שהכלב מושך - עצרו במקום והתחילו ללכת לכיוון ההפוך. חזרו על כך בכל פעם שהוא מושך, כדי שילמד שהוא זה שצריך לעקוב אחריכם." },
      { id: 2, commands: ["לידי", "שב"], emoji: "🪑", illustration: "walk_sit",
        tip: "תרגלו את העצירה-והיפוך פעמיים. בכל פעם שעוצרים, בקשו מהכלב שב. כשיושב בלי למשוך - תגמלו מיד בחטיף ושבח." },
      { id: 3, commands: ["לידי", "שב", "הישאר"], emoji: "✋", illustration: "walk_stay",
        tip: "תרגלו פעמיים נוספות, ולפני שממשיכים בהליכה הוסיפו את פקודת הישאר. זה מלמד את הכלב לחכות בסבלנות לפני שיוצאים לדרך." },
    ],
  },
];

export const C = {
  orange: "#FF6B35", orangeL: "#FFF0EA", orangeM: "#FFCDB2",
  teal: "#2EC4B6", tealL: "#E8FAF9", tealM: "#A8EDE9",
  yellow: "#FFD166", yellowL: "#FFF9E6",
  purple: "#9B5DE5", purpleL: "#F3EDFF",
  green: "#06D6A0", greenL: "#E6FBF5",
  bg: "#FFFBF7", white: "#FFFFFF",
  text: "#1A1A2E", soft: "#6B7280", border: "#F0E8E0",
};
