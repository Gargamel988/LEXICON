import * as IAP from 'expo-iap';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { inventoryService } from './inventoryService';
import { networkService } from './networkService';

// Google Play Console Product IDs
export const IAP_SKUS = [
  // Coins
  'coins_100',
  'coins_500',
  'coins_1000',
  'coins_2000',
  'coins_5000',
  // Bundles
  'bundle_starter',
  'bundle_monthly_adfree',
  'bundle_mega',
  'bundle_ultimate',
  // Premium Frames
  'frame_animated',
  'frame_dragon_gold',
  'frame_purple_phoenix',
  'frame_gold_champion'
];

export interface IAPResult {
  success: boolean;
  error?: string;
  productId?: string;
}

class IAPService {
  private isInitialized = false;

  /**
   * Bağlantıyı başlat ve listener'ları kur
   */
  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await IAP.initConnection();
      this.isInitialized = true;
      console.log('IAP Service: Connection initialized');
    } catch (err) {
      console.error('IAP Service: Init error', err);
    }
  }

  /**
   * Mağazadan ürün bilgilerini çek
   */
  async getProducts() {
    try {
      await this.init();
      return await IAP.fetchProducts({ skus: IAP_SKUS, type: 'all' });
    } catch (err) {
      console.error('IAP Service: Fetch products error', err);
      return [];
    }
  }

  /**
   * Satın alma işlemini başlat
   */
  async purchaseProduct(productId: string, userId: string): Promise<IAPResult> {
    try {
      if (!networkService.isOnline) {
        return { success: false, error: 'İnternet bağlantısı olmadan satın alma yapılamaz.' };
      }
      await this.init();

      const result = await IAP.requestPurchase({
        request: {
          google: { skus: [productId] },
          apple: { sku: productId }
        },
        type: productId.includes('monthly') ? 'subs' : 'in-app'
      });

      const purchase = Array.isArray(result) ? result[0] : result;
      if (!purchase) return { success: false, error: 'Purchase failed' };

      // Satın alma başarılı, şimdi ödülleri verelim
      const fulfillment = await this.fulfillPurchase(productId, userId, purchase);
      
      if (fulfillment.success) {
        // İşlemi bitir (finishTransaction)
        await IAP.finishTransaction({
          purchase,
          isConsumable: !productId.includes('frame') && !productId.includes('monthly')
        });
        return { success: true, productId };
      }

      return { success: false, error: 'Fulfillment failed' };
    } catch (err: any) {
      console.error('IAP Service: Purchase error', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Satın alınan ürünü kullanıcıya teslim et
   */
  private async fulfillPurchase(productId: string, userId: string, purchase: any): Promise<{ success: boolean }> {
    try {
      console.log(`Fulfilling purchase: ${productId} for user: ${userId}`);

      // 1. Coin Paketleri
      if (productId === 'coins_100') await inventoryService.addCoins(userId, 100, 'iap_coins_100');
      else if (productId === 'coins_500') await inventoryService.addCoins(userId, 750, 'iap_coins_500'); // 500+250 bonus (%50)
      else if (productId === 'coins_1000') await inventoryService.addCoins(userId, 1750, 'iap_coins_1000'); // 1000+750 bonus (%75)
      else if (productId === 'coins_2000') await inventoryService.addCoins(userId, 3000, 'iap_coins_2000'); // 2000+1000 bonus (%50)
      else if (productId === 'coins_5000') await inventoryService.addCoins(userId, 8500, 'iap_coins_5000'); // 5000+3500 bonus (%70)

      // 2. Paketler (Bundles)
      else if (productId === 'bundle_starter') {
        await inventoryService.addCoins(userId, 1000, 'bundle_starter_coins');
        // 5 İpucu ekle
        const { data: existing } = await supabase.from('inventory').select('quantity').eq('user_id', userId).eq('powerup_type', 'hint').maybeSingle();
        await supabase.from('inventory').upsert({ user_id: userId, powerup_type: 'hint', quantity: (existing?.quantity ?? 0) + 5 }, { onConflict: 'user_id,powerup_type' });
      }
      else if (productId === 'bundle_mega') {
        await inventoryService.addCoins(userId, 5000, 'bundle_mega_coins');
        // 20 Bomba ekle
        const { data: existing } = await supabase.from('inventory').select('quantity').eq('user_id', userId).eq('powerup_type', 'bomb').maybeSingle();
        await supabase.from('inventory').upsert({ user_id: userId, powerup_type: 'bomb', quantity: (existing?.quantity ?? 0) + 20 }, { onConflict: 'user_id,powerup_type' });
      }
      else if (productId === 'bundle_ultimate') {
        await inventoryService.addCoins(userId, 10000, 'bundle_ultimate_coins');
        const premiumUntil = new Date();
        premiumUntil.setFullYear(premiumUntil.getFullYear() + 100); // Sınırsız gibi (100 yıl)
        
        // Reklamsız yap
        await supabase.from('profiles').update({ 
          is_premium: true, 
          premium_until: premiumUntil.toISOString()
        }).eq('id', userId);
        // Tüm premium çerçeveleri aç
        const premiumFrames = ['frame_animated', 'frame_dragon_gold', 'frame_purple_phoenix', 'frame_gold_champion'];
        for (const fId of premiumFrames) {
          await supabase.from('user_cosmetics').upsert({ user_id: userId, product_id: fId }, { onConflict: 'user_id,product_id' });
        }
      }
      else if (productId === 'bundle_monthly_adfree') {
        await inventoryService.addCoins(userId, 200, 'bundle_monthly_coins');
        const premiumUntil = new Date();
        premiumUntil.setDate(premiumUntil.getDate() + 30); // 30 Günlük
        
        await supabase.from('profiles').update({ 
          is_premium: true, 
          premium_until: premiumUntil.toISOString()
        }).eq('id', userId);
        // Not: Gerçek abonelik kontrolü için backend listener veya getActiveSubscriptions kullanılmalı
      }

      // 3. Çerçeveler (Premium Frames)
      else if (productId.startsWith('frame_')) {
        const { error } = await supabase
          .from('user_cosmetics')
          .upsert({ user_id: userId, product_id: productId }, { onConflict: 'user_id,product_id' });
        if (error) throw error;
      }

      return { success: true };
    } catch (err) {
      console.error('Fulfillment error:', err);
      return { success: false };
    }
  }

  /**
   * Yarım kalan işlemleri temizle (App start'ta çağrılmalı)
   */
  async flushPurchases(userId: string) {
    try {
      await this.init();
      const purchases = await IAP.getAvailablePurchases();
      for (const p of purchases) {
        // Eğer hala teslim edilmemişse fulfill et ve bitir
        // Bu kısım normalde bir backend ile doğrulanmalı
        await IAP.finishTransaction({ purchase: p, isConsumable: !p.productId.includes('frame') });
      }
    } catch (err) {
      console.error('IAP Service: Flush error', err);
    }
  }
}

export const iapService = new IAPService();
