export type MissionType =
  | "play_games"
  | "win_games"
  | "solve_words"
  | "use_powerups"
  | "mode_specific"
  | "streak_goal"
  | "time_goal";

export interface MissionTemplate {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  goal: number;
  rewardCoins: number;
  rewardXp: number;
  mode?: string;
  powerup?: string;
}

export const MISSION_TEMPLATES: MissionTemplate[] = [
  {
    id: "play_5_games",
    type: "play_games",
    title: "Oyun Tutkunu",
    description: "Bugün herhangi bir modda 5 oyun oyna.",
    goal: 5,
    rewardCoins: 5,
    rewardXp: 100,
  },
  {
    id: "win_5_games",
    type: "win_games",
    title: "Galibiyet Serisi",
    description: "Bugün 5 oyun kazan.",
    goal: 5,
    rewardCoins: 6,
    rewardXp: 200,
  },
  {
    id: "solve_25_words",
    type: "solve_words",
    title: "Kelime Avcısı",
    description: "Bugün toplam 25 kelime çöz.",
    goal: 25,
    rewardCoins: 8,
    rewardXp: 300,
  },
  {
    id: "play_blitz_5",
    type: "mode_specific",
    mode: "blitz",
    title: "Yıldırım Hızı",
    description: "Blitz modunda 5 oyun oyna.",
    goal: 5,
    rewardCoins: 5,
    rewardXp: 150,
  },
  {
    id: "play_climb_5",
    type: "mode_specific",
    mode: "climb",
    title: "Zirve Yolcusu",
    description: "Tırmanış modunda 5 oyun oyna.",
    goal: 5,
    rewardCoins: 5,
    rewardXp: 150,
  },
  {
    id: "use_8_hints",
    type: "use_powerups",
    powerup: "hint",
    title: "Yardımsever",
    description: "Bugün 8 kez İpucu kullan.",
    goal: 8,
    rewardCoins: 10,
    rewardXp: 200,
  },
  {
    id: "win_bomb_mode_3",
    type: "mode_specific",
    mode: "bomb",
    title: "İmha Uzmanı",
    description: "Bomba modunda 3 oyun kazan.",
    goal: 3,
    rewardCoins: 10,
    rewardXp: 400,
  },
  {
    id: "win_survival_3",
    type: "mode_specific",
    mode: "survival",
    title: "Hayatta Kalan",
    description: "Hayatta Kalma modunda 3 oyun kazan.",
    goal: 3,
    rewardCoins: 10,
    rewardXp: 350,
  },
  {
    id: "use_12_powerups",
    type: "use_powerups",
    title: "Güç Patlaması",
    description: "Herhangi 12 güçlendirici kullan.",
    goal: 12,
    rewardCoins: 12,
    rewardXp: 250,
  },
  {
    id: "solve_30_words_daily",
    type: "solve_words",
    title: "Efsanevi Avcı",
    description: "Bir günde 30 kelime çöz.",
    goal: 30,
    rewardCoins: 15,
    rewardXp: 500,
  },
  {
    id: "win_6_games_daily",
    type: "win_games",
    title: "Durdurulamaz",
    description: "Bugün 6 oyun kazan.",
    goal: 6,
    rewardCoins: 15,
    rewardXp: 450,
  },
];

export const WEEKLY_MISSION_TEMPLATES: MissionTemplate[] = [
  {
    id: "weekly_play_50",
    type: "play_games",
    title: "Haftalık Maraton",
    description: "Bir hafta içinde 50 oyun oyna.",
    goal: 50,
    rewardCoins: 50,
    rewardXp: 1000,
  },
  {
    id: "weekly_win_25",
    type: "win_games",
    title: "Haftalık Şampiyon",
    description: "Bir hafta içinde 25 oyun kazan.",
    goal: 25,
    rewardCoins: 80,
    rewardXp: 2000,
  },
  {
    id: "weekly_solve_350",
    type: "solve_words",
    title: "Kelime Gurusu",
    description: "Bir hafta içinde 350 kelime çöz.",
    goal: 350,
    rewardCoins: 100,
    rewardXp: 4000,
  },
  {
    id: "weekly_blitz_master",
    type: "mode_specific",
    mode: "blitz",
    title: "Blitz Üstadı",
    description: "Blitz modunda 20 oyun kazan.",
    goal: 20,
    rewardCoins: 70,
    rewardXp: 1500,
  },
  {
    id: "weekly_survival_expert",
    type: "mode_specific",
    mode: "survival",
    title: "Sağ Kalma Uzmanı",
    description: "Survival modunda 15 oyun kazan.",
    goal: 15,
    rewardCoins: 70,
    rewardXp: 1500,
  },
  {
    id: "weekly_bomb_pro",
    type: "mode_specific",
    mode: "bomb",
    title: "Bomba Profesörü",
    description: "Bomba modunda 15 oyun kazan.",
    goal: 15,
    rewardCoins: 90,
    rewardXp: 2500,
  },
  {
    id: "weekly_use_80_powerups",
    type: "use_powerups",
    title: "Güç Ustası",
    description: "Haftalık 80 güçlendirici kullan.",
    goal: 80,
    rewardCoins: 120,
    rewardXp: 2000,
  },
  {
    id: "weekly_climb_15",
    type: "mode_specific",
    mode: "climb",
    title: "Zirve Hakimi",
    description: "Tırmanış modunda 15 oyun kazan.",
    goal: 15,
    rewardCoins: 80,
    rewardXp: 2200,
  },
  {
    id: "weekly_perfect_games",
    type: "win_games",
    title: "Kusursuz Hafta",
    description: "Haftalık 30 oyun kazan.",
    goal: 30,
    rewardCoins: 150,
    rewardXp: 3000,
  },
];
