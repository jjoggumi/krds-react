import { cva } from 'class-variance-authority';
import clsx from 'clsx';
import { Check as CheckIcon, Minus as MinusIcon } from 'lucide-react';

// 디자인 시스템 기준
// select: off | on | focus | indeterminate
// state: default | disabled
// type: normal | terms

type CheckboxSelect = 'off' | 'on' | 'focus' | 'indeterminate';

/**
 * select        bg                     border                  icon           ring
 * ──────────────────────────────────────────────────────────────────────────────────
 * off           control-base           control-neutral-strong  —              —
 * on            control-primary        control-primary         check (white)  —
 * focus         control-base           checkbox-color          —              checkbox-color 32%
 * indeterminate control-base           control-neutral-strong  minus (dark)   —
 *
 * hover  → 박스에 ring (--checkbox-color 32%) 적용 (focus 상태 제외)
 *
 * disabled:
 *   off           → bg-control-neutral-base  border-control-neutral-strong  —
 *   on            → bg-control-neutral-base  border-control-neutral-strong  check (neutral)  ring 없음
 *   focus         → bg-control-neutral-base  border-control-neutral-strong  —  ring (neutral-strong 32%)
 *   indeterminate → bg-control-neutral-base  border-control-neutral-strong  minus (neutral)
 *
 * type: normal → 체크박스 + 메인텍스트 + 서브텍스트
 * type: terms  → 체크박스 + (굵은 prefix +) 메인텍스트 + 서브텍스트 (text-b3)
 *               labelPrefix prop으로 [필수], [선택] 등 굵은 앞글자 지정
 *
 * 컬러 커스터마이징:
 *   color="var(--graphic-red)" 등 토큰 또는 hex 직접 전달
 *   기본값: var(--control-primary)
 */

// ── CSS 변수 타입 ──────────────────────────────────────────────────
type CheckboxCSSVarStyle = React.CSSProperties & {
  '--checkbox-color'?: string;
};

// ── 체크박스 박스 스타일 ───────────────────────────────────────────
const boxStyles = cva(
  'relative shrink-0 size-[20px] rounded-[4px] border transition-all duration-150 outline-none',
  {
    variants: {
      select: {
        off:           'bg-control-base border-control-neutral-strong',
        on:            'bg-[var(--checkbox-color)] border-[var(--checkbox-color)]',
        focus:         'bg-control-base border-[var(--checkbox-color)] shadow-[0_0_0_2px_color-mix(in_srgb,var(--checkbox-color)_32%,transparent)]',
        indeterminate: 'bg-control-base border-control-neutral-strong',
      },
      disabled: {
        true: '!bg-control-neutral-base !border-control-neutral-strong',
      },
    },

    // ── 체크박스 박스 스타일 ───────────────────────────────────────────
    compoundVariants: [
      // disabled + focus만 회색 ring (on disabled는 ring 없음)
      {
        select: 'focus',
        disabled: true,
        className: '!shadow-[0_0_0_2px_color-mix(in_srgb,var(--control-neutral-strong)_32%,transparent)]',
      },
    ],

    defaultVariants: {
      select: 'off',
    },
  }
);

