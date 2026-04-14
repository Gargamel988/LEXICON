import { supabase } from "../lib/supabase";

export interface DailyPlayRecord {
  rank: number;
  streak: number;
}

export interface DailyWord {
  word: string;
  date: string;
}

export const dailyGameService = {
  /**
   * Bugünün kelimesini çeker
   */
  async getDailyWord(): Promise<DailyWord | null> {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const { data, error } = await supabase
      .from("daily_words")
      .select("word, date")
      .eq("date", today)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Lexicon: Error fetching daily word:", error.message);
      return null;
    }
    return data;
  },

  /**
   * Kullanıcının bugün oynayıp oynamadığını kontrol eder
   */
  async checkHasPlayedToday(userId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from("game_results")
      .select("*")
      .eq("user_id", userId)
      .eq("mode", "daily")
      .gte("created_at", startOfDay.toISOString())
      .lte("created_at", endOfDay.toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Lexicon: Error checking play status:", error.message);
      return null;
    }
    return data;
  },

  // submitDailyGame artık statsService.saveGameResult ile yapılıyor.

  /**
   * Bugünün genel istatistiklerini getirir (Örn: Kaç kişi kazandı?)
   */
  async getDailyStats() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const { count, error } = await supabase
      .from("game_results")
      .select("*", { count: "exact", head: true })
      .eq("mode", "daily")
      .gte("created_at", startOfDay.toISOString())
      .lte("created_at", endOfDay.toISOString())
      .eq("is_winner", true);

    if (error) {
      console.error("Lexicon: Error fetching daily stats:", error.message);
      return { winnerCount: 0 };
    }

    return { winnerCount: count || 0 };
  },

  async getStreak(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from("daily_plays")
      .select("date")
      .eq("user_id", userId)
      .eq("is_winner", true)
      .order("date", { ascending: false });

    if (error || !data?.length) {
      console.error("Streak error:", error?.message);
      return 0;
    }

    let streak = 0;

    for (const play of data) {
      const playDate = play.date;

      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - streak);
      const expectedStr = expectedDate.toISOString().split("T")[0];

      if (playDate === expectedStr) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  },
};
