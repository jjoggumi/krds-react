import React, { useId } from 'react';
import clsx from 'clsx';

/**
 * HiScrollbar 디자인 시스템
 * ──────────────────────────────────────────────────────────────
 * 1. 색상: 평상시 Opacity 26% -> 호버 시 34% (color-mix 활용)
 * 2. 사이즈: sm(6px), md(8px)
 * 3. 특징: border + background-clip 조합으로 핸들 여백 구현
 * ──────────────────────────────────────────────────────────────
 */

export interface HiScrollbarProps {
  orientation?: 'vertical' | 'horizontal' | 'both';
  vertical?: boolean;
  horizontal?: boolean;
  both?: boolean;
  size?: 'sm' | 'md';
  variant?: 'default' | 'transparent';
  color?: string;
  maxHeight?: string;
  maxWidth?: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const HiScrollbar = ({
  orientation = 'both',
  vertical, horizontal, both,
  size = 'md',
  variant = 'default',
  color,
  maxHeight, maxWidth,
  children, className, style,
}: HiScrollbarProps) => {
  const finalDir = vertical ? 'vertical' : horizontal ? 'horizontal' : both ? 'both' : orientation;
  const isV = finalDir === 'vertical' || finalDir === 'both';
  const isH = finalDir === 'horizontal' || finalDir === 'both';

  const uid = useId();

  // [수정] 전체 트랙 두께를 조금 늘리고(10px/12px), 핸들에 border 여백을 줍니다.
  const sbSize = size === 'sm' ? '14px' : '16px'; 
  const trackBg = variant === 'default' ? 'var(--bg-base)' : 'transparent';
  const baseColor = color ? (color.startsWith('var') ? color : `var(--${color})`) : 'var(--bg-tertiary-stronger)';
  
  const thumbBase = `color-mix(in oklab, ${baseColor} 26%, transparent)`;
  const thumbHover = `color-mix(in oklab, ${baseColor} 34%, transparent)`;

  return (
    <div
      className={clsx(
        'antialiased overflow-auto',
        // 1. 컨텐츠와 스크롤바 사이의 기본 여백 (안쪽 패딩)
        finalDir === 'vertical' && 'overflow-x-hidden',
        finalDir === 'horizontal' && 'overflow-y-hidden',

        // 2. 스크롤바 전체 두께
        '[&::-webkit-scrollbar]:w-(--sb-size)',
        '[&::-webkit-scrollbar]:h-(--sb-size)',

        // 3. 트랙 (배경)
        '[&::-webkit-scrollbar-track]:bg-(--sb-track)',

        // 4. 핸들 (여백 핵심: 투명 border + padding-box)
        '[&::-webkit-scrollbar-thumb]:bg-(--sb-thumb)',
        '[&::-webkit-scrollbar-thumb]:rounded-full',
        '[&::-webkit-scrollbar-thumb]:bg-clip-padding-box radius-10',
        'transition-[background] duration-200',

        // 5. 호버 (thumb 자체를 hover할 때 색상 변경)
        '[&::-webkit-scrollbar-thumb:hover]:bg-(--sb-thumb-hover)',

        // 6. 코너
        '[&::-webkit-scrollbar-corner]:bg-transparent',

        className
      )}
      id={`hi-scroll-${uid}`}
      style={{
        maxHeight: isV ? maxHeight : 'none',
        maxWidth: isH ? maxWidth : 'none',
        '--sb-size': sbSize,
        '--sb-track': trackBg,
        '--sb-thumb': thumbBase,
        '--sb-thumb-hover': thumbHover,
        '--sb-thumb-border': '4px',
        ...style,
      } as React.CSSProperties}
    >
      {/* scoped CSS fallback for browsers/storybook where utility pseudo selectors don't apply */}
      <style>{`
        #hi-scroll-${uid}::-webkit-scrollbar-thumb {
          background-clip: padding-box;
          border-width: var(--sb-thumb-border);
          border-style: solid;
          border-color: transparent;
        }
        #hi-scroll-${uid}::-webkit-scrollbar-thumb:hover {
          background-clip: padding-box;
        }
      `}</style>
      {children}
    </div>
  );
};

export default HiScrollbar;