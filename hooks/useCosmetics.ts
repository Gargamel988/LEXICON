import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FREE_FRAME_ID, FRAMES, FrameDef } from "../constants/frames";
import { TITLES, Title } from "../constants/titles";
import { supabase } from "../lib/supabase";

const QUERY_OWNED = (userId: string) => ["cosmetics_owned", userId];
const QUERY_ACTIVE = (userId: string) => ["cosmetics_active", userId];

// ─── Sahip olunan varlıkları çek (Çerçeve, İsimlik, Unvan vb.) ───
async function fetchOwnedAssets(userId: string, type: 'frame' | 'nametag' | 'title'): Promise<string[]> {
  const { data, error } = await supabase
    .from("user_assets")
    .select("asset_id")
    .eq("user_id", userId)
    .eq("asset_type", type);
  
  if (error) throw error;
  
  const ids = data?.map((d) => d.asset_id) ?? [];
  if (type === 'frame' && !ids.includes(FREE_FRAME_ID)) ids.unshift(FREE_FRAME_ID);
  return ids;
}

// ─── Aktif kozmetikleri çek ───
async function fetchActiveCosmetics(userId: string) {
  const { data } = await supabase
    .from("user_active_cosmetics")
    .select("active_frame, active_nametag, active_title")
    .eq("user_id", userId)
    .maybeSingle();
  
  return {
    activeFrameId: data?.active_frame ?? FREE_FRAME_ID,
    activeNameTagId: data?.active_nametag ?? null,
    activeTitleId: data?.active_title ?? null,
  };
}

// ─── Aktif kozmetiği kaydet ───
async function persistActiveCosmetic(
  userId: string,
  type: 'frame' | 'nametag' | 'title',
  id: string | null,
): Promise<void> {
  const payload: any = { user_id: userId, updated_at: new Date().toISOString() };

  if (type === 'frame') payload.active_frame = id;
  else if (type === 'nametag') payload.active_nametag = id;
  else payload.active_title = id;

  const { error } = await supabase
    .from("user_active_cosmetics")
    .upsert(payload, { onConflict: "user_id" });
  
  if (error) throw error;
}

// ─── Elmasla satın al ───
async function purchaseAssetWithCoins(
  userId: string,
  productId: string,
  type: 'frame' | 'nametag' | 'title',
  coinPrice: number,
): Promise<void> {
  // 1. Elmas bakiyesini kontrol et
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("coins")
    .eq("id", userId)
    .single();

  if (profileErr) throw new Error("Bakiye kontrol edilemedi");

  const currentCoins = profile?.coins || 0;
  if (currentCoins < coinPrice) throw new Error("Yetersiz elmas bakiye");

  // 2. Elması düş
  const { error: updateErr } = await supabase
    .from("profiles")
    .update({ coins: currentCoins - coinPrice })
    .eq("id", userId);

  if (updateErr) throw new Error("Elmas tahsil edilemedi");

  // 3. Varlık kaydını ortak tabloya ekle
  const { error: insertErr } = await supabase
    .from("user_assets")
    .insert({ 
      user_id: userId, 
      asset_id: productId, 
      asset_type: type 
    });

  if (insertErr) throw new Error("Varlık kaydedilemedi");
}

export function useCosmetics(userId: string | undefined) {
  const queryClient = useQueryClient();

  const ownedQuery = useQuery({
    queryKey: QUERY_OWNED(userId ?? ""),
    queryFn: () => fetchOwnedAssets(userId!, 'frame'),
    enabled: !!userId,
  });

  const activeQuery = useQuery({
    queryKey: QUERY_ACTIVE(userId ?? ""),
    queryFn: () => fetchActiveCosmetics(userId!),
    enabled: !!userId,
  });

  const titleQuery = useQuery({
    queryKey: ["titles_owned", userId ?? ""],
    queryFn: () => fetchOwnedAssets(userId!, 'title'),
    enabled: !!userId,
  });

  const setActiveMutation = useMutation({
    mutationFn: ({ type, id }: { type: 'frame' | 'nametag' | 'title', id: string | null }) => 
      persistActiveCosmetic(userId!, type, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_ACTIVE(userId ?? "") });
      queryClient.invalidateQueries({ queryKey: ["bulk_active_frames"] });
    },
  });

  const buyMutation = useMutation({
    mutationFn: ({ id, price, type }: { id: string; price: number; type: 'frame' | 'nametag' | 'title' }) => 
      purchaseAssetWithCoins(userId!, id, type, price),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coins", userId] });
      queryClient.invalidateQueries({ queryKey: QUERY_OWNED(userId ?? "") });
      queryClient.invalidateQueries({ queryKey: ["inventory", userId] });
      queryClient.invalidateQueries({ queryKey: ["titles_owned", userId] });
    },
  });

  // Resolve objects
  const ownedFrames = (ownedQuery.data ?? [FREE_FRAME_ID])
    .map(id => FRAMES.find(f => f.id === id))
    .filter(Boolean) as FrameDef[];

  const ownedTitles = (titleQuery.data ?? [])
    .map(id => TITLES.find(t => t.id === id))
    .filter(Boolean) as Title[];

  const activeFrame = FRAMES.find(f => f.id === activeQuery.data?.activeFrameId) ?? null;
  const activeTitle = TITLES.find(t => t.id === activeQuery.data?.activeTitleId) ?? null;

  return {
    ownedCosmetics: ownedQuery.data ?? [FREE_FRAME_ID],
    ownedFrames,
    ownedTitles,
    activeFrame,
    activeNameTag: activeQuery.data?.activeNameTagId ?? null,
    activeTitle,
    isLoadingCosmetics: ownedQuery.isLoading || activeQuery.isLoading || titleQuery.isLoading,

    setActiveFrame: (id: string) => setActiveMutation.mutateAsync({ type: 'frame', id }),
    setActiveNameTag: (id: string | null) => setActiveMutation.mutateAsync({ type: 'nametag', id }),
    setActiveTitle: (id: string | null) => setActiveMutation.mutateAsync({ type: 'title', id }),
    isSettingActive: setActiveMutation.isPending,

    buyCosmetic: (id: string, price: number, type: 'frame' | 'nametag' | 'title') => 
      buyMutation.mutateAsync({ id, price, type }),
    isBuying: buyMutation.isPending,
    
    buyFrame: (id: string, price: number) => buyMutation.mutateAsync({ id, price, type: 'frame' }),
    buyNameTag: (id: string, price: number) => buyMutation.mutateAsync({ id, price, type: 'nametag' }),
    buyTitle: (id: string, price: number) => buyMutation.mutateAsync({ id, price, type: 'title' }),
  };
}

export function useBulkActiveCosmetics(userIds: string[]) {
  return useQuery({
    queryKey: ["bulk_active_cosmetics", userIds],
    queryFn: async () => {
      if (!userIds || userIds.length === 0) return {};
      const { data, error } = await supabase
        .from("user_active_cosmetics")
        .select("user_id, active_frame, active_nametag, active_title")
        .in("user_id", userIds);

      if (error) return {};

      const map: Record<string, { frame: string, nametag: string | null, title: string | null }> = {};
      data?.forEach((d) => {
        map[d.user_id] = { 
          frame: d.active_frame, 
          nametag: d.active_nametag,
          title: d.active_title
        };
      });
      return map;
    },
    enabled: userIds.length > 0,
  });
}
