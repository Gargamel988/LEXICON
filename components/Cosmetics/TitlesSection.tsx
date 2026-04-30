import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View, ScrollView } from 'react-native';
import { TITLES, getTitleStyle } from '../../constants/titles';
import { ACHIEVEMENTS } from '../../constants/achievements';
import { useResponsive } from '../../hooks/useResponsive';
import Colors from '../../constants/Colors';

interface TitlesSectionProps {
  ownedTitlesIds: string[];
}

export const TitlesSection: React.FC<TitlesSectionProps> = ({ ownedTitlesIds }) => {
  const { moderateScale, wp } = useResponsive();

  const getUnlockCondition = (titleId: string) => {
    const achievement = ACHIEVEMENTS.find(a => a.rewardTitleId === titleId);
    return achievement ? achievement.description : 'Özel etkinlik ödülü';
  };

  return (
    <View style={{ marginTop: 24, marginBottom: 32 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
        <Text style={{ color: '#fff', fontSize: moderateScale(18), fontWeight: '900', letterSpacing: 0.5 }}>Unvanlar</Text>
        <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: moderateScale(9), fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' }}>BAŞARIM ÖDÜLLERİ</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingRight: 20 }}
      >
        {TITLES.map((title) => {
          const isOwned = ownedTitlesIds.includes(title.id);
          const condition = getUnlockCondition(title.id);
          const titleStyle = getTitleStyle(title.id);

          return (
            <View
              key={title.id}
              style={{
                width: wp(65),
                backgroundColor: isOwned ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                borderRadius: 20,
                padding: 16,
                borderWidth: 1,
                borderColor: isOwned ? `${title.color}40` : 'rgba(255,255,255,0.08)',
                justifyContent: 'center',
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <View style={{ 
                  backgroundColor: `${title.color}15`, 
                  paddingHorizontal: 10, 
                  paddingVertical: 4, 
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: `${title.color}30`
                }}>
                  <Text style={{ 
                    color: title.color, 
                    fontSize: 10, 
                    fontWeight: '900', 
                    textTransform: 'uppercase' 
                  }}>
                    {title.tier}
                  </Text>
                </View>
                {isOwned && (
                  <Ionicons name="checkmark-circle" size={20} color={Colors.accent} />
                )}
              </View>

              <Text style={[{
                fontSize: moderateScale(18),
                fontWeight: '900',
                marginBottom: 6,
              }, titleStyle]}>
                {title.label}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="lock-open-outline" size={14} color="rgba(255,255,255,0.4)" />
                <Text style={{ 
                  color: 'rgba(255,255,255,0.5)', 
                  fontSize: moderateScale(11), 
                  fontWeight: '600',
                  flex: 1
                }}>
                  {isOwned ? 'Kilidi Açıldı' : condition}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};
