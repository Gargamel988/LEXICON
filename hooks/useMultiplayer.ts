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
        text2: "Oda kodu geçersiz veya bir hata oluştu.",
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
  leaveRoom: () => void;
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

  // 1. Oda Detaylarını Getir
  const { data: room, isLoading: isLoadingRoom } = useQuery({
    queryKey: ["room", roomCode],
    queryFn: () => multiplayerService.getRoomByCode(roomCode),
    enabled: !!roomCode,
  });

  // 2. Oyuncuları Getir
  const { data: players = [], isLoading: isLoadingPlayers } = useQuery({
    queryKey: ["room_players", room?.id],
    queryFn: () => multiplayerService.getRoomPlayers(room!.id),
    enabled: !!room?.id,
  });

  useEffect(() => {
    if (room && userId) {
      setIsHost(room.host_id === userId);

      if (room.status === "started") {
        const targetPath = room.mode === "bomb" ? "/bomb" : "/battle";
        if (pathname !== targetPath) {
          router.push({
            pathname: targetPath,
            params: { code: roomCode },
          } as any);
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
          queryClient.setQueryData(["room", roomCode], payload.new);
        },
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error(
            `[Realtime] Channel error for room: ${room.id} (${channelId})`,
          );
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
    room,
    players,
    isHost,
    loading: isLoadingRoom || isLoadingPlayers,
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
    leaveRoom: () =>
      room && userId && leaveRoomMutation.mutate({ roomId: room.id, userId }),
    changeMode: (mode: "battle" | "bomb") =>
      room && changeModeMutation.mutate({ roomId: room.id, mode }),
    isStarting: startGameMutation.isPending || startBombGameMutation.isPending,
  };
};
