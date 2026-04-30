/**
 * FrameCard — Tek bir çerçeve kartı
 * 3 durum: aktif / sahip / sahip değil
 */
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { FrameDef } from '../../constants/frames';
import { useResponsive } from '../../hooks/useResponsive';
import { AvatarWithFrame } from './AvatarWithFrame';

interface Props {
  frame: FrameDef;
  isOwned: boolean;
  isActive: boolean;
  avatarUrl?: string | null;
  username?: string;
  isBuying?: boolean;
  isSettingActive?: boolean;
  coins: number;
  width: number;
  onActivate: () => void;
  onBuy: () => void;
}

export const FrameCard = ({
  frame,
  isOwned,
  isActive,
  avatarUrl,
  username,
  isBuying,
  isSettingActive,
  coins,
  width,
  onActivate,
  onBuy,
}: Props) => {
  const { moderateScale } = useResponsive();
  const canAfford = frame.coinPrice !== null ? coins >= frame.coinPrice : true;
  const isFree = frame.price === null && frame.coinPrice === null;
  const isLoading = isBuying || isSettingActive;

  return (
    <View style={{
      width,
      backgroundColor: 'transparent',
      borderRadius: 18,
      borderWidth: isActive ? 1.5 : 1,
      borderColor: isActive ? `${frame.color}50` : 'rgba(255,255,255,0.06)',
      padding: 14,
      alignItems: 'center',
      gap: 8,
      position: 'relative',
      justifyContent: 'space-between',
      minHeight: 160,
    }}>
      {/* Rozet */}
      {frame.badge && !isActive && (
        <View style={{
          position: 'absolute', top: -9, alignSelf: 'center',
          backgroundColor: frame.color,
          paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6,
        }}>
          <Text style={{ color: '#000', fontSize: 8, fontWeight: '900' }}>{frame.badge}</Text>
        </View>
      )}

      {/* Aktif rozet */}
      {isActive && (
        <View style={{
          position: 'absolute', top: -9, alignSelf: 'center',
          backgroundColor: frame.color,
          paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6,
          flexDirection: 'row', alignItems: 'center', gap: 3,
        }}>
          <Ionicons name="checkmark" size={9} color="#000" />
          <Text style={{ color: '#000', fontSize: 8, fontWeight: '900' }}>AKTİF</Text>
        </View>
      )}

      {/* Avatar önizleme */}
      <AvatarWithFrame
        avatarUrl={avatarUrl}
        username={username}
        frameId={frame.id}
        size={moderateScale(80)}
      />

      {/* İsim */}
      <Text style={{
        color: isActive ? frame.color : '#fff',
        fontWeight: '800',
        fontSize: moderateScale(12),
        textAlign: 'center',
      }}>
        {frame.name}
      </Text>

      {/* Buton */}
      {isLoading ? (
        <View style={{
          width: '100%', paddingVertical: 10,
          backgroundColor: `${frame.color}20`,
          borderRadius: 12, alignItems: 'center',
        }}>
          <ActivityIndicator size="small" color={frame.color} />
        </View>
      ) : isActive ? (
        /* ── Kullanılıyor ── */
        <View style={{
          width: '100%', paddingVertical: 9,
          backgroundColor: `${frame.color}20`,
          borderRadius: 12, alignItems: 'center',
          flexDirection: 'row', justifyContent: 'center', gap: 5,
        }}>
          <Ionicons name="checkmark-circle" size={14} color={frame.color} />
          <Text style={{ color: frame.color, fontWeight: '900', fontSize: moderateScale(11) }}>
            Kullanılıyor
          </Text>
        </View>
      ) : isOwned ? (
        /* ── Aktif Et ── */
        <Pressable
          onPress={onActivate}
          style={({ pressed }) => ({
            width: '100%', paddingVertical: 9,
            backgroundColor: pressed ? `${frame.color}30` : `${frame.color}18`,
            borderRadius: 12, alignItems: 'center',
            borderWidth: 1, borderColor: `${frame.color}40`,
          })}
        >
          <Text style={{ color: frame.color, fontWeight: '900', fontSize: moderateScale(11) }}>
            Aktif Et
          </Text>
        </Pressable>
      ) : (
        /* ── Satın Al ── */
        <Pressable
          onPress={onBuy}
          disabled={frame.coinPrice !== null && !canAfford}
          style={({ pressed }) => ({
            width: '100%', paddingVertical: 9,
            backgroundColor: pressed
              ? 'rgba(255,255,255,0.1)'
              : (frame.coinPrice !== null && !canAfford)
                ? 'rgba(255,255,255,0.04)'
                : `${frame.color}18`,
            borderRadius: 12, alignItems: 'center',
            borderWidth: 1,
            borderColor: (frame.coinPrice !== null && !canAfford)
              ? 'rgba(255,255,255,0.08)'
              : `${frame.color}40`,
            flexDirection: 'row', justifyContent: 'center', gap: 5,
          })}
        >
          {isFree ? (
            <Text style={{ color: frame.color, fontWeight: '900', fontSize: moderateScale(11) }}>
              Ücretsiz
            </Text>
          ) : frame.coinPrice !== null ? (
            <>
              <Ionicons
                name="diamond-outline"
                size={12}
                color={canAfford ? '#82cfff' : 'rgba(255,255,255,0.3)'}
              />
              <Text style={{
                color: canAfford ? '#fff' : 'rgba(255,255,255,0.3)',
                fontWeight: '900', fontSize: moderateScale(11),
              }}>
                {frame.coinPrice.toLocaleString('tr-TR')}
              </Text>
            </>
          ) : (
            <Text style={{ color: frame.color, fontWeight: '900', fontSize: moderateScale(11) }}>
              {frame.price}
            </Text>
          )}
        </Pressable>
      )}
    </View>
  );
};
