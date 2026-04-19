export type CellStatus = "empty" | "present" | "correct" | "absent" | "first" | "last";

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
export type RoomStatus = 'waiting' | 'started' | 'finished';

export interface Room {
  id: string;
  code: string;
  host_id: string;
  status: RoomStatus;
  current_word?: string;
  winner_id?: string;
  category: string;
  word_length: number;
  created_at: string;
  mode: 'battle' | 'bomb';
  // Bomb Mode Specifics
  bomb_holder_id?: string;
  bomb_timer_start?: string;
  bomb_syllable?: string;
  used_words?: string[];
  bomb_duration_ms?: number;
}

export interface RoomPlayer {
  id: string;
  room_id: string;
  user_id: string;
  username: string;
  is_host: boolean;
  is_ready: boolean;
  joined_at: string;
}

export interface BattleMove {
  rowIndex: number;
  pattern: CellStatus[];
  userId: string;
}

export interface Row {
  id: string;
  cells: CellData[];
}
