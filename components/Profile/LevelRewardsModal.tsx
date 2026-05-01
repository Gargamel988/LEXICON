import React from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../constants/Colors';
import { useResponsive } from '../../hooks/useResponsive';
import { COIN_COLOR, COIN_ICON } from '../../constants/ui';
import { TITLE_LABELS } from '../../constants/levels';

interface LevelRewardsModalProps {
  isVisible: boolean;
  onClose: () => void;
  currentLevel: number;
}

export const LevelRewardsModal = ({ isVisible, onClose, currentLevel }: LevelRewardsModalProps) => {
  const { moderateScale, hp, wp } = useResponsive();


  const getRewardsForLevel = (level: number) => {
    const rewards = [];
    // Elmas ödülü (level * 10)
    rewards.push({ type: 'coins', amount: level * 10, label: 'Elmas' });
    
    // Her 5 seviyede bir Takviye Paketi
    if (level % 5 === 0) {
      rewards.push({ type: 'powerup', label: 'Takviye Paketi (2x İpucu, Geri Al, Temizle)' });
    }

    // Unvan ödülleri
    if (TITLE_LABELS[level]) {
      rewards.push({ type: 'title', label: `Unvan: ${TITLE_LABELS[level]}` });
    }
    
    return rewards;
  };

  const levels = Array.from({ length: 50 }, (_, i) => i + 1);

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <BlurView intensity={30} tint="dark" style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }}>
        <Pressable onPress={onClose} style={{ position: 'absolute', width: '100%', height: '100%' }} />
        <View style={{
          width: wp(90),
          height: hp(70),
          backgroundColor: '#15151b',
          borderRadius: moderateScale(28),
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)',
          padding: moderateScale(24),
          overflow: 'hidden'
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: moderateScale(20) }}>
            <View>
              <Text style={{ color: '#fff', fontSize: moderateScale(22), fontWeight: '900' }}>Seviye Ödülleri</Text>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: moderateScale(12), fontWeight: '600' }}>Her seviye atladığında kazanacakların</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <Ionicons name="close" size={moderateScale(28)} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            {levels.map((lvl) => {
              const isUnlocked = lvl <= currentLevel;
              const rewards = getRewardsForLevel(lvl);
              const isSpecial = lvl % 5 === 0;

              return (
                <View 
                  key={lvl}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: isUnlocked ? 'rgba(99, 153, 34, 0.05)' : 'rgba(255,255,255,0.02)',
                    borderRadius: 20,
                    padding: moderateScale(16),
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: isUnlocked ? 'rgba(99, 153, 34, 0.2)' : 'rgba(255,255,255,0.05)',
                  }}
                >
                  <View style={{
                    width: moderateScale(44),
                    height: moderateScale(44),
                    borderRadius: 14,
                    backgroundColor: isUnlocked ? Colors.correct.main : '#333',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 16
                  }}>
                    <Text style={{ color: isUnlocked ? '#fff' : '#888', fontSize: moderateScale(16), fontWeight: '900' }}>{lvl}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    {rewards.map((reward, idx) => (
                      <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: idx > 0 ? 4 : 0 }}>
                        <Ionicons 
                          name={reward.type === 'coins' ? COIN_ICON : reward.type === 'title' ? 'ribbon' : 'gift'} 
                          size={14} 
                          color={reward.type === 'coins' ? COIN_COLOR : reward.type === 'title' ? '#60A5FA' : Colors.accent} 
                        />
                        <Text style={{ 
                          color: isUnlocked ? '#fff' : 'rgba(255,255,255,0.4)', 
                          fontSize: moderateScale(13), 
                          fontWeight: '700' 
                        }}>
                          {reward.type === 'coins' ? `${reward.amount} ${reward.label}` : reward.label}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {isSpecial && (
                    <View style={{
                      backgroundColor: 'rgba(255,215,0,0.1)',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: 'rgba(255,215,0,0.2)'
                    }}>
                      <Text style={{ color: '#FFD700', fontSize: 9, fontWeight: '900' }}>ÖZEL</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            onPress={onClose}
            style={{
              marginTop: 10,
              backgroundColor: '#fff',
              height: moderateScale(50),
              borderRadius: 16,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Text style={{ color: '#000', fontWeight: '900', letterSpacing: 1 }}>KAPAT</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
};
