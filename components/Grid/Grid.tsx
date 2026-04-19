import React from 'react';
import { Dimensions, View } from 'react-native';
import { Row as RowData } from '../../types';
import GridRow from './Row';

interface GridProps {
  grid: RowData[];
  currentRow: number;
  currentGuess: string;
  cellSize?: number;
  cellHeight?: number;
  isBlind?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LAYOUT: Record<number, { gap: number; padding: number; heightRatio: number }> = {
  4: { gap: 10, padding: 80, heightRatio: 0.84 },
  5: { gap: 8, padding: 56, heightRatio: 1.0 },
  6: { gap: 5, padding: 15, heightRatio: 1.0 },
  7: { gap: 5, padding: 15, heightRatio: 1.0 },
};

const MAX_CELL_WIDTH: Record<number, number> = {
  4: 62,
  5: 62,
  6: 56,
  7: 50,
};

const Grid: React.FC<GridProps & { maxGridWidth?: number }> = React.memo(({ 
  grid, 
  currentRow, 
  currentGuess, 
  isBlind,
  maxGridWidth
}) => {
  const rowLength = grid?.[0]?.cells?.length || 5;

  const { gap, padding, heightRatio } = LAYOUT[rowLength] ?? { gap: 5, padding: 20, heightRatio: 0.85 };
  const maxWidth = MAX_CELL_WIDTH[rowLength] ?? 50;

  const containerWidth = maxGridWidth || SCREEN_WIDTH;
  const rawWidth = (containerWidth - (maxGridWidth ? 10 : padding) - (rowLength - 1) * gap) / rowLength;
  const cellWidth = Math.min(rawWidth, maxWidth);
  const cellHeight = Math.round(cellWidth * heightRatio);

  return (
    <View style={{ gap, width: '100%', alignItems: 'center' }}>
      {grid && grid.map((row, rowIndex) => {
        if (!row) return null;
        return (
          <GridRow
            key={row.id}
            rowData={row}
            rowIndex={rowIndex}
            currentRow={currentRow}
            currentGuess={currentGuess}
            cellWidth={cellWidth}
            cellHeight={cellHeight}
            gap={gap}
            isBlind={isBlind}
          />
        );
      })}
    </View>
  );
});

Grid.displayName = 'Grid';

export default Grid;
