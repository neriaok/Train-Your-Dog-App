import { LEVEL_SKELETONS, Level } from '../data';
import { Language } from './LanguageContext';

interface StepText {
  commands: string[];
  tip: string;
}

interface LevelText {
  title: string;
  subtitle: string;
  steps: Record<number, StepText>;
}

const CONTENT: Record<Language, Record<number, LevelText>> = {
  he: {
    1: {
      title: "פקודות בסיסיות",
      subtitle: "הצעדים הראשונים",
      steps: {
        1: { commands: ["שב"], tip: "החזיקו חטיף מעל ראש הכלב ואמרו שב בטון רגוע. כשישב - תגמלו מיד!" },
        2: { commands: ["אליי", "שב"], tip: "קראו לכלב בשמו ואז אמרו אליי. כשיגיע - בקשו שב. תרגלו בחלל פתוח." },
        3: { commands: ["אליי", "שב", "ארצה"], tip: "לאחר שהכלב יושב, הנמיכו את ידכם לאט לרצפה תוך אמירת ארצה. היו סבלניים!" },
      },
    },
    2: {
      title: "עבודה עם כלוב",
      subtitle: "אילוף מקום מנוחה",
      steps: {
        1: { commands: ["מקום"], tip: "הניחו חטיף בתוך הכלוב, הצביעו פנימה ואמרו מקום. כשיכנס וישכב - שבחו בהתלהבות!" },
        2: { commands: ["אליי", "מקום"], tip: "קראו אליי מחוץ לכלוב, חכו שיגיע, ואז הצביעו לכלוב ואמרו מקום. חזרו 5 פעמים." },
        3: { commands: ["אליי", "שב", "ארצה", "מקום"], tip: "סדרת פקודות מלאה! אליי, שב, ארצה, מקום. זו הכנה מצוינת לשגרת ערב." },
      },
    },
    3: {
      title: "פקודת עזוב",
      subtitle: "שליטה עצמית ודחיית פיתוי",
      steps: {
        1: { commands: ["עזוב"], tip: "הניחו חטיף על הרצפה. כשהכלב מתקרב - אמרו עזוב בטון נחרץ. כשיפרוש - תגמלו מחטיף אחר!" },
        2: { commands: ["עזוב"], tip: "אמרו עזוב, עמדו במקומכם והסתובבו גב לכלב. אל תתרחקו! אם מחזיק - סובבו ותגמלו." },
        3: { commands: ["עזוב"], tip: "רק כשהכלב מצליח בשלב 2 - צעדו 3 צעדים אחורה. אם נשאר - חזרו אליו ותגמלו שם." },
      },
    },
    4: {
      title: "טיול עם רצועה",
      subtitle: "הליכה בלי משיכות",
      steps: {
        1: { commands: ["לידי"], tip: "שימו רצועה וצאו לטיול. ברגע שהכלב מושך - עצרו במקום והתחילו ללכת לכיוון ההפוך. חזרו על כך בכל פעם שהוא מושך, כדי שילמד שהוא זה שצריך לעקוב אחריכם." },
        2: { commands: ["לידי", "שב"], tip: "תרגלו את העצירה-והיפוך פעמיים. בכל פעם שעוצרים, בקשו מהכלב שב. כשיושב בלי למשוך - תגמלו מיד בחטיף ושבח." },
        3: { commands: ["לידי", "שב", "הישאר"], tip: "תרגלו פעמיים נוספות, ולפני שממשיכים בהליכה הוסיפו את פקודת הישאר. זה מלמד את הכלב לחכות בסבלנות לפני שיוצאים לדרך." },
      },
    },
  },
  en: {
    1: {
      title: "Basic Commands",
      subtitle: "First Steps",
      steps: {
        1: { commands: ["Sit"], tip: "Hold a treat above the dog's head and say Sit in a calm tone. The moment they sit - reward right away!" },
        2: { commands: ["Come", "Sit"], tip: "Call the dog by name, then say Come. When they arrive, ask for Sit. Practice in an open space." },
        3: { commands: ["Come", "Sit", "Down"], tip: "Once the dog is sitting, slowly lower your hand to the floor while saying Down. Be patient!" },
      },
    },
    2: {
      title: "Crate Training",
      subtitle: "Teaching a Resting Place",
      steps: {
        1: { commands: ["Place"], tip: "Put a treat inside the crate, point in, and say Place. When they go in and lie down - praise enthusiastically!" },
        2: { commands: ["Come", "Place"], tip: "Call Come outside the crate, wait for them to arrive, then point to the crate and say Place. Repeat 5 times." },
        3: { commands: ["Come", "Sit", "Down", "Place"], tip: "A full command sequence! Come, Sit, Down, Place. Great preparation for an evening routine." },
      },
    },
    3: {
      title: 'The "Leave It" Command',
      subtitle: "Self-Control & Resisting Temptation",
      steps: {
        1: { commands: ["Leave It"], tip: "Place a treat on the floor. When the dog approaches, say Leave It firmly. When they back off - reward with a different treat!" },
        2: { commands: ["Leave It"], tip: "Say Leave It, stand still, and turn your back to the dog. Don't walk away! If they hold back - turn around and reward." },
        3: { commands: ["Leave It"], tip: "Only once the dog succeeds at step 2 - take 3 steps back. If they stay - go back to them and reward there." },
      },
    },
    4: {
      title: "Leash Walking",
      subtitle: "Walking Without Pulling",
      steps: {
        1: { commands: ["Heel"], tip: "Put on the leash and go for a walk. The moment the dog pulls - stop and start walking the opposite way. Repeat this every time they pull, so they learn they need to follow you." },
        2: { commands: ["Heel", "Sit"], tip: "Practice the stop-and-reverse twice. Each time you stop, ask the dog to Sit. When they sit without pulling - reward right away with a treat and praise." },
        3: { commands: ["Heel", "Sit", "Stay"], tip: "Practice twice more, and before continuing the walk add the Stay command. This teaches the dog to wait patiently before heading out." },
      },
    },
  },
};

export function getLocalizedLevels(language: Language): Level[] {
  return LEVEL_SKELETONS.map(skeleton => {
    const text = CONTENT[language][skeleton.id];
    return {
      id: skeleton.id,
      emoji: skeleton.emoji,
      color: skeleton.color,
      colorLight: skeleton.colorLight,
      colorMid: skeleton.colorMid,
      title: text.title,
      subtitle: text.subtitle,
      steps: skeleton.steps.map(step => ({
        id: step.id,
        emoji: step.emoji,
        illustration: step.illustration,
        commands: text.steps[step.id].commands,
        tip: text.steps[step.id].tip,
      })),
    };
  });
}
