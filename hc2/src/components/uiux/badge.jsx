import styles from './badge.module.scss';

// badge 컴포넌트
// size: sm | md | lg
// variant: purple | primary | secondary | noti

export const Badge = ({ size = 'md', variant = 'purple', className = '', style = {}, children }) => {
  const sizeClass = styles[size] || '';
  const variantClass = styles[variant] || '';

  const tailwindSizeClass =
    {
      sm: 'h-[20px] text-d2 leading-[100%] px-2 ',
      md: 'h-[22px]',
      lg: 'h-[24px]',
    }[size] || '';

  return (
    <span className={`${styles.badge} ${sizeClass} ${variantClass} ${tailwindSizeClass} ${className} inline-flex items-center justify-center`} style={style}>
      {children}
    </span>
  );
};

export default Badge;
