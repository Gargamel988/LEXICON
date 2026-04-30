/**
 * SSS — Animasyonlu Accordion
 * Her soru tıklanınca cevap açılır/kapanır.
 */
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { LayoutAnimation, Platform, Pressable, Text, UIManager, View } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';

// Android için LayoutAnimation etkinleştir
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

interface FaqItem {
  q: string;
  a: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Elmaslarımı nasıl kazanabilirim?',
    a: 'Oyun modlarını kazanarak, günlük bulmacayı tamamlayarak veya reklam izleyerek elmas kazanabilirsin. Mağaza\'dan da satın alabilirsin.',
  },
  {
    q: 'Güçlendirmeler ne işe yarar?',
    a: 'İpucu harf açar, Bomba yanlış harfleri temizler, Joker kelimeyi tamamen değiştirir, Veto son tahmini geri alır. Daha fazlası mağazada.',
  },
  {
    q: 'Çok oyunculu mod nasıl çalışır?',
    a: 'Lobi ekranından oda oluştur veya katıl. 1vs1 Battle\'da rakibinle yarış; Bomba Kimde\'de sözcüğü bulamazsan bomba karşı tarafa geçer.',
  },
  {
    q: 'Günlük bulmaca her gün değişiyor mu?',
    a: 'Evet, her gün gece yarısı yeni bir kelime gelir. Tüm dünyada aynı kelime olur ve sadece bir kez oynanabilir.',
  },
  {
    q: 'Liderboard\'da neden görünmüyorum?',
    a: 'Liderboard\'a girebilmek için en az 5 oyun oynamış olman gerekir. Gizlilik ayarlarından liderboard görünürlüğünü kontrol edebilirsin.',
  },
  {
    q: 'Satın aldığım öğeler kaybolursa ne yapmalıyım?',
    a: 'Hesabınla yeniden giriş yap; envanter veritabanında saklanır. Sorun devam ederse destek ekibimize yaz.',
  },
];

interface AccordionItemProps {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionItem = ({ item, isOpen, onToggle }: AccordionItemProps) => {
  const { moderateScale } = useResponsive();

  return (
    <View style={{
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isOpen ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
      overflow: 'hidden',
      marginBottom: 8,
    }}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 16,
          backgroundColor: pressed
            ? 'rgba(255,255,255,0.06)'
            : isOpen ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
          gap: 12,
        })}
      >
        <Text style={{
          flex: 1,
          color: isOpen ? '#fff' : 'rgba(255,255,255,0.75)',
          fontWeight: '700',
          fontSize: moderateScale(13),
          lineHeight: 18,
        }}>
          {item.q}
        </Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={isOpen ? '#fff' : 'rgba(255,255,255,0.35)'}
        />
      </Pressable>

      {isOpen && (
        <View style={{
          paddingHorizontal: 16,
          paddingBottom: 16,
          backgroundColor: 'rgba(255,255,255,0.03)',
        }}>
          <View style={{
            height: 1,
            backgroundColor: 'rgba(255,255,255,0.06)',
            marginBottom: 12,
          }} />
          <Text style={{
            color: 'rgba(255,255,255,0.55)',
            fontSize: moderateScale(12),
            lineHeight: 20,
          }}>
            {item.a}
          </Text>
        </View>
      )}
    </View>
  );
};

export const FaqSection = () => {
  const { moderateScale } = useResponsive();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <View style={{ marginBottom: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <View style={{
          width: 32, height: 32, borderRadius: 10,
          backgroundColor: 'rgba(255,196,0,0.15)',
          borderWidth: 1, borderColor: 'rgba(255,196,0,0.25)',
          justifyContent: 'center', alignItems: 'center',
        }}>
          <Ionicons name="help-circle-outline" size={18} color="#ffc400" />
        </View>
        <Text style={{ color: '#fff', fontWeight: '900', fontSize: moderateScale(15) }}>
          Sık Sorulan Sorular
        </Text>
      </View>

      {FAQ_ITEMS.map((item, i) => (
        <AccordionItem
          key={i}
          item={item}
          isOpen={openIndex === i}
          onToggle={() => toggle(i)}
        />
      ))}
    </View>
  );
};
