import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { useResponsive } from '../../hooks/useResponsive';

const CATEGORIES = [
  { id: 'karisik', name: 'Karışık', icon: 'shuffle-outline' },
  { id: 'hayvanlar', name: 'Hayvanlar', icon: 'paw-outline' },
  { id: 'meyvesebze', name: 'Meyve-Sebze', icon: 'leaf-outline' },
  { id: 'yiyecekler', name: 'Yiyecekler', icon: 'fast-food-outline' },
  { id: 'spor', name: 'Spor', icon: 'football-outline' },
  { id: 'sehirler', name: 'Şehirler', icon: 'business-outline' },
  { id: 'meslekler', name: 'Meslekler', icon: 'briefcase-outline' },
  { id: 'ulkeler', name: 'Ülkeler', icon: 'flag-outline' },
  { id: 'renkler', name: 'Renkler', icon: 'color-palette-outline' },
  { id: 'esyalar', name: 'Eşyalar', icon: 'cube-outline' },
  { id: 'doga', name: 'Doğa', icon: 'earth-outline' },
  { id: 'teknoloji', name: 'Teknoloji', icon: 'desktop-outline' },
  { id: 'muzik', name: 'Müzik', icon: 'musical-notes-outline' },
  { id: 'tarih', name: 'Tarih', icon: 'time-outline' },
  { id: 'giyim', name: 'Giyim', icon: 'shirt-outline' },
  { id: 'anatomi', name: 'Anatomi', icon: 'accessibility-outline' },
];

const LENGTHS = [4, 5, 6, 7];




interface SettingsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onStart: (category: string, length?: any, countOrDifficulty?: any) => void;
  mode?: 'classic' | 'blitz' | 'blind' | 'multi' | 'survival' | 'climb';
  isLoading?: boolean;
}

