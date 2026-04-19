import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { StatsSummary } from '../../services/statsService';
import InfoTooltip from '../Common/InfoTooltip';
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

  const { advancedBlitz } = data;

  const speedLevel = (() => {
    const t = data.avgTimePerWord;
    const w = data.winRate;
    const g = data.totalGames;

    if (!t) return {
      title: '🌫️ HENÜZ BİLİNMİYOR',
      desc: 'Yeterli veri toplanmadı. Birkaç oyun daha oyna, hız profilin ortaya çıksın.'
    };
    if (t < 2) return {
      title: '☄️ KUANTUM REFLEKS',
      desc: `${t}s — bu bir insan hızı değil. ${g} oyunda ortalama ${t}s ile sen zaten kelimeyi bilmeden önce buluyorsun.`
    };
    if (t < 4) return {
      title: '⚡ IŞIK HIZI',
      desc: `${t}s ortalama reaksiyon. Parmakların kafandan hızlı çalışıyor. Oyuncuların %92'sinden önde gidiyorsun.`
    };
    if (t < 6) return {
      title: '🔥 SERİ KATİL',
      desc: `${t}s ile kelimeleri avlıyorsun. ${w > 70 ? 'Hem hızlı hem isabetlisin, bu kombinasyon nadir.' : 'Hızın var, isabeti biraz daha artırırsan kimse tutamaz.'}`
    };
    if (t < 9) return {
      title: '🎯 KESKİN NİŞANCI',
      desc: `${t}s ortalama. Her tahminin hesaplı, kelimeyi parçalara bölerek ilerliyorsun. ${w > 80 ? 'Ve bu strateji işe yarıyor.' : 'Strateji oturdu, kazanma oranını biraz daha çek.'}`
    };
    if (t < 13) return {
      title: '🧠 STRATEJİST',
      desc: `${t}s ile düşünerek oynuyorsun. Hız değil akıl önde. ${g > 30 ? `${g} oyunluk deneyimin her tahminine yansıyor.` : 'Daha fazla oynadıkça reflekslerin de hızlanacak.'}`
    };
    if (t < 18) return {
      title: '🐢 TEMKİNLİ USTA',
      desc: `${t}s ortalama. Aceleden hata yapmıyorsun. ${w > 75 ? 'Ve bu sana kazandırıyor — yavaş ama isabetlisin.' : 'Biraz ritim kazanırsan kazanma oranın fırlayacak.'}`
    };
    if (t < 25) return {
      title: '🌙 GECE GEZGİNİ',
      desc: `${t}s ile en ağır toplardan birisin. Her kelimeyi bir bulmaca gibi inceliyorsun. Belki de en keyifli oynayan sensin.`
    };
    return {
      title: '🪐 KENDİ EVRENİNDE',
      desc: `${t}s — zamana göre oynamıyorsun, kendi tempondasın. ${w > 60 ? 'Ve ilginç bir şekilde, bu sana iyi geliyor.' : 'Temponu biraz kırarsan sonuçlar değişebilir.'}`
    };
  })();
  return (
    <View style={{ gap: 20 }}>
      {/* Mod başlığı */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 }}>
        <View>
          <Text style={{ color: '#fff', fontSize: moderateScale(24), fontWeight: '900', letterSpacing: 0.5 }}>Blitz Mod</Text>
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(10), fontWeight: '700', marginTop: 2 }}>ZAMANA KARŞI YARIŞ</Text>
        </View>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
          <Text style={{ color: accent, fontSize: moderateScale(9), fontWeight: '900' }}>HYPER_DRIVE</Text>
        </View>
      </View>

      {/* Ana Statlar - 2x2 Grid */}
      <View style={{ gap: wp(3) }}>
        <View style={{ flexDirection: 'row', gap: wp(3) }}>
          <StatCard
            label="KELİME REKORU"
            value={data.maxSolvedCount || 0}
            accent={accent}
            icon="flash"
            sub="Tek seanstaki başarı"
            info="Bir oyun süresi içinde takılmadan çözdüğün toplam kelime sayısıdır. Ne kadar yüksekse o kadar iyisin!"
          />
          <StatCard
            label="ZİRVE SKOR"
            value={(data.highScore || 0).toLocaleString('tr-TR')}
            accent="#4ade80"
            icon="star"
            info="Şu ana kadar bir oyunda topladığın en yüksek puan. Süre bonusları dahil en iyi derecendir."
          />
        </View>
        <View style={{ flexDirection: 'row', gap: wp(3) }}>
          <StatCard
            label="ZİRVE HIZ"
            value={`${advancedBlitz?.bestSessionSpeed || 0}s`}
            accent="#fbbf24"
            icon="rocket"
            sub="En hızlı seans ort."
            info="En hızlı olduğun oyunda kelime başına harcadığın süredir. Bu ne kadar az ise kelimeleri o kadar hızlı görüyorsun demektir."
          />
          <StatCard
            label="TEMPO SKORU"
            value={`${advancedBlitz?.tempoScore || 0}%`}
            accent={accent}
            icon="pulse"
            sub="Oyun içi yoğunluk"
            info="Oyun esnasındaki ritmini ölçer. Düşünmeden, seri şekilde cevap veriyorsan bu puan tavan yapar!"
          />
        </View>
      </View>

      {/* İkincil Statlar Matrisi */}
      <View style={{ flexDirection: 'row', gap: wp(3) }}>
        <StatCard
          label="STABİLİTE"
          value={`${advancedBlitz?.stabilityScore || 0}%`}
          accent="#818cf8"
          icon="git-commit-outline"
          info="Hızının ne kadar dengeli olduğunu ölçer. Bir kelimede çok hızlı, diğerinde çok yavaş kalmıyorsan puanın artar."
        />
        <StatCard
          label="TOPLAM DENEME"
          value={data.totalGames.toString()}
          accent="rgba(255,255,255,0.4)"
          icon="play"
          info="Bugüne kadar Blitz modunda başladığın oyunların toplam sayısıdır."
        />
      </View>

      {/* Rütbe Paneli */}
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
            {speedLevel.title}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: moderateScale(11), marginTop: 8, fontWeight: '600', lineHeight: 18 }}>
            {speedLevel.desc}
          </Text>
        </View>
        <Ionicons name="trophy" size={moderateScale(120)} color={`${accent}08`} style={{ position: 'absolute', right: -20, bottom: -30 }} />
      </View>

      {/* Hız Katmanları Dağılımı */}
      {advancedBlitz?.solveTierDist && (
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderRadius: 24,
          padding: moderateScale(20),
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.06)',
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <SectionLabel>HIZ KATMANLARI DAĞILIMI</SectionLabel>
              <InfoTooltip
                content="Bitirdiğin oyunların genel hız ortalamasına göre hangi grupta yoğunlaştığını gösterir. Elite grubu hedeflemelisin!"
              />
            </View>
          </View>
          <View style={{ gap: 12 }}>
            {advancedBlitz.solveTierDist.map((tier, idx) => {
              const maxCount = Math.max(...advancedBlitz.solveTierDist.map(t => t.count)) || 1;
              const width = (tier.count / maxCount) * 100;
              return (
                <View key={idx} style={{ gap: 6 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: moderateScale(10), fontWeight: '700' }}>{tier.label}</Text>
                    <Text style={{ color: '#fff', fontSize: moderateScale(10), fontWeight: '900' }}>{tier.count} Oyun</Text>
                  </View>
                  <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                    <View style={{ height: '100%', width: `${width}%`, backgroundColor: width > 50 ? accent : `${accent}80`, borderRadius: 3 }} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Skor Trend Grafiği */}
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 24,
        padding: moderateScale(20),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <SectionLabel>SKOR ANALİZİ</SectionLabel>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: accent }} />
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: moderateScale(10), fontWeight: '700' }}>SON SKORLAR</Text>
          </View>
        </View>
        <MiniBarChart scores={data.lastScores || []} accent={accent} />
      </View>
    </View>
  );
}
