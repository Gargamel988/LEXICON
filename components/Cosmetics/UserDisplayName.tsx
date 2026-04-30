import React from 'react';
import { Text, View } from 'react-native';
import { NAMETAGS } from '../../constants/nametags';
import { TITLES, getTitleStyle } from '../../constants/titles';
import { useResponsive } from '../../hooks/useResponsive';
import { NAMEPLATE_COMPONENTS } from '../nameplates';

interface UserDisplayNameProps {
  username: string;
  nametagId?: string | null;
  titleId?: string | null;
  fontSize?: number;
  containerStyle?: any;
  size?: 'mini' | 'small' | 'medium' | 'large';
}

export const UserDisplayName: React.FC<UserDisplayNameProps> = ({
  username,
  nametagId,
  titleId,
  fontSize,
  containerStyle,
  size = 'medium',
}) => {
  const { moderateScale } = useResponsive();
  const nametag = NAMETAGS.find((n) => n.id === nametagId);
  const title = TITLES.find((t) => t.id === titleId);
  const sizeMap = {
    mini: { height: moderateScale(18), minWidth: moderateScale(90), fontSize: fontSize ?? moderateScale(9), titleSize: moderateScale(7) },
    small: { height: moderateScale(24), minWidth: moderateScale(120), fontSize: fontSize ?? moderateScale(12), titleSize: moderateScale(8) },
    medium: { height: moderateScale(32), minWidth: moderateScale(150), fontSize: fontSize ?? moderateScale(15), titleSize: moderateScale(10) },
    large: { height: moderateScale(44), minWidth: moderateScale(200), fontSize: fontSize ?? moderateScale(19), titleSize: moderateScale(12) },
  };


  const currentSizeData = sizeMap[size] || sizeMap.medium;
  const { height, minWidth, fontSize: fs, titleSize } = currentSizeData;

  const renderContent = () => {
    if (!nametagId || nametagId === 'default' || !NAMEPLATE_COMPONENTS[nametagId]) {
      return (
        <View style={[{ alignItems: 'center', justifyContent: 'center' }, containerStyle]}>
          {title && (
            <Text
              numberOfLines={1}
              style={[
                getTitleStyle(titleId || undefined),
                {
                  fontSize: titleSize,
                  fontWeight: '800',
                  marginBottom: moderateScale(size === 'small' ? 1 : 2),
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  textAlign: 'center',
                }
              ]}
            >
              {title.label}
            </Text>
          )}
          <Text style={{
            color: '#fff',
            fontWeight: '900',
            fontSize: fs,
            textShadowColor: 'rgba(0,0,0,0.5)',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 3
          }}>
            {username}
          </Text>
        </View>
      );
    }

    return (
      <View style={[{ alignItems: 'center', justifyContent: 'center' }, containerStyle]}>
        {title && (
          <View style={{ marginBottom: moderateScale(-4), zIndex: 10 }}>
            <Text
              numberOfLines={1}
              style={[
                getTitleStyle(titleId || undefined),
                {
                  fontSize: titleSize,
                  fontWeight: '800',
                  marginBottom: moderateScale(size === 'small' ? 1 : 2),
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  textAlign: 'center',
                }
              ]}
            >
              {title.label}
            </Text>
          </View>
        )}
        <View style={{
          height: height,
          width: minWidth,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {React.createElement(NAMEPLATE_COMPONENTS[nametagId!], {
            username: username,
            size: size === 'large' ? 'large' : 'small'
          })}

        </View>

      </View>
    );
  };


  return renderContent();
};