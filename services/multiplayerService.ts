import { supabase } from "../lib/supabase";
import { Room, RoomPlayer } from "../types";
import { getRandomSyllable } from "../utils/wordUtils";


export const multiplayerService = {
  /**
   * Yeni bir oda oluşturur veya aynı rakip için mevcut odayı günceller (Rematch)
   */
  async createRoom(code: string, hostId: string, opponentId?: string, mode: 'battle' | 'bomb' = 'battle'): Promise<Room> {
    const pairKey = opponentId ? [hostId, opponentId].sort().join(':') : null;

    const { data, error } = await supabase
      .from('multiplayer_rooms')
      .upsert({
        code,
        host_id: hostId,
        status: 'waiting',
        category: 'karisik',
        word_length: 5,
        pair_key: pairKey,
        mode,
      })
      .select()
      .single();

    if (error) throw error;

    // Uzun vadeli temizlik tetikle
    this.cleanRooms().catch(console.error);

    // Eğer oda reuse ediliyorsa (Rematch), içindeki oyuncuların hazır durumunu sıfırla
    if (opponentId) {
      await this.resetPlayersReadiness(data.id, hostId);
    }

    return data as Room;
  },

  /**
   * Room reuse (Rematch) durumunda oyuncuların hazır durumunu sıfırlar
   */
  async resetPlayersReadiness(roomId: string, hostId: string) {
    await supabase
      .from('room_players')
      .update({ is_ready: false })
      .eq('room_id', roomId)
      .neq('user_id', hostId); // Host zaten joinRoom ile set edilecek
  },

  /**
   * Eski odaları temizler (SQL fonksiyonunu çağırır)
   */
  async cleanRooms() {
    return supabase.rpc('clean_stale_rooms');
  },

  /**
   * Odayı koduna göre bulur
   */
  async getRoomByCode(code: string) {
    const { data, error } = await supabase
      .from('multiplayer_rooms')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error) throw error;
    return data as Room;
  },

  /**
   * Odaya oyuncu ekler veya varsa günceller
   */
  async joinRoom(roomId: string, userId: string, username: string, isHost: boolean = false) {
    const { data, error } = await supabase
      .from('room_players')
      .upsert([{ 
        room_id: roomId, 
        user_id: userId, 
        username,
        is_host: isHost,
        is_ready: isHost // Host otomatik hazır başlar
      }], { onConflict: 'room_id,user_id' })
      .select()
      .single();

    if (error) throw error;
    return data as RoomPlayer;
  },

  /**
   * Odadaki oyuncuları getirir
   */
  async getRoomPlayers(roomId: string) {
    const { data, error } = await supabase
      .from('room_players')
      .select('*')
      .eq('room_id', roomId)
      .order('joined_at', { ascending: true });

    if (error) throw error;
    return data as RoomPlayer[];
  },

  /**
   * Oyuncunun hazır durumunu günceller
   */
  async toggleReady(roomId: string, userId: string, currentReady: boolean) {
    const { error } = await supabase
      .from('room_players')
      .update({ is_ready: !currentReady })
      .eq('room_id', roomId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  /**
   * Oda modunu günceller (Battle / Bomb)
   */
  async updateRoomMode(roomId: string, mode: 'battle' | 'bomb') {
    const { error } = await supabase
      .from('multiplayer_rooms')
      .update({ mode })
      .eq('id', roomId);

    if (error) throw error;
  },

  /**
   * Oda durumunu günceller (Started -> Finished vb)
   */
  async updateRoomStatus(roomId: string, status: 'waiting' | 'started' | 'finished', winnerId?: string) {
    const { error } = await supabase
      .from('multiplayer_rooms')
      .update({ status, winner_id: winnerId })
      .eq('id', roomId);

    if (error) throw error;
  },

  /**
   * Oyunu belirli bir kelimeyle başlatır
   */
  async startGameWithWord(roomId: string, word: string) {
    const { error } = await supabase
      .from('multiplayer_rooms')
      .update({ 
        status: 'started',
        current_word: word.toUpperCase()
      })
      .eq('id', roomId);

    if (error) throw error;
  },

  /**
   * Maçın kazananını belirler (Yalnızca ilk atama geçerlidir)
   */
  async setWinner(roomId: string, userId: string) {
    const { error } = await supabase
      .from('multiplayer_rooms')
      .update({ 
        status: 'finished',
        winner_id: userId
      })
      .eq('id', roomId)
      .is('winner_id', null); // Sadece henüz bir kazanan yoksa güncelle

    if (error) throw error;
  },

  /**
   * Oda ayarlarını günceller
   */
  async updateRoomSettings(roomId: string, category: string, wordLength: number) {
    const { error } = await supabase
      .from('multiplayer_rooms')
      .update({ 
        category,
        word_length: wordLength
      })
      .eq('id', roomId);

    if (error) throw error;
  },

  /**
   * Odadan ayrılır
   */
  async leaveRoom(roomId: string, userId: string) {
    const { error } = await supabase
      .from('room_players')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  /**
   * Bomba Modunu başlatır
   */
  async startBombGame(roomId: string, hostId: string) {
    const syllable = getRandomSyllable();
    const { error } = await supabase
      .from('multiplayer_rooms')
      .update({
        status: 'started',
        bomb_holder_id: hostId,
        bomb_syllable: syllable,
        bomb_timer_start: new Date().toISOString(),
        bomb_duration_ms: 20000,
        used_words: []
      })
      .eq('id', roomId);

    if (error) throw error;
  },

  /**
   * Bombayı bir sonraki oyuncuya geçer
   */
  async passBomb(roomId: string, currentHolderId: string, word: string, nextDuration: number) {
    // 1. Odadaki tüm oyuncuları al
    const players = await this.getRoomPlayers(roomId);
    if (players.length < 2) return;

    // 2. Bir sonraki oyuncuyu bul (Turn cycling)
    const currentIndex = players.findIndex(p => p.user_id === currentHolderId);
    const nextIndex = (currentIndex + 1) % players.length;
    const nextPlayerId = players[nextIndex].user_id;

    // 3. Yeni hece üret
    const nextSyllable = getRandomSyllable();

    // 4. Güncelle
    const { error } = await supabase
      .from('multiplayer_rooms')
      .update({
        bomb_holder_id: nextPlayerId,
        bomb_syllable: nextSyllable,
        bomb_timer_start: new Date().toISOString(),
        bomb_duration_ms: nextDuration,
        used_words: supabase.rpc('array_append_wrapped', { arr_name: 'used_words', val: word }) // RPC logic below or simple array update
      } as any)
      .eq('id', roomId);

    // Not: array_append rpc yoksa simple update:
    if (error) {
       // Fallback: Fetch room, update array manually
       const { data: room } = await supabase.from('multiplayer_rooms').select('used_words').eq('id', roomId).single();
       const updatedWords = [...(room?.used_words || []), word];
       await supabase.from('multiplayer_rooms')
         .update({
           bomb_holder_id: nextPlayerId,
           bomb_syllable: nextSyllable,
           bomb_timer_start: new Date().toISOString(),
           bomb_duration_ms: nextDuration,
           used_words: updatedWords
         })
         .eq('id', roomId);
    }
  }
};
