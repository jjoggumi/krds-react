import React from 'react';
import clsx from 'clsx';

// 디자인 시스템 기준
// select: off | on
// state: default | disabled

type SwitchSelect = 'off' | 'on';

/**
 * select   track                            thumb
 * ──────────────────────────────────────────────────────
 * off      control-neutral-stronger         control-base (white)
 * on       control-primary (--switch-color) control-base (white)
 *
 * disabled:
 *   off → track: control-neutral-stronger opacity-40  / thumb: control-base
 *   on  → track: control-primary opacity-40           / thumb: control-base
 *
 * 사이즈
 *   track : w-11.5 h-6 rounded-full p-[3px]
 *   thumb : size-4.5 rounded-full
 *
 * color prop → CSS 변수 --switch-color 주입
 *   미전달 시 기본값: var(--control-primary)
 */

type SwitchCSSVarStyle = React.CSSProperties & { '--switch-color'?: string };

export interface HiSwitchProps {
  /** 선택 상태 */
  select?: SwitchSelect;
  /** 비활성화 */
  disabled?: boolean;
  /** 라벨 텍스트 */
  label?: string;
  /** 변경 핸들러 */
  onChange?: (select: SwitchSelect) => void;
  /**
   * 커스텀 색상
   * @example color="var(--graphic-red)"
   */
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const HiSwitch = ({
  select = 'off',
  disabled = false,
  label,
  onChange,
  color,
  className,
  style,
}: HiSwitchProps) => {
  const isChecked = select === 'on';

  const handleClick = () => {
    if (disabled) return;
    onChange?.(isChecked ? 'off' : 'on');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleClick();
    }
  };

  const resolveColor = (c?: string): string => {
    if (!c) return 'var(--control-primary)';
    
    const v = String(c).trim();

    // 1. 이미 완성된 형태(CSS 변수, Hex, RGB 등)는 그대로 반환
    // 시작 문자가 '-', '#', 'v', 'r', 'h' 인지 체크하는 방식으로 성능 최적화
    if (/^(--|#|var|rgb|hsl)/.test(v)) return v;

    // 2. 그 외에는 모두 var(--...)로 감싸서 반환
    return `var(--${v})`;
  };

  const cssVars: SwitchCSSVarStyle = {
    '--switch-color': resolveColor(color),
    ...style,
  };

  return (
    <div
      role="switch"
      tabIndex={disabled ? -1 : 0}
      aria-checked={isChecked}
      aria-disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={cssVars}
      className={clsx(
        'inline-flex gap-1.5 items-center',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        className,
      )}
    >
      {/* 트랙 */}
      <div
        className={clsx(
          'relative shrink-0 w-11.5 h-6 rounded-full p-0.75 transition-colors duration-200 ease-in-out',
          disabled && !isChecked && 'bg-control-neutral-stronger opacity-40',
          !disabled && isChecked  && 'bg-(--switch-color)',
          disabled && isChecked   && 'bg-(--switch-color) opacity-40',
          !disabled && !isChecked && 'bg-control-neutral-stronger',
        )}
      >
          {/* 썸(thumb) */}
        <span
          className={clsx(
            'absolute top-0.75 left-0.75 size-4.5 rounded-full will-change-transform shadow-sm',
            disabled ? 'bg-control-base' : 'bg-control-base',
          )}
          style={{
            transform: isChecked ? 'translateX(22px) scale(1.03)' : 'translateX(0) scale(1)',
            transition: 'transform 200ms cubic-bezier(0.2, 0.9, 0.2, 1)',
          }}
        />
      </div>

      {/* 라벨 */}
      {label && (
        <span className={clsx(
          'text-leading-b3 font-regular',
          disabled ? 'text-text-neutral-base' : 'text-text-default',
        )}>
          {label}
        </span>
      )}
    </div>
  );
};