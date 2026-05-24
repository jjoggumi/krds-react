import { useEffect, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface RowVirtualizerProps {
  estimateSize: number;
  overscan: number;
  getItemKey: (index: number) => string;
  rows: any[];
}

export const useVirtualRows = ({ estimateSize, overscan, getItemKey, rows }: RowVirtualizerProps) => {
  const virtualRowsParentRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => virtualRowsParentRef.current,
    estimateSize: () => estimateSize,
    overscan: overscan,
    getItemKey: getItemKey,
  });

  useEffect(() => {
    rowVirtualizer.measure();
  }, [rows.length, rowVirtualizer]);

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize(); // 전체 항목들의 총 높이
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0; // 스크롤 상단의 가려진 영역 높이
  const last = virtualRows.length > 0 ? virtualRows[virtualRows.length - 1] : null; // 마지막 가상 항목
  const bottom = last ? totalSize - (last.start + last.size) : 0; // 스크롤 하단의 가려진 영역 높이

  return { rowVirtualizer, virtualRowsParentRef, virtualRows, paddingTop, bottom };
}