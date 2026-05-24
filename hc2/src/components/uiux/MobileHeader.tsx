import React from 'react';
import { X, ArrowLeft, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/uiux/';

export interface MobileHeaderProps {
  fixed?: boolean;
  title?: React.ReactNode;
  onClose?: () => void;
  onBack?: () => void;
  onHeaderClick?: () => void;
  leftArea?: React.ReactNode;
  rightArea?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  fixed = true,
  title = null,
  onClose = undefined,
  onBack = undefined,
  onHeaderClick = undefined,
  children,
  leftArea = null,
  rightArea = null,
  className = '',
}) => {
  const containerClass = `bg-bg-base border-b border-border-neutral-base h-13 flex items-center justify-between px-2 ${fixed ? 'sticky top-0 z-20' : ''} ${className}`.trim();

  const hasLeft = !!(leftArea || onBack || onClose);
  const hasRight = !!(rightArea );
  const titlePaddingClass = hasLeft && !hasRight ? 'pr-10' : !hasLeft && hasRight ? 'pl-10' : '';

  const renderLeft = () => {
    if (leftArea) return <div className="min-w-10 flex items-center justify-center">{leftArea}</div>;
    if (onBack) {
      return (
        <div className="min-w-10 flex items-center justify-center">
          <Button onClick={onBack} aria-label="뒤로가기" variant="link" className="p-1">
            <ChevronLeft size={28} color="var(--text-default)" strokeWidth={1.5} />
          </Button>
        </div>
      );
    }
    return (
      <div className="min-w-10 flex items-center justify-center">
        <Button onClick={onClose} aria-label="닫기" variant="link" className="p-1">
          <X size={24} color="var(--text-default)" strokeWidth={2} />
        </Button>
      </div>
    );
  };

  return (
    <header className={containerClass} onClick={onHeaderClick}>
      {renderLeft()}

      {title ? (
        <div className={`flex-1 font-semibold text-leading-h3 select-none leading-none ${titlePaddingClass}`}>{title}</div>
      ) : (
        <div className={`flex-1`}>{children}</div>
      )}

      {rightArea && (
        <div className="min-w-10 flex items-center justify-center">{rightArea}</div>
      )}
    </header>
  );
};

export default MobileHeader;
export { MobileHeader };
