/**
 * NameTagCard — Tek bir isimlik kartı
 */
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { NameTag } from '../../constants/nametags';
import { useResponsive } from '../../hooks/useResponsive';
import { UserDisplayName } from './UserDisplayName';

interface Props {
  nametag: NameTag;
  isOwned: boolean;
  isActive: boolean;
  color: string;
  username?: string;
  isBuying?: boolean;
  isSettingActive?: boolean;
  onActivate: () => void;
  onBuy: () => void;
}

export const NameTagCard = ({
  nametag,
  isOwned,
  isActive,
  username = 'OYUNCU',
  isBuying,
  color,
  isSettingActive,
  onActivate,
  onBuy,
}: Props) => {
  const { moderateScale } = useResponsive();
  const isLoading = isBuying || isSettingActive;
  const isFree = nametag.price === null || nametag.price === undefined || nametag.price === '0';

  return (
    <View style={{
      width: '100%',
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderRadius: 16,
      borderWidth: isActive ? 1.5 : 1,
      borderColor: isActive ? `${color}80` : 'rgba(255,255,255,0.06)',
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      {/* Sol taraf: Önizleme */}
      <View style={{ flex: 1, gap: 8 }}>
        <Text style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 1
        }}>
          {nametag.name.toUpperCase()}
        </Text>

        {/* İsimlik Önizlemesi */}
        <UserDisplayName
          username={username}
          nametagId={nametag.id === 'none' ? null : nametag.id}
          fontSize={moderateScale(14)}
          containerStyle={{
            width: moderateScale(160),
            height: moderateScale(36),
          }}
        />

        <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>
          {nametag.rarity === 'legendary' ? '✨ Efsanevi İsimlik' :
            nametag.rarity === 'epic' ? '🟣 Epik İsimlik' : '🔵 Nadir İsimlik'}
        </Text>
      </View>

      {/* Sağ taraf: Butonlar */}
      <View style={{ width: moderateScale(100) }}>
        {isLoading ? (
          <ActivityIndicator size="small" color={color} />
        ) : isActive ? (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: `${color}20`,
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 10,
            justifyContent: 'center'
          }}>
            <Ionicons name="checkmark-circle" size={14} color={color} />
            <Text style={{ color: color, fontWeight: '900', fontSize: 11 }}>Aktif</Text>
          </View>
        ) : isOwned ? (
          <Pressable
            onPress={onActivate}
            style={({ pressed }) => ({
              backgroundColor: pressed ? `${color}40` : `${color}20`,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 10,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: `${color}40`
            })}
          >
            <Text style={{ color: color, fontWeight: '900', fontSize: 11 }}>Kullan</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={onBuy}
            style={({ pressed }) => ({
              backgroundColor: pressed ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 10,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 4,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.15)'
            })}
          >
            {isFree ? (
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 11 }}>ÜCRETSİZ</Text>
            ) : (
              <>
                <Ionicons name="card-outline" size={12} color="#82cfff" />
                <Text style={{
                  color: '#fff',
                  fontWeight: '900',
                  fontSize: 11
                }}>
                  {nametag.price}
                </Text>
              </>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
};
