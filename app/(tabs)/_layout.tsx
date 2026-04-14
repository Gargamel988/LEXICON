import { Ionicons } from '@expo/vector-icons';

import { Tabs } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';

export default function TabLayout() {
  return (
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
      tabBar={(props) => <CustomTabBar {...props} />}

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
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: '#0f0f0f',
      borderTopWidth: 1,
      borderTopColor: '#1c1c1e',
      paddingBottom: Math.max(insets.bottom), // Use safe area inset for bottom padding
      paddingTop: 12,
      justifyContent: 'space-around',
      alignItems: 'center',
    }}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.title !== undefined ? options.title : route.name;
        const isFocused = state.index === index;

        const onPress = () => {
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
            key={index}
            onPress={onPress}
            style={{ alignItems: 'center', gap: 4 }}
          >
            <View style={{
              backgroundColor: isFocused ? 'rgba(99, 153, 34, 0.1)' : 'transparent',
              paddingHorizontal: 20,
              paddingVertical: 6,
              borderRadius: isFocused ? 16 : 0,
            }}>
              <Ionicons
                name={iconName}
                size={24}
                color={isFocused ? Colors.correct.main : Colors.textSecondary}
              />
            </View>
            <Text style={{
              color: isFocused ? Colors.correct.main : Colors.textSecondary,
              fontSize: 10,
              fontWeight: '900',
              letterSpacing: 0.5,
            }}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
