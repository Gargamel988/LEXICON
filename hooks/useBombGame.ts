import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { multiplayerService } from "../services/multiplayerService";
import { Room, RoomPlayer } from "../types";
import { toUpperTurkish } from "../utils/stringUtils";
import { isValidWord } from "../utils/wordUtils";
import { useAuth } from "./useAuth";
import { useRoomState } from "./useMultiplayer";
import { statsService } from "../services/statsService";
import { inventoryService } from "../services/inventoryService";

export const useBombGame = (roomCode: string) => {
  const router = useRouter();
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(30);
  const [isExploded, setIsExploded] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const gameResultSavedRef = useRef(false); // Çift kayıt önleme

  const {
    returnToLobby: serverReturnToLobby,
    leaveRoom,
    players: freshPlayers,
  } = useRoomState(roomCode, user?.id);

  const isMyTurn = room?.bomb_holder_id === user?.id;
  const isHost = room?.host_id === user?.id;
  const me = players.find((p) => p.user_id === user?.id);
  const isEliminated = me?.is_eliminated || false;
  const timerRef = useRef<any>(null);

  // Bomba patladığında oyun sonucunu kaydet
  useEffect(() => {
    if (!isExploded || !user || !room || gameResultSavedRef.current) return;
    gameResultSavedRef.current = true;

    // Bombayı elinde tutan kaybetti
    const isLoser = room.bomb_holder_id === user.id;
    const activePlayers = players.filter((p) => !p.is_eliminated);
    const isWinner = !isLoser && activePlayers.length > 0;

    statsService.saveGameResult(user.id, {
      mode: "bomb",
      is_winner: isWinner,
      score: isWinner ? Math.max(100, players.length * 50) : 0,
      word_count: room.used_words?.length || 0,
    }).catch((err) => console.error("[BombGame] saveGameResult error:", err));

    if (isWinner) {
      inventoryService.giveWinReward(user.id, 'bomb').catch(() => {});
    }
  }, [isExploded]);

  // 1. Odayı ve oyuncuları yükle
  useEffect(() => {
    let roomSubscription: any;

    const init = async () => {
      if (!roomCode) return;
      try {
        const roomData = await multiplayerService.getRoomByCode(roomCode);
        if (!roomData) return;
        setRoom(roomData);

        const playersData = await multiplayerService.getRoomPlayers(
          roomData.id,
        );
        setPlayers(playersData);

        // Realtime Subscription
        roomSubscription = supabase
          .channel(`room_${roomData.id}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "multiplayer_rooms",
              filter: `id=eq.${roomData.id}`,
            },
            (payload) => {
              const newRoom = payload.new as Room;
              setRoom(newRoom);
              // Senkronizasyon: Eğer oda bittiyse herkes patlamayı görsün
              if (newRoom.status === "finished" && !isExploded) {
                setIsExploded(true);
              }
            },
          )
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "room_players",
              filter: `room_id=eq.${roomData.id}`,
            },
            async () => {
              const freshPlayers = await multiplayerService.getRoomPlayers(
                roomData.id,
              );
              setPlayers(freshPlayers);
            },
          )
          .subscribe();
      } catch (err) {
        console.error("Bomb init error:", err);
      }
    };

    init();
    return () => {
      if (roomSubscription) supabase.removeChannel(roomSubscription);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [roomCode]);

  // 2. Zamanlayıcı Mantığı (Yerel Senkronizasyon)
  useEffect(() => {
    // Oda yoksa, oyun başlamadıysa veya bomba patladıysa durdur
    if (!room || room.status !== "started" || isEliminated || isExploded) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // ÖNEMLİ: Senkronizasyon için Sunucu Zaman Damgasını (Timestamp) kullanıyoruz.
    // Bu sayede ağ gecikmesi olsa bile tüm cihazlarda aynı saniye görünür.
    const startTime = room.bomb_timer_start
      ? new Date(room.bomb_timer_start).getTime()
      : Date.now();
    // Her zaman 30 saniye — DB'deki eski/hatalı değerleri yok say
    const duration = 30000;

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const remaining = Math.max(0, Math.min(duration, duration - elapsed));
      const seconds = Math.ceil(remaining / 1000);

      // Her zaman timeLeft'i güncelle (animasyon senkronizasyonu için)
      // isMyTurn false olsa bile animasyonun ilerlemesi gerekiyor
      setTimeLeft(seconds);

      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        if (isHost && !isExploded) {
          console.log(
            "[useBombGame] Timer reached zero, Host triggering explosion",
          );
          multiplayerService.handleBombExplosion(room.id, room.bomb_holder_id!);
        }
      }
    };

    // İlk hesaplamayı hemen yap
    updateTimer();

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(updateTimer, 500); // Daha akıcı senkronizasyon için 500ms

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [
    room?.bomb_holder_id,
    room?.bomb_timer_start,
    room?.status,
    isExploded,
    isHost,
    isEliminated,
    isMyTurn,
  ]);

  // 3. Kelime Gönderimi
  const submitWord = async (word: string) => {
    if (
      !room ||
      !user ||
      room.bomb_holder_id !== user.id ||
      isExploded ||
      isSubmitting
    )
      return false;

    setIsSubmitting(true);
    const normalized = toUpperTurkish(word.trim());

    // Validasyonlar
    if (!isValidWord(normalized)) {
      await applyPenalty("Geçersiz Kelime!");
      setIsSubmitting(false);
      return false;
    }

    const syllables = (room.bomb_syllable || "").split(",");
    const missingSyllable = syllables.find((s) => !normalized.includes(s));

    if (missingSyllable) {
      if (syllables.length > 1) {
        await applyPenalty(`"${syllables.join(" ve ")}" harflerini içermeli!`);
      } else {
        await applyPenalty(`"${room.bomb_syllable}" harflerini içermeli!`);
      }
      setIsSubmitting(false);
      return false;
    }

    if (room.used_words?.includes(normalized)) {
      await applyPenalty("Bu kelime zaten kullanıldı!");
      setIsSubmitting(false);
      return false;
    }

    // Başarılı Pass
    try {
      const nextDuration = 30000; // Her zaman 30 saniyeden başlasın

      await multiplayerService.passBomb(
        room.id,
        user.id,
        normalized,
        nextDuration,
      );
      setIsSubmitting(false);
      return true;
    } catch (err) {
      console.error("Pass error:", err);
      setIsSubmitting(false);
      return false;
    }
  };

  const applyPenalty = async (msg: string) => {
    setErrorMessage(msg);
    setErrorVisible(true);
    setTimeout(() => setErrorVisible(false), 2000);

    if (!room) return;
    // -3 Saniye Cezası
    const newDuration = Math.max(5000, (room.bomb_duration_ms || 30000) - 3000);
    await supabase
      .from("multiplayer_rooms")
      .update({ bomb_duration_ms: newDuration } as any)
      .eq("id", room.id);
  };
  const returnToLobby = async () => {
    try {
      if (isHost && room) {
        await serverReturnToLobby();
      }
      router.replace(`/room/${roomCode}`);
    } catch (err) {
      console.error("Return to lobby error:", err);
      router.replace(`/room/${roomCode}`);
    }
  };

  return {
    room,
    players,
    timeLeft,
    isExploded,
    submitWord,
    errorVisible,
    errorMessage,
    isSubmitting,
    isMyTurn,
    isEliminated,
    returnToLobby,
    leaveRoom,
  };
};
