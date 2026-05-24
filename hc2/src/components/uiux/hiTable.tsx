import React from 'react';
import clsx from 'clsx';
import { HiScrollbar } from './hiScrollbar';

// 디자인 시스템 기준
// variant: primary | secondary | tertiary
// size:    xxl(56) | xl(48) | md(40) | xs(32)
//
// primary
//   - 상단 thead + tbody 구조
//   - border: border-tertiary-subtler, 둥근 모서리
//   - th: bg-secondary-subtler / td: border-neutral-base
//   - hover: bg-secondary-subtlest
//
// secondary
//   - 상단 thead + tbody 구조
//   - border 없음
//   - th: bg-neutral-subtler / td: border-neutral-base
//   - hover: bg-secondary-subtlest
//
// tertiary
//   - 좌측 th(120px) + 우측 td 구조 (scope="row" 전용)
//   - 상단 border-neutral-base, 행 하단 border-neutral-base
//   - th: bg-neutral-subtler (홀수행) / td: bg-base(white)
//   - hover: bg-secondary-subtler/40
//   - 현재 xl 사이즈 사용 중

// ── 타입 ──────────────────────────────────────────────────────────
export type TableVariant = 'primary' | 'secondary' | 'tertiary';
export type TableSize    = 'xxl' | 'xl' | 'md' | 'xs';

// ── 사이즈별 스타일 맵 ────────────────────────────────────────────
const SIZE_MAP: Record<TableSize, {
  minHeight: string;
  fontSize:  string;
  padding:   string;
}> = {
  xxl: { minHeight: '56px', fontSize: 'text-b1', padding: 'p-4' },
  xl:  { minHeight: '48px', fontSize: 'text-b3', padding: 'py-2 px-3' },
  md:  { minHeight: '40px', fontSize: 'text-b3', padding: 'py-2 px-3' },
  xs:  { minHeight: '32px', fontSize: 'text-b3', padding: 'py-1 px-3' },
};

// ── Context ───────────────────────────────────────────────────────
const TableContext = React.createContext<{
  variant: TableVariant;
  size:    TableSize;
  formRow: boolean;
}>({ variant: 'primary', size: 'md', formRow: false });

// ── Table ─────────────────────────────────────────────────────────
export interface HiTableProps {
  variant?:      TableVariant;
  size?:         TableSize;
  innerScroll?:  string;
  useScrollbar?: boolean;
  children?:     React.ReactNode;
  className?:    string;
}

export const HiTable = ({
  variant      = 'primary',
  size         = 'md',
  children,
  className,
  innerScroll,
  useScrollbar = false,
}: HiTableProps) => (
  <TableContext.Provider value={{ variant, size, formRow: false }}>
    <div
      className={clsx(
        'w-full',
        variant === 'primary'
          ? 'border border-border-tertiary-subtler rounded-lg overflow-hidden'
          : 'border-0 rounded-none',
        className,
      )}
    >
      {innerScroll && useScrollbar ? (
        <HiScrollbar orientation="both" maxHeight={innerScroll} maxWidth="100%">
          <table className="w-full border-separate border-spacing-0">{children}</table>
        </HiScrollbar>
      ) : (
        <div
          className={clsx('w-full', innerScroll ? 'overflow-auto' : 'overflow-x-auto')}
          style={innerScroll ? { maxHeight: innerScroll } : undefined}
        >
          <table className="w-full border-separate border-spacing-0">{children}</table>
        </div>
      )}
    </div>
  </TableContext.Provider>
);

// ── TableHead ─────────────────────────────────────────────────────
export interface HiTableHeadProps {
  sticky?:    boolean;
  children?:  React.ReactNode;
  className?: string;
}

export const HiTableHead = ({ sticky = false, children, className }: HiTableHeadProps) => (
  <thead className={clsx(sticky && 'sticky top-0 z-10', className)}>
    {children}
  </thead>
);

// ── TableBody ─────────────────────────────────────────────────────
export interface HiTableBodyProps {
  children?:  React.ReactNode;
  className?: string;
}

export const HiTableBody = ({ children, className }: HiTableBodyProps) => (
  <tbody className={className}>{children}</tbody>
);

// ── TableRow ──────────────────────────────────────────────────────
export interface HiTableRowProps {
  hoverable?: boolean;
  disabled?:  boolean;
  form?:      boolean;
  children?:  React.ReactNode;
  className?: string;
  onClick?:   () => void;
}

