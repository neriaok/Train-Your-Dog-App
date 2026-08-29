# מאלפים יחד - Dog Training App

## גרסה חיה

**https://train-your-dog-app-nerias-projects-33ce4739.vercel.app**

גרסת ה-web של האפליקציה, זמינה מכל מכשיר (כולל פלאפון) בלי צורך שמחשב הפיתוח יהיה דלוק. פריסה: `npx expo export --platform web && vercel deploy --prod --yes --cwd ./dist`.

## התקנה ורצה מהיר

```bash
# 1. התקן תלויות
npm install

# 2. הרץ על הנייד (Expo Go)
npm start
# סרוק QR code עם אפליקציית Expo Go

# 3. הרץ על אנדרואיד emulator
npm run android
```

## Build לחנויות

```bash
# התקן EAS CLI
npm install -g eas-cli

# התחבר ל-Expo account (חינמי)
eas login

# הגדר פרויקט (פעם אחת)
eas init

# Build לשתי חנויות
npm run build:all

# פרסם לחנויות
eas submit --platform android  # Google Play
eas submit --platform ios      # App Store
```

## מה צריך לפני פרסום

### Google Play ($25 חד-פעמי)
1. פתח חשבון ב-play.google.com/console
2. `eas build --platform android`
3. `eas submit --platform android`

### App Store ($99/שנה)
1. פתח Apple Developer account
2. `eas build --platform ios`
3. `eas submit --platform ios`

## מבנה הפרויקט

```
DogTrainingApp/
├── App.tsx                    # Entry point - navigation state
├── src/
│   ├── data.ts               # כל הרמות והשלבים
│   ├── components/
│   │   ├── DogScene.tsx      # אנימציית הכלב + האדם (SVG)
│   │   ├── ProgressBar.tsx   # Progress bar
│   │   └── Confetti.tsx      # קונפטי מסך הצלחה
│   └── screens/
│       ├── SplashScreen.tsx  # מסך פתיחה
│       ├── LevelSelectScreen.tsx  # בחירת רמה
│       ├── StepScreen.tsx    # שלב אילוף
│       └── SuccessScreen.tsx # מסך הצלחה
├── assets/                   # icon.png, splash.png (הוסף בעצמך)
├── app.json                  # הגדרות Expo
├── eas.json                  # הגדרות Build
└── package.json
```

## הוספת רמות עתידיות

ב-`src/data.ts` - פשוט הוסף אובייקט ל-LEVELS array:

```ts
{
  id: 4,
  title: "שם הרמה",
  subtitle: "תיאור קצר",
  emoji: "🎯",
  color: "#...",
  colorLight: "#...",
  colorMid: "#...",
  steps: [...]
}
```

## Assets

בתיקיית `assets/` יש כרגע placeholder פשוט (עיגול על רקע כתום) בשלושת הקבצים הנדרשים:
- `icon.png` - 1024x1024px
- `splash.png` - 1284x2778px
- `adaptive-icon.png` - 1024x1024px (אנדרואיד)

לפני פרסום לחנויות יש להחליף אותם בעיצוב אמיתי (למשל מ-Figma או Canva) - בלי זה ה-build ירוץ אבל האייקון ומסך הפתיחה ייראו גנריים.
