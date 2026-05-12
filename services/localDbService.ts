import * as SQLite from 'expo-sqlite';
import { GameResult } from './statsService';

const DB_NAME = 'lexicon_local.db';

export interface LocalProfile {
  id: string;
  username: string;
  avatar_url: string;
  coins: number;
  xp: number;
  level: number;
  is_premium: boolean;
  premium_until: string | null;
  is_public: boolean;
  show_on_leaderboard: boolean;
}

export const localDbService = {
  db: null as SQLite.SQLiteDatabase | null,

  async init() {
    if (this.db) return;
    this.db = await SQLite.openDatabaseAsync(DB_NAME);

    // Create tables
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS local_profile (
        id TEXT PRIMARY KEY,
        username TEXT,
        avatar_url TEXT,
        coins INTEGER,
        xp INTEGER,
        level INTEGER,
        is_premium INTEGER,
        premium_until TEXT,
        is_public INTEGER DEFAULT 1,
        show_on_leaderboard INTEGER DEFAULT 1
      );
      -- Diğer tablolar aynı kalsın...
    `);

    // Migration: Eski tablolara yeni sütunları ekle (hata verirse sütun zaten vardır, yutalım)
    try {
      await this.db.execAsync("ALTER TABLE local_profile ADD COLUMN is_public INTEGER DEFAULT 1;");
    } catch (e) { /* ignore if column exists */ }
    
    try {
      await this.db.execAsync("ALTER TABLE local_profile ADD COLUMN show_on_leaderboard INTEGER DEFAULT 1;");
    } catch (e) { /* ignore if column exists */ }

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS pending_game_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        mode TEXT,
        is_winner INTEGER,
        attempts INTEGER,
        duration_seconds INTEGER,
        score INTEGER,
        solved_count INTEGER,
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS local_inventory (
        user_id TEXT,
        powerup_type TEXT,
        quantity INTEGER,
        PRIMARY KEY (user_id, powerup_type)
      );
    `);
  },

  async saveProfile(profile: LocalProfile) {
    await this.init();
    await this.db!.runAsync(
      `INSERT OR REPLACE INTO local_profile (id, username, avatar_url, coins, xp, level, is_premium, premium_until, is_public, show_on_leaderboard) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        profile.id,
        profile.username,
        profile.avatar_url,
        profile.coins,
        profile.xp,
        profile.level,
        profile.is_premium ? 1 : 0,
        profile.premium_until,
        profile.is_public ? 1 : 0,
        profile.show_on_leaderboard ? 1 : 0
      ]
    );
  },

  async getProfile(userId: string): Promise<LocalProfile | null> {
    await this.init();
    const result = await this.db!.getFirstAsync<any>(
      'SELECT * FROM local_profile WHERE id = ?',
      [userId]
    );
    if (!result) return null;
    return {
      ...result,
      is_premium: result.is_premium === 1,
      is_public: result.is_public === 1,
      show_on_leaderboard: result.show_on_leaderboard === 1
    };
  },

  async queueGameResult(userId: string, result: GameResult) {
    await this.init();
    await this.db!.runAsync(
      `INSERT INTO pending_game_results (user_id, mode, is_winner, attempts, duration_seconds, score, solved_count, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        result.mode,
        result.is_winner ? 1 : 0,
        result.attempts || 0,
        result.duration_seconds || 0,
        result.score || 0,
        result.solved_count || 0,
        new Date().toISOString()
      ]
    );
  },

  async getPendingResults() {
    await this.init();
    return await this.db!.getAllAsync<any>('SELECT * FROM pending_game_results');
  },

  async clearPendingResult(id: number) {
    await this.init();
    await this.db!.runAsync('DELETE FROM pending_game_results WHERE id = ?', [id]);
  },

  async updateLocalCoins(userId: string, newBalance: number) {
    await this.init();
    await this.db!.runAsync(
      'UPDATE local_profile SET coins = ? WHERE id = ?',
      [newBalance, userId]
    );
  },

  async updateLocalInventory(userId: string, powerupType: string, quantity: number) {
    await this.init();
    await this.db!.runAsync(
      'INSERT OR REPLACE INTO local_inventory (user_id, powerup_type, quantity) VALUES (?, ?, ?)',
      [userId, powerupType, quantity]
    );
  }
};
