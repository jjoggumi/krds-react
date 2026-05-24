import { cva } from 'class-variance-authority';
import clsx from 'clsx';
import React from 'react';

type BadgeType = 'solid' | 'solidLight' | 'outline';
type BadgeColor =
  // Figma 디자인 토큰
  | 'primary' | 'secondary'
  | 'blue' | 'emerald' | 'mint' | 'amber' | 'yellow' | 'orange'
  | 'green' | 'coral' | 'red' | 'magenta' | 'lavender' | 'violet'
  | 'gray' ;
type BadgeShape = 'rounded' | 'pill';
type BadgeSize = 'sm' | 'md' | 'lg';

type BadgeCssVarStyle = React.CSSProperties & {
  ['--badge-bg']?:     string;
  ['--badge-text']?:   string;
  ['--badge-border']?: string;
};

type BadgeColorTokens = {
  solid:      { bg: string; text: string; border: string };
  solidLight: { bg: string; text: string; border: string };
  outline:    { bg: string; text: string; border: string };
};

/** color × type 별 bg / text / border 토큰 (시스템 시맨틱 토큰 사용) */
const colorTokenMap: Record<BadgeColor, BadgeColorTokens> = {
  primary: {
    solid:      { bg: 'var(--bg-primary-base)',       text: 'var(--text-base)',              border: 'var(--bg-primary-base)' },
    solidLight: { bg: 'var(--bg-primary-subtlest)',   text: 'var(--text-primary-base)',      border: 'transparent' },
    outline:    { bg: 'transparent',                  text: 'var(--text-primary-base)',      border: 'var(--bg-primary-base)' },
  },
  secondary: {
    solid:      { bg: 'var(--bg-secondary-base)',     text: 'var(--text-base)',              border: 'var(--bg-secondary-base)' },
    solidLight: { bg: 'var(--bg-secondary-subtlest)', text: 'var(--text-secondary-base)',   border: 'transparent' },
    outline:    { bg: 'transparent',                  text: 'var(--text-secondary-base)',   border: 'var(--bg-secondary-base)' },
  },
  blue: {
    solid:      { bg: 'var(--graphic-blue)',          text: 'var(--text-base)',              border: 'var(--graphic-blue)' },
    solidLight: { bg: 'var(--bg-primary-subtlest)',   text: 'var(--graphic-blue)',           border: 'transparent' },
    outline:    { bg: 'transparent',                  text: 'var(--graphic-blue)',           border: 'var(--graphic-blue)' },
  },
  emerald: {
    solid:      { bg: 'var(--graphic-emerald)',       text: 'var(--text-base)',              border: 'var(--graphic-emerald)' },
    solidLight: { bg: 'var(--bg-green-subtlest)',     text: 'var(--graphic-emerald)',        border: 'transparent' },
    outline:    { bg: 'transparent',                  text: 'var(--graphic-emerald)',        border: 'var(--graphic-emerald)' },
  },
  mint: {
    solid:      { bg: 'var(--graphic-mint)',          text: 'var(--text-base)',              border: 'var(--graphic-mint)' },
    solidLight: { bg: 'var(--bg-mint-subtlest)',      text: 'var(--graphic-mint)',           border: 'transparent' },
    outline:    { bg: 'transparent',                  text: 'var(--graphic-mint)',           border: 'var(--graphic-mint)' },
  },
  amber: {
    solid:      { bg: 'var(--graphic-amber)',         text: 'var(--text-base)',              border: 'var(--graphic-amber)' },
    solidLight: { bg: 'var(--bg-yellow-subtlest)',    text: 'var(--graphic-amber)',          border: 'transparent' },
    outline:    { bg: 'transparent',                  text: 'var(--graphic-amber)',          border: 'var(--graphic-amber)' },
  },
  yellow: {
    solid:      { bg: 'var(--graphic-yellow)',        text: 'var(--text-base)',              border: 'var(--graphic-yellow)' },
    solidLight: { bg: 'var(--bg-yellow-subtlest)',    text: 'var(--graphic-yellow)',         border: 'transparent' },
    outline:    { bg: 'transparent',                  text: 'var(--graphic-yellow)',         border: 'var(--graphic-yellow)' },
  },
  orange: {
    solid:      { bg: 'var(--graphic-orange)',        text: 'var(--text-base)',              border: 'var(--graphic-orange)' },
    solidLight: { bg: 'var(--bg-orange-subtlest)',    text: 'var(--graphic-orange)',         border: 'transparent' },
    outline:    { bg: 'transparent',                  text: 'var(--graphic-orange)',         border: 'var(--graphic-orange)' },
  },
  green: {
    solid:      { bg: 'var(--graphic-green)',         text: 'var(--text-base)',              border: 'var(--graphic-green)' },
    solidLight: { bg: 'var(--bg-green-subtlest)',     text: 'var(--graphic-green)',          border: 'transparent' },
    outline:    { bg: 'transparent',                  text: 'var(--graphic-green)',          border: 'var(--graphic-green)' },
  },
  coral: {
    solid:      { bg: 'var(--graphic-coral)',         text: 'var(--text-base)',              border: 'var(--graphic-coral)' },
    solidLight: { bg: 'var(--bg-red-subtlest)',       text: 'var(--graphic-coral)',          border: 'transparent' },
    outline:    { bg: 'transparent',                  text: 'var(--graphic-coral)',          border: 'var(--graphic-coral)' },
  },
  red: {
    solid:      { bg: 'var(--graphic-red)',           text: 'var(--text-base)',              border: 'var(--graphic-red)' },
    solidLight: { bg: 'var(--bg-red-subtlest)',       text: 'var(--graphic-red)',            border: 'transparent' },
    outline:    { bg: 'transparent',                  text: 'var(--graphic-red)',            border: 'var(--graphic-red)' },
  },
  magenta: {
    solid:      { bg: 'var(--graphic-magenta)',       text: 'var(--text-base)',              border: 'var(--graphic-magenta)' },
    solidLight: { bg: 'var(--bg-red-subtlest)',       text: 'var(--graphic-magenta)',        border: 'transparent' },
    outline:    { bg: 'transparent',                  text: 'var(--graphic-magenta)',        border: 'var(--graphic-magenta)' },
  },
  lavender: {
    solid:      { bg: 'var(--graphic-lavender)',      text: 'var(--text-base)',              border: 'var(--graphic-lavender)' },
    solidLight: { bg: 'var(--bg-primary-subtlest)',   text: 'var(--graphic-lavender)',       border: 'transparent' },
    outline:    { bg: 'transparent',                  text: 'var(--graphic-lavender)',       border: 'var(--graphic-lavender)' },
  },
  violet: {
    solid:      { bg: 'var(--graphic-violet)',        text: 'var(--text-base)',              border: 'var(--graphic-violet)' },
    solidLight: { bg: 'var(--bg-primary-subtlest)',   text: 'var(--graphic-violet)',         border: 'transparent' },
    outline:    { bg: 'transparent',                  text: 'var(--graphic-violet)',         border: 'var(--graphic-violet)' },
  },
  gray: {
    solid:      { bg: 'var(--bg-neutral-stronger)',   text: 'var(--text-base)',              border: 'transparent' },
    solidLight: { bg: 'var(--bg-neutral-base)',       text: 'var(--text-neutral-stronger)',  border: 'transparent' },
    outline:    { bg: 'transparent',                  text: 'var(--text-neutral-stronger)',  border: 'var(--border-neutral-stronger)' },
  },
};

