import { Language } from '../i18n/LanguageContext';

/**
 * A broad, hand-written dog-training FAQ - the assistant's general
 * knowledge, separate from the app-specific tools in tools.ts (which only
 * know about the levels/commands actually inside this app). Matched by
 * counting how many of a topic's keywords appear in the user's message and
 * picking the topic with the highest score, so a free-text question like
 * "why does my puppy bite everything" still lands on the right answer
 * without needing an exact phrase match.
 */
interface FAQTopic {
  id: string;
  keywords: { he: string[]; en: string[] };
  answer: { he: string; en: string };
}

const FAQ_TOPICS: FAQTopic[] = [
  {
    id: 'barking',
    keywords: {
      he: ['נובח', 'נביחה', 'נביחות', 'צועק', 'רועש'],
      en: ['bark', 'barking', 'noisy', 'loud'],
    },
    answer: {
      he: 'נביחות יתר בדרך כלל נובעות משעמום, חרדה או תשומת לב. אל תצעקו בחזרה - זה נשמע לכלב כמו "נביחה" משותפת. במקום זה, התעלמו מנביחה שמטרתה תשומת לב, ותגמלו רגע של שקט. ודאו שהכלב מקבל מספיק פעילות גופנית ומנטלית - כלב עייף נובח פחות.',
      en: 'Excessive barking usually comes from boredom, anxiety, or attention-seeking. Don\'t shout back - to a dog, that can sound like joining in. Instead, ignore attention-seeking barking and reward moments of quiet. Make sure your dog gets enough physical and mental exercise - a tired dog barks less.',
    },
  },
  {
    id: 'chewing',
    keywords: {
      he: ['מכרסם', 'לכרסם', 'הרס', 'הורס', 'נעל', 'רהיט', 'רהיטים'],
      en: ['chew', 'chewing', 'destroy', 'destroying', 'furniture', 'shoe'],
    },
    answer: {
      he: 'כרסום הוא התנהגות טבעית, במיוחד אצל גורים. הציעו מגוון צעצועי לעיסה ותגמלו כשהכלב לועס אותם. אם תופסים אותו מכרסם משהו אסור, הפנו את תשומת לבו בעדינות לצעצוע המתאים במקום להעניש - ענישה אחרי מעשה לא מלמדת כלום כי הכלב לא מקשר אותה לפעולה.',
      en: 'Chewing is natural, especially for puppies. Offer a variety of chew toys and praise your dog when they use them. If you catch them chewing something off-limits, gently redirect to an appropriate toy instead of punishing - punishment after the fact doesn\'t teach anything since the dog can\'t connect it to the act.',
    },
  },
  {
    id: 'biting',
    keywords: {
      he: ['נשיכה', 'נושך', 'נשכן', 'עקיצה', 'נגיסה'],
      en: ['bite', 'biting', 'nip', 'nipping', 'mouthing'],
    },
    answer: {
      he: 'נשיכת ידיים אצל גורים היא בדרך כלל משחק, לא תוקפנות. כשזה קורה, הוציאו קול "אאוץ" חד והפסיקו את המשחק לכמה שניות - זה מה שכלבים אחרים היו עושים. עם הזמן הגור לומד שנשיכה חזקה מסיימת את הכיף. תנו לו חלופה - צעצוע ללעיסה - במקום היד.',
      en: 'Puppy hand-biting is usually play, not aggression. When it happens, make a sharp "ouch" sound and pause the play for a few seconds - that\'s what another dog would do. Over time the puppy learns that biting too hard ends the fun. Offer an alternative - a chew toy - instead of your hand.',
    },
  },
  {
    id: 'separationAnxiety',
    keywords: {
      he: ['חרדת פרידה', 'לבד בבית', 'נשאר לבד', 'בוכה כשעוזבים', 'לבדד'],
      en: ['separation anxiety', 'alone', 'left alone', 'home alone'],
    },
    answer: {
      he: 'חרדת פרידה מטופלת בהדרגתיות: התחילו ביציאות קצרות מאוד (אפילו 30 שניות) וחזרו לפני שהכלב מספיק להיבהל, ואז הגדילו בהדרגה. אל תעשו עניין גדול מהיציאה או מהחזרה - כניסה ויציאה רגועות מלמדות את הכלב שזה לא אירוע דרמטי. השאירו לו צעצוע מהנה שמופיע רק כשאתם לא בבית.',
      en: 'Separation anxiety is treated gradually: start with very short absences (even 30 seconds) and return before your dog gets upset, then slowly extend the time. Don\'t make a big deal of leaving or coming back - calm entries and exits teach your dog it\'s not a dramatic event. Leave an enjoyable toy that only appears while you\'re gone.',
    },
  },
  {
    id: 'leashPulling',
    keywords: {
      he: ['מושך ברצועה', 'מושך', 'רצועה מתוחה'],
      en: ['pulling', 'pulls', 'leash pull', 'tugging'],
    },
    answer: {
      he: 'הדרך היעילה ביותר: כשהכלב מושך, עצרו לגמרי ואל תזוזו עד שהרצועה משתחררת - גם אם זה אומר ללכת לכיוון ההפוך. הכלב לומד שמשיכה לא מקדמת אותו לשום מקום. תרגלו את זה ברמה 4 של האפליקציה, "טיול עם רצועה".',
      en: 'The most effective method: when your dog pulls, stop completely and don\'t move until the leash slackens - even if that means walking the other way. Your dog learns that pulling never gets them anywhere. Practice this in Level 4 of the app, "Leash Walking".',
    },
  },
  {
    id: 'pottyTraining',
    keywords: {
      he: ['לימוד ניקיון', 'עשה צרכיו', 'שירותים', 'עשה בבית', 'שלולית'],
      en: ['potty', 'house training', 'housebreaking', 'toilet', 'pee', 'poop'],
    },
    answer: {
      he: 'שגרה קבועה היא המפתח: הוציאו את הכלב מיד אחרי אכילה, שינה ומשחק, ותמיד לאותו מקום בחוץ. תגמלו בחום ברגע שהוא עושה שם - לא כשחוזרים הביתה. אם קורית תאונה בבית, נקו בלי להעניש; ריח שנשאר מושך אותו לחזור לאותו מקום.',
      en: 'A consistent routine is key: take your dog out right after eating, sleeping, and play, always to the same spot outside. Praise warmly the moment they go there - not after you\'re back inside. If an accident happens indoors, clean it without punishing; leftover scent will pull them back to that same spot.',
    },
  },
  {
    id: 'crateTraining',
    keywords: {
      he: ['כלוב', 'ארגז', 'קרייט', 'לישון בכלוב'],
      en: ['crate', 'kennel', 'crate training'],
    },
    answer: {
      he: 'הכלוב צריך להיות מקום נעים, לא ענישה. הכניסו חטיפים וצעצועים פנימה, השאירו את הדלת פתוחה בהתחלה, והגדילו את הזמן בהדרגה. תרגלו את זה ברמה 2 של האפליקציה, "בית בטוח".',
      en: 'The crate should feel like a cozy den, never a punishment. Toss treats and toys inside, leave the door open at first, and gradually increase the time spent there. Practice this in Level 2 of the app, "Safe Space".',
    },
  },
  {
    id: 'socialization',
    keywords: {
      he: ['סוציאליזציה', 'כלבים אחרים', 'פחד מאנשים', 'חברתי'],
      en: ['socialization', 'socialize', 'other dogs', 'meeting people'],
    },
    answer: {
      he: 'החלון הקריטי לחיברות הוא בין גיל 3 ל-14 שבועות, אבל אפשר וכדאי להמשיך גם אחר כך. חשפו את הכלב בהדרגה ובאווירה חיובית לאנשים, כלבים, קולות ומקומות חדשים - כל פעם קצת, בלי להציף אותו. סבלנות ותגמול על רוגע הם המפתח.',
      en: 'The critical socialization window is around 3 to 14 weeks old, but it\'s worth continuing well after that too. Gradually and positively expose your dog to new people, dogs, sounds, and places - a little at a time, without overwhelming them. Patience and rewarding calm behavior are key.',
    },
  },
  {
    id: 'digging',
    keywords: {
      he: ['חופר', 'חפירה', 'חור בגינה'],
      en: ['dig', 'digging', 'hole'],
    },
    answer: {
      he: 'חפירה היא לרוב שעמום, אנרגיה עודפת או אינסטינקט. הגדילו פעילות גופנית, ואם אפשר הקצו לו "פינת חפירה" מותרת בחצר עם חול או אדמה רכה שבה מותר לחפור ותגמלו כשהוא חופר שם.',
      en: 'Digging is usually boredom, excess energy, or instinct. Increase physical exercise, and if possible designate an allowed "digging spot" in the yard with sand or soft soil where digging is welcome, and reward them for using it.',
    },
  },
  {
    id: 'jumping',
    keywords: {
      he: ['קופץ', 'קפיצה', 'קופץ עלי'],
      en: ['jump', 'jumping', 'jumps on'],
    },
    answer: {
      he: 'כלבים קופצים כדי לקבל תשומת לב פנים אל פנים. הפתרון: הפנו את הגב אליו ברגע שהוא קופץ והתעלמו לגמרי, ותנו תשומת לב וחיבוק רק כששלושת רגליו על הרצפה. עקביות של כל בני הבית חשובה כאן במיוחד.',
      en: 'Dogs jump to get face-to-face attention. The fix: turn your back the moment they jump and ignore them completely, giving attention and petting only once all paws are on the floor. Everyone in the household staying consistent about this really matters.',
    },
  },
  {
    id: 'resourceGuarding',
    keywords: {
      he: ['שומר על אוכל', 'תוקפני עם אוכל', 'נוהם על קערה', 'שמירת קרביים'],
      en: ['resource guard', 'food aggression', 'growls over food', 'guarding food'],
    },
    answer: {
      he: 'שמירת משאבים (נהמות ליד קערה או צעצוע) היא נושא רגיש. תרגול עדין: התקרבו לקערה כשהיא ריקה עדיין, הוסיפו חטיף טעים ותתרחקו - הכלב לומד שהתקרבות שלכם מבשרת טוב, לא איום. אם ההתנהגות חמורה או מלווה בנשיכה, מומלץ מאוד לפנות למאלף מקצועי או וטרינר התנהגותי.',
      en: 'Resource guarding (growling near a bowl or toy) is a sensitive topic. A gentle exercise: approach the empty bowl, add a tasty treat, and step away - your dog learns your approach means something good, not a threat. If the behavior is severe or involves biting, it\'s strongly recommended to consult a professional trainer or veterinary behaviorist.',
    },
  },
  {
    id: 'startAge',
    keywords: {
      he: ['מתי להתחיל', 'באיזה גיל', 'גיל האילוף', 'גור קטן מדי'],
      en: ['when to start', 'what age', 'how old', 'too young'],
    },
    answer: {
      he: 'אפשר להתחיל ללמד פקודות בסיסיות כמו "שב" כבר מגיל 8 שבועות! גורים קטנים לומדים מהר, פשוט שמרו על אימונים קצרים (2-5 דקות) ועם המון תגמולים חיוביים כדי לא להעמיס עליהם.',
      en: 'You can start teaching basic commands like "sit" as early as 8 weeks old! Young puppies learn fast - just keep sessions short (2-5 minutes) and full of positive rewards so you don\'t overwhelm them.',
    },
  },
  {
    id: 'howLong',
    keywords: {
      he: ['כמה זמן לוקח', 'כמה זמן ילמד', 'מתי הוא ילמד', 'לוקח הרבה זמן'],
      en: ['how long does it take', 'how long will it take', 'takes forever'],
    },
    answer: {
      he: 'זה משתנה מכלב לכלב, אבל ברוב המקרים כלב יתחיל להבין פקודה בסיסית תוך כמה ימים של תרגול קצר ועקבי, וביסוס מלא (גם עם הסחות דעת) לוקח בדרך כלל כמה שבועות. סבלנות ועקביות חשובות הרבה יותר ממשך אימון אחד ארוך.',
      en: 'It varies from dog to dog, but in most cases a dog starts grasping a basic command within a few days of short, consistent practice, and fully solidifying it (even with distractions) usually takes a few weeks. Patience and consistency matter far more than one long session.',
    },
  },
  {
    id: 'positiveReinforcement',
    keywords: {
      he: ['חיזוק חיובי', 'תגמול', 'ענישה', 'להעניש'],
      en: ['positive reinforcement', 'reward', 'punishment', 'punish'],
    },
    answer: {
      he: 'חיזוק חיובי (תגמול על התנהגות רצויה) יעיל ומדעי הרבה יותר מענישה. ענישה יכולה ליצור פחד וחרדה בלי ללמד את הכלב מה כן לעשות. במקום זה, תפסו את הכלב "עושה משהו טוב" ותגמלו מיד - זה בונה אמון ומזרז למידה.',
      en: 'Positive reinforcement (rewarding desired behavior) is both more effective and better supported by science than punishment. Punishment can create fear and anxiety without teaching the dog what they should do instead. Instead, catch your dog "doing something right" and reward it immediately - this builds trust and speeds up learning.',
    },
  },
  {
    id: 'treats',
    keywords: {
      he: ['חטיף', 'חטיפים', 'תגמול אוכל', 'איזה חטיף'],
      en: ['treats', 'treat', 'snack', 'what treat'],
    },
    answer: {
      he: 'בחרו חטיפים קטנים, רכים וטעימים שהכלב יכול לבלוע מהר בלי להסיח את דעתו מהאימון - חתיכות של נקניקיה, גבינה או חטיפי אימון מיוחדים עובדים מצוין. ככל שהפקודה חדשה יותר, שווה יותר לגלוש לחטיף "משודרג" שהכלב אוהב במיוחד.',
      en: 'Choose small, soft, tasty treats your dog can swallow quickly without getting distracted from training - bits of hot dog, cheese, or dedicated training treats all work great. The newer the command, the more it\'s worth using an extra-special "high value" treat your dog especially loves.',
    },
  },
  {
    id: 'clicker',
    keywords: {
      he: ['קליקר', 'קליק', 'clicker'],
      en: ['clicker', 'click training'],
    },
    answer: {
      he: 'קליקר הוא כלי שמסמן בדיוק את הרגע שבו הכלב עשה את הדבר הנכון, לפני שמגיע התגמול - זה עוזר לכלב להבין בדיוק איזו פעולה זיכתה אותו. כדי להתחיל, "טענו" את הקליקר: לחצו וישר תנו חטיף, שוב ושוב, עד שהכלב מקשר בין הצליל לתגמול.',
      en: 'A clicker is a tool that marks the exact moment your dog did the right thing, right before the reward arrives - it helps the dog understand precisely which action earned it. To start, "charge" the clicker: click and immediately give a treat, over and over, until your dog links the sound to the reward.',
    },
  },
  {
    id: 'multipleDogs',
    keywords: {
      he: ['שני כלבים', 'עוד כלב', 'כמה כלבים'],
      en: ['multiple dogs', 'two dogs', 'another dog'],
    },
    answer: {
      he: 'עדיף לאלף כל כלב בנפרד בהתחלה, כדי שלא יסיחו זה את דעתו של זה ותוכלו לתת תשומת לב ממוקדת. אחרי ששני הכלבים מכירים פקודה בסיסית בנפרד, אפשר להתחיל לתרגל אותה יחד כדי לחזק גם התנהגות בקבוצה.',
      en: 'It\'s best to train each dog separately at first, so they don\'t distract each other and you can give focused attention. Once both dogs know a basic command individually, you can start practicing it together to reinforce group behavior too.',
    },
  },
  {
    id: 'olderDog',
    keywords: {
      he: ['כלב מבוגר', 'כלב זקן', 'כלב מבוגר ללמוד'],
      en: ['older dog', 'senior dog', 'adult dog', 'old dog'],
    },
    answer: {
      he: '"אי אפשר ללמד כלב זקן טריקים חדשים" זה מיתוס - כלבים מבוגרים יכולים בהחלט ללמוד, לרוב אפילו מהר יותר כי יש להם ריכוז טוב יותר מגורים. פשוט התאימו את הקצב ליכולות הפיזיות שלו, ותנו הפסקות נוחות יותר.',
      en: '"You can\'t teach an old dog new tricks" is a myth - older dogs can absolutely learn, often even faster since they have better focus than puppies. Just match the pace to their physical abilities and give more comfortable breaks.',
    },
  },
  {
    id: 'recall',
    keywords: {
      he: ['לא בא כשקוראים', 'לא מגיב לשם', 'בואי אליי'],
      en: ['recall', 'come when called', 'won\'t come', 'ignores me'],
    },
    answer: {
      he: 'לעולם אל תקראו לכלב כדי להעניש אותו או לעשות משהו לא נעים (כמו לגזור ציפורניים) - הוא ילמד שלבוא זה מסוכן. תרגלו "בוא" תמיד עם חוויה חיובית וחטיף, ותרגלו קודם במרחב סגור עם הסחות דעת מינימליות לפני שיוצאים לשטח פתוח. יש לזה רמה שלמה באפליקציה, רמה 3.',
      en: 'Never call your dog just to punish them or do something unpleasant (like trimming nails) - they\'ll learn that coming is dangerous. Always practice "come" paired with a positive experience and a treat, starting in an enclosed space with minimal distractions before moving to open areas. There\'s a full level for this in the app, Level 3.',
    },
  },
  {
    id: 'fear',
    keywords: {
      he: ['פוחד', 'פחד', 'מפחד מ', 'נבהל'],
      en: ['scared', 'afraid', 'fearful', 'anxious'],
    },
    answer: {
      he: 'אל תכריחו כלב מפוחד להתמודד ישירות עם מה שמפחיד אותו - זה רק מחזק את הפחד. תנו לו לגלות בקצב שלו ממרחק בטוח, תגמלו כל צעד קטן של אומץ, ותנו לו תמיד אפשרות לסגת. עם הזמן וסבלנות רוב הפחדים ניתנים לשיפור.',
      en: 'Don\'t force a scared dog to directly confront what frightens them - that only reinforces the fear. Let them explore at their own pace from a safe distance, reward every small step of courage, and always give them the option to retreat. With time and patience, most fears can improve.',
    },
  },
  {
    id: 'consistency',
    keywords: {
      he: ['כל המשפחה', 'לא עקבי', 'עקביות'],
      en: ['consistency', 'whole family', 'everyone in the house'],
    },
    answer: {
      he: 'עקביות היא אולי הדבר הכי חשוב באילוף. אם אחד בבית מרשה לכלב לעלות על הספה והשני אוסר, הכלב פשוט מתבלבל. שבו כמשפחה, סכמו על אותן פקודות ואותם כללים, ותעדכנו את כולם - כולל אורחים קבועים.',
      en: 'Consistency is arguably the single most important thing in training. If one person allows the dog on the couch and another forbids it, the dog just gets confused. Sit down as a family, agree on the same commands and rules, and make sure everyone - including regular guests - is on the same page.',
    },
  },
  {
    id: 'sessionLength',
    keywords: {
      he: ['כמה זמן אימון', 'כמה דקות', 'תדירות אימון'],
      en: ['session length', 'how many minutes', 'how often should i train'],
    },
    answer: {
      he: 'אימונים קצרים ותכופים עדיפים בהרבה מאימון אחד ארוך - 5-10 דקות, פעם או פעמיים ביום, זה בדיוק הטווח שבו כלב (במיוחד גור) שומר על ריכוז. סיימו תמיד בהצלחה, גם קטנה, כדי שהאימון יגמר בתחושה טובה.',
      en: 'Short, frequent sessions beat one long one by a wide margin - 5-10 minutes, once or twice a day, is right in the sweet spot for a dog (especially a puppy) to keep focus. Always end on a success, even a small one, so the session finishes on a good note.',
    },
  },
  {
    id: 'dogAggression',
    keywords: {
      he: ['תוקפני', 'תוקפנות', 'נלחם עם כלבים', 'רוצה לתקוף'],
      en: ['aggressive', 'aggression', 'fights other dogs', 'lunges'],
    },
    answer: {
      he: 'תוקפנות היא נושא מורכב שיכול לנבוע מפחד, כאב, שמירת טריטוריה ועוד. שמרו על מרחק בטוח מהגורם המעורר, ואל תענישו נהמה - היא אזהרה חשובה שעדיף שהכלב ימשיך לתת. במקרים של תוקפנות ממשית, מומלץ מאוד לפנות למאלף מקצועי או וטרינר התנהגותי במקום לנסות לפתור לבד.',
      en: 'Aggression is a complex topic that can stem from fear, pain, territorial guarding, and more. Keep a safe distance from the trigger, and don\'t punish growling - it\'s an important warning signal you actually want your dog to keep giving. For real aggression, it\'s strongly recommended to consult a professional trainer or veterinary behaviorist rather than trying to solve it alone.',
    },
  },
  {
    id: 'whining',
    keywords: {
      he: ['מייבב', 'ייבוב', 'בוכה'],
      en: ['whine', 'whining', 'crying'],
    },
    answer: {
      he: 'יבבה היא לרוב בקשה לתשומת לב, יציאה או אוכל. אם בדקתם שהצרכים הבסיסיים שלו מסופקים, נסו להתעלם מהיבבה ולתגמל רגע של שקט - כמו עם נביחה, תגובה לכל יבבה רק מלמדת את הכלב שהיא עובדת.',
      en: 'Whining is usually a request for attention, a bathroom break, or food. If you\'ve confirmed the basics are covered, try ignoring the whining and rewarding a moment of quiet - like with barking, responding to every whine just teaches your dog that it works.',
    },
  },
  {
    id: 'energy',
    keywords: {
      he: ['הרבה אנרגיה', 'עצבני', 'לא נרגע', 'משתולל'],
      en: ['too much energy', 'hyper', 'won\'t calm down', 'energetic'],
    },
    answer: {
      he: 'כלב עם עודף אנרגיה שלא מוצא לה פורקן לרוב יהיה קשה יותר לאילוף. ודאו שהוא מקבל מספיק הליכות, משחק וגירוי מנטלי (צעצועי חשיבה, אימון עצמו) לפני שמנסים לתרגל פקודות שדורשות ריכוז ורוגע.',
      en: 'A dog with pent-up energy and no outlet is usually much harder to train. Make sure they get enough walks, play, and mental stimulation (puzzle toys, training itself counts) before trying to practice commands that require focus and calm.',
    },
  },
  {
    id: 'whatFirst',
    keywords: {
      he: ['מה ללמד קודם', 'מאיפה מתחילים', 'איזו פקודה ראשונה'],
      en: ['what to teach first', 'where to start', 'first command'],
    },
    answer: {
      he: 'רוב המאלפים ממליצים להתחיל ב"שב" - היא קלה ללמידה, בטוחה, ונותנת לכלב ולכם ביטחון מוקדם. באפליקציה בדיוק ככה בנינו את רמה 1, "פקודות בסיסיות" - מתחילים משם ומתקדמים בהדרגה.',
      en: 'Most trainers recommend starting with "sit" - it\'s easy to learn, safe, and builds early confidence for both you and your dog. That\'s exactly how we built Level 1 in the app, "Basic Commands" - start there and progress gradually.',
    },
  },
  {
    id: 'distractions',
    keywords: {
      he: ['הסחות דעת', 'מוסח', 'לא מקשיב בחוץ'],
      en: ['distractions', 'distracted', 'doesn\'t listen outside'],
    },
    answer: {
      he: 'כלב שמציית מצוין בבית אבל מתעלם בחוץ הוא תופעה נורמלית לגמרי - זה עניין של הכללה. תרגלו כל פקודה קודם בבית שקט, אחר כך בחצר, ורק אז ברחוב עם הסחות דעת קלות, ותעלו רמת קושי בהדרגה.',
      en: 'A dog that obeys perfectly at home but ignores you outside is completely normal - it\'s about generalizing the skill. Practice each command first in a quiet room, then in the yard, and only then outside with mild distractions, gradually raising the difficulty.',
    },
  },
  {
    id: 'professional',
    keywords: {
      he: ['מאלף מקצועי', 'מאמן כלבים', 'וטרינר התנהגותי', 'לפנות למישהו'],
      en: ['professional trainer', 'dog trainer', 'behaviorist', 'get help'],
    },
    answer: {
      he: 'האפליקציה הזו מצוינת לאילוף בסיסי יומיומי, אבל אם יש התנהגות שמדאיגה אתכם - במיוחד תוקפנות, פחד קיצוני או שמירת משאבים חמורה - כדאי לפנות למאלף כלבים מקצועי או וטרינר התנהגותי שיכול להעריך את הכלב שלכם באופן אישי.',
      en: 'This app is great for everyday basic training, but if there\'s a behavior that worries you - especially aggression, extreme fear, or severe resource guarding - it\'s worth consulting a professional dog trainer or veterinary behaviorist who can personally assess your dog.',
    },
  },
];

