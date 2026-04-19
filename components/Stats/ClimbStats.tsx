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

  const { advancedClimb } = data;

  return (
    <View style={{ gap: 20 }}>
      {/* Mod başlığı */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 }}>
        <View>
          <Text style={{ color: '#fff', fontSize: moderateScale(24), fontWeight: '900', letterSpacing: 0.5 }}>Tırmanış</Text>
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(10), fontWeight: '700', marginTop: 2 }}>ZİRVE ANALİTİK MERKEZİ</Text>
        </View>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
          <Text style={{ color: accent, fontSize: moderateScale(10), fontWeight: '900' }}>ASCEND_V3_ACTIVE</Text>
        </View>
      </View>

      {/* Performans Matrisi (3 Satır) */}
      <View style={{ gap: wp(3) }}>
        <View style={{ flexDirection: 'row', gap: wp(3) }}>
          <StatCard
            label="ZİRVE KAT"
            value={advancedClimb?.highestLevel || 0}
            accent={accent}
            icon="trending-up"
            info="Tek bir tırmanış denemesinde ulaştığın rekor seviye."
          />
          <StatCard
            label="ORTALAMA KAT"
            value={advancedClimb?.avgLevel || 0}
            accent="#4ade80"
            icon="analytics"
            info="Tüm tırmanış oyunlarının genel seviye ortalaması."
          />
        </View>
        <View style={{ flexDirection: 'row', gap: wp(3) }}>
          <StatCard
            label="TOPLAM KAT"
            value={advancedClimb?.totalLevelsClimbed || 0}
            accent="#fbbf24"
            icon="medal"
            info="Kariyerin boyunca tırmandığın toplam kat/seviye miktarı."
          />
          <StatCard
            label="DİKKAT / HIZ"
            value={`${advancedClimb?.efficiency || 0} L/m`}
            accent="#818cf8"
            icon="flash"
            info="Dakikadaki seviye atlama hızın. Ne kadar odaklıysan o kadar yüksek olur."
          />
        </View>
        <View style={{ flexDirection: 'row', gap: wp(3) }}>
          <StatCard
            label="BAŞARI ORANI"
            value={`${advancedClimb?.levelWinRate || 0}%`}
            accent="#f87171"
            icon="trophy"
            info="Başladığın tırmanışlarda en az bir seviye geçme oranını gösterir."
          />
          <StatCard
            label="TOPLAM SEANS"
            value={data.totalGames.toString()}
            accent="rgba(255,255,255,0.4)"
            icon="play"
            info="Tırmanış modunda çıkılan toplam sefer sayısı."
          />
        </View>
      </View>

      {/* İlerleme Grafiği */}
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 24,
        padding: moderateScale(20),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
      }}>
        <SectionLabel>Tırmanma Trendi</SectionLabel>
        <MiniBarChart scores={data.lastScores || []} accent={accent} />
        <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(9), textAlign: 'center', marginTop: 12 }}>
          Son 5 tırmanıştaki performans değişimleriniz.
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
        <Ionicons name="trending-up" size={moderateScale(120)} color={`${accent}05`} style={{ position: 'absolute', right: -20, bottom: -30 }} />
        <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(9), fontWeight: '800', letterSpacing: 2 }}>MEVCUT DURUM</Text>
        <Text style={{ color: '#fff', fontSize: moderateScale(24), fontWeight: '900', marginTop: 4 }}>
          {(advancedClimb?.highestLevel || 0) > 20 ? 'ZİRVE EFENDİSİ' : 'GEZGİN DAĞCI'}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: moderateScale(11), marginTop: 8, fontWeight: '600', lineHeight: 18, zIndex: 1 }}>
          Dakikada <Text style={{ color: accent, fontWeight: '900' }}>{advancedClimb?.efficiency || 0}</Text> kat hızıyla bulutların üzerindesin.
        </Text>
      </View>
    </View>
  );
}
