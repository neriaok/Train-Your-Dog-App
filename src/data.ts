export type IllustrationKey =
  | 'sit' | 'come' | 'down'
  | 'crate_enter' | 'crate_return' | 'crate_full'
  | 'leave_close' | 'leave_back' | 'leave_walk'
  | 'walk_pull' | 'walk_sit' | 'walk_stay'
  | 'trick_paw' | 'trick_high5' | 'trick_spin'
  | 'stay2_sit' | 'stay2_wait' | 'stay2_come'
  | 'recall2_come' | 'recall2_sit' | 'recall2_down'
  | 'social_wave' | 'social_kiss' | 'social_dance'
  | 'field_heel' | 'field_stop' | 'field_go'
  | 'combo_down' | 'combo_come' | 'combo_sit';

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
  {
    id: 5,
    emoji: "🙌",
    color: "#E8A317",
    colorLight: "#FFF7E0",
    colorMid: "#FFD98A",
    steps: [
      { id: 1, emoji: "🐾", illustration: "trick_paw" },
      { id: 2, emoji: "🙌", illustration: "trick_high5" },
      { id: 3, emoji: "🌀", illustration: "trick_spin" },
    ],
  },
  {
    id: 6,
    emoji: "🎯",
    color: "#EF476F",
    colorLight: "#FFEFF3",
    colorMid: "#F8B4C6",
    steps: [
      { id: 1, emoji: "🪑", illustration: "stay2_sit" },
      { id: 2, emoji: "⏳", illustration: "stay2_wait" },
      { id: 3, emoji: "🏃", illustration: "stay2_come" },
    ],
  },
  {
    id: 7,
    emoji: "📢",
    color: "#118AB2",
    colorLight: "#E6F6FA",
    colorMid: "#8FD3E8",
    steps: [
      { id: 1, emoji: "🏃", illustration: "recall2_come" },
      { id: 2, emoji: "🪑", illustration: "recall2_sit" },
      { id: 3, emoji: "⬇️", illustration: "recall2_down" },
    ],
  },
  {
    id: 8,
    emoji: "👋",
    color: "#FF9F1C",
    colorLight: "#FFF3E0",
    colorMid: "#FFD599",
    steps: [
      { id: 1, emoji: "👋", illustration: "social_wave" },
      { id: 2, emoji: "💋", illustration: "social_kiss" },
      { id: 3, emoji: "💃", illustration: "social_dance" },
    ],
  },
  {
    id: 9,
    emoji: "🌳",
    color: "#6A4C93",
    colorLight: "#F1ECF7",
    colorMid: "#C4AEDD",
    steps: [
      { id: 1, emoji: "🚶", illustration: "field_heel" },
      { id: 2, emoji: "🛑", illustration: "field_stop" },
      { id: 3, emoji: "▶️", illustration: "field_go" },
    ],
  },
  {
    id: 10,
    emoji: "🏆",
    color: "#073B4C",
    colorLight: "#E7F0F2",
    colorMid: "#7FA8B3",
    steps: [
      { id: 1, emoji: "⬇️", illustration: "combo_down" },
      { id: 2, emoji: "🏃", illustration: "combo_come" },
      { id: 3, emoji: "🪑", illustration: "combo_sit" },
    ],
  },
];

export const C = {
  orange: "#FF6B35", orangeL: "#FFF0EA", orangeM: "#FFCDB2",
  teal: "#2EC4B6", tealL: "#E8FAF9", tealM: "#A8EDE9",
  yellow: "#FFD166", yellowL: "#FFF9E6",
  purple: "#9B5DE5", purpleL: "#F3EDFF",
  // Purple as body/caption text (vs. as a button fill, where white-on-purple
  // is the pairing) is a touch too light to clear WCAG AA contrast against
  // these light surfaces - this darker read-only variant is for that case.
  purpleText: "#8A42DE",
  green: "#06D6A0", greenL: "#E6FBF5",
  bg: "#FFFBF7", white: "#FFFFFF",
  text: "#1A1A2E", soft: "#6B7280", border: "#F0E8E0",
};
