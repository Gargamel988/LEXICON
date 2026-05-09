import { supabase } from "../lib/supabase";
import { WORD_COLLECTIONS, CollectionCard } from "../constants/collections";
import { inventoryService } from "./inventoryService";

export const collectionService = {
  /**
   * Kullanıcının sahip olduğu kartları getirir
   */
  async getUserCards(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('user_assets')
      .select('asset_id')
      .eq('user_id', userId)
      .eq('asset_type', 'collection');

    if (error) {
      console.error("Error fetching user cards:", error);
      return [];
    }

    return data.map(item => item.asset_id);
  },

  /**
   * Yeni bir kart açar (Oyun sonu ödülü olarak çağrılabilir)
   */
  async unlockCard(userId: string, cardId: string) {
    const { error } = await supabase
      .from('user_assets')
      .insert({ user_id: userId, asset_id: cardId, asset_type: 'collection' });

    if (error) {
      if (error.code === '23505') return { success: true, alreadyOwned: true };
      return { success: false, error };
    }

    return { success: true, alreadyOwned: false };
  },

  /**
   * Rastgele bir kart verir (Kategoriye göre veya tamamen rastgele)
   */
  async dropRandomCard(userId: string, categoryId?: string) {
    let availableCards: CollectionCard[] = [];
    
    if (categoryId) {
      availableCards = WORD_COLLECTIONS.flatMap(c => c.cards).filter(card => card.categoryId === categoryId);
    } else {
      availableCards = WORD_COLLECTIONS.flatMap(c => c.cards);
    }

    if (availableCards.length === 0) return null;

    // Nadirlik bazlı ağırlıklı seçim yapılabilir
    const card = availableCards[Math.floor(Math.random() * availableCards.length)];
    const result = await this.unlockCard(userId, card.id);
    
    return { ...card, ...result };
  }
};
