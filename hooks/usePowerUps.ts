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
  onUse: (key: PowerUpKey) => boolean | void | 'toggle'
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
          count: !prev[key]!.isActive ? 1 : 0
        },
      }));
    } else {
      // Count-based logic
      if (current.count <= 0 && !current.isActive) return;

      // Special case: if onUse returns exactly 'toggle', we just flip isActive
      // and don't decrement the count here.
      const result = onUse(key);
      
      if (result === 'toggle') {
        setStates(prev => ({
          ...prev,
          [key]: { ...prev[key]!, isActive: !prev[key]!.isActive }
        }));
        return;
      }

      if (result === false) return;

      setStates(prev => ({
        ...prev,
        [key]: { ...prev[key]!, count: Math.max(0, prev[key]!.count - 1), isActive: false },
      }));
    }
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
