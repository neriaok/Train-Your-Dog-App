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
    5: {
      title: "טריקים כיפיים",
      subtitle: "מהנה ובונה קשר",
      steps: {
        1: { commands: ["תן כף"], tip: "החזיקו חטיף באגרוף סגור מול הכלב. כשהוא ינסה לגעת או לגרד עם הכף - אמרו תן כף ופתחו את היד לתגמול. חזרו כמה פעמים." },
        2: { commands: ["תן כף", "גבוה"], tip: "אחרי שהכלב שולט בתן כף, הרימו את היד קצת יותר גבוה ואמרו גבוה. תגמלו כל ניסיון להרים את הכף מעלה." },
        3: { commands: ["תן כף", "גבוה", "הסתובב"], tip: "החזיקו חטיף קרוב לאף הכלב והובילו אותו במעגל שלם תוך אמירת הסתובב. תגמלו ברגע שמשלים סיבוב." },
      },
    },
    6: {
      title: "שב והמתן",
      subtitle: "התמדה ושליטה עצמית לאורך זמן",
      steps: {
        1: { commands: ["שב"], tip: "בקשו שב, אך הפעם המתינו 3-5 שניות לפני שמתגמלים - לא תגמול מיידי. זה מלמד את הכלב שישיבה אמיתית אומרת להישאר, לא רק לגעת ברצפה." },
        2: { commands: ["שב", "המתן"], tip: "אחרי שהכלב יושב, אמרו המתן והתרחקו צעד אחד אחורה. אם נשאר יושב - חזרו ותגמלו. אם קם - חזרו לצעד קטן יותר." },
        3: { commands: ["שב", "המתן", "בוא"], tip: "הגדילו בהדרגה את המרחק וזמן ההמתנה, ואז שחררו את הכלב במילה בוא. זו הדרך הנכונה לבנות המתן אמיתי ואמין." },
      },
    },
    7: {
      title: "בוא גם עם הסחות דעת",
      subtitle: "חיזוק פקודת אליי בסביבה מאתגרת",
      steps: {
        1: { commands: ["אליי"], tip: "תרגלו אליי כשמישהו אחר בבית, או כשיש רעש קל ברקע. אם הכלב מגיע למרות ההסחה - תגמלו בהתלהבות כפולה." },
        2: { commands: ["אליי", "שב"], tip: "כשהכלב מגיע, בקשו מיד שב לפני התגמול. זה מוסיף שליטה עצמית לתגובה המהירה שכבר יש לו." },
        3: { commands: ["אליי", "שב", "ארצה"], tip: "נסו את התרגיל הזה בפארק או ברחוב שקט, עם כלב אחר או אדם זר במרחק. זו הבדיקה האמיתית שהאימון נשאר." },
      },
    },
    8: {
      title: "טריקים חברתיים",
      subtitle: "נופף, נשק, ורקוד",
      steps: {
        1: { commands: ["נופף"], tip: "החזיקו חטיף מעל ראש הכלב בלי לגעת בכף שלו. כשהוא מרים כף באוויר לכיוונכם - אמרו נופף ותגמלו. אל תיתנו לו לגעת ביד - זה מה שמבדיל נופף מתן כף." },
        2: { commands: ["נופף", "נשק"], tip: "החזיקו חטיף קטן בין האצבעות קרוב לאף הכלב. כשהוא נוגע באף ליד שלכם - אמרו נשק ותגמלו מיד." },
        3: { commands: ["נופף", "נשק", "רקוד"], tip: "החזיקו חטיף מעל הראש וסובבו אותו במעגל תוך כדי שהכלב עומד על שתי רגליים אחוריות ועוקב. התחילו בסיבוב חלקי בלבד." },
      },
    },
    9: {
      title: "משמעת בשטח פתוח",
      subtitle: "לידי, עצירה, והמשך בשליטה",
      steps: {
        1: { commands: ["לידי"], tip: "צאו לשטח פתוח כמו פארק. תרגלו לידי כרגיל, אך עם יותר גירויים מסביב - ריחות, אנשים, וכלבים אחרים במרחק." },
        2: { commands: ["לידי", "עצור"], tip: "תוך כדי הליכה, עצרו פתאום ואמרו עצור. תגמלו כל עצירה מיידית, גם אם היא לא מושלמת בהתחלה." },
        3: { commands: ["לידי", "עצור", "קדימה"], tip: "אחרי עצירה מוצלחת, המתינו רגע ואז אמרו קדימה כדי להמשיך. זה מלמד את הכלב לחכות לאישור שלכם לפני שממשיכים." },
      },
    },
    10: {
      title: "האתגר הגדול",
      subtitle: "שילוב כל מה שלמדתם",
      steps: {
        1: { commands: ["ארצה"], tip: "בקשו מהכלב ארצה ולהישאר כך למשך דקה שלמה, גם אם אתם לא ממש לידו. זה משלב שליטה עצמית עם המתנה אמיתית." },
        2: { commands: ["ארצה", "בוא"], tip: "משם, קראו אליי מרחוק. המעבר מארצה רגוע לתגובה מהירה הוא מבחן אמיתי לקשר שבניתם." },
        3: { commands: ["ארצה", "בוא", "שב"], tip: "סיימו ברצף המלא: ארצה, בוא, שב. אם הכלב שלכם עבר את כל 10 הרמות - אתם ממש צוות אלופים!" },
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
    5: {
      title: "Fun Tricks",
      subtitle: "Fun and bonding",
      steps: {
        1: { commands: ["Paw"], tip: "Hold a treat in a closed fist in front of the dog. When they try to touch or scratch it with a paw - say Paw and open your hand to reward. Repeat a few times." },
        2: { commands: ["Paw", "High Five"], tip: "Once the dog has Paw down, raise your hand a bit higher and say High Five. Reward any attempt to lift the paw upward." },
        3: { commands: ["Paw", "High Five", "Spin"], tip: "Hold a treat close to the dog's nose and lead them in a full circle while saying Spin. Reward the moment they complete the turn." },
      },
    },
    6: {
      title: "Sit and Stay",
      subtitle: "Building duration and self-control",
      steps: {
        1: { commands: ["Sit"], tip: "Ask for Sit, but this time wait 3-5 seconds before rewarding - not an instant treat. This teaches the dog that sitting means staying, not just briefly touching the floor." },
        2: { commands: ["Sit", "Stay"], tip: "Once the dog is sitting, say Stay and step one pace back. If they stay seated, return and reward. If they get up, go back to a smaller step." },
        3: { commands: ["Sit", "Stay", "Come"], tip: "Gradually increase the distance and wait time, then release the dog with the word Come. This is the right way to build a real, reliable stay." },
      },
    },
    7: {
      title: "Recall with Distractions",
      subtitle: "Strengthening Come in a challenging setting",
      steps: {
        1: { commands: ["Come"], tip: "Practice Come while someone else is around, or with a little background noise. If the dog comes despite the distraction, reward with double the enthusiasm." },
        2: { commands: ["Come", "Sit"], tip: "When the dog arrives, immediately ask for Sit before rewarding. This adds self-control on top of the fast response they already have." },
        3: { commands: ["Come", "Sit", "Down"], tip: "Try this exercise at a park or quiet street, with another dog or a stranger at a distance. This is the real test of whether the training stuck." },
      },
    },
    8: {
      title: "Social Tricks",
      subtitle: "Wave, kiss, and dance",
      steps: {
        1: { commands: ["Wave"], tip: "Hold a treat above the dog's head without letting them touch it. When they lift a paw toward you in the air, say Wave and reward. Don't let them make contact - that's what tells Wave apart from Paw." },
        2: { commands: ["Wave", "Kiss"], tip: "Hold a small treat between your fingers close to the dog's nose. When they touch their nose to your hand, say Kiss and reward right away." },
        3: { commands: ["Wave", "Kiss", "Dance"], tip: "Hold a treat above their head and circle it slowly while the dog stands on their hind legs and follows. Start with just a partial turn." },
      },
    },
    9: {
      title: "Field Discipline",
      subtitle: "Heel, stop, and go with confidence",
      steps: {
        1: { commands: ["Heel"], tip: "Head out to an open area like a park. Practice Heel as usual, but with more stimulation around - scents, people, and other dogs in the distance." },
        2: { commands: ["Heel", "Stop"], tip: "While walking, stop suddenly and say Stop. Reward any immediate stop, even if it isn't perfect at first." },
        3: { commands: ["Heel", "Stop", "Go"], tip: "After a successful stop, pause a moment and then say Go to continue. This teaches the dog to wait for your go-ahead before moving on." },
      },
    },
    10: {
      title: "The Grand Challenge",
      subtitle: "Combining everything you've learned",
      steps: {
        1: { commands: ["Down"], tip: "Ask the dog for Down and to hold it for a full minute, even if you're not right next to them. This combines self-control with real patience." },
        2: { commands: ["Down", "Come"], tip: "From there, call Come from a distance. The switch from a relaxed Down to a fast response is a real test of the bond you've built." },
        3: { commands: ["Down", "Come", "Sit"], tip: "Finish with the full sequence: Down, Come, Sit. If your dog made it through all 10 levels - you're a genuine champion team!" },
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
