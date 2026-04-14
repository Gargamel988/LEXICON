import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import DistributionBar from './DistributionBar';
import StatCard from './StatCard';

import { StatsSummary } from '../../services/statsService';

interface Props {
  accent: string;
  data?: StatsSummary;
}

function SectionLabel({ children }: { children: string }) {
  const { moderateScale } = useResponsive();
  return (
    <Text style={{
      color: 'rgba(255,255,255,0.3)',
      fontSize: moderateScale(10),
      fontWeight: '800',
      letterSpacing: 2,
      textTransform: 'uppercase',
      marginBottom: 12,
    }}>
      {children}
    </Text>
  );
}

export default function ClassicStats({ accent, data }: Props) {
  const { moderateScale, wp } = useResponsive();

  if (!data) return null;

  return (
    <View style={{ gap: 20 }}>
      {/* Mod başlığı */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 }}>
        <View>
          <Text style={{ color: '#fff', fontSize: moderateScale(24), fontWeight: '900', letterSpacing: 0.5 }}>Klasik Mod</Text>
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(10), fontWeight: '700', marginTop: 2 }}>GENEL PERFORMANS</Text>
        </View>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
          <Text style={{ color: accent, fontSize: moderateScale(10), fontWeight: '900' }}>STANDART_X</Text>
        </View>
      </View>

      {/* Ana Özet Kartı */}
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 24,
        padding: moderateScale(24),
        borderWidth: 1,
        borderColor: `${accent}30`,
        overflow: 'hidden',
      }}>
        <View style={{ zIndex: 1 }}>
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(10), fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' }}>Toplam Oyun</Text>
          <Text style={{ color: accent, fontSize: moderateScale(48), fontWeight: '900', marginTop: 4, fontVariant: ['tabular-nums'] }}>
            {data.totalGames.toLocaleString('tr-TR')}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <Ionicons name="trending-up-outline" size={moderateScale(14)} color="#4ade80" />
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: moderateScale(12), fontWeight: '600' }}>
              İstikrarlı gelişim gösteriyorsun
            </Text>
          </View>
        </View>
        <Ionicons name="game-controller" size={moderateScale(120)} color={`${accent}08`} style={{ position: 'absolute', right: -20, bottom: -30 }} />
      </View>

      {/* İkili stat */}
      <View style={{ flexDirection: 'row', gap: wp(3) }}>
        <StatCard label="BAŞARI ORANI" value={`%${data.winRate}`} sub="Galibiyet yüzdesi" accent={accent} icon="trophy-outline" />
        <StatCard label="ORT. DENEME" value={data.avgAttempts || 0} sub="Kazanılan turlar" accent={accent} icon="stats-chart-outline" />
      </View>

      {/* Analiz Paneli */}
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 24,
        padding: moderateScale(20),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}>
        <View style={{ flex: 1, zIndex: 1 }}>
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(9), fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' }}>Ustalık Katmanı</Text>
          <Text style={{ color: '#fff', fontSize: moderateScale(22), fontWeight: '900', marginTop: 4 }}>
            {data.winRate > 90 ? 'KELİME ÜSTADI' : (data.winRate > 70 ? 'DENEYİMLİ' : 'GELİŞMEKTE')}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: moderateScale(11), marginTop: 6, fontWeight: '600', lineHeight: 16 }}>
            En uzun serin <Text style={{ color: accent, fontWeight: '900' }}>{data.bestStreak}</Text> kelimeye ulaştı. {"\n"}Sözlük kapasiten %85'in üzerinde.
          </Text>
        </View>
        <Ionicons name="ribbon" size={moderateScale(100)} color={`${accent}10`} style={{ position: 'absolute', right: -20, bottom: -20 }} />
      </View>

      {/* Dağılım grafiği */}
      <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: moderateScale(20), borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <SectionLabel>Tahmin Dağılımı</SectionLabel>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
            <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(9), fontWeight: '800' }}>1-6 DENEME</Text>
          </View>
        </View>
        <DistributionBar dist={data.distribution} accent={accent} />
      </View>

      {/* Kategoriler */}
      <View>
        <View style={{ paddingHorizontal: 4, marginBottom: 12 }}>
          <SectionLabel>Dominant Kategoriler</SectionLabel>
        </View>
        {data.topCategories && data.topCategories.length > 0 ? (
          <View style={{ gap: 12 }}>
            {data.topCategories.map((cat, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  borderRadius: 20,
                  padding: moderateScale(16),
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderWidth: 1,
                  borderColor: index === 0 ? `${accent}30` : 'rgba(255,255,255,0.06)',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <View style={{
                    width: moderateScale(42),
                    height: moderateScale(42),
                    borderRadius: 14,
                    backgroundColor: index === 0 ? `${accent}20` : 'rgba(255,255,255,0.05)',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <Ionicons name={cat.icon as any} size={moderateScale(22)} color={index === 0 ? accent : 'rgba(255,255,255,0.4)'} />
                  </View>
                  <View>
                    <Text style={{ color: '#fff', fontSize: moderateScale(15), fontWeight: '800', textTransform: 'capitalize' }}>
                      {cat.name}
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(10), fontWeight: '700', marginTop: 2 }}>
                      {index === 0 ? 'EN GÜÇLÜ ALAN' : 'YÜKSEK BAŞARI'}
                    </Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: index === 0 ? accent : '#fff', fontSize: moderateScale(20), fontWeight: '900' }}>
                    {cat.wins}
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: moderateScale(9), fontWeight: '800', textTransform: 'uppercase' }}>
                    GALİBİYET
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.02)',
            borderRadius: 24,
            padding: 32,
            alignItems: 'center',
            borderStyle: 'dashed',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)'
          }}>
            <Ionicons name="medal-outline" size={moderateScale(40)} color="rgba(255,255,255,0.1)" style={{ marginBottom: 12 }} />
            <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(13), fontWeight: '600', textAlign: 'center', lineHeight: 20 }}>
              Henüz yeterli veri toplanmadı.{"\n"}Oyun kazandıkça analizlerin burada belirecek.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

