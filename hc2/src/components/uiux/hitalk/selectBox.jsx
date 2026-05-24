import Styles from './selectBox.module.css';
import { useState, useRef, useEffect } from 'react';
import { Icon } from './icon';

export const SelectBox = ({ options = [], value = null, beforeChange, onChange = () => {}, style = {}, className = '' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Scroll to selected option when popup opens
  const popupRef = useRef(null);
  useEffect(() => {
    if (open && popupRef.current) {
      const selectedIdx = options.findIndex(opt => opt.value === value);
      if (selectedIdx !== -1) {
        const optionEl = popupRef.current.children[selectedIdx];
        if (optionEl) {
          optionEl.scrollIntoView({ block: 'start' });
        }
      }
    }
  }, [open, value, options]);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div
      className={`${Styles['select-box-container']} select-box ${className}`}
      style={style}
      ref={ref}
    >
      <div
        className={Styles['select-box-display']}
        onClick={() => setOpen((prev) => !prev)}
        tabIndex={0}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`${Styles['select-box-label']} select-box-label`}>{selectedOption ? selectedOption.label : '선택'}</span>
        <Icon icon={open ? "select-box-arrow-up" : "select-box-arrow-down"} className={Styles['icon']} />
      </div>
      {open && (
        <div className={Styles['select-box-popup']} role="listbox" ref={popupRef}>
          {options.map((option, idx) => (
            <div
              key={option.value}
              className={Styles['select-box-option']}
              onClick={async () => {
                setOpen(false);
                if (beforeChange && !(await beforeChange(option.value))) return;
                onChange(option.value);
              }}
              role="option"
              aria-selected={option.value === value}
              tabIndex={-1}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}