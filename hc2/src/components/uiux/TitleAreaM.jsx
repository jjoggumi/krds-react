import React from 'react';
import { X } from 'lucide-react';

/**
 * Mobile Title area/header
 * @param {{title?: React.ReactNode, onClose?: ()=>void, className?: string}} props
 */
const MobileHeader = ({ title = null, onClose = undefined, className = '' }) => {
  return (
    <header className={`bg-base border-b border-[rgba(0,0,0,0.06)] h-[52px] flex items-center px-2 sticky top-0 z-20 ${className}`}>
      <div className="w-10 flex items-center justify-center">
        <button onClick={onClose} aria-label="닫기" className="bg-transparent border-0 p-1">
          <X size={18} color="#233445" strokeWidth={2} />
        </button>
      </div>
      <div className="flex-1 text-center font-semibold">{title}</div>
      <div className="w-10" />
    </header>
  );
};

export default MobileHeader;
export { MobileHeader };
