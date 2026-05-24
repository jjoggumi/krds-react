import Style from './radiobox.module.css';

/**
 * RadioBox component
 * @param {{
 *   id: string,
 *   name: string,
 *   value: string,
 *   checked: boolean,
 *   onChange?: () => void,
 *   disabled?: boolean,
 *   label?: string,
 *   className?: string
 * }} props
 */
export const RadioBox = ({ id, name, value, checked, onChange, disabled, label, className = '' }) => {
  return (
    <div className={`${Style['radio-box-wrap']} min-w-0 flex flex-col gap-10 ${className}`}>
      <input type="radio" id={id} name={name} value={value} checked={checked} onChange={onChange} disabled={disabled} />
      <label htmlFor={id}>{label && <span>{label}</span>}</label>
    </div>
  );
};

/**
 * RadioBoxGroup component
 * @param {{
 *   options: { label: string, value: string }[],
 *   value: string,
 *   onChange: (value: string) => void,
 *   disabled?: boolean,
 *   name?: string,
 *   className?: string
 * }} props
 */
export const RadioBoxGroup = ({ options = [], value, onChange, disabled = false, name = 'radio-group', className = '' }) => {
  return (
    <div className={`flex gap-4 ${className}`}>
      {options.map(opt => (
        <RadioBox
          key={opt.value}
          id={`radio-${name}-${opt.value}`}
          name={name}
          value={opt.value}
          checked={value === opt.value}
          onChange={() => onChange(opt.value)}
          disabled={disabled || !!opt.disabled}
          label={opt.label}
        />
      ))}
    </div>
  );
}
