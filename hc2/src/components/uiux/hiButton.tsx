import { cva } from 'class-variance-authority';
import clsx from 'clsx';

// 디자인 시스템 기준
// variant: primary | secondary | tertiaryBlue | tertiary | warningLine | warningFill | underline | link
// state: default | hover | pressed | disabled
// size: xxl | xl | lg | md | sm | xs

type ButtonVariant   = 'primary' | 'secondary' | 'tertiaryBlue' | 'tertiary' | 'warningLine' | 'warningFill' | 'underline' | 'link';
type ButtonShape  = 'rounded' | 'pill' | 'square';
type ButtonSize   = 'xxl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs';

/**
 * variant         bg                        text                border
 * ─────────────────────────────────────────────────────────────────────
 * primary      action-primary-base       text-base           transparent
 * secondary    action-primary-subtler    text-primary-base   transparent
 * tertiaryBlue action-base (white)       text-primary-base   action-primary-base
 * tertiary     action-base (white)       text-default        action-neutral-stronger
 * warningLine  action-base (white)       graphic-red         action-red-base
 * warningFill  action-red-base           text-base           transparent
 * underline    transparent               text-primary-base   transparent (underline, px 없음)
 * link         transparent               —                   transparent (px 없음)
 *
 * underline / link → font-size / color는 사용처에서 className으로 자유롭게 커스터마이징
 *
 * disabled:
 *   primary, secondary              → bg-action-neutral-strong + text-text-base
 *   tertiaryBlue, tertiary, warningLine, warningFill → opacity-40
 *   underline                       → text-text-neutral-base
 *   link                            → (사용처 className으로 처리)
 *
 * size → control-* 유틸리티 (height / border-radius / font-size)
 *   xxl / xl / lg → px-6,  md / sm → px-4,  xs → px-3
 */

type CSSVarStyle = React.CSSProperties & {
  '--btn-hover-bg'?:  string;
  '--btn-active-bg'?: string;
};

const BTN_VARS: Record<ButtonVariant, Pick<CSSVarStyle, '--btn-hover-bg' | '--btn-active-bg'>> = {
  primary:      {
    '--btn-hover-bg':  'color-mix(in oklab, black 12%, var(--action-primary-base))',
    '--btn-active-bg': 'color-mix(in oklab, black 20%, var(--action-primary-base))',
  },
  secondary:    {
    '--btn-hover-bg':  'color-mix(in oklab, black 4%, var(--action-primary-subtler))',
    '--btn-active-bg': 'color-mix(in oklab, black 8%, var(--action-primary-subtler))',
  },
  tertiaryBlue: {
    '--btn-hover-bg':  'color-mix(in oklab, var(--action-primary-base) 16%, var(--action-base))',
    '--btn-active-bg': 'color-mix(in oklab, var(--action-primary-base) 24%, var(--action-base))',
  },
  tertiary:     {
    '--btn-hover-bg':  'color-mix(in oklab, var(--bg-tertiary-stronger) 6%, var(--action-base))',
    '--btn-active-bg': 'color-mix(in oklab, var(--bg-tertiary-stronger) 10%, var(--action-base))',
  },
  warningLine:      {
    '--btn-hover-bg':  'color-mix(in oklab, var(--action-red-base) 6%, var(--action-base))',
    '--btn-active-bg': 'color-mix(in oklab, var(--action-red-base) 10%, var(--action-base))',
  },
  warningFill: {
    '--btn-hover-bg':  'color-mix(in oklab, black 6%, var(--action-red-base))',
    '--btn-active-bg': 'color-mix(in oklab, black 10%, var(--action-red-base))',
  },
  underline:    { '--btn-hover-bg': 'transparent', '--btn-active-bg': 'transparent' },
  link:         { },
};

