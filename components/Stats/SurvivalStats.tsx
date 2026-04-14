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

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}s ${m}d`;
  if (m > 0) return `${m}d ${s}sn`;
  return `${s}sn`;
};

export default function SurvivalStats({ accent, data }: Props) {
  const { moderateScale, wp } = useResponsive();

  if (!data) return null;

  return (
    <View style={{ gap: 16 }}>
      {/* Mod başlığı */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontSize: moderateScale(22), fontWeight: '900', letterSpacing: 0.5 }}>Hayatta Kal</Text>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: moderateScale(8), fontWeight: '900', letterSpacing: 1 }}>SURVIVAL_PRO_V3</Text>
        </View>
      </View>

      {/* 2x2 Stat Matrisi */}
      <View style={{ gap: wp(2.5) }}>
        <View style={{ flexDirection: 'row', gap: wp(2.5) }}>
          <StatCard 
            label="Kelime Rekoru" 
            value={data.maxSolvedCount || 0} 
            accent={accent} 
            icon="trophy"
            sub="Tek seferde"
          />
          <StatCard 
            label="En Yüksek Puan" 
            value={(data.highScore || 0).toLocaleString('tr-TR')} 
            accent="#4ade80" 
            icon="star"
            sub="Puan rekoru"
          />
        </View>
        <View style={{ flexDirection: 'row', gap: wp(2.5) }}>
          <StatCard 
            label="Toplam Süre" 
            value={formatDuration(data.totalDuration || 0)} 
            accent={accent} 
            icon="time"
            sub="Aktif oyun süresi"
          />
          <StatCard 
            label="Ortalama Hız" 
            value={`${data.avgTimePerWord || 0}sn`} 
            accent={accent} 
            icon="speedometer"
            sub="Kelime hızı"
          />
        </View>
      </View>

      {/* Son 5 oyun */}
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 24,
        padding: moderateScale(20),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <SectionLabel>Performans Analizi</SectionLabel>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: accent }} />
            <Text style={{ color: accent, fontSize: moderateScale(10), fontWeight: '700' }}>Skor Trendi</Text>
          </View>
        </View>
        <MiniBarChart scores={data.lastScores || []} accent={accent} />
      </View>

      {/* Dayanıklılık Analizi */}
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
        <View style={{ flex: 1, zIndex: 1 }}>
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(9), fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' }}>Dayanıklılık Katmanı</Text>
          <Text style={{ color: '#fff', fontSize: moderateScale(24), fontWeight: '900', marginTop: 8 }}>
            {data.totalGames > 10 ? (data.winRate > 70 ? 'ELİT ÜSTÜ' : 'DENEYİMLİ') : 'YENİ BAŞLAYAN'}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: moderateScale(11), marginTop: 6, fontWeight: '600', lineHeight: 16 }}>
            {data.totalGames > 0 ? <Text style={{ color: accent }}>%{data.winRate}</Text> : ''} başarı oranı ile <Text style={{ color: accent }}>{data.totalGames}</Text> oyunu geride bıraktın. Dayanıklılığın test ediliyor.
          </Text>
        </View>
        <View style={{ position: 'absolute', right: -15, bottom: -15, opacity: 0.1 }}>
          <Ionicons name="pulse" size={moderateScale(120)} color={accent} />
        </View>
      </View>
    </View>
  );
}
