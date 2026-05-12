import NetInfo from '@react-native-community/netinfo';

export const networkService = {
  isOnline: true,
  listeners: [] as ((online: boolean) => void)[],

  init() {
    // Subscribe to network state changes
    NetInfo.addEventListener(state => {
      const online = !!state.isConnected && !!state.isInternetReachable;
      if (this.isOnline !== online) {
        this.isOnline = online;
        this.notify();
      }
    });

    // Initial check
    NetInfo.fetch().then(state => {
      this.isOnline = !!state.isConnected && !!state.isInternetReachable;
    });
  },

  async checkConnection(): Promise<boolean> {
    const state = await NetInfo.fetch();
    this.isOnline = !!state.isConnected && !!state.isInternetReachable;
    return this.isOnline;
  },

  addListener(callback: (online: boolean) => void) {
    this.listeners.push(callback);
  },

  removeListener(callback: (online: boolean) => void) {
    this.listeners = this.listeners.filter(l => l !== callback);
  },

  notify() {
    this.listeners.forEach(l => l(this.isOnline));
  }
};
