// Mirrors the localized LEVELS content in the app (src/data.ts +
// src/i18n/content.ts). Kept as a plain copy (no shared package/monorepo
// setup) since this worker is a separate deployable project - if you add
// or edit a level in the app, copy the updated content over here too.

export type Language = 'he' | 'en';

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

const LEVELS_HE: Level[] = [
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

const LEVELS_EN: Level[] = [
  {
    id: 1,
    title: "Basic Commands",
    subtitle: "First Steps",
    emoji: "🐾",
    steps: [
      { id: 1, commands: ["Sit"], emoji: "🪑",
        tip: "Hold a treat above the dog's head and say Sit in a calm tone. The moment they sit - reward right away!" },
      { id: 2, commands: ["Come", "Sit"], emoji: "🏃",
        tip: "Call the dog by name, then say Come. When they arrive, ask for Sit. Practice in an open space." },
      { id: 3, commands: ["Come", "Sit", "Down"], emoji: "⬇️",
        tip: "Once the dog is sitting, slowly lower your hand to the floor while saying Down. Be patient!" },
    ],
  },
  {
    id: 2,
    title: "Crate Training",
    subtitle: "Teaching a Resting Place",
    emoji: "🏠",
    steps: [
      { id: 1, commands: ["Place"], emoji: "🏠",
        tip: "Put a treat inside the crate, point in, and say Place. When they go in and lie down - praise enthusiastically!" },
      { id: 2, commands: ["Come", "Place"], emoji: "🔄",
        tip: "Call Come outside the crate, wait for them to arrive, then point to the crate and say Place. Repeat 5 times." },
      { id: 3, commands: ["Come", "Sit", "Down", "Place"], emoji: "⭐",
        tip: "A full command sequence! Come, Sit, Down, Place. Great preparation for an evening routine." },
    ],
  },
  {
    id: 3,
    title: 'The "Leave It" Command',
    subtitle: "Self-Control & Resisting Temptation",
    emoji: "🍖",
    steps: [
      { id: 1, commands: ["Leave It"], emoji: "🍖",
        tip: "Place a treat on the floor. When the dog approaches, say Leave It firmly. When they back off - reward with a different treat!" },
      { id: 2, commands: ["Leave It"], emoji: "🔄",
        tip: "Say Leave It, stand still, and turn your back to the dog. Don't walk away! If they hold back - turn around and reward." },
      { id: 3, commands: ["Leave It"], emoji: "👣",
        tip: "Only once the dog succeeds at step 2 - take 3 steps back. If they stay - go back to them and reward there." },
    ],
  },
  {
    id: 4,
    title: "Leash Walking",
    subtitle: "Walking Without Pulling",
    emoji: "🦮",
    steps: [
      { id: 1, commands: ["Heel"], emoji: "🔄",
        tip: "Put on the leash and go for a walk. The moment the dog pulls - stop and start walking the opposite way. Repeat this every time they pull, so they learn they need to follow you." },
      { id: 2, commands: ["Heel", "Sit"], emoji: "🪑",
        tip: "Practice the stop-and-reverse twice. Each time you stop, ask the dog to Sit. When they sit without pulling - reward right away with a treat and praise." },
      { id: 3, commands: ["Heel", "Sit", "Stay"], emoji: "✋",
        tip: "Practice twice more, and before continuing the walk add the Stay command. This teaches the dog to wait patiently before heading out." },
    ],
  },
];

export function getLevels(language: Language): Level[] {
  return language === 'en' ? LEVELS_EN : LEVELS_HE;
}
