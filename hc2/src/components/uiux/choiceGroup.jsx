import Style from './choiceGroup.module.css';

export const ChoiceGroup = ({ children = [], multiple = false, onChange }) => {
  return (
    <div className={`${Style['choice-group']} choice-group}`}>
      {children.map((child, index) => (
        <div
          key={child.key || index}
          className={`${Style['choice-item']} choice-item`}
          onClick={() => {
            if (multiple) {
              child.props.onChange && child.props.onChange();
            } else {
              onChange && onChange(child.props.value);
            }
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};
