import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import { supabase } from "../lib/supabase";
import { multiplayerService } from "../services/multiplayerService";
import { Room, RoomPlayer } from "../types";

export const useMultiplayer = () => {
  const router = useRouter();

  // ODA OLUŞTURMA
  const createRoomMutation = useMutation({
    mutationFn: ({
      code,
      hostId,
      username,
      opponentId,
      mode = "battle",
    }: {
      code: string;
      hostId: string;
      username: string;
      opponentId?: string;
      mode?: "battle" | "bomb";
    }) =>
      multiplayerService
        .createRoom(code, hostId, opponentId, mode)
        .then((room) =>
          multiplayerService
            .joinRoom(room.id, hostId, username, true)
            .then(() => room),
        ),
    onSuccess: (room) => {
      router.push(`/room/${room.code}` as any);
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Oda Kurulamadı",
        text2: error.message,
      });
    },
  });

  // ODAYA KATILMA
  const joinRoomMutation = useMutation({
    mutationFn: async ({
      code,
      userId,
      username,
    }: {
      code: string;
      userId: string;
      username: string;
    }) => {
      const room = await multiplayerService.getRoomByCode(code);
      if (!room) {
        throw new Error("Oda bulunamadı.");
      }

      if (room.status === "finished") {
        throw new Error("Bu oda kapandı.");
      }

      if (room.status === "started") {
        throw new Error("Oyun devam ediyor, şu an katılamazsınız.");
      }

      await multiplayerService.joinRoom(room.id, userId, username, false);
      return room;
    },
    onSuccess: (room) => {
      router.push(`/room/${room.code}` as any);
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Odaya Katılınamadı",
        text2: error.message || "Oda kodu geçersiz veya bir hata oluştu.",
      });
    },
  });

  return {
    createRoom: createRoomMutation.mutate,
    isCreating: createRoomMutation.isPending,
    joinRoom: joinRoomMutation.mutate,
    isJoining: joinRoomMutation.isPending,
  };
};

interface UseRoomStateReturn {
  room: Room | undefined;
  players: RoomPlayer[];
  isHost: boolean;
  loading: boolean;
  toggleReady: (currentReady: boolean) => void;
  updateSettings: (category: string, wordLength: number) => void;
  startGame: (word: string) => void;
  startBombGame: () => void;
  leaveRoom: () => Promise<void>;
  returnToLobby: () => Promise<void>;
  changeMode: (mode: "battle" | "bomb") => void;
  isStarting: boolean;
}