const buttonStyles = cva(
  [
    'inline-flex items-center justify-center gap-1 auto-cols-max font-regular border select-none cursor-pointer shrink-0 leading-0',
    'transition-colors duration-150',
    'hover:bg-[var(--btn-hover-bg)] active:bg-[var(--btn-active-bg)]',
  ],
  {
    variants: {
      variant: {
        primary:      'bg-action-primary-base text-text-base border-transparent',
        secondary:    'bg-action-primary-subtler text-text-primary-base border-transparent',
        tertiaryBlue: 'bg-action-base text-text-primary-base border-action-primary-base',
        tertiary:     'bg-action-base text-text-default border-action-neutral-stronger',
        warningLine:  'bg-action-base text-graphic-red border-action-red-base',
        warningFill:  'bg-action-red-base text-text-base border-transparent',
        underline:    'bg-transparent text-text-primary-base border-transparent underline',
      },
      size: {
        xxl: 'h-14 text-b1 px-6 font-semibold',
        xl:  'h-12 text-b1 px-6',
        lg:  'h-11 text-b2 px-6',
        md:  'h-10 text-b3 px-4',
        sm:  'h-9 text-b3 px-4',
        xs:  'h-8 text-b3 px-3',
      },
      shape: {
        rounded: '',
        pill:    'rounded-full',
        square:  'rounded-none',
      },
      block:    { true: 'w-full' },
      disabled: { true: 'cursor-not-allowed pointer-events-none' },
      active:   { true: '' },
    },

    compoundVariants: [
      // ── disabled ─────────────────────────────────────────────────
      { variant: 'primary',      disabled: true, className: '!bg-action-neutral-strong !text-text-base !border-transparent' },
      { variant: 'secondary',    disabled: true, className: '!bg-action-neutral-strong !text-text-base !border-transparent' },
      { variant: 'tertiaryBlue', disabled: true, className: 'opacity-40' },
      { variant: 'tertiary',     disabled: true, className: 'opacity-40' },
      { variant: 'warningLine',  disabled: true, className: 'opacity-40' },
      { variant: 'warningFill',  disabled: true, className: 'opacity-40' },
      { variant: 'underline',    disabled: true, className: 'opacity-40' },

      // ── shape=rounded: 사이즈별 border-radius ──────────────────────
      { size: 'xxl', shape: 'rounded', className: 'rounded-md' },
      { size: 'xl',  shape: 'rounded', className: 'rounded-md' },
      { size: 'lg',  shape: 'rounded', className: 'rounded-sm' },
      { size: 'md',  shape: 'rounded', className: 'rounded-sm' },
      { size: 'sm',  shape: 'rounded', className: 'rounded-sm' },
      { size: 'xs',  shape: 'rounded', className: 'rounded-sm' },

      // ── underline / link → px-0, h-auto ──────────────────────────
      { variant: 'underline', className: '!px-0 h-auto !rounded-none' },

      // ── active (외부 제어) ────────────────────────────────────────
      { active: true, className: '!bg-[var(--btn-active-bg)]' },
    ],

    defaultVariants: {
      variant: 'primary',
      size:    'md',
      shape:   'rounded',
    },
  }
);

export interface HiButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** variant: primary | secondary | tertiaryBlue | tertiary | warningLine | underline | link */
  variant?:   ButtonVariant;
  shape?:     ButtonShape;
  size?:      ButtonSize;
  block?:     boolean;
  /** pressed 상태 (외부 제어) */
  active?:    boolean;
  children?:  React.ReactNode;
  className?: string;
  style?:     React.CSSProperties;
}

export const HiButton = ({
  variant = 'primary',
  shape,
  size,
  block,
  active,
  disabled,
  children,
  className,
  style,
  ...props
}: HiButtonProps) => (
  <button
    type="button"
    className={
      variant === 'link'
        ? clsx(
            'inline-flex items-center justify-center gap-1 auto-cols-max', 
            disabled ? 'cursor-not-allowed pointer-events-none opacity-40' : 'cursor-pointer',
            className
          )
        : clsx(buttonStyles({ variant, size, block, shape, disabled: !!disabled, active: !!active }), className)
    }
    style={variant === 'link' ? style : { ...BTN_VARS[variant], ...style }}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);