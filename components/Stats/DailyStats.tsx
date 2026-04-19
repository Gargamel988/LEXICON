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

export default function DailyStats({ accent, data }: Props) {
  const { moderateScale, wp } = useResponsive();

  if (!data) return null;

  return (
    <View style={{ gap: 16 }}>
      {/* Mod başlığı */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontSize: moderateScale(22), fontWeight: '900', letterSpacing: 0.5 }}>Günlük Mod</Text>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: moderateScale(8), fontWeight: '900', letterSpacing: 1 }}>VERİ SENKRONİZE</Text>
        </View>
      </View>

      {/* Seri hero kart */}
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 24,
        padding: moderateScale(22),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: `${accent}30`,
        overflow: 'hidden',
      }}>
        <View style={{ zIndex: 1 }}>
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(10), fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' }}>Mevcut Seri</Text>
          <Text style={{ color: accent, fontSize: moderateScale(52), fontWeight: '900', marginTop: 4 }}>{data.streak} 🔥</Text>
        </View>
        <View style={{ alignItems: 'flex-end', zIndex: 1 }}>
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(9), fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 }}>Zirve Seri</Text>
          <Text style={{ color: '#fff', fontSize: moderateScale(32), fontWeight: '900' }}>{data.bestStreak}</Text>
        </View>
        <View style={{ position: 'absolute', left: -10, opacity: 0.05 }}>
           <Ionicons name="flame" size={moderateScale(100)} color={accent} />
        </View>
      </View>

      {/* 3'lü stat */}
      <View style={{ flexDirection: 'row', gap: wp(2.5) }}>
        <StatCard 
          label="Gün" 
          value={data.totalGames.toString()} 
          accent={accent} 
          icon="calendar"
          sub="Toplam katılım"
        />
        <StatCard 
          label="Başarı Oranı" 
          value={`%${data.winRate}`} 
          accent="#4ade80" 
          icon="stats-chart"
          sub="Galibiyet yüzdesi"
        />
        <StatCard 
          label="Tahmin" 
          value={data.avgAttempts || 0} 
          accent={accent} 
          icon="help-circle"
          sub="Ort. deneme"
        />
      </View>

      {/* Dağılım grafiği */}
      <View style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 24, padding: moderateScale(20), borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
        <SectionLabel>Deneme Dağılımı</SectionLabel>
        <DistributionBar dist={data.distribution} accent={accent} />
      </View>

      {/* Bugünkü sıralama */}
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 24,
        padding: moderateScale(22),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
      }}>
        <View style={{ flex: 1, zIndex: 1 }}>
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(10), fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' }}>Global Sıralama</Text>
          <Text style={{ color: '#fff', fontSize: moderateScale(44), fontWeight: '900', marginTop: 4 }}>
            #{data.rank || '--'}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(11), marginTop: 6, fontWeight: '600', lineHeight: 16 }}>
            {data.rank 
              ? `${data.totalPlayers || 0} oyuncu arasında ${data.rank}. sıradasın. Harika gidiyorsun!`
              : "Global sıralama sisteminde yer almak için en az bir oyun bitirmelisin!"}
          </Text>
        </View>
        <View style={{ position: 'absolute', right: -15, bottom: -15, opacity: 0.1 }}>
          <Ionicons name="earth" size={moderateScale(120)} color={accent} />
        </View>
      </View>

      {/* Gelişmiş İstatistikler (1, 3, 4, 6) */}
      {data.advancedDaily && (
        <>
          <SectionLabel>Gelişmiş Analizler</SectionLabel>
          
          <View style={{ gap: 12 }}>
            {/* 1 & 4: Percentile & Community Comparison */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ 
                flex: 1, 
                backgroundColor: 'rgba(255,255,255,0.03)', 
                padding: moderateScale(16), 
                borderRadius: 20,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.05)'
              }}>
                <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(9), fontWeight: '800', marginBottom: 8 }}>DÜNYA SIRALAMASI</Text>
                <Text style={{ color: accent, fontSize: moderateScale(22), fontWeight: '900' }}>
                  İlk %{Math.max(1, 100 - data.advancedDaily.percentile)}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: moderateScale(10), marginTop: 4 }}>Tüm zamanlar verisi</Text>
              </View>

              <View style={{ 
                flex: 1, 
                backgroundColor: 'rgba(255,255,255,0.03)', 
                padding: moderateScale(16), 
                borderRadius: 20,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.05)'
              }}>
                <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(9), fontWeight: '800', marginBottom: 8 }}>TOPLULUK ORT.</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                  <Text style={{ color: '#fff', fontSize: moderateScale(22), fontWeight: '900' }}>{data.advancedDaily.communityAvgAttempts}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: moderateScale(10) }}>deneme</Text>
                </View>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: moderateScale(10), marginTop: 4 }}>Günlük ortalama</Text>
              </View>
            </View>

            {/* 3: Solving Time Distribution */}
            <View style={{ 
              backgroundColor: 'rgba(255,255,255,0.03)', 
              padding: moderateScale(16), 
              borderRadius: 20,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.05)'
            }}>
              <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(9), fontWeight: '800', marginBottom: 12 }}>ÇÖZME SÜRESİ DAĞILIMI</Text>
              <View style={{ gap: 10 }}>
                {data.advancedDaily.solveTimeDist.map((dist, idx) => {
                  const maxCount = Math.max(...data.advancedDaily!.solveTimeDist.map(d => d.count), 1);
                  const barWidth = `${(dist.count / maxCount) * 100}%`;
                  return (
                    <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: moderateScale(10), width: 45 }}>{dist.label}</Text>
                      <View style={{ flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                        <View style={{ width: barWidth as any, height: '100%', backgroundColor: accent, borderRadius: 4 }} />
                      </View>
                      <Text style={{ color: '#fff', fontSize: moderateScale(10), fontWeight: '700', width: 20 }}>{dist.count}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* 6: Vocabulary Analysis */}
            {data.advancedDaily.vocabularyAnalysis?.bestCategory && (
              <View style={{ 
                backgroundColor: `${accent}10`, 
                padding: moderateScale(16), 
                borderRadius: 20,
                borderWidth: 1,
                borderColor: `${accent}20`,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12
              }}>
                <View style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: 12, 
                  backgroundColor: `${accent}20`, 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }}>
                  <Text style={{ color: accent, fontSize: 18, fontWeight: '900' }}>
                    {data.advancedDaily.vocabularyAnalysis.bestCategory.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fff', fontSize: moderateScale(12), fontWeight: '700', marginBottom: 2 }}>Kategori Analizi</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: moderateScale(10), lineHeight: 14 }}>
                    "<Text style={{ color: accent, fontWeight: '800' }}>{data.advancedDaily.vocabularyAnalysis.bestCategory.name}</Text>" kategorisindeki kelimeleri çözme hızın top %10 içerisinde!
                  </Text>
                </View>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
}
