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
        .from("user_assets")
        .select("asset_id, unlocked_at")
        .eq("user_id", userId)
        .eq("asset_type", "achievement");

      if (error) {
        console.error("Error fetching achievements:", error);
        return [];
      }

      return (data || []).map(d => ({
        achievement_id: d.asset_id,
        unlocked_at: d.unlocked_at
      }));
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
        const achievementsToProcess = newUnlocks.map(id => ACHIEVEMENTS.find(a => a.id === id)).filter(Boolean) as Achievement[];
        
        // Tüm varlıkları (başarım, unvan, kozmetik) tek bir array'de topla
        const assetInserts: any[] = [];

        achievementsToProcess.forEach(a => {
          // Başarımın kendisi
          assetInserts.push({ user_id: userId, asset_type: 'achievement', asset_id: a.id });
          
          // Unvan ödülü
          if (a.rewardTitleId) {
            assetInserts.push({ user_id: userId, asset_type: 'title', asset_id: a.rewardTitleId });
          }
          
          // Kozmetik ödülleri
          if (a.rewardFrameId) {
            assetInserts.push({ user_id: userId, asset_type: 'frame', asset_id: a.rewardFrameId });
          }
          if (a.rewardNameTagId) {
            assetInserts.push({ user_id: userId, asset_type: 'nametag', asset_id: a.rewardNameTagId });
          }
        });

        // ─── Toplu Varlık Kaydı ───
        if (assetInserts.length > 0) {
          const { data: session } = await supabase.auth.getSession();
          if (!session?.session?.user) {
             console.warn("Achievement save aborted: No active session");
             return [];
          }

          const { error } = await supabase.from("user_assets").upsert(assetInserts, { onConflict: 'user_id,asset_type,asset_id' });
          if (error) {
            if (error.code === '42501') {
              console.warn("RLS Policy Error: Please ensure 'user_assets' table has INSERT/UPDATE policies for authenticated users.");
            } else {
              console.error("Error saving user assets:", error);
            }
          }
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

        // ─── Bildirim göster ───
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
        
        return newUnlocks;
      }

      return [];
    } catch (error) {
      console.error("Check achievements error:", error);
      return [];
    }
  }
};
