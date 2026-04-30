import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { PowerUpDefinition } from '../constants/powerUps';

/** Doğru ikon paketini kullanarak ikonu render eder */
export function renderPowerUpIcon(
  def: Pick<PowerUpDefinition, 'icon' | 'iconSet'>,
  size: number,
  color: string
): React.ReactElement {
  if (def.iconSet === 'MaterialCommunityIcons') {
    return (
      <MaterialCommunityIcons
        name={def.icon as keyof typeof MaterialCommunityIcons.glyphMap}
        size={size}
        color={color}
      />
    );
  }
  return (
    <Ionicons
      name={def.icon as keyof typeof Ionicons.glyphMap}
      size={size}
      color={color}
    />
  );
}
