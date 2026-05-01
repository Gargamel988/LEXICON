import AsyncStorage from "@react-native-async-storage/async-storage";
import mobileAds, {
  AdEventType,
  AppOpenAd,
  InterstitialAd,
  RewardedAd,
  RewardedAdEventType,
} from "react-native-google-mobile-ads";
import { AD_CONFIG, AD_UNIT_IDS } from "../constants/ads";

class AdService {
  private interstitial: InterstitialAd | null = null;
  private appOpenAd: AppOpenAd | null = null;
  private gameCounter = 0;
  private STORAGE_KEY = "@game_ad_counter";

  async init() {
    await mobileAds().initialize();
    this.loadCounter();
    this.prepareInterstitial();
    this.prepareAppOpenAd();
  }

  // ... (previous methods)

  private prepareAppOpenAd() {
    this.appOpenAd = AppOpenAd.createForAdRequest(AD_UNIT_IDS.APP_OPEN, {
      keywords: ["games", "puzzles"],
    });

    this.appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
      this.appOpenAd?.load();
    });

    this.appOpenAd.load();
  }

  async showAppOpenAd() {
    if (this.appOpenAd?.loaded) {
      this.appOpenAd.show();
    } else {
      this.appOpenAd?.load();
    }
  }

  private async loadCounter() {
    try {
      const saved = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (saved) this.gameCounter = parseInt(saved, 10);
    } catch (e) {
      // console.error("Ad counter load error:", e);
    }
  }

  private async saveCounter() {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, this.gameCounter.toString());
    } catch (e) {
      // console.error("Ad counter save error:", e);
    }
  }

  // --- Interstitial Logic ---

  private prepareInterstitial() {
    this.interstitial = InterstitialAd.createForAdRequest(
      AD_UNIT_IDS.INTERSTITIAL,
      {
        keywords: ["games", "puzzles", "word games"],
      },
    );

    this.interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      this.interstitial?.load();
    });

    this.interstitial.load();
  }

  async checkAndShowInterstitial(): Promise<boolean> {
    this.gameCounter++;
    await this.saveCounter();

    if (this.gameCounter >= AD_CONFIG.INTERSTITIAL_INTERVAL) {
      if (this.interstitial?.loaded) {
        this.interstitial.show();
        this.gameCounter = 0;
        await this.saveCounter();
        return true;
      }
    }
    return false;
  }

  // --- Rewarded Logic ---

  showRewardedAd(
    unitId: string,
    onReward: (amount: number) => void,
    onError?: () => void,
  ) {
    const rewarded = RewardedAd.createForAdRequest(unitId);

    rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
      onReward(reward.amount);
    });

    rewarded.addAdEventListener(AdEventType.ERROR, () => {
      onError?.();
    });

    rewarded.addAdEventListener(AdEventType.LOADED, () => {
      rewarded.show();
    });

    rewarded.load();
  }
}

export const adService = new AdService();
