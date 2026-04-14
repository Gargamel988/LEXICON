import { TabId } from "@/components/Stats/types";
import { supabase } from "../lib/supabase";

export interface GameResult {
  mode:
    | "classic"
    | "blitz"
    | "daily"
    | "blind"
    | "climb"
    | "multi"
    | "survival";
  is_winner: boolean;
  attempts?: number;
  duration_seconds?: number;
  word_length?: number;
  category?: string;
  score?: number;
  word?: string;
  solved_count?: number; // Survival için
  word_count?: number; // Multi için
  difficulty?: string; // Blind mode veya diğerleri için
}

export interface StatsSummary {
  totalGames: number;
  totalWins: number;
  winRate: number;
  streak: number;
  bestStreak: number;
  distribution: number[];
  highScore?: number;
  avgScore?: number;
  lastScores?: number[];
  avgAttempts?: number;
  maxSolvedCount?: number; // Survival/Blitz record
  totalDuration?: number; // Total time played
  avgTimePerWord?: number; // Average time per solve
  accuracy?: number; // Blind/Multi accuracy
  rankInMode?: number; // Leaderboard rank
  topCategories?: {
    name: string;
    wins: number;
    icon: string;
  }[];
}

export interface AggregateStats {
  totalPoints: number;
  totalWins: number;
  bestStreak: number;
  level: number;
  rank: string;
}

