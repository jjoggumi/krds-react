//하이톡에서만 사용
import Styles from './radioGroup.module.css'
import { useEffect, useState } from 'react'

const isPrimitiveOrLabel = elm => typeof elm === 'string' || typeof elm === 'number' || (elm && elm.type === 'label');

const findLabelOf = (child) => {
  if (!child) return null;
  if (isPrimitiveOrLabel(child))  return child;

  const { children } = child.props;
  if (!children) return null;
  if (Array.isArray(children)) {
    const labelChild = children.find(c => c && c.type === 'label');
    if (labelChild) return labelChild;
    const textChild = children.find(c => typeof c === 'string' || typeof c === 'number');
    if (textChild) return textChild;
    return null;
  }
  return isPrimitiveOrLabel(children) ? children : null;
}

const findOthers = (child) => {
  if (isPrimitiveOrLabel(child)) return null;
  const { children } = child.props;
  if (!children) return null;
  if (Array.isArray(children)) {
    return children.filter(child => child.type !== 'label');
  }
  return children.type !== 'label' ? children : null;
}

const getLabelValue = label => {
  if (!label || typeof label !== 'object') return null;
  return label.props && label.props.value !== undefined ? label.props.value : null;
}

export const RadioGroup = ({children, direction, onChange, selected, disabled}) => {
  const selectedLabel = children.map((child, index) => [findLabelOf(child), index])
    .find(([label]) => label && label.props && label.props.selected) || [null, -1];
  const [selectedIndex, setSelectedIndex] = useState(selectedLabel[1]);

  useEffect(() => {
    if (selected !== undefined) {
      const index = children.findIndex((child, index) => getLabelValue(findLabelOf(child)) === selected || index === selected);
      setSelectedIndex(index >= 0 ? index : -1);
    }
  }, [selected, children]);

  return (
    <div className={Styles.radioGroup} style={{ flexDirection: direction || 'column' }}>
      {children.map((child, index) => {
        const label = findLabelOf(child);
        return (
          <div key={index}>
            <div className={Styles.radioItem} onClick={() => {
              if (disabled) return;
              setSelectedIndex(index)
              onChange(getLabelValue(label) || index)
            }}>
              <div
                className={`${Styles.radioBtn} ${selectedIndex === index ? Styles.selected : ''} ${disabled ? Styles.disabled : ''}`}
              />
              { label }
            </div>
            { findOthers(child) }
          </div>
      )})}
    </div>
  );
}