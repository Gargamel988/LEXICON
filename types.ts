export type CellStatus = "empty" | "present" | "correct" | "absent";

export interface CellData {
  char: string;
  status: CellStatus;
}

export type BlindDifficulty = "TAM_KOR" | "YARI_KOR" | "RENKSIZ";

export interface BlindModeSettings {
  difficulty: BlindDifficulty;
  length: number;
  category: string;
  maxAttempts: number;
}

export interface PowerUpConfig {
  key: string;
  icon: string;
  label: string;
  count: number;
  accentColor: string;
  onPress: () => void;
  description: string;
  isActive?: boolean;
}
