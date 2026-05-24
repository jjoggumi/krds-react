import { cva } from 'class-variance-authority';
import clsx from 'clsx';

// 디자인 시스템 기준
// select: off | on | focus
// state: default | disabled

type RadioSelect = 'off' | 'on' | 'focus';

/**
 * select   bg              border                  dot              ring
 * ────────────────────────────────────────────────────────────────────────
 * off      control-base    control-neutral-strong  —                —
 * on       control-base    control-primary         control-primary  —
 * focus    control-base    control-primary         —                color-mix(radio-color 32%, transparent)
 *
 * hover  → 텍스트 포함 전체 영역에 ring (color-mix(radio-color 32%, transparent)) 적용
 *
* disabled:
 *   off   → bg-control-neutral-base  border-control-neutral-strong
 *   on    → bg-control-neutral-base  border-control-neutral-strong  (회색 dot)
 *   focus → bg-control-neutral-base  border-control-neutral-strong  (control-neutral-strong ring)
 *
 * 컬러 커스터마이징:
 *   `color` prop으로 임의의 색상 토큰 또는 hex 값을 전달하면
 *   컴포넌트는 내부적으로 CSS 변수 `--radio-color`를 설정합니다.
 *   on/focus 상태의 테두리와 dot은 `var(--radio-color)`를 사용해
 *   전달된 색상으로 표시되며, 전달하지 않으면 기본값
 *   `var(--control-primary)`을 사용합니다.
 */

// ── CSS 변수 타입 ──────────────────────────────────────────────────
type RadioCSSVarStyle = React.CSSProperties & {
  '--radio-color'?: string;
};

// ── 라디오 박스 스타일 ─────────────────────────────────────────────
const boxStyles = cva(
  'relative shrink-0 size-[20px] rounded-full border transition-all duration-150 outline-none',
  {
    variants: {
      select: {
        off:   'bg-control-base border-control-neutral-strong',
        on:    'bg-control-base border-[var(--radio-color)]',
        focus: 'bg-control-base border-[var(--radio-color)] shadow-[0_0_0_2px_color-mix(in_srgb,var(--radio-color)_32%,transparent)]',
      },
      disabled: {
        true: '!bg-control-neutral-base !border-control-neutral-strong',
      },
    },
    compoundVariants: [
      // disabled + on → ring 없음
      { select: 'on',    disabled: true, className: '' },
      // disabled + focus → 회색 ring
      { select: 'focus', disabled: true, className: '!shadow-[0_0_0_2px_color-mix(in_srgb,var(--control-neutral-strong)_32%,transparent)]' },
    ],
    defaultVariants: { select: 'off' },
  }
);


