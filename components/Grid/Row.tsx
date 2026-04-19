import React from 'react';
import { View } from 'react-native';
import { CellData, Row as RowType } from '../../types';
import Cell from './Cell';

interface RowProps {
  rowData: RowType;
  rowIndex: number;
  currentRow: number;
  currentGuess: string;
  cellWidth: number;
  cellHeight: number;
  gap: number;
  isBlind?: boolean;
}

const Row: React.FC<RowProps> = React.memo(({ 
  rowData, 
  rowIndex, 
  currentRow, 
  currentGuess, 
  cellWidth, 
  cellHeight, 
  gap, 
  isBlind 
}) => {
  const isCurrentRow = rowIndex === currentRow;
  const { cells } = rowData;

  return (
    <View style={{ flexDirection: 'row', gap, justifyContent: 'center', width: '100%' }}>
      {cells && cells.map((cell, cellIndex) => {
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
  // 3. The row data itself changed (e.g. after submission or ID refresh)
  
  const wasActive = prevProps.rowIndex === prevProps.currentRow;
  const isActive = nextProps.rowIndex === nextProps.currentRow;

  if (wasActive || isActive) {
    if (prevProps.currentGuess !== nextProps.currentGuess) return false;
    if (prevProps.currentRow !== nextProps.currentRow) return false;
  }
  
  // Checking rowData reference is efficient because we create a new object+ID on change
  if (prevProps.rowData !== nextProps.rowData) return false;
  if (prevProps.cellWidth !== nextProps.cellWidth) return false;
  if (prevProps.isBlind !== nextProps.isBlind) return false;

  return true;
});

Row.displayName = 'Row';

export default Row;
