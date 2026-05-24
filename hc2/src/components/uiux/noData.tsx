import React from 'react';
import { Icon } from '@/components/uiux/icon';

type NoDataProps = {
  message?: string; 
  className?: string;
  style?: React.CSSProperties;
  size?: 'sm' | 'md' | 'lg';
  icon?: string; 
  children?: React.ReactNode;
};

const NoData: React.FC<NoDataProps> = ({ className, style, size = 'md', message, icon, children }) => {
  const sizeClass = size === 'sm' ? 'text-leading-b4' : size === 'lg' ? 'text-leading-b1' : 'text-leading-b2';
  return (
    <div className={`${className ?? ''} flex flex-col items-center justify-center`} style={style}>      
        <>
          {icon && <Icon icon={icon} className={`mb-2 ${sizeClass}`} />}
          <p className={`${sizeClass} text-center text-text-neutral-strong whitespace-pre-line`}>{message}</p>
          {children}
        </>
    </div>
  );
};

export default NoData;