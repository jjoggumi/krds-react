import Style from './checkbox.module.css';
import { Icon } from './icon';

/**
 * CheckBox component
 * @param {{
 *   id?: string,
 *   name?: string,
 *   value?: string,
 *   checked: boolean,
 *   onChange?: (checked: boolean) => void,
 *   disabled?: boolean,
 *   label?: string,
 *   className?: string
 * }} props
 */
export const CheckBox = ({ id, name, value, checked, onChange, disabled, label, className = '' }) => {
  const inputId = id || `checkbox-${name || 'default'}-${value || Math.random().toString(36).slice(2, 8)}`;
  return (
    <div className={`${Style['check-box-wrap']} inline-block ${className}`}>
      <input
        type="checkbox"
        id={inputId}
        name={name}
        value={value}
        checked={checked}
        onChange={e => onChange && onChange(e.target.checked)}
        disabled={disabled}
      />
      <label htmlFor={inputId} className="cursor-pointer">
        {label && (<span>{label}</span>)}
      </label>
    </div>
  );
};

/**
 * CheckBoxGroup component
 * @param {{
 *   options: { label: string, value: string }[],
 *   value: string[],
 *   onChange: (value: string[]) => void,
 *   disabled?: boolean,
 *   name?: string,
 *   className?: string
 * }} props
 */
export const CheckBoxGroup = ({ options = [], value = [], onChange, disabled = false, name = 'checkbox-group', className = '' }) => {
  const handleChange = (optionValue, checked) => {
    if (checked) {
      onChange([...value, optionValue]);
    } else {
      onChange(value.filter(v => v !== optionValue));
    }
  };
  return (
    <div className={`flex gap-4 ${className}`}>
      {options.map(opt => (
        <CheckBox
          key={opt.value}
          id={`checkbox-${name}-${opt.value}`}
          name={name}
          value={opt.value}
          checked={value.includes(opt.value)}
          onChange={checked => handleChange(opt.value, checked)}          
          disabled={disabled || !!opt.disabled}
          label={opt.label}
        />
      ))}
    </div>
  );
};
