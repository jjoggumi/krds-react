import React, { useState, useEffect } from 'react';

interface AvatarProps {
  img?: string;
  size?: 'lg' | 'md' | 'sm';
  type?: 'profile' | 'class';
  alt?: string;
  className?: string;
  color?: string;
  outline?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const Avatar: React.FC<AvatarProps & { isCollapsed?: boolean }> = ({
  img,
  size = 'md',
  type = 'profile',
  alt = '',
  className = '',
  color,
  outline,
  onClick,
  children,
  isCollapsed,
}) => {
  const [isValidImg, setIsValidImg] = useState(true);

  useEffect(() => {
    if (!img) {
      setIsValidImg(false);
      return;
    }
    const image = new window.Image();
    image.src = img;
    image.onload = () => setIsValidImg(true);
    image.onerror = () => setIsValidImg(false);
  }, [img]);

  // HiAvatar.vue와 동일: img-area에 backgroundImage 사용
  const imgAreaStyle: React.CSSProperties = {};
  if (img && isValidImg) {
    imgAreaStyle.backgroundImage = `url(${img})`;
  } else if (color) {
    imgAreaStyle.background = color;
  }

  const classList = ['avatar-img', type, size, outline ? 'outline' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classList}
      onClick={onClick}
      role={isCollapsed && onClick ? 'button' : undefined}
    >
      <div className="img-area" style={imgAreaStyle}>
        <span className="sr-only">{alt || ''}</span>
      </div>
      {children}
    </div>
  );
};
