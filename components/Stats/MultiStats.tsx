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

  return (
    <View style={{ gap: 20 }}>
      {/* Mod başlığı */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 }}>
        <View>
          <Text style={{ color: '#fff', fontSize: moderateScale(24), fontWeight: '900', letterSpacing: 0.5 }}>Çoklu</Text>
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(10), fontWeight: '700', marginTop: 2 }}>PARALEL İŞLEMCİ MERKEZİ</Text>
        </View>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
          <Text style={{ color: accent, fontSize: moderateScale(10), fontWeight: '900' }}>HYPER_THREADING_ON</Text>
        </View>
      </View>

      {/* Performans Matrisi (3 Satır) */}
      <View style={{ gap: wp(3) }}>
        <View style={{ flexDirection: 'row', gap: wp(3) }}>
          <StatCard
            label="ODAK SKORU"
            value={`${advancedMulti?.multiTaskScore || 0}%`}
            accent={accent}
            icon="layers"
            info="Aynı anda birden fazla kelimeye odaklanma ve bitirme başarısı."
          />
          <StatCard
            label="SENKRONİZASYON"
            value={`${advancedMulti?.syncScore || 0}%`}
            accent="#4ade80"
            icon="git-merge"
            info="Kelimeleri birbirine ne kadar yakın zamanlarda çözdüğünüzü ölçen uyum puanı."
          />
        </View>
        <View style={{ flexDirection: 'row', gap: wp(3) }}>
          <StatCard
            label="SET SÜRESİ"
            value={`${advancedMulti?.avgSetTime || 0}s`}
            accent="#fbbf24"
            icon="time"
            info="Tüm kelimeleri (örneğin 4'lü set) bitirme sürenin ortalaması."
          />
          <StatCard
            label="PARALEL HIZ"
            value={`${advancedMulti?.parallelEfficiency || 0}s/k`}
            accent="#818cf8"
            icon="flash"
            info="Çoklu modda kelime başına düşen ortalama süre verimliliği."
          />
        </View>
        <View style={{ flexDirection: 'row', gap: wp(3) }}>
          <StatCard
            label="TAMAMLANAN SET"
            value={advancedMulti?.totalSetsCompleted || 0}
            accent="#f87171"
            icon="documents"
            info="Başarıyla tamamlanan toplam çoklu kelime seansı."
          />
          <StatCard
            label="WIN RATE"
            value={`${data.winRate || 0}%`}
            accent="rgba(255,255,255,0.4)"
            icon="checkmark-circle"
            info="Tüm seanslar içindeki genel başarı oranını gösterir."
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
        <SectionLabel>Odak Kanalları Trendi</SectionLabel>
        <MiniBarChart scores={data.lastScores || []} accent={accent} />
        <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(9), textAlign: 'center', marginTop: 12 }}>
          Son 5 çoklu oyun setindeki performans değişimi.
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
          {(advancedMulti?.multiTaskScore || 0) > 80 ? 'MULTI-CORE PRO' : 'SINGLE-CORE EXPERT'}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: moderateScale(11), marginTop: 8, fontWeight: '600', lineHeight: 18, zIndex: 1 }}>
          Aynı anda <Text style={{ color: accent, fontWeight: '900' }}>{advancedMulti?.parallelEfficiency || 0}s</Text> verimlilikle kelimeleri dize getiriyorsun.
        </Text>
      </View>
    </View>
  );
}
