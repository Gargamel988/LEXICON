import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface GameLayoutProps {
  children: React.ReactNode;
  backgroundColor?: string;
}

const GameLayout: React.FC<GameLayoutProps> = ({
  children,
  backgroundColor = '#0a0a1a',
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={{
      flex: 1,
      backgroundColor: backgroundColor,
    }}>
      <StatusBar style="light" />
      <View style={{
        flex: 1,
        paddingBottom: insets.bottom,
      }}>
        {children}
      </View>
    </View>
  );
};

export default GameLayout;
