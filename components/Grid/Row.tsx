import React from 'react';
import { View } from 'react-native';
import { CellData } from '../../types';
import Cell from './Cell';

interface RowProps {
  row: CellData[];
  rowIndex: number;
  currentRow: number;
  currentGuess: string;
  cellWidth: number;
  cellHeight: number;
  gap: number;
  isBlind?: boolean;
}

const Row: React.FC<RowProps> = React.memo(({ 
  row, 
  rowIndex, 
  currentRow, 
  currentGuess, 
  cellWidth, 
  cellHeight, 
  gap, 
  isBlind 
}) => {
  const isCurrentRow = rowIndex === currentRow;

  return (
    <View style={{ flexDirection: 'row', gap, justifyContent: 'center', width: '100%' }}>
      {row && row.map((cell, cellIndex) => {
        // If it's the current row AND the cell is empty (waiting for guess), 
        // show the character from currentGuess. Otherwise show cell.char.
        const char = (isCurrentRow && cell.status === 'empty') ? currentGuess[cellIndex] : cell.char;

        return (
          <Cell
            key={cellIndex}
            char={char}
            status={cell.status}
            index={cellIndex}
            size={cellWidth}
            height={cellHeight}
            isBlind={isBlind}
          />
        );
      })}
    </View>
  );
}, (prevProps, nextProps) => {
  // Optimization: Only re-render if:
  // 1. It's the current row and the guess changed
  // 2. The currentRow indicator moved to/from this row
  // 3. The row data itself changed (e.g. after submission)
  // 4. Other layout props changed
  
  const wasActive = prevProps.rowIndex === prevProps.currentRow;
  const isActive = nextProps.rowIndex === nextProps.currentRow;

  if (wasActive || isActive) {
    if (prevProps.currentGuess !== nextProps.currentGuess) return false;
    if (prevProps.currentRow !== nextProps.currentRow) return false;
  }
  
  if (prevProps.row !== nextProps.row) return false;
  if (prevProps.cellWidth !== nextProps.cellWidth) return false;
  if (prevProps.isBlind !== nextProps.isBlind) return false;

  return true;
});

Row.displayName = 'Row';

export default Row;
