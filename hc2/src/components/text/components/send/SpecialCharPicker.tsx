import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import Styles from './SpecialCharPicker.module.scss';
import { SEND_GRAPHIC_CHARS } from '@/components/text/constants';

export const SpecialCharPicker = ({ anchorRef, show, onClose, onInsert, offset = 8 }) => {
  const wrapperRef = useRef(null);
  const [posStyle, setPosStyle] = useState<CSSProperties>({ visibility: 'hidden' });

  useEffect(() => {
    if (!show) {
      setPosStyle({ visibility: 'hidden' });
      return;
    }
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        onClose && onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [show, onClose]);

  useEffect(() => {
    if (!show) return;
    const anchor = (anchorRef && anchorRef.current) || null;
    if (!anchor) {
      setPosStyle({});
      return;
    }
    const rect = anchor.getBoundingClientRect();
    const offsetValue = offset || 8;

    // DOM에 렌더된 실제 picker 크기를 사용해서 위치를 계산
    const pickerEl = wrapperRef.current;
    const PICKER_WIDTH = pickerEl?.offsetWidth || 500;
    const PICKER_HEIGHT = pickerEl?.offsetHeight || 250;

    // 기본은 버튼 바로 아래에 배치
    let finalTop = rect.bottom + offsetValue;

    // 화면 아래로 넘어가면 버튼 위로 배치
    if (finalTop + PICKER_HEIGHT > window.innerHeight - 8) {
      finalTop = rect.top - PICKER_HEIGHT - offsetValue;
    }

    // 가로 위치: 버튼 왼쪽 정렬, 우측 넘침 방지
    let finalLeft = rect.left;
    if (finalLeft + PICKER_WIDTH > window.innerWidth - 8) {
      finalLeft = Math.max(8, window.innerWidth - PICKER_WIDTH - 8);
    }
    finalLeft = Math.max(8, finalLeft);

    setPosStyle({
      position: 'fixed',
      top: `${finalTop}px`,
      left: `${finalLeft}px`,
      zIndex: 1200,
      visibility: 'visible',
    });
  }, [show, anchorRef, offset]);

  if (!show) return null;

  const handleCharClick = (char) => {
    if (!SEND_GRAPHIC_CHARS.has(char)) {
      alert('지원하지 않는 문자가 포함되어 있습니다. [츝]');
      return;
    }

    // 부모 컴포넌트가 caret 위치를 반영해 삽입하도록 단일 문자만 전달
    onInsert && onInsert(char);
  };

  // 특수문자 개수대로 배열 분할 (11, 12, 11, 7 순서 - 위에서부터)
  const rows = [
    Array.from(SEND_GRAPHIC_CHARS).slice(0, 11), // 맨 위 11개
    Array.from(SEND_GRAPHIC_CHARS).slice(11, 23), // 두 번째 12개
    Array.from(SEND_GRAPHIC_CHARS).slice(23, 34), // 세 번째 11개
    Array.from(SEND_GRAPHIC_CHARS).slice(34, 41), // 맨 아래 7개
  ];

  return (
    <div ref={wrapperRef} className={Styles.picker} style={posStyle} onClick={(e) => e.stopPropagation()}>
      <div className={Styles.keyboardContainer}>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className={Styles.charRow}>
            {row.map((ch, i) => (
              <button key={`${rowIndex}-${i}`} type="button" className={Styles.charCell} onClick={() => handleCharClick(ch)}>
                <span className={Styles.charInner}>{ch}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