// Greetings/small-talk - not real dog-training content, but answering these
// naturally (instead of falling through to "I don't understand") is a big
// part of what makes the assistant feel less like a canned demo.
const GREETING_WORDS: Record<Language, RegExp> = {
  he: /^(שלום|היי|הי|אהלן|בוקר טוב|ערב טוב)\b/,
  en: /^(hi|hello|hey|good morning|good evening)\b/i,
};
const THANKS_WORDS: Record<Language, RegExp> = { he: /תודה|מעולה תודה/, en: /thank/i };
const WHO_ARE_YOU_WORDS: Record<Language, RegExp> = {
  he: /מי אתה|מה אתה יודע|מה אתה עושה|מה זה האפליקציה/,
  en: /who are you|what can you do|what do you know/i,
};
const HOW_ARE_YOU_WORDS: Record<Language, RegExp> = { he: /מה שלומך|מה נשמע/, en: /how are you/i };
const BYE_WORDS: Record<Language, RegExp> = { he: /^(ביי|להתראות|נתראה)\b/, en: /^(bye|goodbye|see you)\b/i };

const SMALL_TALK: { test: Record<Language, RegExp>; answer: Record<Language, string> }[] = [
  {
    test: GREETING_WORDS,
    answer: {
      he: 'היי! 🐾 שמח שאתה כאן. שאל אותי כל דבר על אילוף הכלב שלך - פקודות, בעיות התנהגות, או טיפים כלליים.',
      en: 'Hey there! 🐾 Glad you\'re here. Ask me anything about training your dog - commands, behavior issues, or general tips.',
    },
  },
  {
    test: THANKS_WORDS,
    answer: {
      he: 'בשמחה! 🐕 אם יש עוד משהו על האילוף שאתה רוצה לדעת, אני כאן.',
      en: 'You\'re welcome! 🐕 If there\'s anything else about training you want to know, I\'m here.',
    },
  },
  {
    test: WHO_ARE_YOU_WORDS,
    answer: {
      he: 'אני עוזר האילוף של האפליקציה - אני מכיר את כל הרמות והפקודות כאן, וגם יודע לענות על שאלות כלליות באילוף כלבים: נביחות, נשיכות, חרדת פרידה, לימוד ניקיון ועוד הרבה. תשאל אותי מה שבא לך!',
      en: 'I\'m the app\'s training assistant - I know all the levels and commands here, and I can also answer general dog-training questions: barking, biting, separation anxiety, potty training, and a lot more. Ask me anything!',
    },
  },
  {
    test: HOW_ARE_YOU_WORDS,
    answer: {
      he: 'מצוין, תודה ששאלת! 🐶 מוכן לעזור לך ולכלב שלך. מה תרצה לדעת?',
      en: 'Doing great, thanks for asking! 🐶 Ready to help you and your dog. What would you like to know?',
    },
  },
  {
    test: BYE_WORDS,
    answer: {
      he: 'להתראות! בהצלחה באילוף, ותחזור בכל שאלה 🐾',
      en: 'Goodbye! Good luck with the training, and come back anytime you have a question 🐾',
    },
  },
];

export function matchSmallTalk(message: string, language: Language): string | null {
  const msg = message.trim();
  for (const entry of SMALL_TALK) {
    if (entry.test[language].test(msg)) return entry.answer[language];
  }
  return null;
}

export function matchFAQ(message: string, language: Language): string | null {
  const msg = message.toLowerCase();
  let best: { topic: FAQTopic; score: number } | null = null;
  for (const topic of FAQ_TOPICS) {
    const score = topic.keywords[language].reduce(
      (acc, kw) => acc + (msg.includes(kw.toLowerCase()) ? 1 : 0),
      0
    );
    if (score > 0 && (!best || score > best.score)) best = { topic, score };
  }
  return best ? best.topic.answer[language] : null;
}
