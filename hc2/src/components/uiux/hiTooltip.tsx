
// 리액트 하이툴팁은 현재 타임테이블에서만 사용중이며 
// 기능 업그레이드된 내용으로 tooltip 컴포넌트를 대체합니다. 
// 이후 하이툴팁 은 타임테이블에서도 하나씩 툴팁으로 변경될 예정입니다. 

import React, { useMemo, useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import styles from "./hiTooltip.module.scss";

interface HiTooltipProps {
  titleHtml: string | React.ReactNode;
  color?: string;
  ico?: string;
  position?: "top" | "bottom" | "left" | "right" | "center-top" | "center-bottom" | "center-left" | "center-right";
  ani?: "x" | "y" | "fade";
  className?: string;
  msgclassName?: string;
  style?: React.CSSProperties;
  isActive?: boolean; 
  children?: React.ReactNode;
}

const HiTooltip: React.FC<HiTooltipProps> = ({
  titleHtml,
  color,
  ico = "info",
  position = "top",
  ani,
  className,
  msgclassName,
  style,
  isActive: propIsActive,
  children,
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ left: 0, top: 0, transform: 'translate(0,0)' });

  const isActive = propIsActive ?? isHovered;

  const classList = useMemo(() => {
    const arr = [`${styles['tooltip']}`];
    if (position) arr.push(`${styles[position]}`);
    if (color) arr.push(`${styles['tooltip-'+color]}`);
    if (ani) arr.push(`${styles['tooltip-ani-'+ani]}`);
    return arr.join(" ");
  }, [color, ani, position]);

  const hasChildren = React.Children.count(children) > 0;

  // Force tooltip portal z-index high so it isn't hidden behind modals
  // (previous logic attempted to detect side-modal but could miss timing; use high z-index)
  const forcedPortalStyle = { zIndex: 99999 };

  // Compute anchor left/top and a percentage transform so we don't need the tooltip size
  const computePosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return { left: 0, top: 0, transform: 'translate(0,0)' };

    const rect = trigger.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    let left = rect.left + scrollX;
    let top = rect.top + scrollY;
    let transform = 'translate(0,0)';

    switch (position) {
      case 'top':
        // anchor to trigger left, move up by tooltip height via translateY(-100%)
        transform = 'translate(0, -100%)';
        break;
      case 'bottom':
        transform = 'translate(0, 0)';
        top = rect.top + scrollY + rect.height;
        break;
      case 'left':
        transform = 'translate(-100%, -50%)';
        top = rect.top + scrollY + rect.height / 2;
        break;
      case 'right':
        transform = 'translate(0, -50%)';
        left = rect.left + scrollX + rect.width;
        top = rect.top + scrollY + rect.height / 2;
        break;
      case 'center-top':
        left = rect.left + scrollX + rect.width / 2;
        transform = 'translate(-50%, -100%)';
        break;
      case 'center-bottom':
        left = rect.left + scrollX + rect.width / 2;
        top = rect.top + scrollY + rect.height;
        transform = 'translate(-50%, 0)';
        break;
      case 'center-left':
        left = rect.left + scrollX;
        top = rect.top + scrollY + rect.height / 2;
        transform = 'translate(-100%, -50%)';
        break;
      case 'center-right':
        left = rect.left + scrollX + rect.width;
        top = rect.top + scrollY + rect.height / 2;
        transform = 'translate(0, -50%)';
        break;
    }

    // small offsets
    if (position === 'top') top -= 10;
    if (position === 'center-top') top -= 8;
    if (position === 'bottom') top += 10;

    return { left, top, transform };
  };

  // Update position once on show and on resize (no RAF)
  useEffect(() => {
    if (!isActive) return;
    const update = () => setCoords(computePosition());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [isActive, position]);

  const tooltipElement = (
    <div
      ref={tooltipRef}
      className={`${classList} ${msgclassName} `}
      style={{
        position: 'fixed',
        left: `${coords.left}px`,
        top: `${coords.top}px`,
        transform: coords.transform,
        ...forcedPortalStyle,
      }}
    >
      {typeof titleHtml === 'string' ? (
        <span dangerouslySetInnerHTML={{ __html: titleHtml }} />
      ) : (
        <span>{titleHtml}</span>
      )}
    </div>
  );

  return (
    <div
      ref={triggerRef}
      className={`${className ? className : ''} ${styles['hi-tooltip-wrap']}`}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {!hasChildren && (
        <i className={`${styles['ico']} ico ico-${ico} ico-size-20 ico-${color}`}></i>
      )}
      {isActive && ReactDOM.createPortal(tooltipElement, document.body)}
    </div>
  );
};

export default HiTooltip;
