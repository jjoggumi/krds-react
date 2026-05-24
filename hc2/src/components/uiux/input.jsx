import Styles from './input.module.scss';
import { IconButton } from './buttons';
import { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * TextInput 컴포넌트 Props 타입 정의 (JSDoc)
 * - 이 파일은 JS(jsx)로 작성되어 있으므로, 에디터/TypeScript에게 타입 정보를 제공하기 위해 JSDoc을 추가합니다.
 * - onChange는 HTMLInputElement의 change 이벤트 핸들러 형태입니다.
 * @typedef {Object} TextInputProps
 * @property {string} inputId
 * @property {string|number} value
 * @property {(e: React.ChangeEvent<HTMLInputElement>) => void} onChange
 * @property {(e: React.FocusEvent<HTMLInputElement>) => void} onBlur
 * @property {string} [placeholder]
 * @property {string} [className]
 * @property {boolean} [disabled]
 * @property {boolean} [showClearButton]
 * @property {Object} [styles]
 * @property {string} [inputClassName]
 * @property {number} [maxLength]
 * @property {boolean} [showSearch]
 * @property {boolean} [showSearchIco]
 * @property {(value: string) => void} [onSearch]
 * @property {boolean} [inTable]
 * @property {'error'|'success'} [state]
 * @property {'xs'|'sm'|'md'|'lg'|'xl'|'xxl'} [size]
 * @property {import('react').ReactNode} [children]
 * @property {(e: React.KeyboardEvent<HTMLInputElement>) => void} [onKeyDown]
 * @property {(e: React.FocusEvent<HTMLInputElement>) => void} [onFocus]

/** @type {import('react').FC<TextInputProps>} */

export const TextInput = ({
  inputId = undefined,
  value,
  onChange,
  onBlur = undefined,
  onFocus = undefined,
  placeholder = '',
  className = undefined,
  disabled = false,
  showClearButton = true,
  styles = undefined,
  inputClassName = undefined,
  maxLength = -1,
  showSearch = false,
  showSearchIco = false,
  onSearch = undefined,
  inTable = false,
  state = undefined,
  size = 'md',
  children = null,
  onKeyDown = undefined,
}) => {
  const [focused, setFocused] = useState(false);

  const stateClass = state === 'error' ? `${Styles['error']}` : state === 'success' ? `${Styles['success']}` : '';
  const wrapperClass =
    `text-input ${Styles['text-input']} ${className || ''} ${inTable ? `${Styles['in-table']}` : ''} ${showSearchIco ? `${Styles['search-ico']}` : ''} ${showSearch ? Styles['hasSearch'] : Styles['noSearch']}`.trim();
  const sizeClass = Styles[size] || '';

  return (
    <div className={wrapperClass} style={styles}>
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${stateClass} ${sizeClass} ${inputClassName || ''}`.trim()}
        disabled={disabled}
        maxLength={maxLength < 0 ? undefined : maxLength}
        onFocus={(e) => {
          setFocused(true);
          if (onFocus) onFocus(e);
        }}
        onBlur={(e) => {
          if (e.relatedTarget?.classList.contains('icon-button')) return false;
          setFocused(false);
          if (onBlur) {
            onBlur(e);
          }
        }}
        onKeyDown={onKeyDown}
      />

      {(showClearButton || showSearch) && (
        <div className={`${Styles['btns']}`}>
          {showClearButton && focused && value && !disabled && (
            <IconButton icon="close" className={`${Styles['close-btn']}`} onClick={(e) => onChange({ target: { value: '' } })} />
          )}
          {showSearch && (
            <IconButton
              icon="search"
              className={`${Styles['search-btn']}`}
              onClick={() => {
                if (typeof onSearch === 'function') {
                  onSearch(String(value ?? ''));
                }
              }}
            />
          )}
        </div>
      )}
      {children}
    </div>
  );
};

TextInput.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  maxLength: PropTypes.number,
  className: PropTypes.string,
  styles: PropTypes.object,
  inputClassName: PropTypes.string, // 입력 상자 클래스
  showClearButton: PropTypes.bool, // 입력값 초기화 버튼 표시 여부
  showSearch: PropTypes.bool, // 검색창용 스타일 적용 여부
  inTable: PropTypes.bool, // 테이블 내 입력상자용 스타일 적용 여부
  state: PropTypes.oneOf(['error', 'success']), // 상태 표시 (error, success)
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', 'xxl']), // 입력 상자 크기
  children: PropTypes.node,
  onKeyDown: PropTypes.func, // 키 다운 이벤트 핸들러
  onFocus: PropTypes.func, // 포커스 이벤트 핸들러
  onSearch: PropTypes.func, // 검색 아이콘 클릭 시 실행
  multiline: PropTypes.bool, // render as textarea
  rows: PropTypes.number, // textarea rows
};
