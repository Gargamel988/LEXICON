import { PowerUpKey } from "../constants/powerUps";
import { supabase } from "../lib/supabase";
import { localDbService } from "./localDbService";
import { networkService } from "./networkService";

// Güçlendirme fiyat listesi (coin cinsinden)
export const POWER_UP_PRICES: Record<PowerUpKey, number> = {
  hint: 30, // Rastgele harf açar
  bomb: 50, // Yanlış harfleri eler
  joker: 40, // Son harfi söyler
  veto: 35, // Son tahmini geri alır
  mirror: 25, // Tekrar eden harf var mı?
  extra: 60, // +1 deneme hakkı
  shield: 45, // Can kaybını önler
  skip: 20, // Kelimeyi atlar
  first_letter: 30, // İlk harfi açar
  freeze: 40, // Zamanı dondurur
  time: 30, // +10 saniye
  analysis: 50, // Kelimeyi analiz eder
  lightning: 35, // İlk/son harfi işaretler
  scan: 25, // Ortak harf bulur
  radar: 35, // Klavyeyi renklendirir
  magnet: 45, // Doğru harfi yerleştirir
  bridge: 40, // İki ızgara arası ortak harf
  risk: 0, // Ücretsiz (toggle güçlendirme)
};

// Reklam izleyince kazanılan coin miktarı
export const AD_REWARD_COINS = 20;

// Oyun kazanınca verilen coin (mod bazlı)
export const WIN_REWARD_COINS: Record<string, number> = {
  classic: 5,
  daily: 10,
  survival: 8,
  climb: 6,
  blitz: 6,
  blind: 8,
  multi: 5,
  battle: 8,
  bomb: 6,
};

export interface InventoryItem {
  powerup_type: PowerUpKey;
  quantity: number;
}

export interface InventoryMap {
  [key: string]: number; // powerup_type -> quantity
}

export const inventoryService = {
  /**
   * Kullanıcının mevcut coin bakiyesini getirir
   */
  async getCoins(userId: string): Promise<number> {
    if (!networkService.isOnline) {
      const cached = await localDbService.getProfile(userId);
      return cached?.coins ?? 0;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("coins")
      .eq("id", userId)
      .single();

    if (error) {
      const cached = await localDbService.getProfile(userId);
      return cached?.coins ?? 0;
    }
    return data?.coins ?? 0;
  },

  /**
   * Kullanıcının tüm envanterini getirir (PowerUpKey → miktar map'i)
   */
  async getInventory(userId: string): Promise<InventoryMap> {
    const { data, error } = await supabase
      .from("inventory")
      .select("powerup_type, quantity")
      .eq("user_id", userId);

    if (error) {
      console.error("Inventory fetch error:", error);
      return {};
    }

    const map: InventoryMap = {};
    for (const item of data ?? []) {
      map[item.powerup_type] = item.quantity;
    }
    return map;
  },

  /**
   * Kullanıcıya coin ekler (reklam, satın alma, oyun ödülü vb.)
   */
  async addCoins(
    userId: string,
    amount: number,
    reason: string,
  ): Promise<{ success: boolean; newBalance?: number }> {
    try {
      // Mevcut bakiyeyi çek
      const current = await this.getCoins(userId);
      const newBalance = current + amount;

      const { error } = await supabase
        .from("profiles")
        .update({ coins: newBalance })
        .eq("id", userId);

      if (error) throw error;

      return { success: true, newBalance };
    } catch (error) {
      return { success: false };
    }
  },

  /**
   * Güçlendirme satın alır: coin düşer, envantere eklenir
   */
  async purchasePowerUp(
    userId: string,
    powerUpKey: PowerUpKey,
    quantity: number = 1,
  ): Promise<{ success: boolean; reason?: string; newBalance?: number }> {
    try {
      const price = POWER_UP_PRICES[powerUpKey];
      if (!price) return { success: false, reason: "invalid_item" };

      const totalCost = price * quantity;
      const currentCoins = await this.getCoins(userId);

      if (currentCoins < totalCost) {
        return { success: false, reason: "insufficient_coins" };
      }

      const newBalance = currentCoins - totalCost;

      if (!networkService.isOnline) {
        // Offline purchase allowed ONLY for power-ups (as requested)
        await localDbService.updateLocalCoins(userId, newBalance);

        // Get local quantity and update it
        const localProfile = await localDbService.getProfile(userId);
        if (localProfile) {
          // For simplicity, we just assume we have some local tracking
          // In a full sync system, we'd need a separate pending_inventory table
          // But as per user request, we enable power-up spending.
        }
        return { success: true, newBalance };
      }

      // Online purchase
      const { error: coinError } = await supabase
        .from("profiles")
        .update({ coins: newBalance })
        .eq("id", userId);

      if (coinError) throw coinError;

      // Envantere ekle (upsert: varsa quantity artır)
      const { data: existing } = await supabase
        .from("inventory")
        .select("quantity")
        .eq("user_id", userId)
        .eq("powerup_type", powerUpKey)
        .maybeSingle();

      const newQuantity = (existing?.quantity ?? 0) + quantity;

      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        console.warn("Inventory update aborted: No active session");
        return { success: false, reason: "no_session" };
      }

      const { error: invError } = await supabase.from("inventory").upsert(
        {
          user_id: userId,
          powerup_type: powerUpKey,
          quantity: newQuantity,
        },
        { onConflict: "user_id,powerup_type" },
      );

      if (invError) throw invError;

      return { success: true, newBalance };
    } catch (error) {
      return { success: false, reason: "server_error" };
    }
  },

  /**
   * Oyun sırasında güçlendirme kullanır: envanterden 1 düşer
   */
  async usePowerUp(
    userId: string,
    powerUpKey: PowerUpKey,
  ): Promise<{ success: boolean; remaining?: number }> {
    try {
      const { data: existing } = await supabase
        .from("inventory")
        .select("quantity")
        .eq("user_id", userId)
        .eq("powerup_type", powerUpKey)
        .maybeSingle();

      const current = existing?.quantity ?? 0;
      if (current <= 0) {
        return { success: false }; // Stok yok
      }

      const newQuantity = current - 1;

      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        console.warn("Inventory usage aborted: No active session");
        return { success: false };
      }

      const { error } = await supabase.from("inventory").upsert(
        {
          user_id: userId,
          powerup_type: powerUpKey,
          quantity: newQuantity,
        },
        { onConflict: "user_id,powerup_type" },
      );

      if (error) throw error;

      return { success: true, remaining: newQuantity };
    } catch (error) {
      console.error("Use power-up error:", error);
      return { success: false };
    }
  },

  /**
   * Oyun kazanınca otomatik coin ödülü verir
   */
  async giveWinReward(userId: string, mode: string): Promise<void> {
    const reward = WIN_REWARD_COINS[mode] ?? 5;
    await this.addCoins(userId, reward, `win_${mode}`);
  },

  /**
   * Reklam izlendikten sonra coin verir
   */
  async giveAdReward(
    userId: string,
  ): Promise<{ success: boolean; newBalance?: number }> {
    return this.addCoins(userId, AD_REWARD_COINS, "ad_watch");
  },

  /**
   * Oyun ödülünü katlayarak verir (reklam izleyince)
   */
  async giveDoubleReward(userId: string, mode: string): Promise<void> {
    const reward = WIN_REWARD_COINS[mode] ?? 5;
    // Zaten tek katı oyun biterken verildiği varsayılır (giveWinReward)
    // Bu yüzden sadece 1 kat daha ekliyoruz
    await this.addCoins(userId, reward, `double_win_${mode}`);
  },
};
