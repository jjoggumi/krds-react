import React, { useState, useEffect, useRef } from "react";
import { CSSTransition } from "react-transition-group";
import styles from "./sideModal.module.scss";
import resizeArrow from '../../assets/img/icon/icon_resize_arrow.svg';
import { HiButton } from "./hiButton";
import { X } from "lucide-react";

interface SideModalProps {
  isOpen?: boolean;
  size?: string;
  width?: any;
  onClose: any;
  children: any;
  heading: any;
  desc?: React.ReactNode; 
  footer?: any;
  className?: any;
  anyOutsideClose?: boolean; // true: 바깥 아무 곳이나 클릭 시 닫힘, false: .hc2-time-table-wrap 내에서만 닫힘
  excludeSelector?: string; // 클릭해도 닫지 않을 요소의 CSS selector
}

const SideModal = ({ 
  isOpen = false, 
  size = "md", 
  width = null, 
  onClose, 
  children, 
  heading, 
  desc = null, 
  footer,
  className,
  anyOutsideClose = false,
  excludeSelector,
}: SideModalProps) => {
  const [modalWidth, setModalWidth] = useState(800);
  const [isResizing, setIsResizing] = useState(false);
  const isResizingRef = useRef(false); // 최신값 추적용
  const startXRef = useRef(0); // 드래그 시작 X
  const startWidthRef = useRef(0); // 드래그 시작 width
  const [showCursor, setShowCursor] = useState(false);
  const showCursorRef = useRef(false); // 커서 표시 최신값
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const sideModalRef = useRef<HTMLDivElement | null>(null);
  //const sideModalRef = useRef(null);

  const updateModalWidth = () => {
    const winW = window.innerWidth;
    const sidebarWidth = 240; // Vue에서 쓰던 값
    const marginRight = 30;
    const maxAvailableWidth = winW - sidebarWidth - marginRight;
    let w = 800;

    switch (size) {
      case "sm": w = 400; break;
      case "md": w = 760; break;
      case "lg": w = 1200; break;
      case "xl": w = Math.min(maxAvailableWidth, 1613); break;
      default: break;
    }
    setModalWidth(Number(width) || w);
  };

  useEffect(() => {
    updateModalWidth();
    window.addEventListener("resize", updateModalWidth);
    window.addEventListener("mousemove", trackMouse);
    window.addEventListener("mouseup", stopResizing);

    return () => {
      window.removeEventListener("resize", updateModalWidth);
      window.removeEventListener("mousemove", trackMouse);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [size, width]);

  //Outside click to close
  useEffect(() => {
    if (!isOpen) return;

    const handleDocumentMouseDown = (e: MouseEvent) => {
      if (isResizingRef.current) return; // ignore during resize drag
      const modalEl = sideModalRef.current;
      if (!modalEl) return;
      const targetNode = e.target as Node | null;
      if (!targetNode) return;
      // 플로팅 팝업 내부 클릭은 사이드 모달을 닫지 않음
      const el = targetNode instanceof Element ? targetNode : null;
      if (el && el.closest('.hi-modal-wrap')) return;
      if (el && el.closest('[data-floating-popup]')) return;
      // excludeSelector로 지정된 요소는 닫지 않음
      if (excludeSelector && el && el.closest(excludeSelector)) return;
      const isOutside = !modalEl.contains(targetNode);
      if (isOutside) {
        if (anyOutsideClose) {
          const el = targetNode instanceof Element ? targetNode : null;
          const inWrap = el ? el.closest('#wrap') : null;
          if (inWrap) {
            try { onClose && onClose(); } catch (_) { /* noop */ }
          }
        } else {
          // 기존: .hc2-time-table-wrap 영역에서만 닫힘
          const el = targetNode instanceof Element ? targetNode : null;
          const inTimeTableWrap = el ? el.closest('.hc2-time-table-wrap') : null;
          if (inTimeTableWrap) {
            try { onClose && onClose(); } catch (_) { /* noop */ }
          }
        }
      }
    };

    document.addEventListener('mousedown', handleDocumentMouseDown, true);
    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown, true);
    };
  }, [isOpen, onClose, anyOutsideClose, excludeSelector]);

  const trackMouse = (e: MouseEvent) => {
    if (showCursorRef.current) {
      setCursorPos({ x: e.clientX - 20, y: e.clientY - 20 });
    }
    if (isResizingRef.current) {
      const diff = startXRef.current - e.clientX;
      setModalWidth(Math.min(Math.max(400, startWidthRef.current + diff), window.innerWidth * 0.8));
    }
  };

  const handleMouseEnter = () => {
    setShowCursor(true);
    showCursorRef.current = true;
  };
  const handleMouseLeave = () => {
    setShowCursor(false);
    showCursorRef.current = false;
  };

  const startResizing = (e: React.MouseEvent) => {
    setIsResizing(true);
    isResizingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = modalWidth;
    e.preventDefault();
  };

  const stopResizing = () => {
    setIsResizing(false);
    isResizingRef.current = false;
  };

  return (
    <CSSTransition
      in={isOpen}
      timeout={300}
      classNames="slide-modal"
      unmountOnExit
      nodeRef={sideModalRef}
    >
      <div
        ref={sideModalRef}
        className={`side-modal ${styles['side-modal']} ${className || ""} ${styles[`${size}`]} `}
        style={{
          width: modalWidth + "px",
          transition: isResizing ? "none" : "0.5s ease"
        }}
      >
        {/* 상단 헤더 */}
        <div className={`side-modal-header ${styles['side-modal-header']}`}>
          {heading && <h2 className={styles['heading']}>{heading}</h2>}
          {desc && <div className={styles['desc']}>{desc}</div>}
          <HiButton variant="link" onClick={onClose} className="absolute top-6 right-6">
            <X size={24} strokeWidth={1.4} className="stroke-text-default" />
          </HiButton>
        </div>

        {/* 본문 */}
        <div className={`side-modal-cont-wrap ${styles['side-modal-cont-wrap']} ${footer ? styles['has-footer'] : ""}`}>
          <div className={`side-modal-cont ${styles['side-modal-cont']} custom-scr`}>
            <div className={`side-modal-cont-inner ${styles['side-modal-cont-inner']}`}>
              {children}
            </div>
          </div>
        </div>

        {/* 리사이즈 핸들 */}
        <div
          className={styles['resize-handle']}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={startResizing}
        />

        {showCursor && (
          <div
            className={styles['custom-cursor-follow']}
            style={{
              top: cursorPos.y - 70 + 'px',
            }}
          >
            <img
              src={resizeArrow}
              alt="resize"
              className={styles['resize-arrow']}
            />
          </div>
         )}

        {/* 하단 버튼 */}
        {footer !== undefined && footer !== null && footer !== false && (
          <div className={`side-modal-footer ${styles['side-modal-footer']}`}>{footer}</div>
        )}
      </div>
    </CSSTransition>
  );
};

export default SideModal;
