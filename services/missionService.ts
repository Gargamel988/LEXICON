import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";
import {
  MissionTemplate,
  MISSION_TEMPLATES,
  WEEKLY_MISSION_TEMPLATES,
} from "../constants/missions";
import Toast from "react-native-toast-message";
import { inventoryService } from "./inventoryService";
import { levelService } from "./levelService";

export interface UserMission extends MissionTemplate {
  mission_id: string;
  current_value: number;
  is_completed: boolean;
  is_claimed: boolean;
  period_type: "daily" | "weekly";
  user_id: string;
  period_id: string;
}

export const missionService = {
  /**
   * Günlük giriş ödülünü kontrol eder ve verir (10 Elmas)
   */
  async checkDailyLogin(userId: string) {
    const today = new Date().toISOString().split("T")[0];
    const loginKey = `last_login_date_${userId}`;

    try {
      const lastLogin = await AsyncStorage.getItem(loginKey);

      if (lastLogin !== today) {
        // Kullanıcının premium olup olmadığını ve süresini kontrol et
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_premium, premium_until")
          .eq("id", userId)
          .single();

        const isPremiumActive = profile?.is_premium && 
          (!profile.premium_until || new Date(profile.premium_until) > new Date());

        const rewardAmount = isPremiumActive ? 20 : 10;
        
        // ─── SERİ GÜNCELLEME (Buraya taşındı) ───
        const { statsService } = require("./statsService");
        await statsService.updateStreak(userId);

        // Yeni bir gün, ödülü ver
        await inventoryService.addCoins(userId, rewardAmount, "daily_login");
        await AsyncStorage.setItem(loginKey, today);

        Toast.show({
          type: "success",
          text1: isPremiumActive ? "Premium Günlük Ödül! 💎" : "Günlük Giriş Ödülü! 🎁",
          text2: `+${rewardAmount} Elmas kazandın.${isPremiumActive ? " (Bonus dahil)" : ""}`,
          position: "bottom",
        });
      }
    } catch (e) {
      console.error("Daily login check error:", e);
    }
  },

  /**
   * Görevleri getirir (günlük veya haftalık) - TAMAMEN LOCAL (AsyncStorage)
   */
  async getMissions(
    userId: string,
    type: "daily" | "weekly",
  ): Promise<UserMission[]> {
    // Giriş ödülünü de burada kontrol edelim (uygulama açıldığında veya görevlere bakıldığında)
    if (type === "daily") {
      this.checkDailyLogin(userId);
    }

    const periodId =
      type === "daily"
        ? new Date().toISOString().split("T")[0]
        : this.getWeekId();

    const storageKey = `missions_${userId}_${type}_${periodId}`;

    try {
      const cached = await AsyncStorage.getItem(storageKey);
      let rawData: any[] = [];
      try {
        if (cached) rawData = JSON.parse(cached);
        if (!Array.isArray(rawData)) rawData = [];
      } catch {
        rawData = [];
      }
      
      // Şablonlarla birleştirerek title/desc gibi eksik alanları doldur
      let data = this.mergeWithTemplates(rawData, type);

      const targetCount = 5;

      // Görev yoksa veya eksikse (veya hatalı veriler filtrelendiyse) oluştur/tamamla
      if (data.length < targetCount) {
        data = await this.generateMissions(userId, type, periodId, data);
      }

      return data;
    } catch (error) {
      console.error(`${type} mission fetch error:`, error);
      return [];
    }
  },

  getWeekId() {
    const now = new Date();
    const oneJan = new Date(now.getFullYear(), 0, 1);
    const numberOfDays = Math.floor(
      (now.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000),
    );
    const weekNumber = Math.ceil((now.getDay() + 1 + numberOfDays) / 7);
    return `${now.getFullYear()}-W${weekNumber}`;
  },

  /**
   * Görevleri yerel olarak üretir ve kaydeder
   */
  async generateMissions(
    userId: string,
    type: "daily" | "weekly",
    periodId: string,
    existingMissions: UserMission[] = [],
  ): Promise<UserMission[]> {
    const templates =
      type === "daily" ? MISSION_TEMPLATES : WEEKLY_MISSION_TEMPLATES;
    
    const currentIds = existingMissions.map(m => m.mission_id);
    
    // Geçen dönemden (dün/geçen hafta) kalan görevleri de hariç tutmak için
    const lastMissionsKey = `last_ids_${userId}_${type}`;
    const lastIdsStr = await AsyncStorage.getItem(lastMissionsKey);
    const lastIds: string[] = lastIdsStr ? JSON.parse(lastIdsStr) : [];

    // Hem şu anki listede olanları hem de geçen dönemdekileri filtrele
    let availableTemplates = templates.filter(
      (t) => !currentIds.includes(t.id) && !lastIds.includes(t.id),
    );

    // Eğer yeterli farklı görev kalmadıysa, sadece şu anki listede olmayanları kullan
    if (availableTemplates.length < (5 - existingMissions.length)) {
      availableTemplates = templates.filter(t => !currentIds.includes(t.id));
    }
    
    const shuffled = [...availableTemplates].sort(() => 0.5 - Math.random());
    const targetCount = 5;
    const neededCount = Math.max(0, targetCount - existingMissions.length);

    const newMissions: UserMission[] = shuffled.slice(0, neededCount).map((m) => ({
      ...m,
      mission_id: m.id,
      user_id: userId,
      period_type: type,
      period_id: periodId,
      current_value: 0,
      is_completed: false,
      is_claimed: false,
    }));

    const allMissions = [...existingMissions, ...newMissions];
    
    // Yeni görev listesini ve "son görevler" listesini kaydet
    const storageKey = `missions_${userId}_${type}_${periodId}`;
    await AsyncStorage.setItem(storageKey, JSON.stringify(allMissions));
    
    // Bir sonraki üretimde bu görevleri tekrar çıkarmamak için ID'lerini sakla
    const allIds = allMissions.map(m => m.mission_id);
    await AsyncStorage.setItem(lastMissionsKey, JSON.stringify(allIds));
    
    return allMissions;
  },

  mergeWithTemplates(data: any[], type: "daily" | "weekly"): UserMission[] {
    const templates =
      type === "daily" ? MISSION_TEMPLATES : WEEKLY_MISSION_TEMPLATES;
    
    return data.map((item) => {
      const template = templates.find((t) => t.id === item.mission_id);
      
      return {
        ...template,
        ...item,
        goal: template?.goal || item.goal || 1,
        current_value: item.current_value || 0,
        rewardCoins: template?.rewardCoins || item.rewardCoins || 0,
        rewardXp: template?.rewardXp || item.rewardXp || 0,
        title: template?.title || "Bilinmeyen Görev",
        description: template?.description || "Bu görev artık mevcut değil.",
      } as UserMission;
    }).filter(item => item.mission_id && templates.some(t => t.id === item.mission_id));
  },

  /**
   * İlerlemeyi günceller (Sadece AsyncStorage)
   */
  async updateProgress(
    userId: string,
    type: string,
    value: number = 1,
    metadata?: any,
  ) {
    if (isNaN(value)) value = 1;
    await Promise.all([
      this._updateTypeProgress(userId, "daily", type, value, metadata),
      this._updateTypeProgress(userId, "weekly", type, value, metadata),
    ]);
  },

  async _updateTypeProgress(
    userId: string,
    periodType: "daily" | "weekly",
    type: string,
    value: number,
    metadata?: any,
  ) {
    const missions = await this.getMissions(userId, periodType);
    const periodId =
      periodType === "daily"
        ? new Date().toISOString().split("T")[0]
        : this.getWeekId();

    let updated = false;
    const newMissions = missions.map((mission) => {
      if (mission.is_completed) return mission;

      let match = false;
      if (mission.type === type) {
        if (type === "mode_specific" && mission.mode === metadata?.mode)
          match = true;
        else if (
          type === "use_powerups" &&
          mission.powerup === metadata?.powerup
        )
          match = true;
        else if (["play_games", "win_games", "solve_words"].includes(type))
          match = true;
      }

      if (match) {
        updated = true;
        const safeCurrent = mission.current_value || 0;
        const newValue = safeCurrent + value;
        const isCompleted = newValue >= (mission.goal || 1);

        if (isCompleted) {
          Toast.show({
            type: "info",
            text1: `${periodType === "daily" ? "Günlük" : "Haftalık"} Görev Tamamlandı! 🎉`,
            text2: mission.title,
          });
        }

        return {
          ...mission,
          current_value: newValue,
          is_completed: isCompleted,
        };
      }
      return mission;
    });

    if (updated) {
      const storageKey = `missions_${userId}_${periodType}_${periodId}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify(newMissions));
    }
  },

  /**
   * Ödülü alır - Profil verisini Supabase'de günceller, görev durumunu LOCAL'de günceller
   */
  async claimReward(
    userId: string,
    missionId: string,
    periodType: "daily" | "weekly",
  ) {
    const periodId =
      periodType === "daily"
        ? new Date().toISOString().split("T")[0]
        : this.getWeekId();
    
    const storageKey = `missions_${userId}_${periodType}_${periodId}`;

    try {
      const cached = await AsyncStorage.getItem(storageKey);
      if (!cached) return { success: false, error: "Görev verisi bulunamadı." };

      let missions: UserMission[] = JSON.parse(cached);
      const missionIndex = missions.findIndex(m => m.mission_id === missionId);
      
      if (missionIndex === -1) return { success: false, error: "Görev bulunamadı." };
      
      const mission = missions[missionIndex];
      if (!mission.is_completed || mission.is_claimed) {
        return { success: false, error: "Ödül zaten alınmış veya görev tamamlanmamış." };
      }

      // Ödülleri ver (Supabase - Profile Update)
      await Promise.all([
        inventoryService.addCoins(userId, mission.rewardCoins, `mission_${missionId}`),
        levelService.addExperience(userId, mission.rewardXp),
      ]);

      // Görev durumunu güncelle (Local)
      missions[missionIndex].is_claimed = true;
      await AsyncStorage.setItem(storageKey, JSON.stringify(missions));

      return { success: true, coins: mission.rewardCoins, xp: mission.rewardXp };
    } catch (e) {
      console.error("Claim reward error:", e);
      return { success: false, error: "Bir hata oluştu." };
    }
  },
};