// ── Props ─────────────────────────────────────────────────────────
export interface HiCheckboxProps {
  /** 체크 상태: off | on | focus | indeterminate */
  select?: CheckboxSelect;
  /** 비활성화 */
  disabled?: boolean;
  /** 메인 텍스트 */
  label?: string;
  /** 레이블 앞에 붙는 굵은 텍스트 (예: [필수], [선택]) */
  labelPrefix?: string;
  /** 서브 텍스트 (type=normal일 때만 표시) */
  subLabel?: string;
  /** normal: 일반 체크박스 / terms: 약관용 */
  type?: 'normal' | 'terms';
  /** 변경 핸들러 */
  onChange?: (select: CheckboxSelect) => void;
  /**
   * 체크박스 색상 커스터마이징
   * @example color="var(--graphic-red)"
   * @example color="var(--green-600)"
   */
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

// ── Component ─────────────────────────────────────────────────────
export const HiCheckbox = ({
  select = 'off',
  disabled = false,
  label,
  labelPrefix,
  subLabel,
  type = 'normal',
  onChange,
  color,
  className,
  style,
}: HiCheckboxProps) => {

  const handleClick = () => {
    if (disabled) return;
    // focus 상태도 'on'으로 취급하여 off로 전환
    const next: CheckboxSelect = select === 'off' ? 'on' : 'off';
    onChange?.(next);
  };

  // 포커스 진입 시 on → focus 로 전환
  const handleFocus = () => {
    if (disabled) return;
    if (select === 'on') onChange?.('focus');
  };

  // 포커스 해제 시 focus → on 으로 복귀
  const handleBlur = () => {
    if (disabled) return;
    if (select === 'focus') onChange?.('on');
  };

  // Space 키로 체크/해제 (웹 접근성 기준)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const resolveColor = (c?: string) => {
    if (!c) return 'var(--control-primary)';
    
    const v = c.trim();

    // 1. 이미 완성된 CSS 값(var, --, #, rgb, hsl)인 경우 그대로 반환
    if (/^(var\(|--|#|rgb|hsl)/.test(v)) return v;

    // 2. 나머지는 모두 테마 토큰으로 간주하여 var(--...)로 감쌈
    return `var(--${v})`;
  };

  const cssVars: CheckboxCSSVarStyle = {
    '--checkbox-color': resolveColor(color),
    ...style,
  };

  return (
    <div
      role="checkbox"
      tabIndex={disabled ? -1 : 0}
      aria-checked={
        select === 'indeterminate' ? 'mixed' :
        select === 'on' || select === 'focus'
      }
      aria-disabled={disabled}
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      style={cssVars}
      className={clsx(
        'group inline-flex gap-1.5',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        // 한 줄이면 가운데 정렬, 서브텍스트가 있으면 상단 정렬
        subLabel ? 'items-start' : 'items-center',
        className,
      )}
    >
      <div className="flex items-center h-6 shrink-0">
        <div
          className={clsx(
            boxStyles({ select, disabled }),
            // hover 시 ring (focus 상태엔 이미 ring 있으므로 제외)
            // ⚠️ 리터럴 문자열로 작성해야 Tailwind JIT가 감지함
            !disabled && select !== 'focus' &&
              'group-hover:shadow-[0_0_0_2px_color-mix(in_srgb,var(--checkbox-color)_32%,transparent)]',
            // disabled 상태 hover ring
            disabled &&
              'group-hover:shadow-[0_0_0_2px_color-mix(in_srgb,var(--control-neutral-strong)_32%,transparent)]',
          )}
        >
          {select === 'on' && (
            <CheckIcon
              className={clsx(
                'absolute inset-0 size-full p-0.75',
                disabled ? 'text-text-neutral-base' : 'text-white',
              )}
              strokeWidth={3}
            />
          )}
          {select === 'indeterminate' && (
            <MinusIcon
              className={clsx(
                'absolute inset-0 size-full p-0.75',
                disabled ? 'text-text-neutral-base' : 'text-text-default',
              )}
              strokeWidth={3}
            />
          )}
        </div>
      </div>

      {/* ── 텍스트 그룹 ── */}
      {(label || subLabel) && (
        <div className={clsx(
          'flex flex-col gap-0.5 flex-1 min-w-0',
          // 한 줄이면 가운데 정렬, 서브텍스트가 있으면 상단 정렬
          subLabel ? 'mt-px' : '',
        )}>
          {label && (
            <span
              className={clsx(
                disabled ? 'text-text-neutral-base' : 'text-text-default',
                type === 'terms' ? 'text-leading-b3' : 'text-leading-b3',
                'font-regular',
              )}
            >
              {/* terms일 때 굵은 앞글자 */}
              {labelPrefix && (
                <span className="font-bold mr-1">{labelPrefix}</span>
              )}
              {label}
            </span>
          )}
          {subLabel && (
            <span className={clsx(
              'text-leading-d2 font-regular',
              disabled ? 'text-text-neutral-base' : 'text-text-neutral-stronger',
            )}>
              {subLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};