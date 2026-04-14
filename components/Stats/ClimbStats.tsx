import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { StatsSummary } from '../../services/statsService';
import MiniBarChart from './MiniBarChart';
import StatCard from './StatCard';

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

export default function ClimbStats({ accent, data }: Props) {
  const { moderateScale, wp } = useResponsive();

  if (!data) return null;

  return (
    <View style={{ gap: 20 }}>
      {/* Mod başlığı */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 }}>
        <View>
          <Text style={{ color: '#fff', fontSize: moderateScale(24), fontWeight: '900', letterSpacing: 0.5 }}>Tırmanış</Text>
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(10), fontWeight: '700', marginTop: 2 }}>ZİRVE YOLCULUĞU</Text>
        </View>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
          <Text style={{ color: accent, fontSize: moderateScale(10), fontWeight: '900' }}>RANK_PROGRESS_V1</Text>
        </View>
      </View>

      {/* 2x2 Stat Matrisi */}
      <View style={{ gap: wp(3) }}>
        <View style={{ flexDirection: 'row', gap: wp(3) }}>
          <StatCard label="ZİRVE SKOR" value={(data.highScore || 0).toLocaleString('tr-TR')} accent={accent} icon="ribbon" />
          <StatCard label="EN YÜKSEK TUR" value={data.maxSolvedCount || 0} accent="#4ade80" icon="trending-up" />
        </View>
        <View style={{ flexDirection: 'row', gap: wp(3) }}>
          <StatCard label="ORTALAMA SKOR" value={(data.avgScore || 0).toLocaleString('tr-TR')} accent={accent} icon="analytics" />
          <StatCard label="TOPLAM SEANS" value={data.totalGames.toString()} accent={accent} icon="play" />
        </View>
      </View>

      {/* Analiz Grafiği */}
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 24,
        padding: moderateScale(20),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <SectionLabel>Tırmanma Trendi</SectionLabel>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: accent }} />
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: moderateScale(10), fontWeight: '700' }}>İLERLEME ANALİZİ</Text>
          </View>
        </View>
        <MiniBarChart scores={data.lastScores || []} accent={accent} />
      </View>

      {/* Hero Analiz Paneli */}
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 24,
        padding: moderateScale(24),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: `${accent}30`,
        overflow: 'hidden',
        minHeight: moderateScale(110),
      }}>
        <View style={{ flex: 1, zIndex: 1 }}>
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(9), fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' }}>Zirve Katmanı</Text>
          <Text style={{ color: '#fff', fontSize: moderateScale(24), fontWeight: '900', marginTop: 4 }}>
            #-- GLOBAL
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: moderateScale(11), marginTop: 8, fontWeight: '600', lineHeight: 18 }}>
            Tırmanış modunda global sıralama ve rütbe ödülleri {"\n"}yakında tüm kullanıcılar için açılacak. Zirveye hazır ol!
          </Text>
        </View>
        <Ionicons name="trending-up" size={moderateScale(120)} color={`${accent}08`} style={{ position: 'absolute', right: -20, bottom: -30 }} />
      </View>
    </View>
  );
}
