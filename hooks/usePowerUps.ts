import { useCallback, useState } from 'react';
import { PowerUpConfig } from '../components/Game/PowerUpToolbar';
import { PowerUpKey, POWER_UP_DEFINITIONS } from '../constants/powerUps';

export interface PowerUpState {
  count: number;
  isActive?: boolean;
}

export type PowerUpStates = Partial<Record<PowerUpKey, PowerUpState>>;

export const usePowerUps = (
  keys: PowerUpKey[],
  initialStates: PowerUpStates,
  onUse: (key: PowerUpKey) => void
) => {
  const [states, setStates] = useState<PowerUpStates>(initialStates);

  // Helper to reset states (useful when starting a new game)
  const resetPowerUps = useCallback((newStates: PowerUpStates) => {
    setStates(newStates);
  }, []);

  const handlePress = useCallback((key: PowerUpKey) => {
    const def = POWER_UP_DEFINITIONS[key];
    const current = states[key];
    if (!current) return;

    if (def.alwaysEnabled) {
      // Toggle logic for modes like 'risk'
      setStates(prev => ({
        ...prev,
        [key]: { 
          ...prev[key]!, 
          isActive: !prev[key]!.isActive,
          // Special case: for 'risk', we also toggle count between 1 and 0 for UI consistency if needed,
          // but isActive is the primary driver.
          count: !prev[key]!.isActive ? 1 : 0
        },
      }));
    } else {
      // Count-based logic
      if (current.count <= 0) return;
      setStates(prev => ({
        ...prev,
        [key]: { ...prev[key]!, count: Math.max(0, prev[key]!.count - 1) },
      }));
    }

    onUse(key);
  }, [states, onUse]);

  const configs: PowerUpConfig[] = keys.map(key => {
    const def = POWER_UP_DEFINITIONS[key];
    const state = states[key] ?? { count: 0 };
    return {
      ...def,
      count: state.count,
      isActive: state.isActive,
      onPress: () => handlePress(key),
    };
  });

  return { configs, states, setStates, resetPowerUps };
};