export default function SettingsModal({ isVisible, onClose, onStart, mode = 'classic', isLoading = false }: SettingsModalProps) {
  const { wp, moderateScale, verticalScale, spacing } = useResponsive();
  const [selectedCategory, setSelectedCategory] = useState('karisik');
  const [selectedLength, setSelectedLength] = useState(5);
  const [selectedDifficulty, setSelectedDifficulty] = useState('TAM_KOR');
  const [selectedCount, setSelectedCount] = useState(4);
  const [shouldRender, setShouldRender] = useState(isVisible);
  const animProgress = useSharedValue(0);

  const CLIMB_ACCENT = '#CF4C13';
  const SURVIVAL_ACCENT = '#ff3b30';
  const MULTI_ACCENT = '#9c27b0';
  const BLIND_ACCENT = '#FFD54F';
  const BLITCH_ACCENT = '#ff7e79';
  const CLASSIC_ACCENT = '#82b1ff';

  const accentColor = mode === 'blitz' ? BLITCH_ACCENT :
    mode === 'blind' ? BLIND_ACCENT :
      mode === 'multi' ? MULTI_ACCENT :
        mode === 'survival' ? SURVIVAL_ACCENT :
          mode === 'climb' ? CLIMB_ACCENT : CLASSIC_ACCENT;

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      animProgress.value = withTiming(1, { duration: 300 });
    } else {
      animProgress.value = withTiming(0, { duration: 300 });
      const t = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isVisible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: animProgress.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: animProgress.value,
    transform: [
      { translateY: interpolate(animProgress.value, [0, 1], [30, 0]) }
    ],
  }));

  if (!shouldRender && !isVisible) return null;

  const absoluteFill = { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0 };

  return (
    <View style={{ ...absoluteFill }} pointerEvents={isVisible ? 'auto' : 'none'}>
      {/* Background Overlay */}
      <Animated.View style={[{ ...absoluteFill, backgroundColor: 'rgba(0,0,0,0.7)' }, overlayStyle]}>
        <BlurView intensity={25} style={{ ...absoluteFill }} tint="dark" />
        <TouchableOpacity activeOpacity={1} style={{ ...absoluteFill }} onPress={onClose} />
      </Animated.View>

      {/* Wrapper (Warning fix) */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.md }}>
        <Animated.View style={[{
          width: wp(90),
          backgroundColor: '#1c1c1e',
          borderRadius: moderateScale(28),
          padding: moderateScale(24),
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 10,
        }, cardStyle]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(24), gap: moderateScale(12) }}>
            <Ionicons name={
              mode === 'blitz' ? "flash" :
                mode === 'blind' ? "eye-off-outline" :
                  mode === 'multi' ? "grid-outline" :
                    mode === 'survival' ? "heart" :
                      mode === 'climb' ? "trending-up" : "options-outline"
            } size={moderateScale(28)} color={accentColor} />
            <Text style={{ color: '#fff', fontSize: mode === 'climb' ? moderateScale(16) : moderateScale(20), fontWeight: '900', letterSpacing: 1, flex: 1, textAlign: 'center' }}>
              {
                mode === 'blitz' ? 'BLİTZ AYARLARI' :
                  mode === 'blind' ? 'KÖR MOD AYARLARI' :
                    mode === 'multi' ? 'ÇOKLU MOD AYARLARI' :
                      mode === 'survival' ? 'CAN MODU AYARLARI' :
                        mode === 'climb' ? 'TIRMANMA AYARLARI' : 'OYUN AYARLARI'
              }
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={{ padding: moderateScale(8), borderRadius: moderateScale(12), backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <Ionicons name="close" size={moderateScale(24)} color="#555" />
            </TouchableOpacity>
          </View>

          {/* Category Section */}
          <View style={{ marginBottom: verticalScale(20) }}>
            <Text style={{ color: '#666', fontSize: moderateScale(11), fontWeight: '800', letterSpacing: 1.5, marginBottom: verticalScale(12), textAlign: 'center' }}>
              KATEGORİ
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: moderateScale(20), gap: moderateScale(8) }}
            >
              {Array.from({ length: Math.ceil(CATEGORIES.length / 3) }, (_, i) => CATEGORIES.slice(i * 3, i * 3 + 3)).map((triple, colIdx) => (
                <View key={colIdx} style={{ gap: moderateScale(8) }}>
                  {triple.map((cat) => {
                    const isActive = selectedCategory === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        activeOpacity={0.7}
                        style={{
                          width: moderateScale(85),
                          paddingVertical: verticalScale(8),
                          borderRadius: moderateScale(12),
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderWidth: 1,
                          borderColor: isActive ? accentColor : 'rgba(255,255,255,0.05)',
                          backgroundColor: isActive ? `${accentColor}15` : 'rgba(255,255,255,0.03)',
                        }}
                        onPress={() => setSelectedCategory(cat.id)}
                      >
                        <Ionicons name={cat.icon as any} size={moderateScale(16)} color={isActive ? accentColor : '#555'} />
                        <Text style={{
                          color: isActive ? '#fff' : '#666',
                          fontSize: moderateScale(9),
                          fontWeight: isActive ? '800' : '600',
                          marginTop: moderateScale(2),
                          textAlign: 'center'
                        }}>
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Word Count Section (Multi Mode Only) */}
          {mode === 'multi' && (
            <View style={{ marginBottom: verticalScale(24) }}>
              <Text style={{ color: '#666', fontSize: moderateScale(11), fontWeight: '800', letterSpacing: 1.5, marginBottom: verticalScale(12), textAlign: 'center' }}>
                KELİME SAYISI
              </Text>
              <View style={{ flexDirection: 'row', gap: moderateScale(8), justifyContent: 'center' }}>
                {[2, 4, 6].map((count) => {
                  const isActive = selectedCount === count;
                  return (
                    <TouchableOpacity
                      key={count}
                      style={{
                        flex: 1,
                        paddingVertical: verticalScale(12),
                        borderRadius: moderateScale(12),
                        backgroundColor: isActive ? accentColor : 'rgba(255,255,255,0.03)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: isActive ? accentColor : 'rgba(255,255,255,0.05)',
                      }}
                      onPress={() => setSelectedCount(count)}
                    >
                      <Text style={{ color: isActive ? '#fff' : '#666', fontSize: moderateScale(16), fontWeight: '900' }}>
                        {count}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Difficulty Section (Blind Mode Only) */}
          {mode === 'blind' && (
            <View style={{ marginBottom: verticalScale(24) }}>
              <Text style={{ color: '#666', fontSize: moderateScale(11), fontWeight: '800', letterSpacing: 1.5, marginBottom: verticalScale(12), textAlign: 'center' }}>
                ZORLUK SEVİYESİ
              </Text>
              <View style={{ flexDirection: 'row', gap: moderateScale(8), justifyContent: 'center' }}>
                {[
                  { id: 'TAM_KOR', name: 'Tam Kör', mult: '3.0x' },
                  { id: 'YARI_KOR', name: 'Yarı Kör', mult: '2.0x' },
                  { id: 'RENKSIZ', name: 'Renksiz', mult: '1.5x' },
                ].map((diff) => {
                  const isActive = selectedDifficulty === diff.id;
                  return (
                    <TouchableOpacity
                      key={diff.id}
                      style={{
                        flex: 1,
                        paddingVertical: verticalScale(10),
                        borderRadius: moderateScale(12),
                        backgroundColor: isActive ? accentColor : 'rgba(255,255,255,0.03)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: isActive ? accentColor : 'rgba(255,255,255,0.05)',
                      }}
                      onPress={() => setSelectedDifficulty(diff.id)}
                    >
                      <Text style={{ color: isActive ? '#000' : '#fff', fontSize: moderateScale(11), fontWeight: '900' }}>
                        {diff.name}
                      </Text>
                      <Text style={{ color: isActive ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.4)', fontSize: moderateScale(9), fontWeight: '800' }}>
                        {diff.mult}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Length Section (Classic, Blind, Multi Mode) */}
          {(mode === 'classic' || mode === 'blind' || mode === 'multi') && (
            <View style={{ marginBottom: verticalScale(24) }}>
              <Text style={{ color: '#666', fontSize: moderateScale(11), fontWeight: '800', letterSpacing: 1.5, marginBottom: verticalScale(12), textAlign: 'center' }}>
                KELİME UZUNLUĞU
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: moderateScale(12) }}>
                {LENGTHS.map((len) => {
                  const isActive = selectedLength === len;
                  return (
                    <TouchableOpacity
                      key={len}
                      style={{
                        width: moderateScale(48),
                        height: moderateScale(48),
                        borderRadius: moderateScale(14),
                        backgroundColor: isActive ? accentColor : 'rgba(255,255,255,0.03)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: isActive ? accentColor : 'rgba(255,255,255,0.05)',
                      }}
                      onPress={() => setSelectedLength(len)}
                    >
                      <Text style={{ color: isActive ? '#fff' : '#666', fontSize: moderateScale(18), fontWeight: isActive ? '900' : '700' }}>
                        {len}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          <TouchableOpacity
            style={{
              paddingVertical: verticalScale(16),
              borderRadius: moderateScale(20),
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: accentColor,
              shadowColor: accentColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 8,
            }}
            onPress={() => {
              if (isLoading) return;
              if (mode === 'classic') {
                onStart(selectedCategory, selectedLength);
              } else if (mode === 'blind') {
                onStart(selectedCategory, selectedLength, selectedDifficulty);
              } else if (mode === 'multi') {
                onStart(selectedCategory, selectedLength, selectedCount);
              } else {
                onStart(selectedCategory);
              }
            }}
            activeOpacity={isLoading ? 1 : 0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={{ color: '#fff', fontSize: moderateScale(17), fontWeight: '900', letterSpacing: 0.5 }}>
                  OYUNA BAŞLA
                </Text>
                <Ionicons name="caret-forward" size={moderateScale(20)} color="#fff" style={{ marginLeft: moderateScale(8) }} />
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}
