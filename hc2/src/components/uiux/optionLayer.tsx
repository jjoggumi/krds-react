import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import styles from "./optionLayer.module.scss";

export type LayerPosition = "top" | "bottom" | "left" | "right";

/**
 * position 값에 따른 레이어의 원하는 좌표를 계산합니다.
 * - top: 트리거 위쪽으로 펼침 (4px 간격)
 * - bottom: 트리거 아래쪽으로 펼침 (4px 간격)
 * - left/right: 좌/우로 펼침
 */
function computeDesiredCoords(
  baseX: number,
  baseY: number,
  triggerRect: DOMRect,
  layerRect: DOMRect | null,
  position: LayerPosition
) {
  switch (position) {
    case "top":
      return { x: baseX, y: baseY - (layerRect?.height || 0) - 4 };
    case "bottom":
      return { x: baseX, y: baseY + triggerRect.height + 4 };
    case "left":
      return { x: baseX - triggerRect.width - 4, y: baseY };
    case "right":
      return { x: baseX + triggerRect.width + 4, y: baseY };
  }
}

/**
 * 뷰포트(화면)를 벗어날 경우 자동으로 방향을 뒤집고, 화면 안에 위치하도록 보정합니다.
 */
function autoFlipAndClamp(
  x: number,
  y: number,
  layerRect: DOMRect | null,
  position: LayerPosition,
  baseX: number,
  baseY: number,
  triggerRect: DOMRect
) {
  let desired: LayerPosition = position || "bottom";
  let nextX = x;
  let nextY = y;

  if (layerRect) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const viewX = nextX;
    const viewY = nextY;
    const overflowTop = viewY < 0;
    const overflowBottom = viewY + layerRect.height > vh;
    const overflowLeft = viewX < 0;
    const overflowRight = viewX + layerRect.width > vw;

    if ((desired === "bottom" && overflowBottom) || (desired === "top" && overflowTop)) {
      desired = desired === "bottom" ? "top" : "bottom";
      ({ x: nextX, y: nextY } = computeDesiredCoords(baseX, baseY, triggerRect, layerRect, desired));
    }

    if ((desired === "right" && overflowRight) || (desired === "left" && overflowLeft)) {
      desired = desired === "right" ? "left" : "right";
      ({ x: nextX, y: nextY } = computeDesiredCoords(baseX, baseY, triggerRect, layerRect, desired));
    }

    nextX = Math.max(0, Math.min(nextX, vw - layerRect.width));
    nextY = Math.max(0, Math.min(nextY, vh - layerRect.height));
  }

  return { x: nextX, y: nextY, finalPosition: desired };
}

/**
 * 앵커 요소의 스크롤 부모들을 찾습니다.
 */
function getScrollParents(node: HTMLElement | null) {
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
}

export interface OptionLayerProps {
  /** 레이어 열림 여부 */
  isOpen: boolean;
  /** 레이어 전개 방향 (기본 bottom) */
  position?: LayerPosition;
  /** 위치 계산 기준이 되는 앵커(트리거) 요소 ref */
  anchorRef: React.RefObject<HTMLElement>;
  /** 래퍼 클래스 (예: "option-layer" + 모듈 클래스) */
  className?: string;
  /** 인라인 스타일 */
  style?: React.CSSProperties;
  /** 앵커 너비를 최소 너비로 적용할지 여부 (기본 true) */
  minWidthFromAnchor?: boolean;
  /** z-index 값 (기본 11) */
  zIndex?: number;
  /** 레이어가 열릴 때 호출 */
  onOpen?: () => void;
  /** 트리거가 뷰포트 밖으로 벗어났을 때 닫기 요청 콜백 */
  onRequestClose?: () => void;
  /** 포털 대상 노드 (기본: document.body) */
  portalTarget?: HTMLElement;
  /** 내부 콘텐츠 */
  children?: React.ReactNode;
}

/**
 * 공용 OptionLayer 컴포넌트: document.body 포털 + 고정 좌표(top/left) + 자동 뒤집기/뷰포트 보정
 * AutocompleteInput/HiSelectBox/일반 페이지에서 재사용 가능
 */
