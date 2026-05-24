//하이톡에서 사용하는 체크박스 그룹 컴포넌트
import Style from './checkGroup.module.css';
import { Icon } from '../icon';

import { useState, useEffect } from 'react';

const Checker = ({ selected = false, disabled = false, onChange }) => {
  const handleClick = () => {
    if (disabled) return;
    onChange(!selected);
  };
  return (
    <div className={`${Style['checker']} checker ${selected ? Style['selected'] : ''} ${disabled ? Style['disabled'] : ''}`} onClick={handleClick}>
      { disabled || selected ? (<Icon icon="check"/>) : null }
    </div>
  );
}

export const CheckGroup = ({ key = child => child.key, onChange = () => {}, className, children = [], selectedItems = [], disabledItems = [], direction = 'column', multiple = true, contentCheckable = true }) => {
  const contains = (list, child) => list.includes(key(child));
  const isSelected = child => contains(selectedItems, child);
  const isDisabled = child => contains(disabledItems, child);
  const setSelected = (child, value) => {
    const updatedItems = value
      ? (multiple ? [...selectedItems, key(child)] : [key(child)])
      : selectedItems.filter(item => item !== key(child));
    onChange(updatedItems);
  }
  
  return (
    <div className={`${Style['check-group']} ${className} check-group`} style={{ flexDirection: direction }}>
      {children.map((child) => (
        <div key={key(child)} className={`${Style['check-item']} check-item ${isSelected(child) ? Style['selected'] + ' selected' : ''} ${isDisabled(child) ? Style['disabled'] : ''}`}
          onClick={ contentCheckable ? () => !isDisabled(child) && setSelected(child, !isSelected(child)) : undefined }>
          <Checker
            selected={isSelected(child)}
            disabled={isDisabled(child)}
            onChange={v => !isDisabled(child) && setSelected(child, v)}
          />
          { child }
        </div>
      ))}
    </div>
  );
}