import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';
import { HiButton } from './hiButton';

/* ────────────────────────────────────────────────────────────
  타입 선언
──────────────────────────────────────────────────────────── */
/**
 * default     — footer 노드를 기본 패딩으로 렌더링
 * full-button — 하단에 전체 너비 확인 버튼 렌더링 (onConfirm 필수)
 * custom      — footer 노드를 padding 없이 그대로 렌더링 (사용처에서 완전 제어)
 */
type FooterVariant = 'default' | 'custom';

/* ────────────────────────────────────────────────────────────
  인터페이스
──────────────────────────────────────────────────────────── */
export interface HiBottomSheetProps {
  /** 시트 열림 여부 */
  isOpen: boolean;
  /** 닫기 콜백 */
  onClose: () => void;
  /** 제목 */
  title?: React.ReactNode;
  /** 설명글 */
  desc?: React.ReactNode;
  /** 헤더 슬롯 (제목/설명 아래에 렌더링) */
  header?: React.ReactNode;
  /** 컨텐츠 영역 */
  content?: React.ReactNode;
  /** 컨텐츠 fallback (content가 없을 때 사용) */
  children?: React.ReactNode;
  /** 하단 슬롯 */
  footer?: React.ReactNode;
  /**
   * 풋터 스타일 변형
   * - 'default'      → footer 노드를 기본 패딩으로 렌더링
   * - 'full-button'  → 전체 너비 확인 버튼 렌더링 (onConfirm 전달 필요)
   * - 'custom'       → padding 없이 footer 노드를 그대로 렌더링
   */
  footerVariant?: FooterVariant;
  /** 하단 확인 버튼 핸들러 (footerVariant='full-button' 시 사용) */
  onConfirm?: () => void;
  /** 확인 버튼 라벨 (기본: '확인') */
  confirmLabel?: string;
  /** 확인 버튼 비활성화 여부 */
  confirmDisabled?: boolean;
  /** 딤 클릭 시 닫기 (기본값: true) */
  dimClose?: boolean;
  /** 닫기(X) 버튼 표시 여부 (기본값: false) */
  closeSkip?: boolean;
  /** 시트 루트 className */
  className?: string;
  /** 시트 루트 style */
  style?: React.CSSProperties;
  /** 열릴 때 스크롤을 맨 위로 이동할지 여부 (기본값: true) */
  showOnScrollUp?: boolean;
}

/* ────────────────────────────────────────────────────────────
  컴포넌트
──────────────────────────────────────────────────────────── */
export const HiBottomSheet: React.FC<HiBottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  desc,
  header,
  content,
  children,
  footer,
  footerVariant = 'default',
  onConfirm,
  confirmLabel = '확인',
  confirmDisabled = false,
  dimClose = true,
  closeSkip = false,
  className = '',
  style,
  showOnScrollUp = true,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // 열려 있을 때 body 스크롤 잠금
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!showOnScrollUp || !isOpen) return;
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [showOnScrollUp, isOpen]);

  const hasHeader = title || desc || header;
  const bodyContent = content ?? children;

  return (
    <div
      className={clsx(
        'fixed inset-0 z-[9999] flex items-end',
        isOpen ? 'pointer-events-auto' : 'pointer-events-none',
      )}
    >
      {/* Dim */}
      <div
        className={clsx(
          'absolute inset-0 bg-bg-dim transition-opacity duration-300 select-none',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={dimClose ? onClose : undefined}
      />

      {/* Sheet */}
      <div
        className={clsx(
          'relative w-full bg-bg-base rounded-t-[20px] flex flex-col max-h-[90vh]',
          'shadow-[0_-4px_24px_rgba(0,0,0,0.12)]',
          'transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
          isOpen ? 'translate-y-0' : 'translate-y-[calc(100%+50px)]',
          className,
        )}
        style={style}
        role="dialog"
        aria-modal="true"
      >

        {/* 헤더 */}
        <div className={clsx('shrink-0 px-6 relative', hasHeader ? 'pt-7 pb-5' : 'py-4')}>
          {hasHeader && (
            <>
              {closeSkip && (
                <button
                  className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center text-default rounded-lg hover:bg-neutral-subtlest"
                  onClick={onClose}
                  aria-label="닫기"
                >
                  <X size={20} strokeWidth={2} />
                </button>
              )}
              {title && (
                <h2 className="font-bold text-leading-h3 text-default">
                  {title}
                </h2>
              )}
              {desc && (
                <p className="text-leading-b2 text-text-neutral-stronger">
                  {desc}
                </p>
              )}
              {header && <div className="mt-3">{header}</div>}
            </>
          )}
        </div>

        {/* 헤더 없이 닫기버튼만 필요한 경우 */}
        {!hasHeader && closeSkip && (
          <div className={clsx('shrink-0 px-6 relative py-8')}>
            <button
              className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center text-default rounded-lg hover:bg-neutral-subtlest"
              onClick={onClose}
              aria-label="닫기"
            >
              <X size={20} strokeWidth={2} />
            </button>
          </div>
        )}

        {/* 컨텐츠 */}
        {bodyContent !== undefined && bodyContent !== null && (
          <div ref={scrollContainerRef} className={clsx('flex-1 overflow-y-auto ', footer ? 'pb-5' : 'pb-8')}>
            {bodyContent}
          </div>
        )}

        {/* 하단 영역 */}
        {footer && (
          <div className={clsx(
            'flex shrink-0 sticky bottom-0 bg-bg-base pt-5',
            footerVariant === 'default' && 'p-5 gap-2',
          )}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default HiBottomSheet;

