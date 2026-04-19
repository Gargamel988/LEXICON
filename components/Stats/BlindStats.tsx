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

export default function BlindStats({ accent, data }: Props) {
  const { moderateScale, wp } = useResponsive();

  if (!data) return null;

  const { advancedBlind } = data;

  const distData = advancedBlind?.guessDist?.map((count, index) => ({
    label: `${index + 1}.`,
    count
  })) || [];

  return (
    <View style={{ gap: 20 }}>
      {/* Mod başlığı */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 }}>
        <View>
          <Text style={{ color: '#fff', fontSize: moderateScale(24), fontWeight: '900', letterSpacing: 0.5 }}>Körleme</Text>
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(10), fontWeight: '700', marginTop: 2 }}>ZİHİNSEL ANALİTİK MERKEZİ</Text>
        </View>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
          <Text style={{ color: accent, fontSize: moderateScale(10), fontWeight: '900' }}>SENSOR_OFF_ENABLED</Text>
        </View>
      </View>

      {/* Performans Matrisi (3 Satır) */}
      <View style={{ gap: wp(3) }}>
        <View style={{ flexDirection: 'row', gap: wp(3) }}>
          <StatCard
            label="ÖNGÖRÜ SKORU"
            value={`${advancedBlind?.intelScore || 0}%`}
            accent={accent}
            icon="eye-off"
            info="Renkleri görmeden doğru harfleri bulma yeteneğin. Tahminlerin ne kadar tutarlıysa bu puan o kadar artar."
          />
          <StatCard
            label="KUSURSUZ ÇÖZÜM"
            value={advancedBlind?.perfectSaves || 0}
            accent="#4ade80"
            icon="ribbon"
            info="Körleme modunda, hiçbir renk ipucu almadan (ilk tahminde) bulduğun kelime sayısı."
          />
        </View>
        <View style={{ flexDirection: 'row', gap: wp(3) }}>
          <StatCard
            label="DENEME HIZI"
            value={`${advancedBlind?.avgGuessTime || 0}s`}
            accent="#fbbf24"
            icon="timer"
            info="Kelimeleri renk desteği olmadan ne kadar sürede çözdüğünün ortalaması."
          />
          <StatCard
            label="HARF BULMA"
            value={advancedBlind?.totalLettersFound || 0}
            accent="#818cf8"
            icon="text"
            info="Şimdiye kadar körleme modunda doğru yerini bulduğun toplam harf sayısı."
          />
        </View>
        <View style={{ flexDirection: 'row', gap: wp(3) }}>
          <StatCard
            label="DOĞRULUK"
            value={`${data.accuracy || 0}%`}
            accent="#f87171"
            icon="compass"
            info="Toplam tahminlerinin içindeki harf doğruluk oranı."
          />
          <StatCard
            label="DİL BİLGİSİ"
            value={(advancedBlind?.intelScore || 0) > 60 ? 'YÜKSEK' : 'NORMAL'}
            accent="rgba(255,255,255,0.4)"
            icon="book"
            info="Kelime dağarcığının körleme modundaki başarıya etkisi."
          />
        </View>
      </View>

      {/* Deneme Dağılım Grafiği */}
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 24,
        padding: moderateScale(20),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
      }}>
        <SectionLabel>Tahmin Dağılımı (Körleme)</SectionLabel>
        <MiniBarChart scores={advancedBlind?.guessDist || []} accent={accent} />
        <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(9), textAlign: 'center', marginTop: 12 }}>
          Kalıpları renk görmeden çözme sıklığınızı gösterir.
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
        <Ionicons name="infinite" size={moderateScale(120)} color={`${accent}05`} style={{ position: 'absolute', right: -20, bottom: -30 }} />
        <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(9), fontWeight: '800', letterSpacing: 2 }}>ZİHİNSEL DURUM</Text>
        <Text style={{ color: '#fff', fontSize: moderateScale(24), fontWeight: '900', marginTop: 4 }}>
          {(advancedBlind?.intelScore || 0) > 80 ? 'ÜSTÜN ALGI' : 'DERİN ODAK'}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: moderateScale(11), marginTop: 8, fontWeight: '600', lineHeight: 18, zIndex: 1 }}>
          Görünmez ipuçlarını zihninde birleştirerek rakiplerinin %{advancedBlind?.intelScore || 0} kadar üzerindesin.
        </Text>
      </View>
    </View>
  );
}
