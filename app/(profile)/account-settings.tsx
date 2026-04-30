import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeleteSection } from '../../components/AccountSettings/DeleteSection';
import { EmailSection } from '../../components/AccountSettings/EmailSection';
import { PasswordSection } from '../../components/AccountSettings/PasswordSection';
import Colors from '../../constants/Colors';
import { useAuth } from '../../hooks/useAuth';
import { useResponsive } from '../../hooks/useResponsive';

type Tab = 'email' | 'password' | 'delete';

const TABS: {
  key: Tab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
    { key: 'email', label: 'E-posta', icon: 'mail-outline', color: '#4A9EFF' },
    { key: 'password', label: 'Şifre', icon: 'lock-closed-outline', color: '#30d158' },
    { key: 'delete', label: 'Hesabı Sil', icon: 'trash-outline', color: '#ff3b30' },
  ];

export default function AccountSettingsScreen() {
  const router = useRouter();
  const { user, signOutMutation } = useAuth();
  const { moderateScale } = useResponsive();

  // Google / OAuth ile giriş yapanları tespit et
  const provider = user?.app_metadata?.provider as string | undefined;
  const isGoogleUser = provider === 'google';

  // Google kullanıcılar sadece "Sil" sekmesin görebilir
  const visibleTabs = isGoogleUser
    ? TABS.filter(t => t.key === 'delete')
    : TABS;

  const [activeTab, setActiveTab] = useState<Tab>(
    isGoogleUser ? 'delete' : 'email'
  );

  const activeColor = TABS.find(t => t.key === activeTab)?.color ?? '#fff';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['top']}>

      {/* Gradient accent */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200 }} pointerEvents="none">
        <LinearGradient
          colors={[`${activeColor}12`, 'transparent']}
          style={{ flex: 1 }}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* ── Header ── */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 14,
          gap: 12,
        }}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={({ pressed }) => ({
              width: 38, height: 38, borderRadius: 12,
              backgroundColor: pressed ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)',
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
              justifyContent: 'center', alignItems: 'center',
            })}
          >
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </Pressable>

          <View>
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: moderateScale(18) }}>
              Hesap Ayarları
            </Text>
            {user?.email && (
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: moderateScale(11), marginTop: 1 }}>
                {user.email}
              </Text>
            )}
          </View>
        </View>

        {/* ── Google OAuth Banner ── */}
        {isGoogleUser && (
          <View style={{
            marginHorizontal: 20,
            marginBottom: 16,
            backgroundColor: 'rgba(66,133,244,0.1)',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: 'rgba(66,133,244,0.25)',
            padding: 14,
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 10,
          }}>
            <Ionicons name="logo-google" size={18} color="#4285F4" style={{ marginTop: 1 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#4285F4', fontWeight: '800', fontSize: moderateScale(13), marginBottom: 3 }}>
                Google ile giriş yapıldı
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: moderateScale(11), lineHeight: 16 }}>
                E-posta ve şifren Google tarafından yönetiliyor. Değiştirmek için Google Hesabım'a git.
              </Text>
            </View>
          </View>
        )}

        {/* ── Tab Switcher ── */}
        {visibleTabs.length > 1 && (
          <View style={{
            flexDirection: 'row',
            marginHorizontal: 20,
            marginBottom: 20,
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderRadius: 18,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.07)',
            padding: 4,
            gap: 4,
          }}>
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={({ pressed }) => ({
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                  paddingVertical: 11,
                  borderRadius: 14,
                  backgroundColor: isActive
                    ? `${tab.color}18`
                    : pressed ? 'rgba(255,255,255,0.04)' : 'transparent',
                  borderWidth: isActive ? 1 : 0,
                  borderColor: `${tab.color}30`,
                })}
              >
                <Ionicons
                  name={tab.icon}
                  size={15}
                  color={isActive ? tab.color : 'rgba(255,255,255,0.3)'}
                />
                <Text style={{
                  color: isActive ? tab.color : 'rgba(255,255,255,0.3)',
                  fontWeight: '800',
                  fontSize: moderateScale(11),
                }}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        )}

        {/* ── İçerik ── */}
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {activeTab === 'email' && (
            <EmailSection currentEmail={user?.email ?? ''} />
          )}
          {activeTab === 'password' && (
            <PasswordSection />
          )}
          {activeTab === 'delete' && (
            <DeleteSection
              onDeleted={() => {
                signOutMutation.mutate();
              }}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
