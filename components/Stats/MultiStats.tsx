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

  return (
    <View style={{ gap: 16 }}>
      {/* Mod başlığı */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontSize: moderateScale(22), fontWeight: '900', letterSpacing: 0.5 }}>Çoklu Mod</Text>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: moderateScale(8), fontWeight: '900', letterSpacing: 1 }}>STRATEGIC_PROCESS_X</Text>
        </View>
      </View>

      {/* 2x2 Stat Matrisi */}
      <View style={{ gap: wp(2.5) }}>
        <View style={{ flexDirection: 'row', gap: wp(2.5) }}>
          <StatCard 
            label="Kazanma Oranı" 
            value={`%${data.winRate}`} 
            accent="#4ade80"
            icon="checkmark-circle"
            sub="Başarı yüzdesi"
          />
          <StatCard 
            label="Ortalama Deneme" 
            value={data.avgAttempts || 0} 
            accent={accent}
            icon="list"
            sub="Tahmin yoğunluğu"
          />
        </View>
        <View style={{ flexDirection: 'row', gap: wp(2.5) }}>
          <StatCard 
            label="En Yüksek Puan" 
            value={(data.highScore || 0).toLocaleString('tr-TR')} 
            accent={accent}
            icon="trophy"
            sub="Rekor skor"
          />
          <StatCard 
            label="Toplam Oyun" 
            value={data.totalGames.toString()} 
            accent={accent}
            icon="layers"
            sub="Multi deneyimi"
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
          <SectionLabel>Stratejik Geçmiş</SectionLabel>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: accent }} />
            <Text style={{ color: accent, fontSize: moderateScale(10), fontWeight: '700' }}>Skor Trendi</Text>
          </View>
        </View>
        <MiniBarChart scores={data.lastScores || []} accent={accent} />
      </View>

      {/* Zihinsel Çeviklik */}
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
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(9), fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' }}>Zihinsel Çeviklik</Text>
          <Text style={{ color: '#fff', fontSize: moderateScale(24), fontWeight: '900', marginTop: 8 }}>ÇOK YÖNLÜ</Text>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: moderateScale(11), marginTop: 6, fontWeight: '600', lineHeight: 16 }}>
            Aynı anda <Text style={{ color: accent }}>4 farklı</Text> odağı yönetebilme yeteneğin gelişmiş. Stratejik derinliğin seni öne çıkarıyor.
          </Text>
        </View>
        <View style={{ position: 'absolute', right: -15, bottom: -15, opacity: 0.1 }}>
          <Ionicons name="apps" size={moderateScale(120)} color={accent} />
        </View>
      </View>
    </View>
  );
}
