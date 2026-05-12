import Colors from '@/constants/Colors';
import { FREE_FRAME_ID } from "@/constants/frames";
import { useResponsive } from '@/hooks/useResponsive';
import { statsService } from '@/services/statsService';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { BlurView } from 'expo-blur';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AvatarWithFrame } from '../Cosmetics/AvatarWithFrame';
import { UserDisplayName } from '../Cosmetics/UserDisplayName';

interface PlayerStatsModalProps {
  isVisible: boolean;
  onClose: () => void;
  userId: string | null;
  username: string;
  avatar_url?: string;
  active_frame?: string;
  active_nametag?: string | null;
  active_title?: string | null;
}

export const PlayerStatsModal = ({
  isVisible,
  onClose,
  userId,
  username,
  avatar_url,
  active_frame,
  active_nametag,
  active_title,
}: PlayerStatsModalProps) => {
  const { scale, moderateScale, verticalScale } = useResponsive();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['playerStats', userId],
    queryFn: () => statsService.getAggregateStats(userId!),
    enabled: !!userId && isVisible,
  });

  const renderStat = (label: string, value: string | number, icon: keyof typeof Ionicons.glyphMap) => (
    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
      <View style={[{ backgroundColor: 'rgba(255,255,255,0.03)', justifyContent: 'center', alignItems: 'center' }, { width: scale(40), height: scale(40), borderRadius: scale(12) }]}>
        <Ionicons name={icon} size={20} color={Colors.accent} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: '800', letterSpacing: 1 }}>{label}</Text>
        <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700', marginTop: 2 }}>{value}</Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <BlurView intensity={30} tint="dark" style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }}>
        <View style={{ width: '85%', backgroundColor: '#15151b', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10, padding: moderateScale(24) }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              {active_frame && active_frame !== FREE_FRAME_ID ? (
                <View style={{ width: scale(50), height: scale(50), justifyContent: 'center', alignItems: 'center' }}>
                  <AvatarWithFrame
                    avatarUrl={avatar_url}
                    frameId={active_frame}
                    size={scale(50) * 0.9}
                  />
                </View>
              ) : (
                <View style={[{ backgroundColor: 'rgba(255,255,255,0.03)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }, { width: scale(50), height: scale(50), borderRadius: scale(15), overflow: 'hidden' }]}>
                  {avatar_url?.startsWith('http') ? (
                    <Image source={{ uri: avatar_url }} style={{ width: '100%', height: '100%' }} />
                  ) : avatar_url ? (
                    <Text style={{ fontSize: scale(24) }}>{avatar_url}</Text>
                  ) : (
                    <Ionicons name="person" size={24} color={Colors.accent} />
                  )}
                </View>
              )}
              <View style={{ marginLeft: 12 }}>
                <UserDisplayName
                  username={username}
                  nametagId={active_nametag}
                  titleId={active_title}
                  size="medium"
                  containerStyle={{
                    alignItems: 'flex-start',
                    minWidth: undefined,
                  }}
                />
                <Text style={{ color: Colors.accent, fontSize: 10, fontWeight: '800', letterSpacing: 2, marginTop: 2 }}>OYUNCU PROFİLİ</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
              <Ionicons name="close" size={20} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={{ height: verticalScale(200), justifyContent: 'center' }}>
              <ActivityIndicator color={Colors.accent} size="large" />
            </View>
          ) : stats?.isPublic === false ? (
            <View style={{ height: verticalScale(200), justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 20, marginBottom: 16 }}>
                <Ionicons name="lock-closed" size={40} color="rgba(255,255,255,0.2)" />
              </View>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 8 }}>Gizli Profil</Text>
              <Text style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', fontSize: 12, lineHeight: 18 }}>
                Bu oyuncu profil bilgilerini gizlemeyi tercih etti.
              </Text>
            </View>
          ) : stats ? (
            <View style={{ gap: 16, marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                {renderStat('SEVİYE', stats.level, 'ribbon-outline')}
                {renderStat('RÜTBE', stats.rank, 'trophy-outline')}
              </View>
              <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.05)', width: '100%' }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                {renderStat('TOPLAM PUAN', stats.totalPoints.toLocaleString(), 'star-outline')}
                {renderStat('GALİBİYET', stats.totalWins, 'medal-outline')}
              </View>
              <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.05)', width: '100%' }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                {renderStat('EN İYİ SERİ', `${stats.bestStreak} GÜN`, 'flame-outline')}
              </View>
            </View>
          ) : (
            <Text style={{ color: '#fff', textAlign: 'center' }}>Veri yüklenemedi.</Text>
          )}

          <TouchableOpacity
            style={[{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }, { height: verticalScale(50) }]}
            onPress={onClose}
          >
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 2 }}>KAPAT</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
};

