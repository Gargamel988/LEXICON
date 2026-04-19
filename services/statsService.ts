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
    | "survival"
    | "timed";
  is_winner: boolean;
  attempts?: number;
  duration_seconds?: number;
  word_length?: number;
  category?: string;
  score?: number;
  solved_count?: number; // Survival için
  word_count?: number; // Multi için
  difficulty?: string; // Blind mode veya diğerleri için
  created_at?: string | Date; // Metadata for temporal analysis
  is_fair_play?: boolean; // Client-side only flag, not stored in DB
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
  speedPercentile?: number; // Blitz hızı için yüzdelik dilim
  rank?: number; // Mod bazlı genel sıralama
  totalPlayers?: number; // Mod bazlı toplam oyuncu sayısı
  advancedDaily?: {
    communityAvgAttempts: number;
    communityAvgDuration: number;
    percentile: number;
    vocabularyAnalysis: any;
    solveTimeDist: { label: string; count: number }[];
  };
  advancedClassic?: {
    wordLengthPerformance: {
      length: number;
      avgTime: number;
      avgAttempts: number;
    }[];
    categoryPerformance: {
      name: string;
      avgTime: number;
      successRate: number;
      total: number;
    }[];
    efficiencyScore: number;
    trend: { direction: "up" | "down" | "stable"; percentage: number };
    timeAnalysis: { label: string; winRate: number; gameCount: number }[];
  };
  advancedBlitz?: {
    bestSessionSpeed: number; // En iyi seanstaki kelime başına hız
    tempoScore: number; // 0-100 arası tempo yoğunluğu
    solveTierDist: { label: string; count: number }[]; // Hız katmanları dağılımı
    stabilityScore: number; // Hız tutarlılığı
  };
  advancedBlind?: {
    intelScore: number;
    perfectSaves: number;
    totalLettersFound: number;
    avgGuessTime: number;
    guessDist: number[]; // 1-6 arası dağılım
  };
  advancedClimb?: {
    highestLevel: number;
    avgLevel: number;
    efficiency: number;
    totalLevelsClimbed: number;
    levelWinRate: number; // Yüzde kaç seviye geçildi
  };
  advancedSurvival?: {
    totalSolved: number;
    enduranceScore: number;
    survivalRate: number;
    avgSurvivalTime: number; // Saniye cinsinden
    milestoneReaches: number; // 10+ kelime ulaşılan seans sayısı
  };
  advancedMulti?: {
    multiTaskScore: number;
    parallelEfficiency: number;
    totalSetsCompleted: number;
    avgSetTime: number;
    syncScore: number; // 0-100 paralel bitirme senkronu
  };
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
   * Kullanıcının profil bilgilerini getirir
   */
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;
    return data as { id: string; username: string; avatar_url: string };
  },

  /**
   * Oyun sonucunu kaydeder ve seriyi (streak) günceller
   */
  async saveGameResult(userId: string, result: GameResult) {
    try {
      // Hile şüphesi varsa veritabanına kaydetme
      if (result.is_fair_play === false) {
        return { success: false, reason: "fair_play_violation" };
      }

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
          score: result.score || 0,
          solved_count: result.solved_count || 0,
          word_count: result.word_count || 0,
          difficulty: result.difficulty,
          // NOT: is_fair_play sütunu veritabanında mevcut olmadığı için buraya eklenmiyor.
        });

      if (resultError) throw resultError;

      if (result.mode === "daily") {
        await this.updateStreak(userId);
      }

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
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];

    // 1. Mevcut seriyi çek (hesaplama için gerekiyor)
    const { data: streakData, error: fetchError } = await supabase
      .from("user_streaks")
      .select("current_streak, best_streak, last_played_date")
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError) {
      console.error("Streak fetch error:", fetchError);
      return;
    }

    // Bugün zaten oynanmışsa işlem yapma
    if (streakData?.last_played_date === today) return;

    // 2. Yeni seri değerlerini hesapla
    const isYesterday = streakData?.last_played_date === yesterday;
    const newStreak = isYesterday ? streakData.current_streak + 1 : 1;
    const newBest = Math.max(newStreak, streakData?.best_streak || 0);

    // 3. Upsert: Varsa güncelle, yoksa ekle
    await supabase.from("user_streaks").upsert({
      user_id: userId,
      current_streak: newStreak,
      best_streak: newBest,
      last_played_date: today,
    });
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

    // 1.5. Günlük Mod için Özel Seri Verisini Çek (Upsert ile kaydedilen veri)
    let currentStreak = 0;
    let bestWinStreak = 0;

    if (mode === "daily") {
      const { data: streakData } = await supabase
        .from("user_streaks")
        .select("current_streak, best_streak")
        .eq("user_id", userId)
        .maybeSingle();

      if (streakData) {
        currentStreak = streakData.current_streak;
        bestWinStreak = streakData.best_streak;
      }
    } else {
      // Dinamik Seri (Consecutive Win Streak) Hesaplama - Diğer modlar için
      for (const r of results) {
        if (r.is_winner) {
          currentStreak++;
        } else {
          break; // Seri bozuldu
        }
      }

      // En iyi seri (Tüm zamanlar - history üzerinden)
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
      .filter(
        (r) => r.is_winner && r.attempts && r.attempts >= 1 && r.attempts <= 6,
      )
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
      highScore = scores.length > 0 ? Math.max(0, ...scores) : 0;
      avgScore =
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0;
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
        maxSolvedCount =
          solvedCounts.length > 0 ? Math.max(0, ...solvedCounts) : 0;

        const totalSolved = solvedCounts.reduce((a, b) => a + b, 0);
        if (totalSolved > 0 && totalDuration > 0) {
          avgTimePerWord = Math.round(totalDuration / totalSolved);
        }
      }

      if (mode === "blind" || mode === "multi") {
        const totalAttempts = results.length;
        const wins = results.filter((r) => r.is_winner).length;
        accuracy =
          totalAttempts > 0 ? Math.round((wins / totalAttempts) * 100) : 0;
      }
    }

    // Gelişmiş Günlük İstatistikler
    let advancedDaily = undefined;
    if (mode === "daily" && results.length > 0) {
      const lastResult = results[0]; // En son günlük oyun
      const [communityStats, vocabularyAnalysis, percentile] =
        await Promise.all([
          this.getDailyCommunityStats(),
          this.getVocabularyAnalysis(userId),
          this.getDailyPercentile(userId, lastResult.duration_seconds || 0),
        ]);

      // Süre dağılımı hesapla
      const timeDist = [
        { label: "0-30s", count: 0 },
        { label: "30-60s", count: 0 },
        { label: "1-2dk", count: 0 },
        { label: "2dk+", count: 0 },
      ];

      results.forEach((r) => {
        const d = r.duration_seconds || 0;
        if (d <= 30) timeDist[0].count++;
        else if (d <= 60) timeDist[1].count++;
        else if (d <= 120) timeDist[2].count++;
        else timeDist[3].count++;
      });

      advancedDaily = {
        communityAvgAttempts: communityStats.avgAttempts,
        communityAvgDuration: communityStats.avgDuration,
        percentile,
        vocabularyAnalysis,
        solveTimeDist: timeDist,
      };
    }

    const summary: StatsSummary = {
      totalGames,
      totalWins,
      winRate,
      streak: currentStreak,
      bestStreak: bestWinStreak,
      distribution: [0, 0, 0, 0, 0, 0],
      highScore,
      avgScore,
      lastScores,
      avgAttempts,
      maxSolvedCount,
      totalDuration,
      avgTimePerWord,
      accuracy,
      topCategories,
      speedPercentile: 0,
      advancedDaily,
    };

    if (mode === "classic" && results.length > 0) {
      summary.advancedClassic = this.getClassicPerformanceAnalysis(results);
    }

    if (mode === "blitz" && results.length > 0) {
      summary.advancedBlitz = this.getBlitzPerformanceAnalysis(results);
    }

    if (mode === "blind" && results.length > 0) {
      summary.advancedBlind = this.getBlindPerformanceAnalysis(results);
    }

    if (mode === "climb" && results.length > 0) {
      summary.advancedClimb = this.getClimbPerformanceAnalysis(results);
    }

    if (mode === "survival" && results.length > 0) {
      summary.advancedSurvival = this.getSurvivalPerformanceAnalysis(results);
    }

    if (mode === "multi" && results.length > 0) {
      summary.advancedMulti = this.getMultiPerformanceAnalysis(results);
    }

    // Tahmin dağılımını (1-6 deneme) yeniden hesapla
    const finalDistribution = [0, 0, 0, 0, 0, 0];
    results.forEach((r) => {
      if (r.is_winner && r.attempts && r.attempts >= 1 && r.attempts <= 6) {
        finalDistribution[r.attempts - 1]++;
      }
    });
    summary.distribution = finalDistribution;

    // ── Blitz için Özel Sıralama ve Yüzdelik Dilim Hesaplama ──
    if (
      mode === "blitz" &&
      summary.avgTimePerWord &&
      summary.avgTimePerWord > 0
    ) {
      try {
        const rankInfo = await this.getUserRankByMode(
          "all_time",
          "blitz",
          userId,
        );

        if (rankInfo && typeof rankInfo.rank === "number") {
          const { data: totalPlayersData } = await supabase
            .from("game_results")
            .select("user_id")
            .eq("mode", "blitz");

          const uniquePlayers = new Set(totalPlayersData?.map((r) => r.user_id))
            .size;

          if (uniquePlayers > 1) {
            const percentile = Math.round(
              ((uniquePlayers - rankInfo.rank) / (uniquePlayers - 1)) * 100,
            );
            summary.speedPercentile = Math.max(0, Math.min(100, percentile));
          } else {
            summary.speedPercentile = 100;
          }
        }
      } catch (err) {
        console.error("Blitz percentile calc error:", err);
      }
    }

    // ── Günlük veya Diğer Modlar için Genel Sıralama ──
    if (mode === "daily" || mode === "survival" || mode === "climb") {
      try {
        const rankInfo = await this.getUserRankByMode("all_time", mode, userId);
        if (rankInfo && typeof rankInfo.rank === "number") {
          summary.rank = rankInfo.rank;

          const { data: totalPlayersData } = await supabase
            .from("game_results")
            .select("user_id")
            .eq("mode", mode);
          summary.totalPlayers = new Set(
            totalPlayersData?.map((r) => r.user_id),
          ).size;
        }
      } catch (err) {
        console.error(`${mode} rank fetch error:`, err);
      }
    }

    return summary;
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
  async getLeaderboard(period: "daily" | "weekly" | "all_time" = "all_time") {
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

  /**
   * Bugünün günlük kelime istatistiklerini getirir (Topluluk Ortalaması)
   */
  async getDailyCommunityStats() {
    try {
      const today = new Date().toISOString().split("T")[0];
      const startOfDay = `${today}T00:00:00.000Z`;
      const endOfDay = `${today}T23:59:59.999Z`;

      const { data, error } = await supabase
        .from("game_results")
        .select("attempts, duration_seconds")
        .eq("mode", "daily")
        .eq("is_winner", true)
        .gte("created_at", startOfDay)
        .lte("created_at", endOfDay);

      if (error) throw error;

      if (!data || data.length === 0) {
        return { avgAttempts: 0, avgDuration: 0, totalPlayers: 0 };
      }

      const totalPlayers = data.length;
      const totalAttempts = data.reduce((sum, r) => sum + (r.attempts || 0), 0);
      const totalDuration = data.reduce(
        (sum, r) => sum + (r.duration_seconds || 0),
        0,
      );

      return {
        avgAttempts: Number((totalAttempts / totalPlayers).toFixed(1)),
        avgDuration: Math.round(totalDuration / totalPlayers),
        totalPlayers,
      };
    } catch (error) {
      console.error("Error fetching community stats:", error);
      return { avgAttempts: 0, avgDuration: 0, totalPlayers: 0 };
    }
  },

  /**
   * Kullanıcının bugünkü günlük kelime performans yüzdesini hesaplar
   */
  async getDailyPercentile(userId: string, userDuration: number) {
    try {
      const today = new Date().toISOString().split("T")[0];
      const startOfDay = `${today}T00:00:00.000Z`;
      const endOfDay = `${today}T23:59:59.999Z`;

      const { data, error } = await supabase
        .from("game_results")
        .select("duration_seconds")
        .eq("mode", "daily")
        .eq("is_winner", true)
        .gte("created_at", startOfDay)
        .lte("created_at", endOfDay);

      if (error) throw error;
      if (!data || data.length <= 1) return 100;

      const results = data.map((r) => r.duration_seconds || 999);
      const betterThan = results.filter((d) => d > userDuration).length;

      return Math.round((betterThan / results.length) * 100);
    } catch (error) {
      console.error("Error calculating percentile:", error);
      return 100;
    }
  },

  /**
   * Kullanıcının kelime bazlı performans analizini yapar
   */
  async getVocabularyAnalysis(userId: string) {
    try {
      const { data, error } = await supabase
        .from("game_results")
        .select("category, attempts, duration_seconds, is_winner")
        .eq("user_id", userId)
        .eq("mode", "daily")
        .eq("is_winner", true);

      if (error) throw error;
      if (!data || data.length === 0) return null;

      // Kategori bazlı analiz
      const categoryStats: Record<
        string,
        { attempts: number[]; times: number[] }
      > = {};

      data.forEach((r) => {
        const cat = r.category || "Genel";
        if (!categoryStats[cat]) {
          categoryStats[cat] = { attempts: [], times: [] };
        }
        categoryStats[cat].attempts.push(r.attempts || 0);
        categoryStats[cat].times.push(r.duration_seconds || 0);
      });

      const analysis = Object.entries(categoryStats)
        .map(([name, stats]) => ({
          name,
          avgAttempts: Number(
            (
              stats.attempts.reduce((a, b) => a + b, 0) / stats.attempts.length
            ).toFixed(1),
          ),
          avgTime: Math.round(
            stats.times.reduce((a, b) => a + b, 0) / stats.times.length,
          ),
        }))
        .sort((a, b) => a.avgTime - b.avgTime);

      return {
        bestCategory: analysis[0],
        allCategories: analysis,
      };
    } catch (error) {
      console.error("Error fetching vocabulary analysis:", error);
      return null;
    }
  },

  /**
   * Klasik mod için gelişmiş performans analizi yapar
   */
  getClassicPerformanceAnalysis(results: GameResult[]) {
    if (results.length === 0) return;

    const winningResults = results.filter((r) => r.is_winner);

    // 1. Kelime Uzunluğu Performansı
    const lengthStats: Record<number, { attempts: number[]; times: number[] }> =
      {};
    winningResults.forEach((r) => {
      const len = r.word_length || 5;
      if (!lengthStats[len]) lengthStats[len] = { attempts: [], times: [] };
      lengthStats[len].attempts.push(r.attempts || 0);
      lengthStats[len].times.push(r.duration_seconds || 0);
    });

    const wordLengthPerformance = Object.entries(lengthStats).map(
      ([len, stats]) => {
        const attemptsCount = stats.attempts.length || 1;
        const timesCount = stats.times.length || 1;
        return {
          length: Number(len),
          avgTime: Math.round(
            stats.times.reduce((a, b) => a + b, 0) / timesCount,
          ),
          avgAttempts: Number(
            (stats.attempts.reduce((a, b) => a + b, 0) / attemptsCount).toFixed(
              1,
            ),
          ),
        };
      },
    );

    // 2. Kategori Performansı
    const catStats: Record<
      string,
      { total: number; wins: number; times: number[] }
    > = {};
    results.forEach((r) => {
      const cat = r.category || "karisik";
      if (!catStats[cat]) catStats[cat] = { total: 0, wins: 0, times: [] };
      catStats[cat].total++;
      if (r.is_winner) {
        catStats[cat].wins++;
        if (r.duration_seconds && r.duration_seconds > 0) {
          catStats[cat].times.push(r.duration_seconds);
        }
      }
    });

    const categoryPerformance = Object.entries(catStats)
      .map(([name, stats]) => ({
        name,
        total: stats.total,
        successRate: Math.round((stats.wins / stats.total) * 100),
        avgTime:
          stats.times.length > 0
            ? Math.round(
                stats.times.reduce((a, b) => a + b, 0) / stats.times.length,
              )
            : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // 3. Verimlilik Skoru (0-100)
    // Formül: Deneme sayısı ve süre ağırlıklı hesaplama
    let efficiencyScore = 0;
    if (winningResults.length > 0) {
      const totalEff = winningResults.reduce((acc, r) => {
        const attemptScore = Math.max(0, (7 - (r.attempts || 6)) * 15); // 1 deneme = 90pt, 6 deneme = 15pt
        const timeScore = Math.max(0, (120 - (r.duration_seconds || 120)) / 2); // 0s = 60pt, 120s = 0pt
        return acc + (attemptScore + timeScore);
      }, 0);
      efficiencyScore = Math.min(
        100,
        Math.round(totalEff / winningResults.length),
      );
    }

    // 4. Trend Analizi (Son 10 vs Genel)
    let trend: { direction: "up" | "down" | "stable"; percentage: number } = {
      direction: "stable",
      percentage: 0,
    };
    if (results.length >= 10 && winningResults.length > 0) {
      const recentWins = results.slice(0, 10).filter((r) => r.is_winner);

      if (recentWins.length >= 3) {
        const recentAvgTime =
          recentWins.reduce((acc, r) => acc + (r.duration_seconds || 0), 0) /
          recentWins.length;

        const overallAvgTime =
          winningResults.reduce(
            (acc, r) => acc + (r.duration_seconds || 0),
            0,
          ) / winningResults.length;

        if (recentAvgTime < overallAvgTime * 0.95) {
          trend = {
            direction: "up",
            percentage: Math.round(
              ((overallAvgTime - recentAvgTime) / overallAvgTime) * 100,
            ),
          };
        } else if (recentAvgTime > overallAvgTime * 1.05) {
          trend = {
            direction: "down",
            percentage: Math.round(
              ((recentAvgTime - overallAvgTime) / overallAvgTime) * 100,
            ),
          };
        }
      }
    }

    // 5. Zaman Analizi (Created At bazlı)
    // Şema SQL'de created_at olduğu için bunu parse edebiliriz
    const timeBlocks: Record<string, { total: number; wins: number }> = {
      "Gece (00-06)": { total: 0, wins: 0 },
      "Sabah (06-12)": { total: 0, wins: 0 },
      "Öğle (12-18)": { total: 0, wins: 0 },
      "Akşam (18-00)": { total: 0, wins: 0 },
    };

    results.forEach((r) => {
      // created_at string veya Date olabilir. SQL'den string gelir genelde.
      const date = r.created_at ? new Date(r.created_at) : new Date();
      const hour = date.getHours();
      let block = "";
      if (hour < 6) block = "Gece (00-06)";
      else if (hour < 12) block = "Sabah (06-12)";
      else if (hour < 18) block = "Öğle (12-18)";
      else block = "Akşam (18-00)";

      timeBlocks[block].total++;
      if (r.is_winner) timeBlocks[block].wins++;
    });

    const timeAnalysis = Object.entries(timeBlocks).map(([label, stats]) => ({
      label,
      winRate:
        stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0,
      gameCount: stats.total,
    }));

    return {
      wordLengthPerformance,
      categoryPerformance,
      efficiencyScore,
      trend,
      timeAnalysis,
    };
  },

  /**
   * Blitz Modu için gelişmiş performans analizi
   */
  getBlitzPerformanceAnalysis(results: any[]) {
    if (!results || results.length === 0) return undefined;

    // 1. En İyi Seans Hızı (Best Word-Per-Second in a single session)
    let bestSessionSpeed = 0;
    const sessionSpeeds: number[] = [];

    results.forEach((r) => {
      const solved = r.solved_count || 0;
      const duration = r.duration_seconds || 0;
      if (solved > 0 && duration > 0) {
        const speed = Number((duration / solved).toFixed(2));
        sessionSpeeds.push(speed);
        if (bestSessionSpeed === 0 || speed < bestSessionSpeed) {
          bestSessionSpeed = speed;
        }
      }
    });

    // 2. Tempo Skoru (0-100)
    // 2 saniye/kelime = 100 puan, 10 saniye/kelime = 20 puan gibi bir normalize
    let tempoScore = 0;
    if (sessionSpeeds.length > 0) {
      const avgSpeed =
        sessionSpeeds.reduce((a, b) => a + b, 0) / sessionSpeeds.length;
      tempoScore = Math.min(
        100,
        Math.max(0, Math.round((12 - avgSpeed) * 10)), // 2s -> 100, 12s -> 0
      );
    }

    // 3. Hız Katmanları Dağılımı (Seans bazlı)
    const tiers = [
      { label: "Elite (<3s)", count: 0 },
      { label: "Hızlı (3-6s)", count: 0 },
      { label: "Normal (6-10s)", count: 0 },
      { label: "Yavaş (>10s)", count: 0 },
    ];

    sessionSpeeds.forEach((s) => {
      if (s < 3) tiers[0].count++;
      else if (s < 6) tiers[1].count++;
      else if (s < 10) tiers[2].count++;
      else tiers[3].count++;
    });

    // 4. Stabilite Skoru (Hız değişkenliği üzerinden)
    let stabilityScore = 0;
    if (sessionSpeeds.length > 1) {
      const avg =
        sessionSpeeds.reduce((a, b) => a + b, 0) / sessionSpeeds.length;
      const variance =
        sessionSpeeds.reduce((a, b) => a + Math.pow(b - avg, 2), 0) /
        sessionSpeeds.length;
      const stdDev = Math.sqrt(variance);
      stabilityScore = Math.max(
        0,
        Math.min(100, Math.round(100 - stdDev * 20)),
      ); // Sapma arttıkça stabilite düşer
    } else if (sessionSpeeds.length === 1) {
      stabilityScore = 100;
    }

    return {
      bestSessionSpeed,
      tempoScore,
      solveTierDist: tiers,
      stabilityScore,
    };
  },

  /**
   * Körleme (Blind) Modu Analizi
   */
  getBlindPerformanceAnalysis(results: any[]) {
    if (!results || results.length === 0) return undefined;
    const wins = results.filter((r) => r.is_winner);

    let intelScore = 0;
    if (wins.length > 0) {
      const avgAttempts =
        wins.reduce((acc, r) => acc + (r.attempts || 6), 0) / wins.length;
      intelScore = Math.min(
        100,
        Math.max(0, Math.round((7 - avgAttempts) * 15 + 10)),
      );
    }

    const perfectSaves = wins.filter((r) => r.attempts === 1).length;
    const totalLettersFound = results.reduce(
      (acc, r) => acc + (r.solved_count || 0) * 5,
      0,
    );

    const totalDuration = results.reduce(
      (acc, r) => acc + (r.duration_seconds || 0),
      0,
    );
    const avgGuessTime =
      results.length > 0
        ? Number((totalDuration / results.length).toFixed(1))
        : 0;

    const guessDist = [0, 0, 0, 0, 0, 0];
    wins.forEach((r) => {
      if (r.attempts >= 1 && r.attempts <= 6) guessDist[r.attempts - 1]++;
    });

    return {
      intelScore,
      perfectSaves,
      totalLettersFound,
      avgGuessTime,
      guessDist,
    };
  },

  /**
   * Tırmanış (Climb) Modu Analizi
   */
  getClimbPerformanceAnalysis(results: any[]) {
    if (!results || results.length === 0) return undefined;

    const levels = results.map((r) => r.solved_count || 0);
    const highestLevel = Math.max(0, ...levels);
    const avgLevel = Math.round(
      levels.reduce((a, b) => a + b, 0) / levels.length,
    );
    const totalLevelsClimbed = levels.reduce((a, b) => a + b, 0);

    const totalTimeMin =
      results.reduce((acc, r) => acc + (r.duration_seconds || 0), 0) / 60;
    const efficiency =
      totalTimeMin > 0
        ? Number((totalLevelsClimbed / totalTimeMin).toFixed(1))
        : 0;

    const levelWinRate =
      results.length > 0
        ? Math.round(
            (results.filter((r) => r.solved_count > 0).length /
              results.length) *
              100,
          )
        : 0;

    return {
      highestLevel,
      avgLevel,
      efficiency,
      totalLevelsClimbed,
      levelWinRate,
    };
  },

  /**
   * Hayatta Kalma (Survival) Modu Analizi
   */
  getSurvivalPerformanceAnalysis(results: any[]) {
    if (!results || results.length === 0) return undefined;

    const solvedCounts = results.map((r) => r.solved_count || 0);
    const totalSolved = solvedCounts.reduce((a, b) => a + b, 0);
    const milestoneReaches = solvedCounts.filter((c) => c >= 10).length;
    const survivalRate = Math.round((milestoneReaches / results.length) * 100);

    const totalTime = results.reduce(
      (acc, r) => acc + (r.duration_seconds || 0),
      0,
    );
    const avgSurvivalTime = Math.round(totalTime / results.length);

    const avgSolved = totalSolved / results.length;
    const enduranceScore = Math.min(100, Math.round(avgSolved * 8));

    return {
      totalSolved,
      enduranceScore,
      survivalRate,
      avgSurvivalTime,
      milestoneReaches,
    };
  },

  /**
   * Çoklu (Multi) Modu Analizi
   */
  getMultiPerformanceAnalysis(results: any[]) {
    if (!results || results.length === 0) return undefined;

    const wins = results.filter((r) => r.is_winner);
    const multiTaskScore = Math.min(
      100,
      Math.round((wins.length / results.length) * 100),
    );

    const totalSetsCompleted = results.filter((r) => r.is_winner).length;
    const totalDuration = results.reduce(
      (acc, r) => acc + (r.duration_seconds || 0),
      0,
    );
    const avgSetTime =
      totalSetsCompleted > 0
        ? Math.round(totalDuration / totalSetsCompleted)
        : 0;

    const totalWords = results.reduce((acc, r) => acc + (r.word_count || 4), 0);
    const parallelEfficiency =
      totalWords > 0 ? Number((totalDuration / totalWords).toFixed(1)) : 0;

    // Senkronizasyon puanı: süre standart sapması benzeri bir mantık (basitleştirilmiş)
    const syncScore = Math.min(100, Math.max(0, 100 - avgSetTime / 10));

    return {
      multiTaskScore,
      parallelEfficiency,
      totalSetsCompleted,
      avgSetTime,
      syncScore,
    };
  },

  /**
   * Kullanıcı profilini günceller (Hem Auth metadata hem de profiles tablosu)
   */
  async updateProfile(
    userId: string,
    data: { username?: string; avatar_url?: string },
  ) {
    try {
      // 2. Profiles Tablosu Güncelle (Upsert)
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId,
        username: data.username,
        avatar_url: data.avatar_url,
      });

      if (profileError) throw profileError;

      return { success: true };
    } catch (error) {
      console.error("Profile update error:", error);
      return { success: false, error };
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
