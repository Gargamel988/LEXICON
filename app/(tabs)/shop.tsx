import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { useResponsive } from '../../hooks/useResponsive';

// Assets (Generated) - Removed

interface PackCardProps {
  title: string;
  count: string;
  price: string;
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  const { moderateScale } = useResponsive();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
      <Text style={{ color: '#fff', fontSize: moderateScale(20), fontWeight: '900', letterSpacing: 0.5 }}>{title}</Text>
      {subtitle && (
        <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: moderateScale(10), fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const { moderateScale, wp, hp } = useResponsive();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* ── Custom Header ── */}
      <View style={{
        paddingTop: insets.top + moderateScale(10),
        paddingHorizontal: wp(5),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 20,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
          <Pressable style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={{ color: '#fff', fontSize: moderateScale(22), fontWeight: '900' }}>Mağaza</Text>
        </View>
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.06)',
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
          gap: 8,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.05)',
        }}>
          <Ionicons name="flash" size={16} color="#4ade80" />
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: moderateScale(16) }}>1,250</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* ── Hero Banner ── */}
        <View style={{ paddingHorizontal: wp(5), marginBottom: 30 }}>
          <View
            style={{
              height: hp(22),
              borderRadius: 24,
              backgroundColor: '#064e3b',
              padding: 24,
              justifyContent: 'space-between',
              borderWidth: 1,
              borderColor: '#4ade8020',
            }}
          >
            <View>
              <View style={{ backgroundColor: '#fedb41', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 12 }}>
                <Text style={{ color: '#000', fontSize: 10, fontWeight: '900' }}>SINIRLI SÜRE</Text>
              </View>
              <Text style={{ color: '#fff', fontSize: moderateScale(24), fontWeight: '900', lineHeight: 28 }}>Başlangıç Paketi</Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: moderateScale(13), fontWeight: '600', marginTop: 4 }}>
                2500 Altın + 5 Joker %50 İndirimle!
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <Text style={{ color: '#fff', fontSize: moderateScale(22), fontWeight: '900' }}>49,99 TL</Text>
              <Pressable style={{ backgroundColor: '#4ade80', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}>
                <Text style={{ color: '#000', fontWeight: '900', fontSize: moderateScale(14) }}>SATIN AL</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ── Altın Paketleri ── */}
        <View style={{ paddingHorizontal: wp(5), marginBottom: 35 }}>
          <SectionTitle title="Altın Paketleri" subtitle="HIZLI YÜKLEME" />
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                <Ionicons name="receipt-outline" size={32} color="#fedb41" style={{ marginBottom: 15 }} />
                <Text style={{ color: '#fff', fontSize: moderateScale(18), fontWeight: '900' }}>500 Altın</Text>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '700', marginTop: 4 }}>TEMEL PAKET</Text>
                <View style={{ width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 15 }} />
                <Pressable style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.06)', paddingVertical: 10, borderRadius: 12, alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: '800' }}>19,99 TL</Text>
                </Pressable>
              </View>

              <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#4ade8040' }}>
                <View style={{ position: 'absolute', top: -10, backgroundColor: '#4ade80', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 6 }}>
                  <Text style={{ color: '#000', fontSize: 8, fontWeight: '900' }}>POPÜLER</Text>
                </View>
                <Ionicons name="card-outline" size={32} color="#4ade80" style={{ marginBottom: 15 }} />
                <Text style={{ color: '#fff', fontSize: moderateScale(18), fontWeight: '900' }}>1500 Altın</Text>
                <Text style={{ color: '#4ade80', fontSize: 10, fontWeight: '900', marginTop: 4 }}>+250 BONUS</Text>
                <View style={{ width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 15 }} />
                <Pressable style={{ width: '100%', backgroundColor: '#4ade80', paddingVertical: 10, borderRadius: 12, alignItems: 'center' }}>
                  <Text style={{ color: '#000', fontWeight: '900' }}>44,99 TL</Text>
                </Pressable>
              </View>
            </View>

            <View style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                <Ionicons name="wallet-outline" size={40} color="#fedb41" />
                <View>
                  <Text style={{ color: '#fff', fontSize: moderateScale(20), fontWeight: '900' }}>5000 Altın</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '700', marginTop: 2 }}>+1000 Ekstra Bonus</Text>
                </View>
              </View>
              <Pressable style={{ backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}>
                <Text style={{ color: '#fff', fontWeight: '900' }}>129,99 TL</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ── Jokerler ── */}
        <View style={{ paddingHorizontal: wp(5), marginBottom: 35 }}>
          <SectionTitle title="Jokerler" subtitle="OYUN İÇİ AVANTAJ" />
          <View style={{ gap: 12 }}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' }}>
                  <Ionicons name="bulb" size={24} color="#4ade80" />
                </View>
                <View>
                  <Text style={{ color: '#fff', fontSize: moderateScale(16), fontWeight: '800' }}>Harf İpucu</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Rastgele bir harfi açar</Text>
                </View>
              </View>
              <Pressable style={{ backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="flash" size={14} color="#4ade80" />
                <Text style={{ color: '#fff', fontWeight: '900' }}>150</Text>
              </Pressable>
            </View>

            <View style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' }}>
                  <Ionicons name="snow" size={24} color="#fedb41" />
                </View>
                <View>
                  <Text style={{ color: '#fff', fontSize: moderateScale(16), fontWeight: '800' }}>Zaman Dondurucu</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Süreyi 15 saniye durdurur</Text>
                </View>
              </View>
              <Pressable style={{ backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="flash" size={14} color="#4ade80" />
                <Text style={{ color: '#fff', fontWeight: '900' }}>250</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ── Kelimeler Dünyası ── */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ paddingHorizontal: wp(5) }}>
            <SectionTitle title="Kelimeler Dünyası" subtitle="TEMATİK PAKETLER" />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: wp(5), gap: 16 }}>
            <View style={{ width: wp(45), backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 24, overflow: 'hidden' }}>
              <View style={{ height: 100, width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="book-outline" size={40} color="rgba(255,255,255,0.1)" />
              </View>
              <View style={{ padding: 16 }}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>Edebiyat</Text>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>120 Seviye</Text>
                <Pressable style={{ backgroundColor: 'rgba(255,255,255,0.06)', paddingVertical: 10, borderRadius: 12, marginTop: 15, alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: '800' }}>400 Altın</Text>
                </Pressable>
              </View>
            </View>

            <View style={{ width: wp(45), backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 24, overflow: 'hidden' }}>
              <View style={{ height: 100, width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="film-outline" size={40} color="rgba(255,255,255,0.1)" />
              </View>
              <View style={{ padding: 16 }}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>Sinema</Text>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>80 Seviye</Text>
                <Pressable style={{ backgroundColor: 'rgba(255,255,255,0.06)', paddingVertical: 10, borderRadius: 12, marginTop: 15, alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: '800' }}>300 Altın</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}
