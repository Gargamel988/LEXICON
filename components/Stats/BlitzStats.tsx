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

export default function BlitzStats({ accent, data }: Props) {
  const { moderateScale, wp } = useResponsive();

  if (!data) return null;

  return (
    <View style={{ gap: 20 }}>
      {/* Mod başlığı */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 }}>
        <View>
          <Text style={{ color: '#fff', fontSize: moderateScale(24), fontWeight: '900', letterSpacing: 0.5 }}>Blitz Mod</Text>
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(10), fontWeight: '700', marginTop: 2 }}>ZAMANA KARŞI YARIŞ</Text>
        </View>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
          <Text style={{ color: accent, fontSize: moderateScale(9), fontWeight: '900' }}>TIME_ATTACK_V2</Text>
        </View>
      </View>

      {/* 2x2 Stat Matrisi */}
      <View style={{ gap: wp(3) }}>
        <View style={{ flexDirection: 'row', gap: wp(3) }}>
          <StatCard
            label="KELİME REKORU"
            value={data.maxSolvedCount || 0}
            accent={accent}
            icon="flash"
            sub="En iyi seans"
          />
          <StatCard
            label="ZİRVE SKOR"
            value={(data.highScore || 0).toLocaleString('tr-TR')}
            accent="#4ade80"
            icon="star"
          />
        </View>
        <View style={{ flexDirection: 'row', gap: wp(3) }}>
          <StatCard
            label="ORTALAMA HIZ"
            value={`${data.avgTimePerWord || 0}s`}
            accent={accent}
            icon="timer"
            sub="Çözüm başına"
          />
          <StatCard
            label="TOPLAM DENEME"
            value={data.totalGames.toString()}
            accent={accent}
            icon="play"
          />
        </View>
      </View>

      {/* Rütbe Paneli (Yeni HUD Standartı) */}
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 24,
        padding: moderateScale(24),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: `${accent}40`,
        overflow: 'hidden',
        minHeight: moderateScale(120),
      }}>
        <View style={{ flex: 1, zIndex: 1 }}>
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(9), fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' }}>Hız Katmanı</Text>
          <Text style={{ color: '#fff', fontSize: moderateScale(24), fontWeight: '900', marginTop: 4 }}>
            {data.avgTimePerWord && data.avgTimePerWord < 15 ? 'IŞIK HIZI' : (data.avgTimePerWord && data.avgTimePerWord < 30 ? 'SERİ KATİL' : 'STABİL OPERATÖR')}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: moderateScale(11), marginTop: 8, fontWeight: '600', lineHeight: 18 }}>
            Ortalama <Text style={{ color: accent, fontWeight: '900' }}>{data.avgTimePerWord || 0}</Text> saniye reaksiyon hızı ile {"\n"}oyuncuların %{data.winRate > 50 ? '85' : '60'}'inden daha hızlısın.
          </Text>
        </View>
        <Ionicons name="trophy" size={moderateScale(120)} color={`${accent}08`} style={{ position: 'absolute', right: -20, bottom: -30 }} />
      </View>

      {/* Hız Analizi Grafiği */}
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 24,
        padding: moderateScale(20),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <SectionLabel>Volatilite Analizi</SectionLabel>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: accent }} />
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: moderateScale(10), fontWeight: '700' }}>SKOR TRENDİ</Text>
          </View>
        </View>
        <MiniBarChart scores={data.lastScores || []} accent={accent} />
      </View>
    </View>
  );
}