// ── HiRadio Props ──────────────────────────────────────────────────
export interface HiRadioProps {
  /** 선택 상태: off | on | focus */
  select?: RadioSelect;
  /** 비활성화 */
  disabled?: boolean;
  /** 메인 텍스트 */
  label?: string;
  /** 서브 텍스트 */
  subLabel?: string;
  /** 변경 핸들러 */
  onChange?: (select: RadioSelect) => void;
  /**
    * 라디오 색상 커스터마이징 (참고: 현재 자동 적용되지 않음)
    * @example color="var(--graphic-red)"
   */
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

// ── HiRadio Component ──────────────────────────────────────────────
export const HiRadio = ({
  select = 'off',
  disabled = false,
  label,
  subLabel,
  onChange,
  color,
  className,
  style,
}: HiRadioProps) => {

  const handleClick = () => {
    // focus 상태에서도 클릭으로 on 상태로 전환되도록 허용
    // disabled 클릭 차단 유지
    if (disabled || select === 'on') return;
    onChange?.('on');
  };

  // 포커스 진입 시 on -> focus 로 전환
  const handleFocus = () => {
    if (disabled) return;
    if (select === 'on') onChange?.('focus');
  };

  // 포커스 해제 시 focus -> on 으로 복귀
  const handleBlur = () => {
    if (disabled) return;
    if (select === 'focus') onChange?.('on');
  };

  // Space 키로 선택 (접근성)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const resolveColor = (c?: string) => {
    // 1. 값이 없을 때 기본값 반환
    if (!c) return 'var(--control-primary)';

    const v = c.trim();

    // 2. 이미 완성된 CSS 값(var, --, #, rgb, hsl)은 그대로 반환
    // startsWith를 여러 번 쓰는 대신 정규식 하나로 처리하여 성능과 가독성 향상
    if (/^(var\(|--|#|rgb|hsl)/.test(v)) return v;

    // 3. 나머지는 테마 토큰으로 간주하여 var(--...)로 감싸서 반환
    // 기존의 'color-', 'text-' 등의 접두사 검사는 결과값이 동일하므로 통합 가능합니다.
    return `var(--${v})`;
  };

  // Radio 컴포넌트 등에서 사용할 CSS 변수 객체
  const cssVars: RadioCSSVarStyle = {
    '--radio-color': resolveColor(color),
    ...style,
  };

  return (
    <div
      role="radio"
      tabIndex={disabled ? -1 : 0}
      aria-checked={select === 'on' || select === 'focus'}
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
      {/* ── 라디오 박스 ── */}
      <div
        className={clsx(
          boxStyles({ select, disabled }),
          // 한 줄이면 가운데 정렬, 서브텍스트가 있으면 상단 정렬
          subLabel ? 'mt-px' : '',
          // 활성화 상태 hover ring
          !disabled && select !== 'focus' &&
            'group-hover:shadow-[0_0_0_2px_color-mix(in_srgb,var(--radio-color)_32%,transparent)]',
          // disabled 상태 hover ring
          disabled &&
            'group-hover:shadow-[0_0_0_2px_color-mix(in_srgb,var(--control-neutral-strong)_32%,transparent)]',
        )}
      >
        {select === 'on' && (
          <span
            className={clsx(
              'absolute inset-1 rounded-full',
              disabled ? 'bg-control-neutral-stronger' : 'bg-(--radio-color)',
            )}
          />
        )}
      </div>

      {/* ── 텍스트 그룹 ── */}
      {(label || subLabel) && (
        <div className={clsx(
          'flex flex-col gap-0.5 flex-1 min-w-0',
          // 한 줄이면 가운데 정렬, 서브텍스트가 있으면 상단 정렬
          subLabel ? 'justify-start' : 'justify-center',
        )}>
          {label && (
            <span className={clsx(
              'text-leading-b3 font-regular',
              disabled ? 'text-text-neutral-base' : 'text-text-default',
            )}>
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

// ── HiRadioGroup Props ─────────────────────────────────────────────
export interface HiRadioGroupOption {
  value:      string;
  label?:     string;
  subLabel?:  string;
  disabled?:  boolean;
}

export interface HiRadioGroupProps {
  /** 옵션 목록 */
  options: HiRadioGroupOption[];
  /** 현재 선택값 */
  value?: string;
  /** 변경 핸들러 */
  onChange?: (value: string) => void;
  /** 전체 비활성화 */
  disabled?: boolean;
  /** 레이아웃 방향 */
  direction?: 'vertical' | 'horizontal';
  /** 색상 커스터마이징 */
  color?: string;
  className?: string;
}

// ── HiRadioGroup Component ─────────────────────────────────────────
export const HiRadioGroup = ({
  options,
  value,
  onChange,
  disabled = false,
  direction = 'vertical',
  color,
  className,
}: HiRadioGroupProps) => (
  <div
    role="radiogroup"
    className={clsx(
      'flex',
      direction === 'vertical' ? 'flex-col gap-3' : 'flex-row gap-4 flex-wrap',
      className,
    )}
  >
    {options.map((opt) => (
      <HiRadio
        key={opt.value}
        select={value === opt.value ? 'on' : 'off'}
        label={opt.label}
        subLabel={opt.subLabel}
        disabled={disabled || opt.disabled}
        color={color}
        onChange={() => onChange?.(opt.value)}
      />
    ))}
  </div>
);