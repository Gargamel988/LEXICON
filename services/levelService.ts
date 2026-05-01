import { supabase } from "../lib/supabase";
import Toast from "react-native-toast-message";
import { PowerUpKey } from "../constants/powerUps";
import { TITLE_REWARDS, getLevelInfo } from "../constants/levels";

export interface LevelUpResult {
  leveledUp: boolean;
  oldLevel: number;
  newLevel: number;
  rewards: {
    coins: number;
    powerups?: { type: PowerUpKey; quantity: number }[];
    titleId?: string;
  };
}

export const levelService = {
  /**
   * Kullanıcıya XP ekler ve seviye atlayıp atlamadığını kontrol eder
   */
  async addExperience(userId: string, xpAmount: number): Promise<LevelUpResult | null> {
    try {
      // 1. Mevcut profil verilerini getir
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('xp, level, coins')
        .eq('id', userId)
        .single();

      if (profileError || !profile) throw profileError;

      const oldXp = profile.xp || 0;
      const newTotalXp = oldXp + xpAmount;

      // 2. Yeni seviyeyi hesapla
      const oldLevelInfo = getLevelInfo(oldXp);
      const oldLevel = oldLevelInfo.level;
      
      const newLevelInfo = getLevelInfo(newTotalXp);
      const currentLevel = newLevelInfo.level;
      const leveledUp = currentLevel > oldLevel;
      const result: LevelUpResult = {
        leveledUp,
        oldLevel,
        newLevel: currentLevel,
        rewards: {
          coins: 0
        }
      };

      // 3. Veritabanını güncelle
      const updates: any = {
        xp: newTotalXp,
        level: currentLevel
      };

      if (leveledUp) {
        // Seviye atlama ödüllerini hesapla - Elmas azaltıldı (level * 10)
        const coinsReward = currentLevel * 10;
        result.rewards.coins = coinsReward;
        updates.coins = (profile.coins || 0) + coinsReward;

        // Her 5 seviyede bir Power-up paketi
        if (currentLevel % 5 === 0) {
          result.rewards.powerups = [
            { type: 'hint', quantity: 2 },
            { type: 'veto', quantity: 2 },
            { type: 'bomb', quantity: 2 }
          ];
          
          // Power-up'ları envantere ekle
          for (const pu of result.rewards.powerups) {
            const { data: inv } = await supabase
              .from('inventory')
              .select('quantity')
              .eq('user_id', userId)
              .eq('powerup_type', pu.type)
              .maybeSingle();

            await supabase
              .from('inventory')
              .upsert({
                user_id: userId,
                powerup_type: pu.type,
                quantity: (inv?.quantity || 0) + pu.quantity
              }, { onConflict: 'user_id,powerup_type' });
          }
        }

        // Unvan ödülü kontrolü
        if (TITLE_REWARDS[currentLevel]) {
          const titleId = TITLE_REWARDS[currentLevel];
          result.rewards.titleId = titleId;
          
          // Unvanı kullanıcıya ekle
          await supabase
            .from('user_titles')
            .upsert({
              user_id: userId,
              title_id: titleId
            }, { onConflict: 'user_id,title_id' });
        }

        // Seviye atlama bildirimi
        let toastText2 = `${coinsReward} Elmas kazandın!`;
        if (result.rewards.titleId) toastText2 += ` 🎖️ Yeni unvan açıldı!`;

        Toast.show({
          type: 'success',
          text1: `🎉 SEVİYE ATLADIN! (LVL ${currentLevel})`,
          text2: toastText2,
          position: 'bottom',
          visibilityTime: 5000,
        });
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (updateError) throw updateError;

      return result;
    } catch (error) {
      console.error('Error adding experience:', error);
      return null;
    }
  },

  /**
   * Bir sonraki seviye için gereken toplam XP'yi hesaplar
   */
  getXpForLevel(level: number): number {
    let total = 0;
    let threshold = 3000;
    for (let i = 1; i < level; i++) {
      total += threshold;
      threshold += 1000;
    }
    return total;
  }
};
