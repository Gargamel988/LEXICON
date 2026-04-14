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

  return (
    <View style={{ gap: 16 }}>
      {/* Mod başlığı */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontSize: moderateScale(22), fontWeight: '900', letterSpacing: 0.5 }}>Kör Mod</Text>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: moderateScale(8), fontWeight: '900', letterSpacing: 1 }}>SENSORY_OFF_V2</Text>
        </View>
      </View>

      {/* 2x2 Stat Matrisi */}
      <View style={{ gap: wp(2.5) }}>
        <View style={{ flexDirection: 'row', gap: wp(2.5) }}>
          <StatCard
            label="Kazanma Oranı"
            value={`%${data.winRate || 0}`}
            accent="#FFD54F"
            icon="checkmark-circle"
            sub="Başarı yüzdesi"
          />
          <StatCard
            label="En Yüksek Puan"
            value={(data.highScore || 0).toLocaleString('tr-TR')}
            accent={accent}
            icon="trophy"
            sub="Tüm zamanlar"
          />
        </View>
        <View style={{ flexDirection: 'row', gap: wp(2.5) }}>
          <StatCard
            label="İsabet"
            value={`%${data.accuracy || 0}`}
            accent={accent}
            icon="locate"
            sub="Tahmin doğruluğu"
          />
          <StatCard
            label="Toplam Oyun"
            value={data.totalGames.toString()}
            accent={accent}
            icon="play-circle"
            sub="Kör mod deneyimi"
          />
        </View>
      </View>

      {/* Skor Geçmişi */}
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 24,
        padding: moderateScale(20),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <SectionLabel>Performans Takibi</SectionLabel>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: accent }} />
            <Text style={{ color: accent, fontSize: moderateScale(10), fontWeight: '700' }}>Skor Trendi</Text>
          </View>
        </View>
        <MiniBarChart scores={data.lastScores || []} accent={accent} />
      </View>

      {/* Bilgi Kutusu */}
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 24,
        padding: moderateScale(20),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: `${accent}30`,
        overflow: 'hidden',
      }}>
        <View style={{ flex: 1, zIndex: 1 }}>
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(9), fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' }}>Kör Mod Analizi</Text>
          <Text style={{ color: '#fff', fontSize: moderateScale(24), fontWeight: '900', marginTop: 8 }}>{data.accuracy && data.accuracy > 70 ? 'KESKİN GÖZ' : 'SEZGİSEL'}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: moderateScale(11), marginTop: 6, fontWeight: '600', lineHeight: 16 }}>
            Görsel ipucu olmadan <Text style={{ color: accent }}>%{data.accuracy || 0}</Text> doğrulukla oynamak yüksek ustalık gerektirir.
          </Text>
        </View>
        <View style={{ position: 'absolute', right: -15, bottom: -15, opacity: 0.1 }}>
          <Ionicons name="eye-off" size={moderateScale(120)} color={accent} />
        </View>
      </View>
    </View>
  );
}
