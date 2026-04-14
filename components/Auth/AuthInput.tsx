import React from 'react';
import { View, Text, TextInput, TextInputProps, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive } from '../../hooks/useResponsive';
import Colors from '../../constants/Colors';

interface AuthInputProps extends TextInputProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  error?: string;
  isPassword?: boolean;
}

export default function AuthInput({ label, icon, error, isPassword, ...props }: AuthInputProps) {
  const { scale, moderateScale } = useResponsive();
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <View style={{ marginBottom: moderateScale(20) }}>
      <Text style={{
        color: Colors.textSecondary,
        fontSize: moderateScale(12),
        fontWeight: '700',
        marginBottom: moderateScale(8),
        letterSpacing: 1,
      }}>
        {label.toUpperCase()}
      </Text>
      
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
        borderRadius: moderateScale(12),
        borderWidth: 1,
        borderColor: error ? '#ff4d4d' : '#222',
        paddingHorizontal: moderateScale(16),
        height: moderateScale(56),
      }}>
        <Ionicons name={icon} size={20} color={Colors.textSecondary} style={{ marginRight: 12 }} />
        
        <TextInput
          {...props}
          secureTextEntry={isPassword && !showPassword}
          placeholderTextColor="#444"
          style={{
            flex: 1,
            color: '#fff',
            fontSize: moderateScale(16),
            height: '100%',
          }}
        />

        {isPassword && (
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            <Ionicons 
              name={showPassword ? "eye-off-outline" : "eye-outline"} 
              size={20} 
              color={Colors.textSecondary} 
            />
          </Pressable>
        )}
      </View>
      
      {error && (
        <Text style={{ 
          color: '#ff4d4d', 
          fontSize: moderateScale(12), 
          marginTop: 4,
          fontWeight: '500' 
        }}>
          {error}
        </Text>
      )}
    </View>
  );
}
