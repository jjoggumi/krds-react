import { useState, useRef, useEffect } from 'react';
import styles from './textareaWithVar.module.scss';

export const TextareaWithVar = ({
  value = '',
  onChange,
  onBlur = null,
  showByte = false,
  maxBytes = null,
  onMaxError,
  placeholder = '',
  disabled = false,
  readOnly = false,
  className = '',
  rows = 5,
  showAction = false,
  showEtc = false,
  action = null,
  etc = null,
  encoder = 'utf-8',
  inputRef = null,
  inputClassName = '',
  inputStyle = {},
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const localRef = useRef(null);

  const setRef = (el) => {
    localRef.current = el;
    if (!inputRef) return;
    if (typeof inputRef === 'function') inputRef(el);
    else inputRef.current = el;
  };

  /**
   * [중요] textarea는 무한 확장되어야 오버레이와 어긋나지 않습니다.
   * 실제 스크롤은 mainArea div가 담당합니다.
   */
  const adjustHeight = () => {
    const el = localRef.current;
    if (!el) return;
    // 높이 계산 초기화
    el.style.height = '0px';
    // 부모(스크롤 컨테이너) 높이와 콘텐츠 높이를 비교하여 더 큰 값으로 설정
    const parent = el.parentElement;
    const parentHeight = parent?.clientHeight ?? 0;
    const contentHeight = el.scrollHeight ?? 0;

    const targetHeight = Math.max(contentHeight, parentHeight || contentHeight);

    el.style.height = `${targetHeight}px`;
  };

  /**
   * value 또는 높이 관련 style 변경 시 재계산
   */
  const { height, minHeight, maxHeight, ...restInputStyle } = inputStyle || {};

  useEffect(() => {
    adjustHeight();
  }, [value, minHeight, maxHeight]);

  const getByteLength = (text) => {
    let byte = 0;
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      byte += charCode <= 0x007f ? 1 : 2;
    }
    return byte;
  };

  const getByteSize = (str) => {
    if (encoder === 'utf-8') {
      return new Blob([str]).size;
    } else {
      return getByteLength(str);
    }
  };

  const getTruncatedString = (str) => {
    let totalByte = 0;
    let cutIndex = 0;

    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      let byte = 0;

      if (encoder === 'utf-8') {
        if (charCode <= 0x7f) byte = 1;
        else if (charCode <= 0x7ff) byte = 2;
        else if (charCode <= 0xffff) byte = 3;
        else byte = 4;
      } else {
        byte = charCode > 127 ? 2 : 1;
      }

      if (totalByte + byte <= maxBytes) {
        totalByte += byte;
        cutIndex = i + 1;
      } else {
        break;
      }
    }

    return str.substring(0, cutIndex);
  };

  const handleChange = (e) => {
    const newValue = e.target.value;

    if (maxBytes && getByteSize(newValue) > maxBytes) {
      if (onChange) onChange(getTruncatedString(newValue));
      if (onMaxError) onMaxError(maxBytes);

      setTimeout(adjustHeight, 0);
      return;
    }

    if (onChange) onChange(newValue);
  };

  const renderOverlay = (text) => {
    if (!text) return null;

    const regex = /\[\*.*?\*\]/g;
    const parts = [];
    let lastIdx = 0;
    let match;
    let idx = 0;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        parts.push(<span key={idx++}>{text.slice(lastIdx, match.index)}</span>);
      }

      parts.push(
        <span key={idx++} className={styles.variableTag}>
          {match[0]}
        </span>
      );

      lastIdx = match.index + match[0].length;
    }

    if (lastIdx < text.length) {
      parts.push(<span key={idx++}>{text.slice(lastIdx)}</span>);
    }

    return parts;
  };

  // textarea와 오버레이가 동일한 줄바꿈/개행 규칙을 사용하도록 공통 스타일 정의
  const textLayoutStyle = {
    whiteSpace: 'pre-wrap',
    wordBreak: 'keep-all',
    overflowWrap: 'break-word',
  };

  return (
    <div
      className={[
        styles.textareaWith_wrapper,
        isFocused ? styles.focused : '',
        disabled ? styles.disabled : '',
        readOnly ? styles.readonly : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className={[styles.mainArea, 'custom-scr'].join(' ')}
        style={{
          minHeight,
          maxHeight,
          height: height || minHeight || maxHeight,
          overflowY: 'auto',
          overflowX: 'hidden',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        <div
          aria-hidden
          className={styles.overlayText}
          style={{
            ...textLayoutStyle,
            pointerEvents: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        >
          {renderOverlay(value)}
          {value.endsWith('\n') ? ' ' : ''}
        </div>

        <textarea
          ref={setRef}
          value={value}
          onChange={handleChange}
          onInput={adjustHeight}
          className={[styles.textarea_field, inputClassName].join(' ')}
          onFocus={() => !readOnly && !disabled && setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          spellCheck="false"
          rows={rows}
          style={{
            ...restInputStyle,
            height: 'auto',
            minHeight: '100%',
            overflow: 'hidden',
            resize: 'none',
            ...textLayoutStyle,
            background: 'transparent',
            display: 'block',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {(showByte || showAction || showEtc) && (
        <div className={styles.footerBar}>
          {showEtc && <div className={styles.etcArea}>{etc}</div>}
          {showAction && <div className={styles.actionArea}>{action}</div>}
          {showByte && (
            <div className={styles.byte_footer}>
              <span className={styles.current}>
                {getByteSize(value).toLocaleString()}
              </span>
              {maxBytes && (
                <span className={styles.total}>
                  {' '}
                  / {maxBytes.toLocaleString()} byte
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};