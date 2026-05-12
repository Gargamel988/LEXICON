import { localDbService } from './localDbService';
import { statsService } from './statsService';
import { networkService } from './networkService';
import { supabase } from '../lib/supabase';

export const syncService = {
  isSyncing: false,

  async syncPendingResults() {
    if (this.isSyncing || !networkService.isOnline) return;

    try {
      this.isSyncing = true;
      const pending = await localDbService.getPendingResults();
      
      if (pending.length === 0) {
        this.isSyncing = false;
        return;
      }

      console.log(`Syncing ${pending.length} pending results...`);

      for (const item of pending) {
        // Try to save to Supabase
        const { error } = await supabase.from('game_results').insert({
          user_id: item.user_id,
          mode: item.mode,
          is_winner: item.is_winner === 1,
          attempts: item.attempts,
          duration_seconds: item.duration_seconds,
          score: item.score,
          solved_count: item.solved_count,
          created_at: item.created_at
        });

        if (!error) {
          await localDbService.clearPendingResult(item.id);
        } else {
          console.error('Sync error:', error);
          // If it's a network error, stop syncing for now
          if (error.message.includes('Fetch')) break;
        }
      }
    } finally {
      this.isSyncing = false;
    }
  },

  async syncProfile(userId: string) {
    if (!networkService.isOnline) return;
    
    // Fetch latest from Supabase and update local cache
    const profile = await statsService.getProfile(userId);
    if (profile) {
      await localDbService.saveProfile({
        id: userId,
        username: profile.username || '',
        avatar_url: profile.avatar_url || '',
        coins: profile.coins || 0,
        xp: profile.xp || 0,
        level: profile.level || 1,
        is_premium: !!profile.is_premium,
        premium_until: profile.premium_until || null,
        is_public: profile.is_public ?? true,
        show_on_leaderboard: profile.show_on_leaderboard ?? true
      });
    }
  }
};

// Initial sync on online
networkService.addListener((online) => {
  if (online) {
    syncService.syncPendingResults();
  }
});
