import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from "framer-motion";
import { cva } from 'class-variance-authority';
import { Icon } from './icon';

// framer-motion variants --
const animationVariants = {
  // 1. 좌우로 3번 움직임
  shakeX: {
    initial: { opacity: 0, x: -10 },
    animate: {
      opacity: 1,
      // 좌우 이동 폭을 절반(±5)로 줄인다.
      x: [ -5, 5, -5, 5, -5, 0 ],
      transition: {
        x: { repeat: 0, duration: 1.8, times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
        opacity: { duration: 0.2 }
      }
    },
  },
  // 2. 상하로 3번 움직임
  shakeY: {
    initial: { opacity: 0, y: -10 },
    animate: {
      opacity: 1,
      y: [ -5, 5, -5, 5, -5, 0 ],
      transition: {
        y: { repeat: 0, duration: 1.8, times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
        opacity: { duration: 0.2 }
      }
    },
  },
  // 3. fadein
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  // 3.5 fade-in then fade-out (opacity timing same as shakeYOut but no vertical movement)
  fadeinOut: {
    initial: { opacity: 0 },
    animate: {
      opacity: [0, 1, 1, 1, 1, 0],
      transition: {
        opacity: { duration: 2, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }
      }
    },
    exit: {
      opacity: [1, 0],
      transition: {
        opacity: { duration: 0.2 }
      }
    },
  },
  // 4. 좌우로 3번 움직이고 사라짐
  shakeXOut: {
    initial: { opacity: 0, x: -10 },
    animate: {
      // 3번 좌우로 흔들고(0~0.8), 마지막 구간(0.8~1)에서만
      // 멈춘 상태로 부드럽게 페이드 아웃
      opacity: [0, 1, 1, 1, 1, 0],
      x: [ -5, 5, -5, 5, -5, 0 ],
      transition: {
        x: { repeat: 0, duration: 2, times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
        opacity: { duration: 2, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }
      }
    },
    exit: {
      opacity: [1, 0],
      x: [0, 30],
      transition: {
        opacity: { duration: 0.2 },
        x: { duration: 0.2 }
      }
    },
  },
  // 5. 상하로 3번 움직이고 사라짐
  shakeYOut: {
    initial: { opacity: 0, y: -10 },
    animate: {
      // 3번 상하로 흔들고(0~0.8), 마지막 구간(0.8~1)에서만
      // 멈춘 상태로 부드럽게 페이드 아웃
      opacity: [0, 1, 1, 1, 1, 0],
      y: [ -5, 5, -5, 5, -5, 0 ],
      transition: {
        y: { repeat: 0, duration: 2, times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
        opacity: { duration: 2, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }
      }
    },
    exit: {
      opacity: [1, 0],
      y: [0, 30],
      transition: {
        opacity: { duration: 0.2 },
        y: { duration: 0.2 }
      }
    },
  },
};


type TooltipIntent = 'solid' | 'solidLight';

type TooltipCssVarStyle = React.CSSProperties & {
  ['--tooltip-color']?: string;
  ['--tooltip-color-10']?: string;
  ['--tooltip-color-15']?: string;
  ['--tooltip-color-90']?: string;
};


type Position =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'center-top'
  | 'center-bottom'
  | 'center-left'
  | 'center-right';

// 트리거 기준으로 스크롤 부모들을 수집한다 (OptionLayer와 동일한 패턴)
const getScrollParents = (node: HTMLElement | null) => {
  const result: (Element | Window)[] = [window];
  let parent: HTMLElement | null = node?.parentElement || null;
  while (parent && parent !== document.body) {
    const style = getComputedStyle(parent);
    const overflowY = style.overflowY;
    const overflowX = style.overflowX;
    if (/(auto|scroll)/.test(overflowY) || /(auto|scroll)/.test(overflowX)) {
      result.push(parent);
    }
    parent = parent.parentElement;
  }
  return result;
};

export interface TooltipProps {
  titleHtml: string | React.ReactNode;
  color?: string;
  icon?: string;
  iconSize?: number;
  position?: Position;
  ani?: string;
  className?: string;
  tooltipClassName?: string;
  style?: React.CSSProperties;
  isActive?: boolean;
  children?: React.ReactNode;
  arrowOffset?: number; // px, default 8  //  툴팁 arrow 위치 지정
  size?: 'sm' | 'md' | 'lg'; // 툴팁 박스 사이즈
  intent?: TooltipIntent; // 스타일 인텐트
  isEnabled?: boolean;
}

// Tooltip 색상 변수 계산 (hiButton과 유사 패턴)
const getTooltipCssVars = (color: string | undefined): TooltipCssVarStyle => {
  const baseColor = color ? `var(--${String(color)})` : '#3D4655';

  const base: TooltipCssVarStyle = {
    '--tooltip-color': baseColor,
    '--tooltip-color-10': 'color-mix(in oklab, var(--tooltip-color) 10%, #fff)',
    '--tooltip-color-15': 'color-mix(in oklab, var(--tooltip-color) 15%, #fff)',
    '--tooltip-color-90': 'color-mix(in oklab, var(--tooltip-color) 90%, #000)',
  };
  return { ...base };
};

// --- Custom Hook for Tooltip Positioning ---
const useTooltipStyle = (
  triggerRef: React.RefObject<HTMLElement>,
  tooltipRef: React.RefObject<HTMLElement>,
  position: Position,
  isActive: boolean,
) => {
  const [style, setStyle] = useState<React.CSSProperties>({
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0, // Initially hidden
  });

  const setupPositioning = () => {
    if (!isActive || !triggerRef.current) {
      if (style.opacity !== 0) setStyle((s) => ({ ...s, opacity: 0 }));
      return () => {};
    }

    const triggerEl = triggerRef.current;
    const tooltipEl = tooltipRef.current;

    let _prevLeft: number | null = null;
    const updatePosition = () => {
      const rect = triggerEl.getBoundingClientRect();
      const tooltipRect = tooltipEl?.getBoundingClientRect();

      if (!tooltipRect) return;

      let x = window.scrollX;
      let y = window.scrollY;

      let transform = '';
      switch (position) {
        case 'top':
          x += rect.left;
          y += rect.top - tooltipRect.height - 10;
          transform = 'translateX(-6px)';
          break;
        case 'bottom':
          x += rect.left;
          y += rect.bottom + 10;
          transform = 'translateX(-6px)';
          break;
        case 'left':
          x += rect.left - tooltipRect.width - 10;
          y += rect.top + rect.height / 2 - tooltipRect.height / 2;
          transform = 'translateY(+6px)';
          break;
        case 'right':
          x += rect.right + 10;
          y += rect.top + rect.height / 2 - tooltipRect.height / 2;
          transform = 'translateY(+6px)';
          break;
        case 'center-top':
          x += rect.left + rect.width / 2;
          y += rect.top - tooltipRect.height - 10;
          transform = 'translateX(-50%)';
          break;
        case 'center-bottom':
          x += rect.left + rect.width / 2;
          y += rect.bottom + 10;
          transform = 'translateX(-50%)';
          break;
        case 'center-left':
          x += rect.left - tooltipRect.width - 10;
          y += rect.top + rect.height / 2;
          transform = 'translateY(-50%)';
          break;
        case 'center-right':
          x += rect.right + 10;
          y += rect.top + rect.height / 2;
          transform = 'translateY(-50%)';
          break;
      }
      setStyle({
        position: 'absolute',
        top: 0,
        left: 0,
        transform: `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)${transform ? ' ' + transform : ''}`,
        opacity: 1,
      });
    };

    updatePosition();

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    const parents = getScrollParents(triggerEl as HTMLElement);
    parents.forEach((p) => (p as any).addEventListener('scroll', updatePosition, { passive: true }));

    let rafId: number | null = null;
    let wakeTimeoutId: number | null = null;
    let stableFrames = 0;
    const FRAME_STABLE_LIMIT = 6;

    const startLoop = () => {
      if (rafId != null) return;
      const frame = () => {
        try {
          const curLeft = triggerEl.getBoundingClientRect().left;
          if (_prevLeft === null) {
            _prevLeft = curLeft;
            stableFrames = 0;
            updatePosition();
          } else if (Math.abs(curLeft - _prevLeft) > 0.5) {
            _prevLeft = curLeft;
            stableFrames = 0;
            updatePosition();
          } else {
            stableFrames += 1;
            if (stableFrames >= FRAME_STABLE_LIMIT) {
              if (rafId != null) {
                window.cancelAnimationFrame(rafId);
                rafId = null;
              }
              wakeTimeoutId = window.setTimeout(() => {
                stableFrames = 0;
                _prevLeft = null;
                startLoop();
              }, 200);
              return;
            }
          }
        } catch (e) {
          // ignore
        }
        rafId = window.requestAnimationFrame(frame);
      };
      rafId = window.requestAnimationFrame(frame);
    };

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
      parents.forEach((p) => (p as any).removeEventListener('scroll', updatePosition));
      if (rafId != null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (wakeTimeoutId != null) {
        window.clearTimeout(wakeTimeoutId);
        wakeTimeoutId = null;
      }
    };
  };

  useEffect(() => {
    return setupPositioning();
  }, [isActive, position, triggerRef, tooltipRef]);

  return style;
};

// --- Arrow Component ---
const Arrow: React.FC<{ position: Position; colorVar: string; arrowOffset?: number }> = ({
  position,
  colorVar,
  arrowOffset = 8,
}) => {
  // 동적으로 px 값을 넣기 위해 style로 처리
  const px = `${arrowOffset}px`;
  const positionClasses: Record<Position, string> = {
    top: `top-full left-[var(--arrow-offset,8px)]`,
    bottom: `bottom-full left-[var(--arrow-offset,8px)]`,
    left: `left-full top-[var(--arrow-offset,8px)]`,
    right: `right-full top-[var(--arrow-offset,8px)]`,
    'center-top': 'top-full left-1/2 -translate-x-1/2',
    'center-bottom': 'bottom-full left-1/2 -translate-x-1/2',
    'center-left': 'left-full top-1/2 -translate-y-1/2',
    'center-right': 'right-full top-1/2 -translate-y-1/2',
  };
  const borderStyle: React.CSSProperties = {
    borderTopColor: position.includes('top') ? colorVar : 'transparent',
    borderBottomColor: position.includes('bottom') ? colorVar : 'transparent',
    borderLeftColor: position.includes('left') ? colorVar : 'transparent',
    borderRightColor: position.includes('right') ? colorVar : 'transparent',
    // 동적으로 arrowOffset 적용
    ...(position === 'top' || position === 'bottom' ? { '--arrow-offset': px } : {}),
    ...(position === 'left' || position === 'right' ? { '--arrow-offset': px } : {}),
  } as React.CSSProperties;
  const classes = `absolute w-0 h-0 border-[5px] ${positionClasses[position]}`;
  return <div className={classes} style={borderStyle} />;
};

// --- Main Tooltip Component ---
// Tooltip 스타일: intent/size 기반 클래스 정의 (hiButton 패턴 참고)
const tooltipStyles = cva('rounded', {
  variants: {
    intent: {
      solid:
        'bg-[var(--tooltip-color)] text-[var(--text-base)] border-[var(--tooltip-color)]',
      solidLight:
        'bg-[var(--tooltip-color-10)] border-transparent text-[var(--tooltip-color)]',
    },
    size: {
      sm: 'tooltipSm px-2 py-2',
      md: 'tooltipMd px-3 py-3',
      // 기존 구현에서 lg는 md와 동일 스타일을 사용하므로 그대로 맞춘다.
      lg: 'tooltipMd px-3 py-3',
    },
  },
  defaultVariants: {
    intent: 'solid',
    size: 'md',
  },
});

const Tooltip: React.FC<TooltipProps> = ({
  titleHtml,
  color = undefined,
  icon = 'info-fill',
  iconSize = 20,
  position = 'center-bottom',
  ani,
  className,
  tooltipClassName,
  style,
  isActive: propIsActive,
  children,
  arrowOffset = 8,
  size = 'md', // 기본값 md
  intent = 'solid',
  isEnabled,
}) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // 휠 스크롤 시 툴팁 닫힘 처리
  React.useEffect(() => {
    if (!isHovered) return;
    const handleScroll = () => setIsHovered(false);
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [isHovered, isEnabled]);
  
  const hasChildren = React.Children.count(children) > 0;

  const isActive = propIsActive ?? isHovered;
  const tooltipPositionStyle = useTooltipStyle(
    triggerRef,
    tooltipRef,
    position,
    isActive,
  );
  const tooltipVars = getTooltipCssVars(color);

  // --- 포지션별 기본 슬라이드 효과 ---
  let defaultInitial: any = { opacity: 0 };
  if (!ani) {
    switch (position) {
      case 'top':
      case 'center-top':
      case 'center-bottom':
        defaultInitial = { opacity: 0, y: -5 };
        break;
      case 'bottom':
        defaultInitial = { opacity: 0, y: 5 };
        break;
      case 'left':
      case 'center-left':
        defaultInitial = { opacity: 0, x: -5 };
        break;
      case 'right':
      case 'center-right':
        defaultInitial = { opacity: 0, x: 5 };
        break;
      default:
        defaultInitial = { opacity: 0 };
    }
  }

  const aniKey = ani ? String(ani) : '';
  const variant = (animationVariants as Record<string, any>)[aniKey] || { initial: defaultInitial, animate: { opacity: 1, x: 0, y: 0 } };
  const motionTransition = variant.transition || { duration: 0.15, ease: [0.4, 0, 0.2, 1] };
  const arrowColorVar = intent === 'solidLight' ? 'var(--tooltip-color-10)' : 'var(--tooltip-color)';
  
  const TooltipContent = (
    <AnimatePresence mode="wait">
      {isActive && (
        <div
          key={aniKey}
          ref={tooltipRef}
          style={{ ...tooltipPositionStyle }}
          className={'z-6 ' + tooltipClassName}
        >
          <motion.div
            className={tooltipStyles({ intent, size })}
            style={{ ...tooltipVars }}
            initial={variant.initial}
            animate={variant.animate}
            exit={(aniKey === 'shakeYOut' || aniKey === 'shakeXOut' || aniKey === 'fadeinOut') ? variant.exit : undefined}
            transition={motionTransition}
          >
            <Arrow position={position} colorVar={arrowColorVar} arrowOffset={arrowOffset} />
              {typeof titleHtml === 'string' ? (
                <span dangerouslySetInnerHTML={{ __html: titleHtml }} className="inline-block text-xs whitespace-nowrap leading-[1.3]"/>
              ) : (
                titleHtml
              )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div
        ref={triggerRef}
        className={`inline relative ${
          className || ''
        }`}
        style={style}
        onMouseEnter={() => (isEnabled !== false) && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
        {!hasChildren && (
          <Icon icon={icon} iconSize={iconSize} color={color}/>
        )}
      </div>
      {ReactDOM.createPortal(TooltipContent, document.body)}
    </>
  );
};

export default Tooltip;

// 툴팁 예제
// 애니메이션
// <Tooltip titleHtml="ani='shakeX'" ani="shakeX" />
// <Tooltip titleHtml="ani='shakeY'" ani="shakeY" />
// <Tooltip titleHtml="ani='fade'" ani="fade" />
// <Tooltip titleHtml="ani='shakeXOut'" ani="shakeXOut" />
// <Tooltip titleHtml="ani='shakeYOut'" ani="shakeYOut" />
// 인텐트
// <Tooltip titleHtml="안녕하세요" intent="solid" />
// <Tooltip titleHtml="안녕하세요" intent="solidLight" />
// 아이콘
// <Tooltip titleHtml="안녕하세요" icon="help" />
// <Tooltip titleHtml="안녕하세요" icon="help-fill" />
// <Tooltip titleHtml="안녕하세요" icon="info" />
// <Tooltip titleHtml="안녕하세요" icon="info-fill" />
// 사이즈
// <Tooltip titleHtml="안녕하세요" size="sm" />
// <Tooltip titleHtml="안녕하세요" size="md" />
// <Tooltip titleHtml="안녕하세요" size="lg" />
// 색상
// <Tooltip titleHtml="안녕하세요" color="primary" />
// <Tooltip titleHtml="안녕하세요" color="secondary" />
// <Tooltip titleHtml="안녕하세요" color="info" />
// <Tooltip titleHtml="안녕하세요" color="warning" />
// <Tooltip titleHtml="안녕하세요" color="default" />
// <Tooltip titleHtml="안녕하세요" color="disabled" />
// <Tooltip titleHtml="안녕하세요" color="black" />
// <Tooltip titleHtml="안녕하세요" color="white" />
//  위치
// <Tooltip titleHtml="안녕하세요" position="bottom" />
// <Tooltip titleHtml="안녕하세요" position="top" />
// <Tooltip titleHtml="안녕하세요" position="right" />
// <Tooltip titleHtml="안녕하세요" position="left" />
// <Tooltip titleHtml="안녕하세요" position="center-top" />
// <Tooltip titleHtml="안녕하세요" position="center-bottom" />
// <Tooltip titleHtml="안녕하세요" position="center-left" />
// <Tooltip titleHtml="안녕하세요" position="center-right" />
// 그밖에
// <Tooltip titleHtml="안녕하세요" isActive position="bottom"> <p className='h-20 bg-gray-20'>children</p> </Tooltip>
// <Tooltip titleHtml="안녕하세요" isActive position="right"> <p className='bg-gray-20'>children</p> </Tooltip>
// <Tooltip titleHtml="안녕하세요" isActive position="left"> <p className='bg-gray-20'>children</p> </Tooltip>
// <Tooltip titleHtml="안녕하세요" > <p className='bg-gray-20'>children</p> </Tooltip>
// <Tooltip titleHtml="안녕하세요" isActive ani="shakeXOut" />
