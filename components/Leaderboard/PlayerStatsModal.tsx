import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useQuery } from '@tanstack/react-query';
import Colors from '@/constants/Colors';
import { useResponsive } from '@/hooks/useResponsive';
import { statsService } from '@/services/statsService';

interface PlayerStatsModalProps {
  isVisible: boolean;
  onClose: () => void;
  userId: string | null;
  username: string;
  avatar_url?: string;
}

export const PlayerStatsModal = ({
  isVisible,
  onClose,
  userId,
  username,
  avatar_url,
}: PlayerStatsModalProps) => {
  const { scale, moderateScale, verticalScale } = useResponsive();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['playerStats', userId],
    queryFn: () => statsService.getAggregateStats(userId!),
    enabled: !!userId && isVisible,
  });

  const renderStat = (label: string, value: string | number, icon: keyof typeof Ionicons.glyphMap) => (
    <View style={styles.statItem}>
      <View style={[styles.iconContainer, { width: scale(40), height: scale(40), borderRadius: scale(12) }]}>
        <Ionicons name={icon} size={20} color={Colors.accent} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
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
      <BlurView intensity={30} tint="dark" style={styles.container}>
        <View style={[styles.content, { padding: moderateScale(24) }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={[styles.avatarContainer, { width: scale(50), height: scale(50), borderRadius: scale(15), overflow: 'hidden' }]}>
                {avatar_url?.startsWith('http') ? (
                  <Image source={{ uri: avatar_url }} style={{ width: '100%', height: '100%' }} />
                ) : avatar_url ? (
                  <Text style={{ fontSize: scale(24) }}>{avatar_url}</Text>
                ) : (
                   <Ionicons name="person" size={24} color={Colors.accent} />
                )}
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.username} numberOfLines={1}>{username.toUpperCase()}</Text>
                <Text style={styles.subtitle}>OYUNCU PROFİLİ</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={20} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={{ height: verticalScale(200), justifyContent: 'center' }}>
              <ActivityIndicator color={Colors.accent} size="large" />
            </View>
          ) : stats ? (
            <View style={styles.statsContainer}>
              <View style={styles.row}>
                {renderStat('SEVİYE', stats.level, 'ribbon-outline')}
                {renderStat('RÜTBE', stats.rank, 'trophy-outline')}
              </View>
              <View style={styles.separator} />
              <View style={styles.row}>
                {renderStat('TOPLAM PUAN', stats.totalPoints.toLocaleString(), 'star-outline')}
                {renderStat('GALİBİYET', stats.totalWins, 'medal-outline')}
              </View>
              <View style={styles.separator} />
              <View style={styles.row}>
                {renderStat('EN İYİ SERİ', `${stats.bestStreak} GÜN`, 'flame-outline')}
              </View>
            </View>
          ) : (
            <Text style={{ color: '#fff', textAlign: 'center' }}>Veri yüklenemedi.</Text>
          )}

          <TouchableOpacity
            style={[styles.doneButton, { height: verticalScale(50) }]}
            onPress={onClose}
          >
            <Text style={styles.doneButtonText}>KAPAT</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  content: {
    width: '85%',
    backgroundColor: '#15151b',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  username: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  subtitle: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  statsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  statValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    width: '100%',
  },
  doneButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
