/**
 * Avatar + üzerine frame overlay
 * avatarUrl yoksa baş harfi gösterir.
 */
import { Image, ImageSource } from 'expo-image';
import LottieView from 'lottie-react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { FRAMES } from '../../constants/frames';

interface Props {
  avatarUrl?: string | null;
  username?: string;
  frameId: string;
  size?: number;
}

export const AvatarWithFrame = ({ avatarUrl, username, frameId, size = 80 }: Props) => {
  const frameDef = FRAMES.find((f) => f.id === frameId);
  const initial = username?.[0]?.toUpperCase() ?? '?';

  // Çerçevenin içindeki boşluk payı (Resmin ne kadar küçüleceği)
  // %75-80 arası genelde çerçevelerin içindeki "delik" kısmına tam oturur.
  const innerScale = frameDef?.innerScale ?? 0.78;
  const innerSize = size * innerScale;

  return (
    <View style={{ width: size, height: size, position: 'relative', justifyContent: 'center', alignItems: 'center' }}>

      {/* 1. KATMAN: Avatar Resmi/Emoji */}
      <View style={{
        zIndex: frameDef?.avatarOnTop ? 2 : 1, // avatarOnTop true ise en üstte görünür
        width: innerSize,
        height: innerSize,
        borderRadius: innerSize / 2, // Tam daire yapar
        overflow: 'hidden',           // Taşan kısımları kırpar
        backgroundColor: 'rgba(255,255,255,0.05)', // Resim yoksa hafif bir zemin
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {avatarUrl?.startsWith('http') ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        ) : avatarUrl ? (
          <Text style={{ fontSize: innerSize * 0.6 }}>{avatarUrl}</Text>
        ) : (
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: innerSize * 0.4 }}>
            {initial}
          </Text>
        )}
      </View>

      {/* 2. KATMAN: Çerçeve Overlay */}
      {frameDef && (
        <View style={{
          position: 'absolute',
          zIndex: frameDef.avatarOnTop ? 1 : 2, // avatarOnTop true ise arkaya atar
          width: size,
          height: size,
          justifyContent: 'center',
          alignItems: 'center',
        }} pointerEvents="none">
          {frameDef.type === 'lottie' ? (
          <LottieView
            source={frameDef.source}
            autoPlay
            loop
            style={{
              position: 'absolute',
              width: size,
              height: size,
              transform: [{ scale: frameDef?.frameScale ?? 1.35 }], // Lottie çerçeveleri büyütme oranı
            }}
            onLayout={() => { }} // Tip uyuşmazlığı ihtimaline karşı boş bir handler
          />
        ) : (
          <Image
            source={frameDef.source as ImageSource}
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: size, height: size,
              transform: [{ scale: frameDef?.frameScale ?? 1.25 }], // Resmi büyütüp fotoğrafın tam oturmasını sağlama oranı
            }}
            contentFit="contain"
            // @ts-ignore
            pointerEvents="none"
          />
          )}
        </View>
      )}
    </View>
  );
};
