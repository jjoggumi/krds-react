import { useId } from 'react';
import Style from './switch.module.scss';

export const Switch = ({ model = false, disabled = false, invert = false, rootElementClassList = [], id = null, className = '', onUpdateModel }) => {
  const defaultId = useId();
  const finalId = id || defaultId;

  const checked = invert ? !model : model;

  const handleToggle = () => {
    if (disabled) return;
    const nextChecked = !checked;
    const nextModelValue = invert ? !nextChecked : nextChecked;
    onUpdateModel?.(nextModelValue);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  const mappedExtras = (rootElementClassList || []).map((cls) => Style[cls] || cls);
  const rootClasses = [Style['switch'], 'switch', checked ? Style['on'] : '', disabled ? Style['disabled'] : '', ...mappedExtras, className || '']
    .filter(Boolean)
    .join(' ');

  return (
    <div
      id={finalId}
      className={rootClasses}
      role="switch"
      aria-checked={!!checked}
      aria-disabled={!!disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
    >
      <label className={Style.label}>
        <span className={Style.track}></span>
      </label>
    </div>
  );
};
