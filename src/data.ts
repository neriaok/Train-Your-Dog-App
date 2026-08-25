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

// Structural data only (no display text) - shared by every language. Text
// (title/subtitle/commands/tip) is merged in per-language by
// src/i18n/content.ts -> getLocalizedLevels().
export interface StepSkeleton {
  id: number;
  emoji: string;
  illustration: IllustrationKey;
}

export interface LevelSkeleton {
  id: number;
  emoji: string;
  color: string;
  colorLight: string;
  colorMid: string;
  steps: StepSkeleton[];
}

export const LEVEL_SKELETONS: LevelSkeleton[] = [
  {
    id: 1,
    emoji: "🐾",
    color: "#FF6B35",
    colorLight: "#FFF0EA",
    colorMid: "#FFCDB2",
    steps: [
      { id: 1, emoji: "🪑", illustration: "sit" },
      { id: 2, emoji: "🏃", illustration: "come" },
      { id: 3, emoji: "⬇️", illustration: "down" },
    ],
  },
  {
    id: 2,
    emoji: "🏠",
    color: "#2EC4B6",
    colorLight: "#E8FAF9",
    colorMid: "#A8EDE9",
    steps: [
      { id: 1, emoji: "🏠", illustration: "crate_enter" },
      { id: 2, emoji: "🔄", illustration: "crate_return" },
      { id: 3, emoji: "⭐", illustration: "crate_full" },
    ],
  },
  {
    id: 3,
    emoji: "🍖",
    color: "#9B5DE5",
    colorLight: "#F3EDFF",
    colorMid: "#D4B8F8",
    steps: [
      { id: 1, emoji: "🍖", illustration: "leave_close" },
      { id: 2, emoji: "🔄", illustration: "leave_back" },
      { id: 3, emoji: "👣", illustration: "leave_walk" },
    ],
  },
  {
    id: 4,
    emoji: "🦮",
    color: "#06D6A0",
    colorLight: "#E6FBF5",
    colorMid: "#8FE3C5",
    steps: [
      { id: 1, emoji: "🔄", illustration: "walk_pull" },
      { id: 2, emoji: "🪑", illustration: "walk_sit" },
      { id: 3, emoji: "✋", illustration: "walk_stay" },
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
