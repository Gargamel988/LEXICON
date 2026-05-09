import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown, Layout } from 'react-native-reanimated';
import { missionService, UserMission } from '../../services/missionService';
import { useAuth } from '../../hooks/useAuth';
import Colors from '../../constants/Colors';
import { COIN_COLOR, COIN_ICON } from '../../constants/ui';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

interface MissionsModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({ isVisible, onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');
  const [missions, setMissions] = useState<UserMission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isVisible && user) {
      loadMissions();
    }
  }, [isVisible, activeTab, user]);

  const loadMissions = async () => {
    if (!user) return;
    setLoading(true);
    const data = await missionService.getMissions(user.id, activeTab);
    setMissions(data);
    setLoading(false);
  };

  const handleClaim = async (missionId: string) => {
    if (!user) return;
    const result = await missionService.claimReward(user.id, missionId, activeTab);
    if (result.success) {
      Toast.show({
        type: 'success',
        text1: 'Ödül Alındı! 🎁',
        text2: `${result.coins} Altın ve ${result.xp} XP kazandın.`,
      });
      loadMissions();
    } else {
      Toast.show({
        type: 'error',
        text1: 'Hata',
        text2: result.error,
      });
    }
  };

  const renderMissionItem = ({ item, index }: { item: UserMission; index: number }) => {
    const rawProgress = (item.current_value || 0) / (item.goal || 1);
    const progress = isNaN(rawProgress) ? 0 : Math.min(rawProgress, 1);
    const isCompleted = item.is_completed;
    const isClaimed = item.is_claimed;
    
    return (
      <Animated.View 
        entering={FadeInUp.delay(index * 100)}
        layout={Layout.springify()}
        style={styles.missionCard}
      >
        <View style={[styles.cardContent, isCompleted && styles.completedCard]}>
          <View style={styles.missionHeader}>
            <View style={[styles.iconContainer, { backgroundColor: isCompleted ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255,255,255,0.05)' }]}>
              <Ionicons 
                name={isClaimed ? "checkmark-done" : isCompleted ? "gift" : "flag"} 
                size={22} 
                color={isCompleted ? Colors.correct.main : Colors.textSecondary} 
              />
            </View>
            <View style={styles.missionInfo}>
              <Text style={styles.missionTitle}>{item.title}</Text>
              <Text style={styles.missionDesc}>{item.description}</Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
              <Text style={styles.progressText}>
                {item.current_value} / {item.goal}
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <LinearGradient
                colors={[Colors.correct.main, Colors.correct.light || Colors.correct.main]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBarFill, { width: `${progress * 100}%` }]}
              />
            </View>
          </View>

          <View style={styles.rewardFooter}>
            <View style={styles.rewards}>
              <View style={styles.rewardItem}>
                <Ionicons name={COIN_ICON} size={14} color={COIN_COLOR} />
                <Text style={styles.rewardText}>{item.rewardCoins}</Text>
              </View>
              <View style={styles.rewardItem}>
                <Ionicons name="flash" size={14} color="#00D2FF" />
                <Text style={styles.rewardText}>{item.rewardXp} XP</Text>
              </View>
            </View>

            {isCompleted && !isClaimed ? (
              <TouchableOpacity 
                style={styles.claimButton}
                onPress={() => handleClaim(item.mission_id)}
              >
                <Text style={styles.claimButtonText}>Ödülü Al</Text>
              </TouchableOpacity>
            ) : isClaimed ? (
              <View style={styles.claimedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="rgba(255,255,255,0.3)" />
                <Text style={styles.claimedText}>Alındı</Text>
              </View>
            ) : null}
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        <Pressable style={styles.overlay} onPress={onClose} />
        
        <Animated.View 
          entering={FadeInDown.springify().damping(15)}
          style={styles.modalContent}
        >
          <View style={styles.handle} />
          
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Görev Merkezi</Text>
              <Text style={styles.subtitle}>Ekstra ödüller kazanmak için tamamla</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <BlurView intensity={20} tint="light" style={styles.closeBlur}>
                <Ionicons name="close" size={24} color="#fff" />
              </BlurView>
            </TouchableOpacity>
          </View>

          <View style={styles.tabContainer}>
            <Pressable 
              style={[styles.tab, activeTab === 'daily' && styles.activeTab]}
              onPress={() => setActiveTab('daily')}
            >
              <Ionicons name="calendar" size={18} color={activeTab === 'daily' ? '#fff' : Colors.textSecondary} />
              <Text style={[styles.tabText, activeTab === 'daily' && styles.activeTabText]}>Günlük</Text>
            </Pressable>
            <Pressable 
              style={[styles.tab, activeTab === 'weekly' && styles.activeTab]}
              onPress={() => setActiveTab('weekly')}
            >
              <Ionicons name="trophy" size={18} color={activeTab === 'weekly' ? '#fff' : Colors.textSecondary} />
              <Text style={[styles.tabText, activeTab === 'weekly' && styles.activeTabText]}>Haftalık</Text>
            </Pressable>
          </View>

          <View style={styles.contentContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.correct.main} />
                <Text style={styles.loadingText}>Görevler yükleniyor...</Text>
              </View>
            ) : (
              <FlatList
                data={missions}
                renderItem={renderMissionItem}
                keyExtractor={(item) => item.mission_id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="notifications-off-outline" size={64} color="rgba(255,255,255,0.1)" />
                    <Text style={styles.emptyText}>Şu an için aktif görev bulunmuyor.</Text>
                  </View>
                }
              />
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: height * 0.85,
    width: '100%',
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  closeButton: {
    overflow: 'hidden',
    borderRadius: 20,
  },
  closeBlur: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 6,
    marginHorizontal: 24,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: 8,
  },
  activeTab: {
    backgroundColor: Colors.correct.main,
    shadowColor: Colors.correct.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tabText: {
    color: Colors.textSecondary,
    fontWeight: '700',
    fontSize: 15,
  },
  activeTabText: {
    color: '#fff',
  },
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
    marginTop: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  missionCard: {
    marginBottom: 16,
    borderRadius: 24,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  cardContent: {
    padding: 20,
  },
  completedCard: {
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  missionDesc: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  progressPercent: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  progressText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  rewards: {
    flexDirection: 'row',
    gap: 8,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  rewardText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 6,
  },
  claimButton: {
    backgroundColor: Colors.correct.main,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: Colors.correct.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  claimButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  claimedText: {
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    fontSize: 15,
    fontWeight: '500',
  }
});