// Bekleme Odası (Room) için Özel Hook
export const useRoomState = (
  roomCode: string,
  userId: string | undefined,
): UseRoomStateReturn => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const [isHost, setIsHost] = useState(false);

  const cleanRoomCode = roomCode?.trim()?.toUpperCase();

  // 1. Oda Detaylarını Getir
  const { data: room, isLoading: isLoadingRoom } = useQuery({
    queryKey: ["room", cleanRoomCode],
    queryFn: () => multiplayerService.getRoomByCode(cleanRoomCode),
    enabled: !!cleanRoomCode,
  });

  // 2. Oyuncuları Getir
  const { data: players = [], isLoading: isLoadingPlayers, refetch: refetchPlayers } = useQuery({
    queryKey: ["room_players", room?.id],
    queryFn: () => {
        return multiplayerService.getRoomPlayers(room!.id);
    },
    enabled: !!room?.id,
  });

  useEffect(() => {
    // Players loaded sync logic
  }, [players.length, cleanRoomCode]);

  useEffect(() => {
    if (room && userId) {
      setIsHost(room.host_id === userId);

      if (room.status === "started") {
        const targetPath = room.mode === "bomb" ? "/bomb" : "/battle";
        const targetUrl = `${targetPath}?id=${room.code}`;
        
        const currentPath = pathname.replace(/\/$/, "");
        if (!currentPath.includes(targetPath)) {
          router.replace(targetUrl as any);
        }
      }
    }
  }, [room?.status, room?.current_word, userId]);

  const channelId = useRef(Math.random().toString(36).substring(7)).current;

  // 3. Realtime Aboneliği
  useEffect(() => {
    if (!room?.id) return;

    const channelName = `room_sync:${room.id}:${channelId}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "room_players",
          filter: `room_id=eq.${room.id}`,
        },
        async () => {
          queryClient.invalidateQueries({
            queryKey: ["room_players", room.id],
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "multiplayer_rooms",
          filter: `id=eq.${room.id}`,
        },
        (payload) => {
          // ÖNEMLİ: payload.new bazen sadece değişen kolonları içerir. 
          // Cache'i bozmamak için veriyi geçersiz kılıp tekrar çekiyoruz.
          queryClient.invalidateQueries({ queryKey: ["room", roomCode] });
        },
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          // Hata durumunda sessizce cleanup yapması için bırakıyoruz
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room?.id, roomCode]);

  // ACTIONS
  const toggleReadyMutation = useMutation({
    mutationFn: ({
      roomId,
      userId,
      currentReady,
    }: {
      roomId: string;
      userId: string;
      currentReady: boolean;
    }) => multiplayerService.toggleReady(roomId, userId, currentReady),
    onError: () =>
      Toast.show({ type: "error", text2: "Hazır durumu güncellenemedi" }),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: ({
      roomId,
      category,
      wordLength,
    }: {
      roomId: string;
      category: string;
      wordLength: number;
    }) => multiplayerService.updateRoomSettings(roomId, category, wordLength),
    onError: () =>
      Toast.show({ type: "error", text2: "Ayarlar güncellenemedi" }),
  });

  const startGameMutation = useMutation({
    mutationFn: ({ roomId, word }: { roomId: string; word: string }) =>
      multiplayerService.startGameWithWord(roomId, word),
    onError: () => Toast.show({ type: "error", text2: "Oyun başlatılamadı" }),
  });

  const leaveRoomMutation = useMutation({
    mutationFn: ({ roomId, userId }: { roomId: string; userId: string }) =>
      multiplayerService.leaveRoom(roomId, userId),
  });

  const returnToLobbyMutation = useMutation({
    mutationFn: (roomId: string) => multiplayerService.returnToLobby(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room", roomCode] });
    },
    onError: () => Toast.show({ type: "error", text2: "Lobiye dönülemedi" }),
  });

  const changeModeMutation = useMutation({
    mutationFn: ({
      roomId,
      mode,
    }: {
      roomId: string;
      mode: "battle" | "bomb";
    }) => multiplayerService.updateRoomMode(roomId, mode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room", roomCode] });
    },
  });

  const startBombGameMutation = useMutation({
    mutationFn: ({ roomId, hostId }: { roomId: string; hostId: string }) =>
      multiplayerService.startBombGame(roomId, hostId),
    onError: () => Toast.show({ type: "error", text2: "Oyun başlatılamadı" }),
  });

  return {
    room: room ?? undefined,
    players,
    isHost,
    loading: (isLoadingRoom && !room) || (isLoadingPlayers && players.length === 0),
    toggleReady: (currentReady: boolean) =>
      room &&
      userId &&
      toggleReadyMutation.mutate({ roomId: room.id, userId, currentReady }),
    updateSettings: (category: string, wordLength: number) =>
      room &&
      updateSettingsMutation.mutate({ roomId: room.id, category, wordLength }),
    startGame: (word: string) =>
      room && startGameMutation.mutate({ roomId: room.id, word }),
    startBombGame: () =>
      room &&
      userId &&
      startBombGameMutation.mutate({ roomId: room.id, hostId: userId }),
    leaveRoom: async () => {
      if (room && userId) {
        return leaveRoomMutation.mutateAsync({ roomId: room.id, userId });
      }
    },
    returnToLobby: async () => {
      if (room) {
        return returnToLobbyMutation.mutateAsync(room.id);
      }
    },
    changeMode: (mode: "battle" | "bomb") =>
      room && changeModeMutation.mutate({ roomId: room.id, mode }),
    isStarting: startGameMutation.isPending || startBombGameMutation.isPending,
  };
};
