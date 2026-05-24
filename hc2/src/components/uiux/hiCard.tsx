import React from 'react';
import clsx from 'clsx';

// 디자인 시스템 기준
// size:  xl | lg | md | sm | xs
// color: white | gray | blue | red | 커스텀

/**
 * size   padding  radius
 * ────────────────────────────────
 * xl     p-8      rounded-lg (12px)
 * lg     p-6      rounded-lg (12px)
 * md     p-5      rounded-md (8px)
 * sm     p-4      rounded-md (8px)
 * xs     p-3      rounded-md (8px)
 *
 * color    bg                      border (hasBorder)
 * ────────────────────────────────────────────────────
 * white    bg-base                 border-neutral-strong
 * gray     bg-neutral-subtler      border-neutral-base
 * blue     bg-secondary-subtlest   border-secondary-subtler
 * red      bg-red-subtlest         border-graphic-coral
 *
 * 커스텀 color → CSS 변수, hex, rgb, gradient 직접 전달 가능
 *   @example color="var(--bg-mint-subtlest)"
 *   @example color="#f0f0f0"
 */

export type CardSize  = 'xl' | 'lg' | 'md' | 'sm' | 'xs';
export type CardColor = 'white' | 'gray' | 'blue' | 'red';

const PRESET_COLORS = ['white', 'gray', 'blue', 'red'] as const;

const BG_MAP: Record<CardColor, string> = {
  white: 'bg-bg-base',
  gray:  'bg-bg-neutral-subtler',
  blue:  'bg-bg-secondary-subtlest',
  red:   'bg-bg-red-subtlest',
};

const BORDER_MAP: Record<CardColor, string> = {
  white: 'border-border-neutral-strong',
  gray:  'border-border-neutral-base',
  blue:  'border-border-secondary-subtler',
  red:   'border-graphic-coral',
};

const SIZE_MAP: Record<CardSize, string> = {
  xl: 'p-8 rounded-lg',
  lg: 'p-6 rounded-lg',
  md: 'p-5 rounded-md',
  sm: 'p-4 rounded-md',
  xs: 'p-3 rounded-md',
};

// ── 커스텀 color → style 변환 ─────────────────────────────────────
const resolveCustomStyle = (color: string): React.CSSProperties => {
  const s = color.trim();
  if (/^(#|rgb|hsl|linear-gradient|var\()/.test(s)) return { background: s };
  if (s.startsWith('--')) return { background: `var(${s})` };
  return { background: `var(--${s.startsWith('bg-') ? s : `bg-${s}`})` };
};

// ── Props ─────────────────────────────────────────────────────────
export interface HiCardProps {
  /** 카드 사이즈 */
  size?: CardSize;
  /** 배경 색상: 프리셋(white|gray|blue|red) 또는 CSS 변수/hex/rgb */
  color?: CardColor | string;
  /** 테두리 표시 여부 */
  hasBorder?: boolean;
  children?: React.ReactNode;
  className?: string;
}

// ── Component ─────────────────────────────────────────────────────
export const HiCard = ({
  size = 'sm',
  color = 'white',
  hasBorder = false,
  children,
  className,
}: HiCardProps) => {
  const isPreset = (PRESET_COLORS as readonly string[]).includes(color);
  const preset   = isPreset ? (color as CardColor) : null;

  return (
    <div
      style={!isPreset ? resolveCustomStyle(color) : undefined}
      className={clsx(
        'flex flex-col items-start overflow-hidden w-full transition-all',
        SIZE_MAP[size],
        preset && BG_MAP[preset],
        hasBorder && 'border',
        hasBorder && (preset ? BORDER_MAP[preset] : 'border-border-neutral-subtle'),
        className,
      )}
    >
      {children}
    </div>
  );
};