import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';

interface SocialButtonProps {
  onPress: () => void;
  loading?: boolean;
}

export default function SocialButton({ onPress, loading }: SocialButtonProps) {
  const { moderateScale } = useResponsive();

  const handlePress = () => {
    if (loading) return;
    onPress();
  };

  return (
    <View style={{ width: '100%', paddingVertical: 8 }}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#111', // Deep black
          height: moderateScale(60),
          width: '100%',
          borderRadius: moderateScale(16),
          borderWidth: 1.5,
          borderColor: pressed ? '#4285F4' : '#333',
          
          // NEON GLOW EFFECT
          shadowColor: '#4285F4',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: pressed ? 0.8 : 0.3,
          shadowRadius: pressed ? 12 : 8,
          elevation: 10,
          
          transform: [{ scale: pressed ? 0.98 : 1 }],
          opacity: 1,
        })}
      >
        <View style={{
          width: 32,
          height: 32,
          backgroundColor: '#fff',
          borderRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
        }}>
          {loading ? (
            <ActivityIndicator size="small" color="#4285F4" />
          ) : (
            <Ionicons
              name={"logo-google"}
              size={20}
              color={"#4285F4"}
            />
          )}
        </View>
        
        <Text style={{
          color: '#fff',
          fontSize: moderateScale(15),
          fontWeight: '900',
          letterSpacing: 1.2,
        }}>
          GOOGLE İLE DEVAM ET
        </Text>
      </Pressable>
    </View>
  );
}
