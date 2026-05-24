import React from 'react';
import Styles from './buttons.module.scss';
import { Icon } from './icon';

/**
 * @typedef {Object} IconButtonProps
 * @property {any} icon
 * @property {number} tabIndex
 * @property {function=} onClick
 * @property {string=} className
 * @property {any=} children
 * @property {object=} style
 * @property {any=} label
 * @property {number=} iconSize
 */

/**
 * @param {IconButtonProps} props
 */
const IconButton = ({ icon, tabIndex, onClick, className = '', children, style, label, iconSize }) => (
    <button tabIndex={tabIndex} className={`${Styles['icon-button']} ${className} icon-button ${icon}`} onClick={onClick} style={style}>
    <Icon icon={icon} iconSize={iconSize} style={label ? { marginRight: '4px' } : undefined} />
    {label && <>{label}</>}
    {children}
  </button>
);

const RoundedButton = ({ onClick, className = '', children = '', style, filled = true, disabled = false }) => (
  <button
    className={`${Styles['rounded-button']} ${filled ? Styles['filled'] : ''} ${className} rounded-button ${disabled ? Styles['disabled'] + ' disabled' : ''}`}
    onClick={onClick}
    style={style}
    disabled={disabled}
  >
    {children}
  </button>
);

/**
 * @typedef {Object} ButtonProps
 * @property {'primary'|'secondary'|'gray'|'light-gray'|'light-primary'|'success'|'navy'|'purple'|'yellow'|'orange'|'jungle'|'warning'|'info'|'noti'|'black'|'white'|'error'|'link'|'ghost'} [variant='primary']
 * @property {boolean} [outline=false]
 * @property {boolean} [underline=false]
 * @property {'xxs'|'xs'|'sm'|'md'|'lg'|'xl'|'xxl'} [size='md']
 * @property {'rounded'|'bitrounded'|'square'|''} [shape='']
 * @property {boolean} [block=false]
 * @property {boolean} [disabled=false]
 * @property {any} [children]
 * @property {function} [onClick]
 * @property {string} [className='']
 * @property {object} [style]
 * @property {string} [icon]
 * @property {'left'|'right'} [iconPosition='right']
 * @property {number=} [iconSize]
 * @property {string=} [iconColor]
 */

/** @param {ButtonProps} props */
const Button = ({
  variant = 'primary',
  outline = false,
  underline = false,
  size = 'md',
  shape = 'bitrounded',
  block = false,
  disabled = false,
  children,
  onClick,
  className = '',
  style,
  icon,
  iconPosition = 'left',
  iconSize,
  iconColor,
  ...props
}) => {
  const isUnderline = !!underline;
  const useOutline = !!outline && !isUnderline;

  const classes = [
    Styles.btn,
    variant ? (isUnderline ? Styles[`btn-underline-${variant}`] : (useOutline ? Styles[`btn-line-${variant}`] : Styles[`btn-${variant}`])) : null,
    shape ? Styles[`btn-${shape}`] : null,
    size ? Styles[`btn-${size}`] : null,
    block ? Styles['btn-block'] : null,
    disabled ? Styles['disabled'] : null,
    disabled ? 'disabled' : null,
    className,
    `gap-1`,
  ]
    .filter(Boolean)
    .join(' ');

  const combinedStyles = { ...style };

  // const iconStyle = {};
  // 아이콘과 레이블 사이 간격
  // if (icon && iconPosition === 'left') iconStyle.marginRight = '4px';
  // if (icon && iconPosition === 'right') iconStyle.marginLeft = '4px';
  // 아이콘+텍스트 세로 중앙정렬
  // iconStyle.display = 'inline-flex';
  // iconStyle.alignItems = 'center';
  // iconStyle.verticalAlign = 'middle';

  const _mappedVariant = variant === 'error' ? 'noti' : variant;
  const _cssVarForIcon = _mappedVariant === 'light-gray' ? 'var(--white)' : `var(--${_mappedVariant}-font, var(--white))`;

  // 아이콘 색상 결정 로직
  // - `iconColor` prop이 명시되어 있으면 그것을 사용
  // - 아웃라인이 아닌(채워진) 버튼일 경우: 아이콘 색상을 버튼 텍스트 색상과 동일하게 설정
  //   대부분의 채워진 버튼은 텍스트가 흰색이라 기본값은 'white'
  //   예외: variant === 'white' (텍스트는 gray-10), 'light-primary' (텍스트는 primary)
  // - 아웃라인(btn-line-*) 상태일 경우: 텍스트와 동일한 색상(대부분은 font 색)으로 설정
  const _defaultIconColorName = _mappedVariant === 'light-gray' ? 'white' : _mappedVariant;
  let _iconColorName;
  if (_mappedVariant === 'link') {
    _iconColorName = 'gray-10';
  }
  if (iconColor) {
    _iconColorName = iconColor;
  } else if (_iconColorName == null) {
    const colorOutline = useOutline || isUnderline;
    if (!colorOutline) {
      // 채워진 버튼(아웃라인 아님): 아이콘을 텍스트 색상과 동일하게
      if (_mappedVariant === 'white') _iconColorName = 'gray-10';
      else if (_mappedVariant === 'light-primary') _iconColorName = 'primary';
      else _iconColorName = 'white';
    } else {
      // 아웃라인 상태: 아이콘 색상을 버튼 텍스트 색상과 동일하게 설정
      if (_mappedVariant === 'light-gray') {
        _iconColorName = 'gray-10';
      } else if (_mappedVariant === 'white') {
        _iconColorName = 'white';
      } else if (_mappedVariant === 'light-primary') {
        _iconColorName = 'secondary';
      } else {
        _iconColorName = _mappedVariant;
      }
    }
  }

  let iconElement = null;
  if (icon) {
    // iconElement = <Icon icon={icon} iconSize={iconSize} color={_iconColorName} style={iconStyle} />;
    iconElement = <Icon icon={icon} iconSize={iconSize} color={_iconColorName} />;
  }

  const processedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;
    if (child.type === 'i') {
      const existingStyle = child.props && child.props.style ? child.props.style : {};
      const existingClass = child.props && child.props.className ? child.props.className : '';
      const hasColorClass = existingClass.includes(Styles.color) || existingClass.includes('color');
      const newClass = hasColorClass ? existingClass : `${existingClass} ${Styles.color}`.trim();
      return React.cloneElement(child, { className: newClass, style: existingStyle });
    }
    return child;
  });

  const handleClick = (e) => {
    if (onClick) {
      e.stopPropagation();
      onClick(e);
    }
  };

  return (
    <button type="button" className={classes} style={combinedStyles} disabled={disabled} onClick={handleClick} {...props}>
      {icon && iconPosition !== 'right' ? iconElement : null}
      {processedChildren}
      {icon && iconPosition === 'right' ? iconElement : null}
    </button>
  );
};

export { IconButton, RoundedButton, Button };