export const HiTableRow = ({
  hoverable = true,
  disabled  = false,
  form      = false,
  children,
  className,
  onClick,
}: HiTableRowProps) => {
  const ctx = React.useContext(TableContext);
  return (
    <TableContext.Provider value={{ ...ctx, formRow: form }}>
      <tr
        onClick={!disabled ? onClick : undefined}
        className={clsx(
          'transition-colors group',
          hoverable && !disabled && 'hover:bg-bg-secondary-subtler/40',
          disabled  && 'opacity-40 cursor-not-allowed',
          onClick && !disabled && 'cursor-pointer',
          className,
        )}
      >
        {children}
      </tr>
    </TableContext.Provider>
  );
};

// ── TableTh ───────────────────────────────────────────────────────
export interface HiTableThProps {
  align?:          'left' | 'center' | 'right';
  width?:          string;
  /** col: 상단 헤더(기본) / row: 좌측 헤더 */
  scope?:          'col' | 'row';
  /** 배경색 제거 (noBackground 시 투명) */
  noBackground?:   boolean;
  children?:       React.ReactNode;
  className?:      string;
}

export const HiTableTh = ({
  align        = 'left',
  width,
  scope        = 'col',
  noBackground = false,
  children,
  className,
}: HiTableThProps) => {
  const { variant, size } = React.useContext(TableContext);
  const s = SIZE_MAP[size];

  return (
    <th
      scope={scope}
      style={{ width: width ?? (scope === 'row' && variant === 'tertiary' ? '120px' : undefined) }}
      className={clsx(
        s.fontSize,
        'font-bold text-text-default align-middle whitespace-nowrap leading-none',
        'relative',
        // ── 배경 ──────────────────────────────────────────────────
        !noBackground && (
          variant === 'primary'   ? 'bg-bg-secondary-subtler' :
          variant === 'secondary' ? 'bg-bg-neutral-subtler'   :
                                    'bg-bg-neutral-subtler'    // tertiary
        ),
        scope === 'col' && variant === 'primary'   && 'border-b border-border-tertiary-subtler border-r last:border-r-0',
        scope === 'col' && variant === 'secondary' && 'border-b border-border-neutral-base',
        scope === 'col' && variant === 'tertiary'  && 'border-b border-border-neutral-base',
        scope === 'row' && (
          variant === 'tertiary'
            ? '[tr:first-child_&]:border-t [tr:first-child_&]:border-border-neutral-base border-b border-border-neutral-base last:border-b-0'
            : '[tr:first-child_&]:border-t [tr:first-child_&]:border-border-neutral-base border-r border-b border-border-neutral-base last:border-b-0'
        ),
        className,
      )}
    >
      {scope === 'row' && variant === 'tertiary' && !noBackground && (
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-bg-secondary-subtler/40" />
      )}
      <div
        style={{ minHeight: s.minHeight }}
        className={clsx(
          'flex items-center h-full relative z-10',
          s.padding,
          align === 'center' && 'justify-center',
          align === 'right'  && 'justify-end',
        )}
      >
        {children}
      </div>
    </th>
  );
};

// ── TableTd ───────────────────────────────────────────────────────
export interface HiTableTdProps {
  align?:    'left' | 'center' | 'right';
  form?:     boolean;
  children?: React.ReactNode;
  className?: string;
  colSpan?:  number;
  rowSpan?:  number;
}

export const HiTableTd = ({
  align = 'left',
  form  = false,
  children,
  className,
  colSpan,
  rowSpan,
}: HiTableTdProps) => {
  const { variant, size, formRow } = React.useContext(TableContext);
  const s = SIZE_MAP[size];
  const isForm = form || formRow;

  return (
    <td
      colSpan={colSpan}
      rowSpan={rowSpan}
      className={clsx(
        s.fontSize,
        'font-regular text-text-default align-middle whitespace-nowrap leading-none',
        'border-b border-border-neutral-base',
        variant !== 'tertiary' && 'border-r border-border-neutral-base last:border-r-0',
        variant === 'tertiary' && '[tr:first-child_&]:border-t [tr:first-child_&]:border-border-neutral-base',
        className,
      )}
    >
      <div
        style={{ minHeight: s.minHeight }}
        className={clsx(
          'flex items-center w-full h-full',
          isForm ? 'p-0' : s.padding,
          align === 'center' && 'justify-center',
          align === 'right'  && 'justify-end',
        )}
      >
        {children}
      </div>
    </td>
  );
};