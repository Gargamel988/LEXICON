import React from 'react';
import { ScrollView, View } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { CellData, Row } from '../../types';
import Grid from './Grid';

interface MultiGridProps {
  grids: Row[][];
  currentRow: number;
  currentGuess: string;
  solvedStates: boolean[];
}

const MultiGrid: React.FC<MultiGridProps> = React.memo(({ grids, currentRow, currentGuess, solvedStates }) => {
  const { width: SCREEN_WIDTH } = useResponsive();

  if (!grids || grids.length === 0) return null;

  const wordCount = grids.length;
  const numColumns = wordCount > 1 ? 2 : 1;
  const gridWidth = (SCREEN_WIDTH - 30) / numColumns;

  return (
    <ScrollView
      contentContainerStyle={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
      }}
      showsVerticalScrollIndicator={false}
    >
      {grids && grids.map((grid, index) => {
        if (!grid) return null;

        const isSolved = solvedStates?.[index];
        const borderColor = isSolved ? '#4CAF50' : '#8E24AA';
        const shadowColor = isSolved ? 'rgba(76, 175, 80, 0.4)' : 'rgba(142, 36, 170, 0.3)';

        return (
          <View
            key={`multi-grid-${index}`}
            style={{
              width: gridWidth - 8,
              borderWidth: 1.5,
              borderColor: borderColor,
              padding: 6,
              borderRadius: 16,
              opacity: isSolved ? 0.65 : 1,
              backgroundColor: isSolved ? 'rgba(76, 175, 80, 0.08)' : 'rgba(142, 36, 170, 0.03)',
              marginBottom: 15,
              shadowColor: shadowColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 1,
              shadowRadius: 10,
              elevation: 5,
            }}
          >
            <Grid
              grid={grid}
              currentRow={currentRow}
              currentGuess={currentGuess}
              maxGridWidth={gridWidth - 20}
            />
          </View>
        );
      })}
    </ScrollView>
  );
});

MultiGrid.displayName = 'MultiGrid';

export default MultiGrid;
