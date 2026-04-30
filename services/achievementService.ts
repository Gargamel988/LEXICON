import { supabase } from "../lib/supabase";
import { ACHIEVEMENTS, Achievement } from "../constants/achievements";
import { statsService } from "./statsService";
import { levelService } from "./levelService";
import Toast from "react-native-toast-message";

export interface UserAchievement {
  achievement_id: string;
  unlocked_at: string;
}

export const achievementService = {
  /**
   * Kullanıcının kilitli olmayan başarımlarını getirir
   */
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      const { data, error } = await supabase
        .from("user_achievements")
        .select("achievement_id, unlocked_at")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching achievements:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Achievement fetch error:", error);
      return [];
    }
  },

  /**
   * Yeni başarımları kontrol eder ve açılanları kaydeder
   */
  async checkAndUnlockAchievements(userId: string, lastGameResult?: any) {
    try {
      // 1. Mevcut başarımları çek
      const unlocked = await this.getUserAchievements(userId);
      const unlockedIds = new Set(unlocked.map(a => a.achievement_id));

      const newUnlocks: string[] = [];
      const stats = await statsService.getAchievementStats(userId);

      for (const achievement of ACHIEVEMENTS) {
        if (unlockedIds.has(achievement.id)) continue;

        if (achievement.check(stats, lastGameResult)) {
          newUnlocks.push(achievement.id);
        }
      }

      // 3. Yeni açılanları kaydeder
      if (newUnlocks.length > 0) {
        const inserts = newUnlocks.map(id => ({
          user_id: userId,
          achievement_id: id,
        }));

        const achievementsToProcess = newUnlocks.map(id => ACHIEVEMENTS.find(a => a.id === id)).filter(Boolean) as Achievement[];

        // ─── Unvan ödüllerini kaydet ───
        const titleInserts = achievementsToProcess
          .filter(a => a.rewardTitleId)
          .map(a => ({
            user_id: userId,
            title_id: a.rewardTitleId!
          }));

        if (titleInserts.length > 0) {
          await supabase.from("user_titles").insert(titleInserts);
        }

        // ─── Kozmetik ödüllerini (Çerçeve & İsimlik) kaydet ───
        const cosmeticInserts = achievementsToProcess
          .filter(a => a.rewardFrameId || a.rewardNameTagId)
          .flatMap(a => {
            const items = [];
            if (a.rewardFrameId) items.push({ user_id: userId, product_id: a.rewardFrameId });
            if (a.rewardNameTagId) items.push({ user_id: userId, product_id: a.rewardNameTagId });
            return items;
          });

        if (cosmeticInserts.length > 0) {
          await supabase.from("user_cosmetics").insert(cosmeticInserts);
        }

        // ─── Power-up ödüllerini kaydet ───
        for (const achievement of achievementsToProcess) {
          if (achievement.rewardPowerUp) {
            const { id: pType, quantity: pQty } = achievement.rewardPowerUp;
            
            // Mevcut miktarı al
            const { data: existing } = await supabase
              .from('inventory')
              .select('quantity')
              .eq('user_id', userId)
              .eq('powerup_type', pType)
              .maybeSingle();

            const newQty = (existing?.quantity || 0) + pQty;

            await supabase
              .from('inventory')
              .upsert({
                user_id: userId,
                powerup_type: pType,
                quantity: newQty,
              }, { onConflict: 'user_id,powerup_type' });
          }
        }

        // ─── XP Ödüllerini Kaydet ───
        const totalXpReward = achievementsToProcess.reduce((sum, a) => sum + (a.rewardPoints || 0), 0);
        if (totalXpReward > 0) {
          await levelService.addExperience(userId, totalXpReward);
        }

        // ─── Başarım kaydı ───
        const { error } = await supabase.from("user_achievements").insert(inserts);
        if (error) {
          console.error("Error saving new achievements:", error);
        } else {
          // Başarılı kayıttan sonra bildirim göster
          achievementsToProcess.forEach(achievement => {
            let rewardMsg = "";
            if (achievement.rewardTitleId) rewardMsg = "🎖️ Yeni Unvan!";
            else if (achievement.rewardFrameId || achievement.rewardNameTagId) rewardMsg = "✨ Yeni Kozmetik!";
            else if (achievement.rewardPowerUp) rewardMsg = "⚡ Güçlendirme!";
            else rewardMsg = "🏆 Başarım Kazanıldı!";

            Toast.show({
              type: 'success',
              text1: rewardMsg,
              text2: `${achievement.title} açıldı!`,
              position: 'top',
              visibilityTime: 4000,
            });
          });
        }
        
        return newUnlocks;
      }

      return [];
    } catch (error) {
      console.error("Check achievements error:", error);
      return [];
    }
  }
};
