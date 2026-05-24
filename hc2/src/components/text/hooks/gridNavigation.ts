import { useState, useCallback, KeyboardEvent } from 'react';

interface GridNavOptions {
  maxRow: number;
  maxCell: number;
  startCellIndex: number;
  onAddRow?: () => void;
}

export const useGridNavigation = ({ maxRow, maxCell, startCellIndex, onAddRow }: GridNavOptions) => {
  const [focusedCell, setFocusedCell] = useState<{ r: number, c: number } | null>(null);

  const handleChangeFocusedInput = useCallback((
    e: KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    cellIndex: number
  ) => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key)) return;
    if (e.nativeEvent.isComposing) return;

    if (e.key === 'Tab') {
      e.preventDefault();
    }

    let nextRow = rowIndex;
    let nextCol = cellIndex;

    const input = e.currentTarget as HTMLInputElement;
    const selStart = input.selectionStart ?? 0;
    const selEnd = input.selectionEnd ?? selStart;
    const textLength = input.value.length;

    const atStart = selStart === 0 && selEnd === 0;
    const atEnd = selStart === textLength && selEnd === textLength;

    switch (e.key) {
      case 'ArrowUp':
        nextRow = Math.max(0, rowIndex - 1);
        break;
      case 'ArrowDown':
      case 'Enter':
        nextRow = Math.min(maxRow, rowIndex + 1);
        break;
      case 'ArrowLeft': {
        if (!atStart) return;
        nextCol = Math.max(0, cellIndex - 1);
        break;
      }
      case 'ArrowRight': {
        if (!atEnd) return;
        nextCol = Math.min(maxCell - 1, cellIndex + 1);
        break;
      }
      case 'Tab': {
        if (e.shiftKey) {
          if (cellIndex === startCellIndex) {
            nextCol = maxCell - 1;
            nextRow = Math.max(0, rowIndex - 1);
          } else {
            nextCol = Math.max(startCellIndex, cellIndex - 1);
          }
        } else {
          if (cellIndex === maxCell - 1) {
            nextCol = startCellIndex;
            nextRow = Math.min(maxRow, rowIndex + 1);
          } else {
            nextCol = cellIndex + 1;
          }
        }
        break;
      }
    }

    if (nextRow !== rowIndex || nextCol !== cellIndex) {
      setFocusedCell({ r: nextRow, c: nextCol });
    }
  }, [maxRow, maxCell, onAddRow]);

  return {
    focusedCell,
    setFocusedCell,
    handleChangeFocusedInput
  };
};