import Styles from './icons.module.css'

/**
 * @typedef {Object} IconProps
 * @property {string} icon
 * @property {string} [className]
 * @property {React.CSSProperties} [style]
 * @property {(e: React.MouseEvent<HTMLElement>) => void} [onClick]
 * @property {string} [color] // primary, secondary, success 등 아이콘에 적용할 색 이름
 * @property {number|string} [iconSize]
 * @property {string} [title]
 */

/**
 * @param {IconProps} props
 */
export const Icon = ({ icon, className = '', onClick, style = {}, color, iconSize, title }) => {
  const colorClass = color ? `${Styles.color} ${Styles['color-' + color] || ''}` : '';
  
  const s = {};

  if (iconSize != null) {
    if (typeof iconSize === 'number') {
      const px = `${iconSize}px`;
      const bg = `${px} ${px}`;
      if (style.width == null) s.width = px;
      if (style.height == null) s.height = px;
      s.backgroundSize = bg;
      s.WebkitMaskSize = bg;
      s.maskSize = bg;
    } else {
      s.fontSize = iconSize;
      s.backgroundSize = iconSize;
      s.WebkitMaskSize = iconSize;
      s.maskSize = iconSize;
    }
  }

  return (
    <i
      className={`icon align-middle ${Styles.icon} ${Styles[icon] || ''} ${colorClass} ${className}`.trim()}
      onClick={onClick}
      title={title}
      style={{ ...s, ...style }}
    />
  );
};

export default Icon;
