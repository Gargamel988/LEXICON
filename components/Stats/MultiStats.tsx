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

export default function MultiStats({ accent, data }: Props) {
  const { moderateScale, wp } = useResponsive();

  if (!data) return null;

  const { advancedMulti } = data;
  const highScore = data.highScore || 0;
  const avgScore = data.avgScore || 0;
  const lastScores = data.lastScores || [];

  return (
    <View style={{ gap: 20 }}>
      {/* Mod başlığı */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 }}>
        <View>
          <Text style={{ color: '#fff', fontSize: moderateScale(24), fontWeight: '900', letterSpacing: 0.5 }}>Çoklu Mod</Text>
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(10), fontWeight: '700', marginTop: 2 }}>PARALELİZM ANALİZ MERKEZİ</Text>
        </View>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
          <Text style={{ color: accent, fontSize: moderateScale(10), fontWeight: '900' }}>MULTI_CORE_ON</Text>
        </View>
      </View>

      {/* Puan İstatistikleri */}
      <View style={{ gap: wp(3) }}>
        <View style={{ flexDirection: 'row', gap: wp(3) }}>
          <StatCard
            label="EN YÜKSEK PUAN"
            value={highScore.toLocaleString()}
            accent={accent}
            icon="trophy"
            info="Tek bir Çoklu Mod seansında kazandığın en yüksek puan."
          />
          <StatCard
            label="ORTALAMA PUAN"
            value={avgScore.toLocaleString()}
            accent="#4ade80"
            icon="analytics"
            info="Tüm Çoklu Mod seanslarının puan ortalaması."
          />
        </View>
        <View style={{ flexDirection: 'row', gap: wp(3) }}>
          <StatCard
            label="TOPLAM SEANS"
            value={data.totalGames}
            accent="#fbbf24"
            icon="layers"
            info="Çoklu Modda oynanan toplam oyun sayısı."
          />
          <StatCard
            label="WIN RATE"
            value={`${data.winRate || 0}%`}
            accent="#f87171"
            icon="checkmark-circle"
            info="Tüm seanslar içindeki genel başarı oranı."
          />
        </View>
      </View>

      {/* Detaylı Analiz Kartları */}
      <View style={{ gap: wp(3) }}>
        <View style={{ flexDirection: 'row', gap: wp(3) }}>
          <StatCard
            label="ODAK SKORU"
            value={`${advancedMulti?.multiTaskScore || 0}%`}
            accent="#818cf8"
            icon="git-merge"
            info="Aynı anda birden fazla kelimeye odaklanma ve bitirme başarısı."
          />
          <StatCard
            label="SET SÜRESİ"
            value={`${advancedMulti?.avgSetTime || 0}s`}
            accent="rgba(255,255,255,0.4)"
            icon="time"
            info="Tüm kelimeleri bitirme sürenin ortalaması (saniye)."
          />
        </View>
        <View style={{ flexDirection: 'row', gap: wp(3) }}>
          <StatCard
            label="TAMAMLANAN"
            value={advancedMulti?.totalSetsCompleted || 0}
            accent="#4ade80"
            icon="documents"
            info="Başarıyla tamamlanan toplam Çoklu Mod seti."
          />
          <StatCard
            label="PARALEL HIZ"
            value={`${advancedMulti?.parallelEfficiency || 0}s/k`}
            accent="#fbbf24"
            icon="flash"
            info="Çoklu modda kelime başına düşen ortalama süre (saniye)."
          />
        </View>
      </View>

      {/* Puan Trendi Grafiği */}
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 24,
        padding: moderateScale(20),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
      }}>
        <SectionLabel>Son 5 Seansın Puan Trendi</SectionLabel>
        <MiniBarChart scores={lastScores} accent={accent} />
        <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(9), textAlign: 'center', marginTop: 12 }}>
          Son 5 Çoklu Mod seansındaki puan değişimi.
        </Text>
      </View>

      {/* Hero Kartı */}
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 24,
        padding: moderateScale(24),
        borderWidth: 1,
        borderColor: `${accent}30`,
        overflow: 'hidden',
      }}>
        <Ionicons name="apps" size={moderateScale(120)} color={`${accent}05`} style={{ position: 'absolute', right: -20, bottom: -30 }} />
        <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(9), fontWeight: '800', letterSpacing: 2 }}>ZİHİNSEL İŞLEMCİ</Text>
        <Text style={{ color: '#fff', fontSize: moderateScale(24), fontWeight: '900', marginTop: 4 }}>
          {highScore > 1000 ? 'MULTI-CORE PRO' : highScore > 500 ? 'PARALEL UZMAN' : 'SINGLE-CORE'}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: moderateScale(11), marginTop: 8, fontWeight: '600', lineHeight: 18, zIndex: 1 }}>
          En yüksek sefer <Text style={{ color: accent, fontWeight: '900' }}>{highScore.toLocaleString()} puan</Text> kazandın.
          Ortalama <Text style={{ color: '#4ade80', fontWeight: '900' }}>{avgScore.toLocaleString()} puan</Text> seviyedesin.
        </Text>
      </View>
    </View>
  );
}