const getBadgeStyle = (color: BadgeColor = 'primary', type: BadgeType = 'solid'): BadgeCssVarStyle => {
  const tokens = colorTokenMap[color][type];
  return {
    '--badge-bg':     tokens.bg,
    '--badge-text':   tokens.text,
    '--badge-border': tokens.border,
  };
};

const badgeStyles = cva(
  'inline-flex items-center justify-center font-medium relative border bg-[var(--badge-bg)] text-[var(--badge-text)] border-[var(--badge-border)]',
  {
    variants: {
      shape: {
        rounded: 'rounded-sm',
        pill:    'rounded-full',
      },
      size: {
        sm: 'h-[18px] text-[10px] leading-[100%]',
        md: 'h-[24px] text-d1 leading-[100%] md:h-[20px] md:text-[10px]',
        lg: 'h-[24px] text-d2 leading-[100%]',
      },
    },
    compoundVariants: [
      // rounded: 상하 여백이 좁으므로 padding 작게
      { shape: 'rounded', size: 'sm', className: 'px-2' },
      { shape: 'rounded', size: 'md', className: 'px-2 md:px-2' },
      { shape: 'rounded', size: 'lg', className: 'px-2' },
      // pill: 둥근 형태이므로 padding 넉넉하게
      { shape: 'pill',    size: 'sm', className: 'px-2' },
      { shape: 'pill',    size: 'md', className: 'px-2.5 md:px-2' },
      { shape: 'pill',    size: 'lg', className: 'px-2.5' },
    ],
    defaultVariants: {
      shape: 'pill',
      size:  'md',
    },
  }
);

interface HiBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  type?:  BadgeType;
  color?: BadgeColor;
  shape?: BadgeShape;
  size?:  BadgeSize;
}

export const HiBadge = ({ type = 'solid', color = 'primary', shape, size, className, style, children, ...props }: HiBadgeProps) => {
  const mergedStyle: BadgeCssVarStyle = {
    ...getBadgeStyle(color, type),
    ...(style ?? {}),
  };

  return (
    <span
      className={clsx(badgeStyles({ shape, size }), className)}
      style={mergedStyle}
      {...props}
    >
      {children}
    </span>
  );
};

export default HiBadge;
