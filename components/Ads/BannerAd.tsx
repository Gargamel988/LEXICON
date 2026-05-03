import React from 'react';
import { Platform, View } from 'react-native';
import { BannerAd as AdMobBanner, BannerAdSize } from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS } from '../../constants/ads';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { adService } from '../../services/adService';

interface BannerAdProps {
  size?: BannerAdSize;
}

export const BannerAd: React.FC<BannerAdProps> = ({ size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER }) => {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);

  if (profile?.no_ads || adService.isAdFree) return null;

  // Web'de reklam gösterme
  if (Platform.OS === 'web') return null;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', backgroundColor: 'transparent' }}>
      <AdMobBanner
        unitId={AD_UNIT_IDS.BANNER}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdFailedToLoad={(error) => console.log('Banner ad failed to load: ', error)}
      />
    </View>
  );
};
