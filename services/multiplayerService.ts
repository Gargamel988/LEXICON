import { supabase } from "../lib/supabase";
import { Room, RoomPlayer } from "../types";
import { getRandomSyllable } from "../utils/wordUtils";

export const multiplayerService = {
  /**
   * Yeni bir oda oluşturur veya aynı rakip için mevcut odayı günceller (Rematch)
   */
  async createRoom(
    code: string,
    hostId: string,
    opponentId?: string,
    mode: "battle" | "bomb" = "battle",
  ): Promise<Room> {
    const pairKey = opponentId ? [hostId, opponentId].sort().join(":") : null;

    const { data, error } = await supabase
      .from("multiplayer_rooms")
      .upsert({
        code,
        host_id: hostId,
        status: "waiting",
        category: "karisik",
        word_length: 5,
        pair_key: pairKey,
        mode,
        bomb_duration_ms: 30000,
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
      .from("room_players")
      .update({ is_ready: false })
      .eq("room_id", roomId)
      .neq("user_id", hostId); // Host zaten joinRoom ile set edilecek
  },

  /**
   * Eski odaları temizler (SQL fonksiyonunu çağırır)
   */
  async cleanRooms() {
    return supabase.rpc("clean_stale_rooms");
  },

  /**
   * Odayı koduna göre bulur
   */
  async getRoomByCode(code: string) {
    if (!code) {
      console.warn(`[MultiplayerService] getRoomByCode called with empty code`);
      return null;
    }
    const cleanCode = code.toUpperCase();
    const { data, error } = await supabase
      .from("multiplayer_rooms")
      .select("*")
      .eq("code", cleanCode)
      .single();

    if (error) {
      throw error;
    }
    return data as Room;
  },

  /**
   * Odaya oyuncu ekler veya varsa günceller
   */
  async joinRoom(
    roomId: string,
    userId: string,
    username: string,
    isHost: boolean = false,
  ) {
    const { data, error } = await supabase
      .from("room_players")
      .upsert(
        [
          {
            room_id: roomId,
            user_id: userId,
            username,
            is_host: isHost,
            is_ready: isHost, // Host otomatik hazır başlar
          },
        ],
        { onConflict: "room_id,user_id" },
      )
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data as RoomPlayer;
  },

  /**
   * Odadaki oyuncuları getirir (Profil bilgileriyle birlikte)
   */
  async getRoomPlayers(roomId: string) {
    const { data: players, error: playersError } = await supabase
      .from("room_players")
      .select("*")
      .eq("room_id", roomId)
      .order("joined_at", { ascending: true });

    if (playersError) {
      console.error("[MultiplayerService] Error fetching players:", playersError);
      throw playersError;
    }

    if (!players || players.length === 0) return [];

    // 2. Profil bilgilerini ve AKTİF KOZMETİKLERİ çek
    const userIds = players.map(p => p.user_id);
    
    // Profiller (avatar_url için)
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, avatar_url")
      .in("id", userIds);

    // Aktif Kozmetikler (çerçeve, unvan, name tag için)
    const { data: cosmetics } = await supabase
      .from("user_active_cosmetics")
      .select("user_id, active_frame, active_nametag, active_title")
      .in("user_id", userIds);

    return players.map((player) => {
      const profile = profiles?.find(p => p.id === player.user_id);
      const userCosmetic = cosmetics?.find(c => c.user_id === player.user_id);

      return {
        ...player,
        avatar_url: profile?.avatar_url || player.avatar_url,
        active_frame: userCosmetic?.active_frame || player.active_frame,
        active_nametag: userCosmetic?.active_nametag || player.active_nametag,
        active_title: userCosmetic?.active_title || (player as any).active_title,
      };
    }) as RoomPlayer[];
  },

  /**
   * Oyuncunun hazır durumunu günceller
   */
  async toggleReady(roomId: string, userId: string, currentReady: boolean) {
    const { error } = await supabase
      .from("room_players")
      .update({ is_ready: !currentReady })
      .eq("room_id", roomId)
      .eq("user_id", userId);

    if (error) throw error;
  },

  /**
   * Oda modunu günceller (Battle / Bomb)
   */
  async updateRoomMode(roomId: string, mode: "battle" | "bomb") {
    const { error } = await supabase
      .from("multiplayer_rooms")
      .update({ mode })
      .eq("id", roomId);

    if (error) throw error;
  },

  /**
   * Oda durumunu günceller (Started -> Finished vb)
   */
  async updateRoomStatus(
    roomId: string,
    status: "waiting" | "started" | "finished",
    winnerId?: string,
  ) {
    const { error } = await supabase
      .from("multiplayer_rooms")
      .update({ status, winner_id: winnerId })
      .eq("id", roomId);

    if (error) throw error;
  },

  /**
   * Odayı lobi (bekleme) durumuna geri döndürür, oyun verilerini sıfırlar
   */
  async returnToLobby(roomId: string) {
    // 1. Odayı sıfırla ve host_id'yi tek seferde al
    const { data: room, error: roomError } = await supabase
      .from("multiplayer_rooms")
      .update({
        status: "waiting",
        winner_id: null,
        current_word: null,
        bomb_holder_id: null,
        bomb_syllable: null,
        bomb_timer_start: null,
        bomb_duration_ms: 30000,
        used_words: [],
      } as any)
      .eq("id", roomId)
      .select("host_id")
      .single();

    if (roomError) throw roomError;

    // 2. Oyuncu durumlarını paralel güncelle (Daha hızlı)
    await Promise.all([
      supabase
        .from("room_players")
        .update({ is_ready: false } as any)
        .eq("room_id", roomId)
        .neq("user_id", room.host_id),
      supabase
        .from("room_players")
        .update({ is_ready: true } as any)
        .eq("room_id", roomId)
        .eq("user_id", room.host_id),
    ]);
  },

  /**
   * Oyunu belirli bir kelimeyle başlatır
   */
  async startGameWithWord(roomId: string, word: string) {
    const { error } = await supabase
      .from("multiplayer_rooms")
      .update({
        status: "started",
        current_word: word.toUpperCase(),
      })
      .eq("id", roomId);

    if (error) throw error;
  },

  /**
   * Maçın kazananını belirler (Yalnızca ilk atama geçerlidir)
   */
  async setWinner(roomId: string, userId: string) {
    const { error } = await supabase
      .from("multiplayer_rooms")
      .update({
        status: "finished",
        winner_id: userId,
      })
      .eq("id", roomId)
      .is("winner_id", null); // Sadece henüz bir kazanan yoksa güncelle

    if (error) throw error;
  },

  /**
   * Maçı beraberlikle sonuçlandırır
   */
  async setDraw(roomId: string) {
    const { error } = await supabase
      .from("multiplayer_rooms")
      .update({
        status: "finished",
        winner_id: "draw",
      })
      .eq("id", roomId)
      .is("winner_id", null);

    if (error) throw error;
  },

  /**
   * Oda ayarlarını günceller
   */
  async updateRoomSettings(
    roomId: string,
    category: string,
    wordLength: number,
  ) {
    const { error } = await supabase
      .from("multiplayer_rooms")
      .update({
        category,
        word_length: wordLength,
      })
      .eq("id", roomId);

    if (error) throw error;
  },

  /**
   * Odadan ayrılır
   */
  async leaveRoom(roomId: string, userId: string) {
    // 1. Oyuncuyu sil
    const { error } = await supabase
      .from("room_players")
      .delete()
      .eq("room_id", roomId)
      .eq("user_id", userId);

    if (error) throw error;

    // 2. Kalan oyuncu sayısını kontrol et
    const { count } = await supabase
      .from("room_players")
      .select("*", { count: "exact", head: true })
      .eq("room_id", roomId);

    // 3. Eğer odada kimse kalmadıysa odayı 'finished' durumuna getir
    if (count === 0) {
      await supabase
        .from("multiplayer_rooms")
        .update({ status: "finished" })
        .eq("id", roomId);
    }
  },

  /**
   * Bomba Modunu başlatır
   */
  async startBombGame(roomId: string, hostId: string) {
    // 1. Oyuncuların canlarını sıfırla
    await supabase
      .from("room_players")
      .update({ lives: 3, is_eliminated: false } as any)
      .eq("room_id", roomId);

    const syllable = getRandomSyllable();
    const { error } = await supabase
      .from("multiplayer_rooms")
      .update({
        status: "started",
        bomb_holder_id: hostId,
        bomb_syllable: syllable,
        bomb_timer_start: new Date().toISOString(),
        bomb_duration_ms: 30000,
        used_words: [],
        winner_id: null,
      })
      .eq("id", roomId);

    if (error) throw error;
  },

  /**
   * Patlama durumunu yönetir: Can düşer, elenme kontrolü yapar
   */
  async handleBombExplosion(roomId: string, holderId: string) {
    // 1. Oyuncunun canını azalt
    const { data: player } = await supabase
      .from("room_players")
      .select("lives")
      .eq("room_id", roomId)
      .eq("user_id", holderId)
      .single();

    const newLives = Math.max(0, (player?.lives || 1) - 1);
    const isEliminated = newLives === 0;

    await supabase
      .from("room_players")
      .update({ lives: newLives, is_eliminated: isEliminated } as any)
      .eq("room_id", roomId)
      .eq("user_id", holderId);

    // 2. Kalan aktif oyuncuları kontrol et
    const players = await this.getRoomPlayers(roomId);
    const alivePlayers = players.filter(p => !p.is_eliminated);

    if (alivePlayers.length <= 1) {
      // Oyun bitti, kazananı belirle
      const winner = alivePlayers[0] || players.find(p => p.user_id !== holderId);
      await this.updateRoomStatus(roomId, "finished", winner?.user_id);
    } else {
      // Oyun devam ediyor, bombayı başkasına pasla veya aynı kişide sıfırla
      // Mekanik gereği: Patlayan kişiden sonraki canlı kişiye geçsin
      const currentIndex = players.findIndex(p => p.user_id === holderId);
      let nextIndex = (currentIndex + 1) % players.length;
      
      // Canlı birini bulana kadar dön
      while (players[nextIndex].is_eliminated || players[nextIndex].user_id === (isEliminated ? holderId : "")) {
          nextIndex = (nextIndex + 1) % players.length;
          if (nextIndex === currentIndex) break; // Güvenlik
      }

      const nextPlayerId = players[nextIndex].user_id;
      const nextSyllable = getRandomSyllable();

      await supabase
        .from("multiplayer_rooms")
        .update({
          bomb_holder_id: nextPlayerId,
          bomb_syllable: nextSyllable,
          bomb_timer_start: new Date().toISOString(),
          bomb_duration_ms: 30000, // Süreyi sıfırla
        })
        .eq("id", roomId);
    }
  },

  /**
   * Bombayı bir sonraki oyuncuya geçer
   */
  async passBomb(
    roomId: string,
    currentHolderId: string,
    word: string,
    nextDuration: number,
  ) {
    // 1. Odadaki tüm oyuncuları al
    const players = await this.getRoomPlayers(roomId);
    const alivePlayers = players.filter(p => !p.is_eliminated);
    if (alivePlayers.length < 2) return;

    // 2. Odayı al (Zaman kontrolü için)
    const { data: room } = await supabase
      .from("multiplayer_rooms")
      .select("bomb_timer_start, last_holder_id, used_words")
      .eq("id", roomId)
      .single();

    // 3. Bounce (Geri Sekme) Kontrolü
    let nextPlayerId = "";
    const startTime = room?.bomb_timer_start ? new Date(room.bomb_timer_start).getTime() : 0;
    const elapsed = Date.now() - startTime;
    
    // Geri sekme süresini 0.5 saniyeye indiriyoruz
    if (elapsed < 500 && room?.last_holder_id && alivePlayers.find(p => p.user_id === room.last_holder_id)) {
        console.log("[PASS BOMB] Bounce! Back to previous holder");
        nextPlayerId = room.last_holder_id;
    } else {
        const currentIndex = players.findIndex(p => p.user_id === currentHolderId);
        let nextIndex = (currentIndex + 1) % players.length;
        while (players[nextIndex].is_eliminated) {
            nextIndex = (nextIndex + 1) % players.length;
        }
        nextPlayerId = players[nextIndex].user_id;
        console.log(`[PASS BOMB] Next Player: ${nextPlayerId}`);
    }

    // 4. Yeni hece üret (Zorluk seviyesine göre)
    const turnCount = (room?.used_words?.length || 0) + 1;
    let level = 1;
    if (turnCount > 10) level = 3;
    else if (turnCount > 5) level = 2;
    
    const nextSyllable = getRandomSyllable(level);

    // 5. Güncelle
    const updatedWords = [...(room?.used_words || []), word];
    await supabase
      .from("multiplayer_rooms")
      .update({
        bomb_holder_id: nextPlayerId,
        last_holder_id: currentHolderId,
        bomb_syllable: nextSyllable,
        bomb_timer_start: new Date().toISOString(),
        bomb_duration_ms: nextDuration,
        used_words: updatedWords,
      } as any)
      .eq("id", roomId);
  },
};


