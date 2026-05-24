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

export { IconButton, RoundedButton};
