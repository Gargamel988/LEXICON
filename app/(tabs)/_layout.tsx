import { Ionicons } from '@expo/vector-icons';
import React from 'react';

import { Tabs } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthRequiredModal from '../../components/modal/AuthRequiredModal';
import Colors from '../../constants/Colors';
import { useAuth } from '../../hooks/useAuth';
import { useResponsive } from '../../hooks/useResponsive';

export default function TabLayout() {
  const [isAuthModalVisible, setIsAuthModalVisible] = React.useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: '#0f0f0f',
            borderTopWidth: 1,
            borderTopColor: '#1c1c1e',
          },
        }}
        tabBar={(props) => (
          <CustomTabBar
            {...props}
            onShowAuthModal={() => setIsAuthModalVisible(true)}
          />
        )}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'ANA SAYFA',
            tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: 'İSTATİSTİK',
            tabBarIcon: ({ color }) => <Ionicons name="bar-chart" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="leaderboard"
          options={{
            title: 'SIRALAMA',
            tabBarIcon: ({ color }) => <Ionicons name="stats-chart" size={24} color={color} />,
          }}
        />

        <Tabs.Screen
          name="shop"
          options={{
            title: 'MAĞAZA',
            tabBarIcon: ({ color }) => <Ionicons name="bag-handle" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'PROFİL',
            tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
          }}
        />
      </Tabs>
      <AuthRequiredModal
        isVisible={isAuthModalVisible}
        onClose={() => setIsAuthModalVisible(false)}
      />
    </>
  );
}

function CustomTabBar({ state, descriptors, navigation, onShowAuthModal }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { moderateScale } = useResponsive();

  return (
    <View style={{
      width: '100%',
      flexDirection: 'row',
      backgroundColor: '#0f0f0f',
      borderTopWidth: 1,
      borderTopColor: '#1c1c1e',
      paddingBottom: Math.max(insets.bottom, moderateScale(10)), 
      paddingTop: moderateScale(12),
      paddingHorizontal: moderateScale(8), // Dengeleme için eklendi
      alignItems: 'center',
    }}>
      {state.routes.filter((route: any) => descriptors[route.key].options.href !== null).map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.title !== undefined ? options.title : route.name;
        const isFocused = state.routes[state.index].key === route.key;

        const onPress = () => {
          // Korumalı rotalar listesi
          const protectedRoutes = ['stats', 'leaderboard', 'shop', 'profile'];
          const isProtectedRoute = protectedRoutes.includes(route.name);

          if (isProtectedRoute && !user) {
            onShowAuthModal();
            return;
          }

          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const iconName = options.tabBarIcon ? options.tabBarIcon({ color: isFocused ? Colors.correct.main : Colors.textSecondary }).props.name : 'help-circle';

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={{ flex: 1, alignItems: 'center', gap: 4 }}
          >
            <View style={{
              backgroundColor: isFocused ? 'rgba(99, 153, 34, 0.1)' : 'transparent',
              paddingHorizontal: moderateScale(20),
              paddingVertical: moderateScale(6),
              borderRadius: isFocused ? moderateScale(16) : 0,
              alignItems: 'center',
            }}>
              <Ionicons
                name={iconName}
                size={moderateScale(24)}
                color={isFocused ? Colors.correct.main : Colors.textSecondary}
              />
            </View>
            <Text style={{
              color: isFocused ? Colors.correct.main : Colors.textSecondary,
              fontSize: moderateScale(10),
              fontWeight: '900',
              letterSpacing: 0.5,
              textAlign: 'center'
            }}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
