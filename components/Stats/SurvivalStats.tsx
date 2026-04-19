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

export default function SurvivalStats({ accent, data }: Props) {
  const { moderateScale, wp } = useResponsive();

  if (!data) return null;

  const { advancedSurvival } = data;

  return (
    <View style={{ gap: 20 }}>
      {/* Mod başlığı */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 }}>
        <View>
          <Text style={{ color: '#fff', fontSize: moderateScale(24), fontWeight: '900', letterSpacing: 0.5 }}>Hayatta Kalma</Text>
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(10), fontWeight: '700', marginTop: 2 }}>DAYANIKLILIK İZLEME MERKEZİ</Text>
        </View>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
          <Text style={{ color: accent, fontSize: moderateScale(10), fontWeight: '900' }}>VITAL_SIGNS_STABLE</Text>
        </View>
      </View>

      {/* Performans Matrisi (3 Satır) */}
      <View style={{ gap: wp(3) }}>
        <View style={{ flexDirection: 'row', gap: wp(3) }}>
          <StatCard
            label="DAYANIKLILIK"
            value={`${advancedSurvival?.enduranceScore || 0}%`}
            accent={accent}
            icon="heart"
            info="Ortalama çözüm performansına dayalı genel direnç puanın."
          />
          <StatCard
            label="ZİRVE SERİ"
            value={data.maxSolvedCount || 0}
            accent="#4ade80"
            icon="flame"
            info="Tek bir seferde elenmeden çözdüğün rekor kelime sayısı."
          />
        </View>
        <View style={{ flexDirection: 'row', gap: wp(3) }}>
          <StatCard
            label="ORT. ÖMÜR"
            value={`${advancedSurvival?.avgSurvivalTime || 0}s`}
            accent="#fbbf24"
            icon="infinite"
            info="Seans başına hayatta kalabildiğin ortalama süre."
          />
          <StatCard
            label="TOTAL KURTARMA"
            value={advancedSurvival?.totalSolved || 0}
            accent="#818cf8"
            icon="medical"
            info="Tüm oyunlarında zamana karşı yenilmeyen toplam kelime sayısı."
          />
        </View>
        <View style={{ flexDirection: 'row', gap: wp(3) }}>
          <StatCard
            label="EFSANE SEANS"
            value={advancedSurvival?.milestoneReaches || 0}
            accent="#f87171"
            icon="skull"
            info="10+ kelime barajını aştığın toplam seans sayısı."
          />
          <StatCard
            label="DİRENİŞ ORANI"
            value={`${advancedSurvival?.survivalRate || 0}%`}
            accent="rgba(255,255,255,0.4)"
            icon="analytics"
            info="Ciddi direnç gösterdiğin oyunların genel yüzdesi."
          />
        </View>
      </View>

      {/* Akış Grafiği */}
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 24,
        padding: moderateScale(20),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
      }}>
        <SectionLabel>Hayatta Kalma Trendi</SectionLabel>
        <MiniBarChart scores={data.lastScores || []} accent={accent} />
        <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(9), textAlign: 'center', marginTop: 12 }}>
          Son 5 seanstaki elenme öncesi performansınız.
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
        <Ionicons name="shield-checkmark" size={moderateScale(120)} color={`${accent}05`} style={{ position: 'absolute', right: -20, bottom: -30 }} />
        <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(9), fontWeight: '800', letterSpacing: 2 }}>DURUM RAPORU</Text>
        <Text style={{ color: '#fff', fontSize: moderateScale(24), fontWeight: '900', marginTop: 4 }}>
          {(advancedSurvival?.enduranceScore || 0) > 75 ? 'ÖLÜMSÜZ' : 'DİRENİŞÇİ'}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: moderateScale(11), marginTop: 8, fontWeight: '600', lineHeight: 18, zIndex: 1 }}>
          Zaman senin için akmıyor, adeta duruyor. <Text style={{ color: accent, fontWeight: '900' }}>%{advancedSurvival?.enduranceScore || 0}</Text> direnç puanı ile zirvedesin.
        </Text>
      </View>
    </View>
  );
}
