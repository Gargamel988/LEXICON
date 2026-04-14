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
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: moderateScale(8), fontWeight: '900', letterSpacing: 1 }}>DAILY_SYNC_01</Text>
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
          <Text style={{ color: '#fff', fontSize: moderateScale(44), fontWeight: '900', marginTop: 4 }}>#--</Text>
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(11), marginTop: 6, fontWeight: '600', lineHeight: 16 }}>
             Global sıralama sistemi bir sonraki güncellemede aktif olacak!
          </Text>
        </View>
        <View style={{ position: 'absolute', right: -15, bottom: -15, opacity: 0.1 }}>
          <Ionicons name="earth" size={moderateScale(120)} color={accent} />
        </View>
      </View>
    </View>
  );
}
