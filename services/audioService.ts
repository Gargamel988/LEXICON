import { createAudioPlayer } from 'expo-audio';

export const SOUNDS = {
  CORRECT: require('../assets/sounds/correct.mp3'),
  WRONG: require('../assets/sounds/wrong.mp3'),
  GAME_OVER: require('../assets/sounds/game_over.mp3'),
  CLICK: require('../assets/sounds/click.mp3'),
  POWERUP: require('../assets/sounds/powerup.mp3'),
};

/**
 * Modern Audio Service using expo-audio
 */
export const audioService = {
  // Keep active players to prevent garbage collection during playback
  activePlayers: new Set<any>(),

  async playSound(soundKey: keyof typeof SOUNDS) {
    try {
      const player = createAudioPlayer(SOUNDS[soundKey]);
      this.activePlayers.add(player);
      
      player.play();
      
      // Cleanup when finished
      const subscription = player.addListener('playbackStatusUpdate', (status: any) => {
        if (status.didJustFinish) {
          this.activePlayers.delete(player);
          subscription.remove();
        }
      });
    } catch (error) {
      console.log('Audio play error:', error);
    }
  },

  async playBackgroundMusic(mode: string) {
    // Background music implementation
  }
};
