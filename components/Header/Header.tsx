import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  title: string | React.ReactNode;
  subtitle?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  onBack?: () => void;
  showBack?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  leftElement,
  rightElement,
  onBack,
  showBack = true,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const Left = leftElement ? (
    leftElement
  ) : showBack ? (
    <Pressable
      onPress={handleBack}
      style={({ pressed }) => ({
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3a3a3c',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Ionicons name="chevron-back" size={24} color="#fff" />
    </Pressable>
  ) : (
    <View style={{ width: 40 }} />
  );

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: insets.top + 10,
      paddingBottom: 10,
      width: '100%',
    }}>
      <View style={{ flex: 1, alignItems: 'flex-start' }}>{Left}</View>

      <View style={{ flex: 2, alignItems: 'center' }}>
        <Text style={{
          color: '#fff',
          fontSize: 20,
          fontWeight: '900',
          letterSpacing: 2,
        }}>{title}</Text>
        {subtitle && (
          <Text style={{
            color: '#818384',
            fontSize: 12,
            fontWeight: '600',
            textTransform: 'uppercase',
            marginTop: 2,
          }}>{subtitle}</Text>
        )}
      </View>

      <View style={{ flex: 1, alignItems: 'flex-end' }}>
        {rightElement || <View style={{ width: 40 }} />}
      </View>
    </View>
  );
};

export default Header;
