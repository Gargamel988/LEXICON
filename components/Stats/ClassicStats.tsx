import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import InfoTooltip from '../Common/InfoTooltip';
import DistributionBar from './DistributionBar';
import StatCard from './StatCard';

import { StatsSummary } from '../../services/statsService';

const categoryNames: Record<string, string> = {
  karisik: 'Karışık',
  meyvesebze: 'Meyve & Sebze',
  sehirler: 'Şehirler',
  şehirler: 'Şehirler',
  ulkeler: 'Ülkeler',
  ülkeler: 'Ülkeler',
  hayvanlar: 'Hayvanlar',
  spor: 'Spor',
  muzik: 'Müzik',
  müzik: 'Müzik',
  doga: 'Doğa',
  doğa: 'Doğa',
  meslekler: 'Meslekler',
  renkler: 'Renkler',
  yiyecekler: 'Yiyecekler',
};

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

export default function ClassicStats({ accent, data }: Props) {
  const { moderateScale, wp } = useResponsive();

  if (!data) return null;

  const { totalGames, winRate, avgAttempts, bestStreak, distribution, advancedClassic } = data;

  let totalgamestext = '';
  let totalgamesicon: keyof typeof Ionicons.glyphMap = 'help-circle-outline';

  switch (true) {
    case totalGames === 0:
      totalgamestext = 'Henüz hiç oyun oynamadın, ilk adımı at!';
      totalgamesicon = 'ellipse-outline';
      break;
    case totalGames < 5:
      totalgamestext = 'Yeni başlıyorsun, devam et!'
      totalgamesicon = 'leaf-outline';
      break;
    case totalGames < 10:
      totalgamestext = 'Isınma turlarındasın, ritmi yakalıyorsun.';
      totalgamesicon = 'flame-outline';
      break;
    case totalGames < 25:
      totalgamestext = 'Oyuna alışmaya başlıyorsun, iyi gidiyorsun.';
      totalgamesicon = 'walk-outline';
      break;
    case totalGames < 50:
      totalgamestext = 'Düzenli bir oyuncu olmaya başladın.';
      totalgamesicon = 'bicycle-outline';
      break;
    case totalGames < 100:
      totalgamestext = 'Kelime oyunlarına olan tutkunun belli oluyor!';
      totalgamesicon = 'heart-outline';
      break;
    case totalGames < 200:
      totalgamestext = 'Ciddi bir deneyim biriktirdin, tebrikler.';
      totalgamesicon = 'shield-outline';
      break;
    case totalGames < 500:
      totalgamestext = 'Veteran seviyesindesin, az kişi buraya ulaşır.';
      totalgamesicon = 'medal-outline';

      break;
    case totalGames < 1000:
      totalgamestext = 'Elit oyuncular arasındasın, etkileyici!';
      totalgamesicon = 'diamond-outline';

      break;
    default:
      totalgamestext = '👑 Efsane statüsüne ulaştın, rakibin yok!';
      totalgamesicon = 'trophy';
      break;
  }
  const masteryLevel = (() => {
    if (winRate >= 95 && totalGames >= 50) return {
      title: '👑 SÖZCÜK EFENDİSİ',
      desc: `${totalGames} oyunun ${winRate}% zaferle kapandı. Bu seviyeye ulaşan az kişi var.`
    };
    if (winRate >= 90) return {
      title: '⚡ KELİME ÜSTADI',
      desc: `Her 10 oyundan ${Math.round(winRate / 10)}'ini kazanıyorsun. Reflekslerin keskin.`
    };
    if (winRate >= 80) return {
      title: '🔥 UZMAN',
      desc: `Ortalama ${avgAttempts} denemede bitiriyorsun. Kelime sezgin güçlü.`
    };
    if (winRate >= 65) return {
      title: '📈 DENEYİMLİ',
      desc: `${totalGames} oyunluk deneyiminle sağlam bir temel kurdun.`
    };
    if (winRate >= 45) return {
      title: '💪 GELİŞMEKTE',
      desc: `Son oyunlarda ivme kazanıyorsun. Doğru yoldasın.`
    };
    if (winRate >= 20) return {
      title: '🌱 ÇABALAYAN',
      desc: `Her kayıp bir ders. ${totalGames} oyundan öğrendiklerin birikmeye başladı.`
    };
    return {
      title: '🐣 YENİ BAŞLAYAN',
      desc: 'İlk adımlar atıldı. Sözlüğün büyümeye hazır.'
    };
  })();

  const streakDesc = (() => {
    if (bestStreak === 0) return 'İlk serini kurmak için tek yapman gereken kazanmaya devam etmek.';
    if (bestStreak >= 20) return `${bestStreak} oyunluk seri — bu bir rekor, çoğu oyuncu buraya ulaşamaz.`;
    if (bestStreak >= 10) return `${bestStreak} oyunluk kesintisiz galibiyet serisi. Etkileyici bir odak.`;
    if (bestStreak >= 5) return `${bestStreak} oyunluk serin var. Biraz daha ittir, 10'u yakala.`;
    return `En uzun serin ${bestStreak} oyun. Serisini kırmadan oynamaya devam et.`;
  })();

  return (
    <View style={{ gap: 20 }}>
      {/* Mod başlığı */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 }}>
        <View>
          <Text style={{ color: '#fff', fontSize: moderateScale(24), fontWeight: '900', letterSpacing: 0.5 }}>Klasik Mod</Text>
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(10), fontWeight: '700', marginTop: 2 }}>GENEL PERFORMANS</Text>
        </View>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
          <Text style={{ color: accent, fontSize: moderateScale(10), fontWeight: '900' }}>{totalGames > 0 ? 'AKTİF MOD' : 'YENİ BAŞLAYAN'}</Text>
        </View>
      </View>

      {/* Ana Özet Kartı */}
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 24,
        padding: moderateScale(24),
        borderWidth: 1,
        borderColor: `${accent}30`,
        overflow: 'hidden',
      }}>
        <View style={{ zIndex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(10), fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' }}>Toplam Oyun</Text>
          </View>
          <Text style={{ color: accent, fontSize: moderateScale(48), fontWeight: '900', marginTop: 4, fontVariant: ['tabular-nums'] }}>
            {totalGames.toLocaleString('tr-TR')}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <Ionicons name={totalgamesicon} size={moderateScale(14)} color="#4ade80" />
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: moderateScale(12), fontWeight: '600' }}>
              {totalgamestext}
            </Text>
          </View>
        </View>
        <Ionicons name="game-controller" size={moderateScale(120)} color={`${accent}08`} style={{ position: 'absolute', right: -20, bottom: -30 }} />
      </View>

      {/* İkili stat */}
      <View style={{ flexDirection: 'row', gap: wp(3), zIndex: 10 }}>
        <StatCard label="BAŞARI ORANI" value={`%${winRate}`} sub="Galibiyet yüzdesi" accent={accent} icon="trophy-outline" info="Oynadığın her 100 oyundan kaç tanesini zaferle bitirdiğini söyler." />
        <StatCard label="ORT. DENEME" value={avgAttempts || 0} sub="Kazanılan turlar" accent={accent} icon="stats-chart-outline" info="Bir kelimeyi bulmak için genellikle kaç tahmin hakkı harcadığını gösterir." />
      </View>

      {/* Analiz Paneli */}
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 24,
        padding: moderateScale(20),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}>
        <View style={{ flex: 1, zIndex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(9), fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' }}>Ustalık Katmanı</Text>
            <InfoTooltip content="Ne kadar usta bir kelime avcısı olduğunu ölçen senin rütben." />
          </View>
          <Text style={{ color: '#fff', fontSize: moderateScale(22), fontWeight: '900', marginTop: 4 }}>
            {masteryLevel.title}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: moderateScale(11), marginTop: 6, fontWeight: '600', lineHeight: 16 }}>
            {masteryLevel.desc}{'\n'}{streakDesc}
          </Text>
        </View>
        <Ionicons name="ribbon" size={moderateScale(100)} color={`${accent}10`} style={{ position: 'absolute', right: -20, bottom: -20 }} />
      </View>

      {/* Dağılım grafiği */}
      <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: moderateScale(20), borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <SectionLabel>Tahmin Dağılımı</SectionLabel>
            <View style={{ marginBottom: 12 }}><InfoTooltip content="Kelimeleri genellikle kaçıncı hakkında (1., 2. veya 6.) bulduğunu gösteren tablo." /></View>
          </View>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
            <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(9), fontWeight: '800' }}>1-6 DENEME</Text>
          </View>
        </View>
        <DistributionBar dist={distribution} accent={accent} />
      </View>

      {/* Verimlilik ve Trend Analizi */}
      {advancedClassic && (
        <View style={{ gap: wp(3) }}>
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderRadius: 24,
            padding: moderateScale(20),
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.06)',
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <SectionLabel>Hız & Verimlilik</SectionLabel>
                <View style={{ marginBottom: 12 }}><InfoTooltip content="Hem hızlı hem de az denemeyle bulup bulmadığına göre verilen başarı puanın." /></View>
              </View>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: advancedClassic.trend.direction === 'up' ? '#4ade8020' : '#f8717120',
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 12,
                gap: 4
              }}>
                <Ionicons
                  name={advancedClassic.trend.direction === 'up' ? "trending-up" : "trending-down"}
                  size={moderateScale(12)}
                  color={advancedClassic.trend.direction === 'up' ? "#4ade80" : "#f87171"}
                />
                <Text style={{
                  color: advancedClassic.trend.direction === 'up' ? "#4ade80" : "#f87171",
                  fontSize: moderateScale(10),
                  fontWeight: '900'
                }}>
                  %{advancedClassic.trend.percentage} {advancedClassic.trend.direction === 'up' ? 'DAHA HIZLI' : 'YAVAŞLAMA'}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
              <View style={{ flex: 1 }}>
                <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                  <View style={{ width: `${advancedClassic.efficiencyScore}%`, height: '100%', backgroundColor: accent }} />
                </View>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: moderateScale(10), marginTop: 8, fontWeight: '600' }}>
                  Verimlilik Puanı: <Text style={{ color: '#fff', fontWeight: '900' }}>{advancedClassic.efficiencyScore}/100</Text>
                </Text>
              </View>
              <View style={{ width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.05)' }} />
              <View>
                <Text style={{ color: accent, fontSize: moderateScale(18), fontWeight: '900' }}>
                  {advancedClassic.trend.direction === 'up' ? 'GELİŞİYOR' : 'STABİL'}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(9), fontWeight: '700', marginTop: 2 }}>SON 10 OYUN TRENDİ</Text>
              </View>
            </View>
          </View>

          {/* Kelime Uzunluğu Ustalığı */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <SectionLabel>Kelime Uzunluğu Ustalığı</SectionLabel>
            <View style={{ marginBottom: 12 }}><InfoTooltip content="Hangi uzunluktaki kelimelerde (4, 5, 6 harf) daha yetenekli olduğunu gösterir." /></View>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: wp(3) }}>
            {advancedClassic.wordLengthPerformance.map((item, idx) => (
              <View key={idx} style={{
                width: wp(43.5),
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderRadius: 20,
                padding: moderateScale(15),
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.05)'
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <View style={{ backgroundColor: `${accent}15`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                    <Text style={{ color: accent, fontSize: moderateScale(10), fontWeight: '900' }}>{item.length} HARF</Text>
                  </View>
                  <Ionicons name="flash-outline" size={moderateScale(14)} color="rgba(255,255,255,0.2)" />
                </View>
                <Text style={{ color: '#fff', fontSize: moderateScale(18), fontWeight: '900' }}>{item.avgTime}s</Text>
                <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(9), fontWeight: '700', marginTop: 2 }}>ORT. SÜRE</Text>
                <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 10 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: moderateScale(10), fontWeight: '600' }}>Deneme: {item.avgAttempts}</Text>
                  <Ionicons name="checkmark-circle-outline" size={moderateScale(12)} color="#4ade80" />
                </View>
              </View>
            ))}
          </View>

          {/* Zaman Bazlı Verimlilik */}
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.02)',
            borderRadius: 24,
            padding: moderateScale(20),
            borderStyle: 'dashed',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <SectionLabel>Zirve Saati Analizi</SectionLabel>
              <View style={{ marginBottom: 12 }}><InfoTooltip content="Günün hangi saatlerinde kafanın daha iyi çalıştığını ve daha çok kazandığını gösterir." /></View>
            </View>
            <View style={{ gap: 12, marginTop: 4 }}>
              {advancedClassic.timeAnalysis.filter(t => t.gameCount > 0).map((item, idx) => (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Ionicons
                      name={item.label.includes('Gece') ? 'moon' : (item.label.includes('Sabah') ? 'sunny' : 'partly-sunny')}
                      size={moderateScale(16)}
                      color="rgba(255,255,255,0.3)"
                    />
                    <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: moderateScale(12), fontWeight: '600' }}>{item.label}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ width: 60, height: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                      <View style={{ width: `${item.winRate}%`, height: '100%', backgroundColor: accent, borderRadius: 2 }} />
                    </View>
                    <Text style={{ color: '#fff', fontSize: moderateScale(11), fontWeight: '800', width: 35 }}>%{item.winRate}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      )
      }

      {/* Kategoriler */}
      <View>
        <View style={{ paddingHorizontal: 4, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <SectionLabel>Kategori Başarı Oranları</SectionLabel>
          <View style={{ marginBottom: 12 }}><InfoTooltip content="Hangi konulardaki (Spor, Bilim vb.) kelimelere daha hakim olduğunu gösterir." /></View>
        </View>
        {advancedClassic?.categoryPerformance && advancedClassic.categoryPerformance.length > 0 ? (
          <View style={{ gap: 12 }}>
            {advancedClassic.categoryPerformance.map((cat, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  borderRadius: 20,
                  padding: moderateScale(16),
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderWidth: 1,
                  borderColor: index === 0 ? `${accent}30` : 'rgba(255,255,255,0.06)',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <View style={{
                    width: moderateScale(42),
                    height: moderateScale(42),
                    borderRadius: 14,
                    backgroundColor: index === 0 ? `${accent}20` : 'rgba(255,255,255,0.05)',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <Ionicons name={index === 0 ? "trophy" : "ribbon-outline"} size={moderateScale(22)} color={index === 0 ? accent : 'rgba(255,255,255,0.4)'} />
                  </View>
                  <View>
                    <Text style={{ color: '#fff', fontSize: moderateScale(15), fontWeight: '800' }}>
                      {categoryNames[cat.name] ?? cat.name}
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(10), fontWeight: '700', marginTop: 2 }}>
                      ORT. SÜRE: <Text style={{ color: accent }}>{cat.avgTime}s</Text> | OYUN: <Text style={{ color: accent }}>{cat.total}</Text>
                    </Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: index === 0 ? accent : '#fff', fontSize: moderateScale(20), fontWeight: '900' }}>
                    %{cat.successRate}
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: moderateScale(9), fontWeight: '800', textTransform: 'uppercase' }}>
                    BAŞARI
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.02)',
            borderRadius: 24,
            padding: 32,
            alignItems: 'center',
            borderStyle: 'dashed',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)'
          }}>
            <Ionicons name="medal-outline" size={moderateScale(40)} color="rgba(255,255,255,0.1)" style={{ marginBottom: 12 }} />
            <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(13), fontWeight: '600', textAlign: 'center', lineHeight: 20 }}>
              Henüz yeterli veri toplanmadı.{"\n"}Oyun kazandıkça analizlerin burada belirecek.
            </Text>
          </View>
        )}
      </View>
    </View >
  );
}