export const statsService = {
  /**
   * Oyun sonucunu kaydeder ve seriyi (streak) günceller
   */
  async saveGameResult(userId: string, result: GameResult) {
    try {
      // 1. Oyun detayını kaydet
      const { error: resultError } = await supabase
        .from("game_results")
        .insert({
          user_id: userId,
          mode: result.mode,
          is_winner: result.is_winner,
          attempts: result.attempts,
          duration_seconds: result.duration_seconds,
          word_length: result.word_length,
          category: result.category,
          word: result.word,
          score: result.score || 0,
          solved_count: result.solved_count || 0,
          word_count: result.word_count || 0,
          difficulty: result.difficulty,
        });

      if (resultError) throw resultError;

      // 2. Seri (Streak) Mantığı
      await this.updateStreak(userId);

      return { success: true };
    } catch (error) {
      console.error("Lexicon: Error saving game result:", error);
      return { success: false, error };
    }
  },

  /**
   * Seri (Streak) hesaplama ve güncelleme
   */
  async updateStreak(userId: string) {
    const today = new Date().toISOString().split("T")[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split("T")[0];

    // Mevcut seriyi çek
    const { data: streakData, error: fetchError } = await supabase
      .from("user_streaks")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError) {
      console.error("Streak fetch error:", fetchError);
      return;
    }

    if (!streakData) {
      // Hiç kaydı yoksa yeni oluştur
      await supabase.from("user_streaks").insert({
        user_id: userId,
        current_streak: 1,
        best_streak: 1,
        last_played_date: today,
      });
    } else {
      const lastDate = streakData.last_played_date;

      if (lastDate === today) {
        // Bugün zaten oynanmış, bir şey yapma
        return;
      }

      let newStreak = 1;
      if (lastDate === yesterday) {
        // Dün oynanmış, seri devam ediyor
        newStreak = streakData.current_streak + 1;
      }

      // En iyi seriyi güncelle
      const newBest = Math.max(newStreak, streakData.best_streak);

      await supabase
        .from("user_streaks")
        .update({
          current_streak: newStreak,
          best_streak: newBest,
          last_played_date: today,
        })
        .eq("user_id", userId);
    }
  },

  /**
   * Belirli bir mod için tüm istatistik özetini getirir
   */
  async getModeStats(userId: string, mode: TabId): Promise<StatsSummary> {
    // 1. Toplam oyun ve galibiyet sayılarını çek
    const { data: results, error: resultsError } = await supabase
      .from("game_results")
      .select("*")
      .eq("user_id", userId)
      .eq("mode", mode)
      .order("created_at", { ascending: false });

    if (resultsError) {
      console.error("Stats fetch error:", resultsError);
      return this.getEmptyStats();
    }

    const totalGames = results.length;
    const totalWins = results.filter((r) => r.is_winner).length;
    const winRate =
      totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

    // Tahmin dağılımı (1-6 deneme)
    const distribution = [0, 0, 0, 0, 0, 0];
    results.forEach((r) => {
      if (r.is_winner && r.attempts && r.attempts >= 1 && r.attempts <= 6) {
        distribution[r.attempts - 1]++;
      }
    });

    // Dinamik Seri (Consecutive Win Streak) Hesaplama
    let currentStreak = 0;
    for (const r of results) {
      if (r.is_winner) {
        currentStreak++;
      } else {
        break; // Seri bozuldu
      }
    }

    // En iyi seri (Tüm zamanlar - history üzerinden)
    let bestWinStreak = 0;
    let tempStreak = 0;
    const reverseResults = [...results].reverse();
    for (const r of reverseResults) {
      if (r.is_winner) {
        tempStreak++;
        bestWinStreak = Math.max(bestWinStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Kategori Analizi (Top 3 En Çok Kazanılan)
    const categoryMap: Record<string, number> = {};
    results.forEach((r) => {
      if (r.is_winner && r.category) {
        categoryMap[r.category] = (categoryMap[r.category] || 0) + 1;
      }
    });

    const categoryIcons: Record<string, string> = {
      karisik: "shuffle-outline",
      hayvanlar: "paw-outline",
      yemekler: "fast-food-outline",
      sehirler: "business-outline",
      spor: "football-outline",
      sanat: "color-palette-outline",
      bilim: "flask-outline",
      teknoloji: "hardware-chip-outline",
      tarih: "time-outline",
      cografya: "earth-outline",
      edebiyat: "book-outline",
      sinema: "videocam-outline",
    };

    const topCategories = Object.entries(categoryMap)
      .map(([name, wins]) => ({
        name,
        wins,
        icon: categoryIcons[name.toLowerCase()] || "star-outline",
      }))
      .sort((a, b) => b.wins - a.wins)
      .slice(0, 3);

    let highScore = 0;
    let avgScore = 0;
    let lastScores: number[] = [];
    let avgAttempts = 0;
    let maxSolvedCount = 0;
    let totalDuration = 0;
    let avgTimePerWord = 0;
    let accuracy = 0;

    // Ortalama deneme hesapla (sadece kazanılan oyunlar üzerinden)
    const winningAttempts = results
      .filter((r) => r.is_winner && r.attempts)
      .map((r) => r.attempts as number);
    if (winningAttempts.length > 0) {
      avgAttempts = Number(
        (
          winningAttempts.reduce((a, b) => a + b, 0) / winningAttempts.length
        ).toFixed(1),
      );
    }

    if (results.length > 0) {
      const scores = results.map((r) => r.score || 0);
      highScore = Math.max(...scores);
      avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      lastScores = results
        .slice(0, 5)
        .map((r) => r.score || 0)
        .reverse();

      totalDuration = results.reduce(
        (acc, r) => acc + (r.duration_seconds || 0),
        0,
      );

      if (mode === "survival" || mode === "blitz") {
        const solvedCounts = results.map((r) => r.solved_count || 0);
        maxSolvedCount = Math.max(...solvedCounts);

        const totalSolved = solvedCounts.reduce((a, b) => a + b, 0);
        if (totalSolved > 0 && totalDuration > 0) {
          avgTimePerWord = Math.round(totalDuration / totalSolved);
        }
      }

      if (mode === "blind" || mode === "multi") {
        const totalAttempts = results.length;
        const wins = results.filter((r) => r.is_winner).length;
        accuracy = Math.round((wins / totalAttempts) * 100);
      }
    }

    return {
      totalGames,
      totalWins,
      winRate,
      streak: currentStreak,
      bestStreak: bestWinStreak,
      distribution,
      highScore,
      avgScore,
      lastScores,
      avgAttempts,
      maxSolvedCount,
      totalDuration,
      avgTimePerWord,
      accuracy,
      topCategories,
    };
  },

  /**
   * Tüm modlar için birleştirilmiş istatistikleri getirir
   */
  async getAggregateStats(userId: string): Promise<AggregateStats> {
    const { data: results, error: resultsError } = await supabase
      .from("game_results")
      .select("is_winner, score, mode")
      .eq("user_id", userId);

    if (resultsError) {
      console.error("Aggregate stats fetch error:", resultsError);
      return {
        totalPoints: 0,
        totalWins: 0,
        bestStreak: 0,
        level: 1,
        rank: "Acemi",
      };
    }

    const { data: streakData } = await supabase
      .from("user_streaks")
      .select("best_streak")
      .eq("user_id", userId)
      .maybeSingle();

    const totalPoints = results.reduce((a, b) => a + (b.score || 0), 0);
    const totalWins = results.filter((r) => r.is_winner).length;
    const bestStreak = streakData?.best_streak || 0;

    // Seviye hesaplama (Örn: Her 2000 puan bir seviye)
    const level = Math.floor(totalPoints / 2000) + 1;
    console.log("level", level);

    // Rütbe belirleme
    let rank = "Acemi";
    if (level >= 50) rank = "Efsane";
    else if (level >= 30) rank = "Üstat";
    else if (level >= 15) rank = "Kelime Avcısı";
    else if (level >= 5) rank = "Çırak";

    return {
      totalPoints,
      totalWins,
      bestStreak,
      level,
      rank,
    };
  },

  /**
   * Global sıralama verilerini getirir
   */
  async getLeaderboard(period: "weekly" | "all_time" = "all_time") {
    try {
      const { data, error } = await supabase.rpc("get_leaderboard", {
        time_period: period,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Leaderboard fetch error:", error);
      return [];
    }
  },

  /**
   * Giriş yapan kullanıcının sıralama bilgisini getirir
   */
  async getUserRank(period: "weekly" | "all_time", userId: string) {
    try {
      const { data, error } = await supabase.rpc("get_user_leaderboard_rank", {
        time_period: period,
        target_user_id: userId,
      });

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error("User rank fetch error:", error);
      return null;
    }
  },

  /**
   * Mod bazlı liderlik tablosu verilerini getirir
   */
  async getLeaderboardByMode(period: string, mode: string) {
    try {
      const { data, error } = await supabase.rpc("get_mode_leaderboard", {
        time_period: period,
        game_mode: mode,
      });

      if (error) throw error;
      return data as {
        rank: number;
        user_id: string;
        username: string;
        avatar_url: string;
        score: string;
        duration: number;
      }[];
    } catch (error) {
      console.error("Mode leaderboard fetch error:", error);
      return [];
    }
  },

  /**
   * Kullanıcının mod bazlı sıralamasını getirir
   */
  async getUserRankByMode(period: string, mode: string, userId: string) {
    try {
      const { data, error } = await supabase.rpc("get_user_mode_rank", {
        time_period: period,
        game_mode: mode,
        target_user_id: userId,
      });

      if (error) throw error;
      return data && data.length > 0
        ? (data[0] as { rank: number; score: string; duration: number })
        : null;
    } catch (error) {
      console.error("User mode rank fetch error:", error);
      return null;
    }
  },

  getEmptyStats(): StatsSummary {
    return {
      totalGames: 0,
      totalWins: 0,
      winRate: 0,
      streak: 0,
      bestStreak: 0,
      distribution: [0, 0, 0, 0, 0, 0],
    };
  },
};
