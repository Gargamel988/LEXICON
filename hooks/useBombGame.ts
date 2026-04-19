import { useState, useEffect, useCallback, useRef } from 'react';
import { multiplayerService } from '../services/multiplayerService';
import { isValidWord } from '../utils/wordUtils';
import { supabase } from '../lib/supabase';
import { Room, RoomPlayer } from '../types';
import { useAuth } from './useAuth';
import { toUpperTurkish } from '../utils/stringUtils';

export const useBombGame = (roomCode: string) => {
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isExploded, setIsExploded] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isMyTurn = room?.bomb_holder_id === user?.id;
  const timerRef = useRef<any>(null);

  // 1. Odayı ve oyuncuları yükle
  useEffect(() => {
    let roomSubscription: any;

    const init = async () => {
      try {
        const roomData = await multiplayerService.getRoomByCode(roomCode);
        if (!roomData) return;
        setRoom(roomData);

        const playersData = await multiplayerService.getRoomPlayers(roomData.id);
        setPlayers(playersData);

        // Realtime Subscription
        roomSubscription = supabase
          .channel(`room_${roomData.id}`)
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'multiplayer_rooms', filter: `id=eq.${roomData.id}` }, 
            (payload) => {
              const newRoom = payload.new as Room;
              setRoom(newRoom);
              // Senkronizasyon: Eğer oda bittiyse herkes patlamayı görsün
              if (newRoom.status === 'finished' && !isExploded) {
                setIsExploded(true);
              }
            }
          )
          .on('postgres_changes', { event: '*', schema: 'public', table: 'room_players', filter: `room_id=eq.${roomData.id}` },
            async () => {
              const freshPlayers = await multiplayerService.getRoomPlayers(roomData.id);
              setPlayers(freshPlayers);
            }
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

  // 2. Zamanlayıcı Mantığı (Server-side sync)
  useEffect(() => {
    if (!room || room.status !== 'started' || isExploded) return;

    // Eğer bomba bende değilse geri sayımı çalıştırma (İzolasyon)
    if (!isMyTurn) {
      if (timerRef.current) clearInterval(timerRef.current);
      const duration = room.bomb_duration_ms || 20000;
      setTimeLeft(duration / 1000);
      return;
    }

    if (timerRef.current) clearInterval(timerRef.current);

    const calculateTime = () => {
      if (!room.bomb_timer_start) return;

      const startTime = new Date(room.bomb_timer_start).getTime();
      const now = Date.now();
      const elapsed = now - startTime;
      const duration = room.bomb_duration_ms || 20000;
      const remaining = Math.max(0, (duration - elapsed) / 1000);

      setTimeLeft(remaining);

      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsExploded(true);
        
        // Sadece bomba sahibi durumu günceller (race condition engellemek için)
        multiplayerService.updateRoomStatus(room.id, 'finished', undefined);
      }
    };

    calculateTime();
    timerRef.current = setInterval(calculateTime, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [room?.bomb_timer_start, room?.status, room?.bomb_duration_ms, isExploded, isMyTurn]);

  // 3. Kelime Gönderimi
  const submitWord = async (word: string) => {
    if (!room || !user || room.bomb_holder_id !== user.id || isExploded || isSubmitting) return false;

    setIsSubmitting(true);
    const normalized = toUpperTurkish(word.trim());

    // Validasyonlar
    if (!isValidWord(normalized)) {
      await applyPenalty("Geçersiz Kelime!");
      setIsSubmitting(false);
      return false;
    }

    if (!normalized.includes(room.bomb_syllable || '')) {
      await applyPenalty(`"${room.bomb_syllable}" harflerini içermeli!`);
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
      // 3 turda bir 1 saniye hızlandır (20s -> 19s -> 18s...)
      const currentWordsCount = (room.used_words?.length || 0) + 1;
      const baseDuration = 20000;
      const speedUp = Math.floor(currentWordsCount / 3) * 1000;
      const nextDuration = Math.max(8000, baseDuration - speedUp);

      await multiplayerService.passBomb(room.id, user.id, normalized, nextDuration);
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
    const newDuration = Math.max(3000, (room.bomb_duration_ms || 20000) - 3000);
    await supabase.from('multiplayer_rooms').update({ bomb_duration_ms: newDuration } as any).eq('id', room.id);
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
    isMyTurn
  };
};
