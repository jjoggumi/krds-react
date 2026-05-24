import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import Style from './tabs.module.scss';

export const HitalkTabs = forwardRef(({ labels = [], children, className = '', style, extractTabSetter }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useImperativeHandle(ref, () => ({
    setSelectedIndex,
  }));

  useEffect(() => {
    if (extractTabSetter) extractTabSetter(setSelectedIndex);
  }, [extractTabSetter]);

  return (
    <div className={`${Style['hitalk-tabs']} ${className} hitalk-tabs`} style={style}>
      <div className={`${Style['tabs-wrapper']} tabs-wrapper`}>
        {labels.map((label, index) => (
          <div key={index} className={`tab-label ${selectedIndex === index ? 'active' : ''}`} onClick={() => setSelectedIndex(index)}>
            {label}
          </div>
        ))}
      </div>
      <div className={`${Style['tab-content']} tab-content`}>{Array.isArray(children) ? children[selectedIndex] : children}</div>
    </div>
  );
});

/**
 * @typedef {Object} TabsProps
 * @property {string[]} [labels]
 * @property {import('react').ReactNode | import('react').ReactNode[]} [children]
 * @property {'underline' | 'pills'} [variant='underline']
 * @property {'xs' | 'sm' | 'md' | 'lg' | 'xl'} [size='md']
 * @property {'blue'|'dark'} [color]
 * @property {boolean[]} [isNew]
 * @property {string} [className]
 * @property {import('react').CSSProperties} [style]
 * @property {(setter: (index: number) => void) => void} [extractTabSetter]
 * @property {(index: number) => void} [onChange]
 * @property {boolean} [isControlOuter]
 * @property {number} [selectedTabIndex]
 * @property {React.ReactNode|(() => React.ReactNode)} [renderEtc] // 탭 우측에 렌더링할 외부 컨텐츠
 */

/** @type {import('react').ForwardRefExoticComponent<TabsProps & import('react').RefAttributes<any>>} */
export const Tabs = forwardRef(
  (
    {
      labels = [],
      children,
      className = '',
      style,
      variant = 'underline',
      size = 'md',
      color = 'blue',
      onChange,
      extractTabSetter,
      isNew = [],
      isControlOuter = false,
      selectedTabIndex = 0,
      renderEtc = null
    },
    ref
  ) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useImperativeHandle(ref, () => ({
      setSelectedIndex,
    }));

    useEffect(() => {
      setSelectedIndex(selectedTabIndex);
    }, [selectedTabIndex]);

    useEffect(() => {
      if (typeof extractTabSetter === 'function') extractTabSetter(setSelectedIndex);
    }, [extractTabSetter]);

    const gapClass = variant === 'pills' ? 'gap-2' : 'gap-6';
    let sizeClass;
    if (variant === 'pills') {
      sizeClass = 'h-10 text-leading-b2';
    } else {
      // underline: md = 52px, lg = 56px
      sizeClass = size === 'lg' ? 'h-14 text-leading-h3 py-2.5' : 'h-[52px] text-leading-h4 py-2.5';
    }

    const wrapperClass = ['inline-flex', 'items-center', 'justify-start', 'w-full', gapClass, className].filter(Boolean).join(' ');
    const baseBtn = `flex items-center justify-center px-1 ${sizeClass}`;
    const variantBtn = variant === 'pills' ? 'px-4 rounded-full' : 'border-b-4 border-transparent mb-[-1px]';
    const activeForPills = 'bg-[#1D304B] text-white';
    const activeForUnderline =
      color === 'dark' ? 'text-[#1D304B] border-b-4 border-b-[#1D304B] font-bold' : 'text-navy border-b-4 border-b-navy font-bold';

    return (
      <div className={`w-full`} style={style}>
        <div className="flex items-center justify-between">
          <div className={wrapperClass}>
            {labels.map((label, index) => (
              <button
                key={index}
                type="button"
                className={[
                  baseBtn,
                  variantBtn,
                  selectedIndex === index
                    ? variant === 'pills'
                      ? activeForPills
                      : activeForUnderline
                    : variant === 'pills'
                      ? 'text-black bg-[#F0F1F4]'
                      : 'text-[#9e9e9e] bg-transparent font-bold',
                  isNew[index] ? (Style['is-new'] ? Style['is-new'] : 'is-new') : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => {
                  if (!isControlOuter) {
                    setSelectedIndex(index);
                  }
                  if (typeof onChange === 'function') onChange(index);
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {renderEtc && (
            typeof renderEtc === 'function' ? renderEtc() : renderEtc
          )}
        </div>
        <div className="mt-4">{Array.isArray(children) ? children[selectedIndex] : children}</div>
      </div>
    );
  }
);

export default Tabs;
