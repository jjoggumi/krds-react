import React, { useState, forwardRef, useImperativeHandle, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cva } from 'class-variance-authority';
import clsx from 'clsx';

type TabVariant = 'underline' | 'pills';
type TabSize = 'sm' |'md' | 'lg' | 'xl' | 'xxl';

// pills 좌우 패딩
const pillsPxBySize: Record<TabSize, string> = {
  sm:  'px-4',
  md:  'px-4',
  lg:  'px-5',
  xl:  'px-5',
  xxl: 'px-6', 
};

// underline gap    
const underlineGapBySize: Record<TabSize, string> = {
  sm:  'gap-4', // underline에서는 사용 안함
  md:  'gap-4',
  lg:  'gap-5',
  xl:  'gap-6',
  xxl: 'gap-6',
};

const UNDERLINE_STYLE = 'absolute bottom-0 h-[3px] rounded-full pointer-events-none';
const UNDERLINE_BG = 'var(--action-secondary-strongest)';

const BADGE_STYLE: React.CSSProperties = {
  display: 'inline-block',
  marginLeft: '6px',
  alignSelf: 'flex-start',
  marginTop: 0,
  width: 6, height: 6,
};

const tabItemStyles = cva('flex items-center justify-center transition-all duration-150', {
  variants: {
    variant: {
      underline: 'relative px-1 font-bold mb-[-1px] py-2.5',
      pills: 'rounded-full font-medium',
    },
    size: {
      sm: 'h-9 text-leading-b3',
      md: 'h-10 text-leading-h4',
      lg: 'h-11 text-leading-h4',
      xl: 'h-12 text-leading-h4',
      xxl: 'h-14 text-leading-h3'
    },
    active: { true: '', false: '' },
  },
  compoundVariants: [
    { variant: 'underline', size: 'md', className: 'text-leading-h4' },
    { variant: 'pills', size: 'sm', className: 'text-leading-b3' },
    { variant: 'pills', className: 'text-leading-b2' },
    { variant: 'pills', size: 'xl', className: 'text-leading-b1' },
    { variant: 'underline', active: true, className: 'text-text-secondary-strongest' },
    { variant: 'underline', active: false, className: 'text-text-neutral-strong hover:[color:var(--text-secondary-strongest)]' },
    { variant: 'pills', active: true, className: 'bg-[var(--action-secondary-strongest)] text-text-base' },
    { variant: 'pills', active: false, className: 'bg-[var(--action-secondary-subtler)] text-[var(--gray-950)] hover:[background:linear-gradient(0deg,rgba(67,73,101,0.06)_0%,rgba(67,73,101,0.06)_100%),var(--action-secondary-subtler)]' },
  ],
  defaultVariants: { variant: 'underline', size: 'md', active: false },
});

export interface HiTabHandle {
  setSelectedIndex: (index: number) => void;
}

export interface HiTabProps {
  labels?: string[];
  children?: React.ReactNode | React.ReactNode[];
  variant?: TabVariant;
  size?: TabSize;
  isNew?: boolean[];
  className?: string;
  wrapClassName?: string;
  style?: React.CSSProperties;
  extractTabSetter?: (setter: (index: number) => void) => void;
  onChange?: (index: number) => void;
  isControlOuter?: boolean;
  selectedTabIndex?: number;
  renderEtc?: React.ReactNode | (() => React.ReactNode);
  contentAnimation?: 'fade' | 'none';
  contentAnimationDuration?: number;
}

export const HiTab = forwardRef<HiTabHandle, HiTabProps>(function HiTab(
  {
    labels = [],
    children,
    variant = 'underline',
    size = 'md',
    isNew = [],
    className = '',
    wrapClassName = '',
    style,
    extractTabSetter,
    onChange,
    isControlOuter = false,
    selectedTabIndex = 0,
    renderEtc = null,
    contentAnimation = 'none',
    contentAnimationDuration = 0.18,
  }: HiTabProps,
  ref
) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [underline, setUnderline] = useState({ left: 0, width: 0, ready: false });

  useImperativeHandle(ref, () => ({ setSelectedIndex }));

  useEffect(() => {
    setSelectedIndex(selectedTabIndex);
  }, [selectedTabIndex]);

  useEffect(() => {
    if (typeof extractTabSetter === 'function') extractTabSetter(setSelectedIndex);
  }, [extractTabSetter]);

  // underline 위치를 선택된 버튼 기준으로 계산
  useEffect(() => {
    if (variant !== 'underline') return;
    const btn = buttonRefs.current[selectedIndex];
    const container = containerRef.current;
    if (btn && container) {
      const btnRect = btn.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      setUnderline({ left: btnRect.left - containerRect.left, width: btnRect.width, ready: true });
    }
  }, [selectedIndex, labels, variant]);

  const handleClick = (index: number) => {
    if (!isControlOuter) setSelectedIndex(index);
    onChange?.(index);
  };

  return (
    <div className={clsx(' w-full', wrapClassName)} style={style}>
      <div className="flex items-center justify-between">
        <div
          ref={containerRef}
          className={clsx(
            'relative inline-flex items-center justify-start w-full',
            variant === 'underline' ? underlineGapBySize[size] : 'gap-2',
            className
          )}
        >
          {labels.map((label, index) => {
            const isActive = selectedIndex === index;
                return (
                  <motion.button
                    key={index}
                    ref={(el) => { buttonRefs.current[index] = el; }}
                    type="button"
                    className={clsx(
                      tabItemStyles({ variant, size, active: isActive }),
                      variant === 'pills' && [pillsPxBySize[size], 'min-w-0']
                    )}
                    onClick={() => handleClick(index)}
                  >
                    <span className={clsx('flex items-center w-full', isNew[index] ? 'justify-between' : 'justify-center')}>
                      <span className="shrink-0 truncate whitespace-nowrap text-center leading-h3">{label}</span>
                      {isNew[index]
                        ? <span style={BADGE_STYLE} className="bg-action-red-base rounded-full shrink-0" />
                        : null}
                    </span>
                  </motion.button>
                );
          })}
          {variant === 'underline' && underline.ready && (
            <motion.span
              className={UNDERLINE_STYLE}
              animate={{ x: underline.left }}
              initial={false}
              transition={{ type: 'spring', bounce: 0.12, stiffness: 300, damping: 30 }}
              style={{ background: UNDERLINE_BG, width: underline.width }}
            />
          )}
        </div>
        {renderEtc && (typeof renderEtc === 'function' ? renderEtc() : renderEtc)}
      </div>
      {contentAnimation === 'fade' && Array.isArray(children) ? (
        <div className="mt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: contentAnimationDuration }}
            >
              {children[selectedIndex]}
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        Array.isArray(children) ? children[selectedIndex] : children
      )}
    </div>
  );
});

export default HiTab;