export const OptionLayer: React.FC<OptionLayerProps> = ({
  isOpen,
  position = "bottom",
  anchorRef,
  className,
  style,
  minWidthFromAnchor = true,
  zIndex = 11,
  onOpen,
  onRequestClose,
  portalTarget,
  children,
}) => {
  const layerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ x: number; y: number; width: number; ready: boolean }>({ x: 0, y: 0, width: 0, ready: false });

  useLayoutEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const anchorEl = anchorRef.current;
      if (!anchorEl) {
        setCoords((prev) => (prev.ready ? { ...prev, ready: false } : prev));
        return;
      }
      const rect = anchorEl.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // 트리거가 완전히 뷰포트 밖일 경우 닫기 요청
      const anchorOutOfView = rect.bottom < 0 || rect.top > vh || rect.right < 0 || rect.left > vw;
      if (anchorOutOfView) {
        onRequestClose && onRequestClose();
        return;
      }
      const baseX = rect.left;
      const baseY = rect.top;
      const layerRect = layerRef.current?.getBoundingClientRect() || null;

      const desired = position || "bottom";
      const initial = computeDesiredCoords(baseX, baseY, rect, layerRect, desired);
      const adjusted = autoFlipAndClamp(initial.x, initial.y, layerRect, desired, baseX, baseY, rect);

      setCoords({ x: adjusted.x, y: adjusted.y, width: rect.width, ready: true });
    };

    // 초기 계산 및 콜백
    updatePosition();
    onOpen && onOpen();

    // rAF 스로틀 갱신
    let scheduled = false;
    const scheduleUpdate = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        updatePosition();
      });
    };

    window.addEventListener("resize", scheduleUpdate);
    const parents = getScrollParents(anchorRef.current as HTMLElement);
    parents.forEach((p) => (p as any).addEventListener("scroll", scheduleUpdate, { passive: true }));
    return () => {
      window.removeEventListener("resize", scheduleUpdate);
      parents.forEach((p) => (p as any).removeEventListener("scroll", scheduleUpdate));
    };
  }, [isOpen, position, anchorRef, onOpen, onRequestClose]);

  useEffect(() => {
    if (!isOpen) {
      setCoords((prev) => (prev.ready ? { ...prev, ready: false } : prev));
    }
  }, [isOpen]);
  

  if (!isOpen) return null;

  const node = (
    <div
      ref={layerRef}
      className={`${styles['option-layer']} ${className ? className : ""}`}
      style={{
        position: "fixed",
        top: `${coords.y}px`,
        left: `${coords.x}px`,
        minWidth: minWidthFromAnchor ? `${coords.width}px` : undefined,
        zIndex,
        visibility: coords.ready ? "visible" : "hidden",
        ...style,
      }}
    >
      {children}

    </div>
  );

  return ReactDOM.createPortal(node, portalTarget || document.body);
};


export interface OptionFooterProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * 공용 OptionFooter: 옵션 레이어 하단에 버튼/액션 영역을 구성할 때 사용
 */
export const OptionFooter: React.FC<OptionFooterProps> = ({ className, children }) => {
  return <div className={`${styles['option-footer']} ${className ? className : ""}`}>
    {children}
    </div>;
};

export interface OptionItemProps {
  /** 추가 클래스 (예: 모듈 클래스) */
  className?: string;
  /** 선택 상태 여부 */
  selected?: boolean;
  /** 태그 타입: 기본 'button' */
  tag?: "button" | "div" | "a";
  /** 클릭 핸들러 */
  onClick?: (e: React.MouseEvent) => void;
  /** 내부 콘텐츠 */
  children?: React.ReactNode;
}

/**
 * 공용 OptionItem: 리스트 아이템의 껍데기(래퍼)만 제공합니다.
 * - 기본 클래스: 'item'
 * - selected=true면 selectedClassName 추가
 */
export const OptionItem: React.FC<OptionItemProps> = ({
  className,
  selected,
  tag = "button",
  onClick,
  children,
}) => {
  const Tag: any = tag;
  const classes = [
    `item ${styles['item']}`,
    selected ? `selected ${styles['selected']}` : null,
    className || null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag className={classes} onClick={onClick}>
      {children}
    </Tag>
  );
};


export interface OptionListProps {
  /** 래퍼 클래스 (기본 'option-list') */
  className?: string;
  /** 크기 옵션: sm | md | lg | xl */
  size?: "sm" | "md" | "lg" | "xl";
  /** 내부 콘텐츠 */
  children?: React.ReactNode;

  /** children이 없을 때 렌더링할 항목들 */
  items?: any[];
  getKey?: (item: any) => string | number;
  renderItem?: (item: any) => React.ReactNode;
  isSelected?: (item: any) => boolean;
  onClickItem?: (item: any) => void;
  itemTag?: "button" | "div" | "a";
  itemClassName?: string | ((item: any) => string);
}

/**
 * 공용 OptionList: 리스트의 껍대기(래퍼)만 제공합니다. 아이템은 children으로 전달하세요.
 * - 기본 클래스: 'option-list'
 * - size가 있으면 'sm|md|lg|xl' 추가
 * - scroll=true면 'custom-scr' 추가
 */
export const OptionList: React.FC<OptionListProps> = ({
  className,
  size,
  children,
  items,
  getKey,
  renderItem,
  isSelected,
  onClickItem,
  itemTag,
  itemClassName,
}) => {
  const classes = [
    `option-list ${styles['option-list']}`,
    size ? `${size} ${styles[size]}` : null,
    className || null,
  ]
    .filter(Boolean)
    .join(" ");

  if (children !== undefined && children !== null) {
    return <div className={classes}>{children}</div>;
  }

  if (items && items.length && getKey && renderItem) {
    return (
      <div className={classes}>
        {items.map((item) => (
          <OptionItem
            key={getKey(item)}
            tag={itemTag || 'button'}
            className={typeof itemClassName === 'function' ? itemClassName(item) : itemClassName}
            selected={isSelected ? isSelected(item) : false}
            onClick={onClickItem ? () => onClickItem(item) : undefined}
          >
            {renderItem(item)}
          </OptionItem>
        ))}
      </div>
    );
  }

  return <div className={classes} />;
};

export default OptionLayer;
