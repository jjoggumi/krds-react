import React, { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import Styles from './VariablePicker.module.scss';
import { CONTENT_FIELDS } from '@/components/text/constants';
import { HiButton, Card } from '@/components/uiux';

const VariablePicker = ({ anchorRef, show, onClose, onInsert, offset = 8 }) => {
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
    const pickerEl = wrapperRef.current;
    const PICKER_WIDTH = pickerEl?.offsetWidth || 220;
    const PICKER_HEIGHT = pickerEl?.offsetHeight || 180;
    let finalTop = rect.bottom + offsetValue;
    if (finalTop + PICKER_HEIGHT > window.innerHeight - 8) {
      finalTop = rect.top - PICKER_HEIGHT - offsetValue;
    }
    finalTop = Math.max(8, finalTop - 4);
    let finalLeft = rect.left;
    if (finalLeft + PICKER_WIDTH > window.innerWidth - 8) {
      finalLeft = Math.max(8, window.innerWidth - PICKER_WIDTH - 8);
    }
    finalLeft = Math.max(8, finalLeft - 16);
    setPosStyle({
      position: 'fixed',
      top: `${finalTop}px`,
      left: `${finalLeft}px`,
      zIndex: 1200,
      visibility: 'visible',
    });
    const handleReposition = () => {
      const rect2 = anchor.getBoundingClientRect();
      let top2 = rect2.bottom + offsetValue;
      if (top2 + PICKER_HEIGHT > window.innerHeight - 8) {
        top2 = rect2.top - PICKER_HEIGHT - offsetValue;
      }
      top2 = Math.max(8, top2 - 4);
      let left2 = rect2.left;
      if (left2 + PICKER_WIDTH > window.innerWidth - 8) {
        left2 = Math.max(8, window.innerWidth - PICKER_WIDTH - 8);
      }
      left2 = Math.max(8, left2 - 16);
      setPosStyle((prev) => ({ ...prev, top: `${top2}px`, left: `${left2}px` }));
    };
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);
    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [show, anchorRef, offset]);

  if (!show) return null;

  return (
    <div ref={wrapperRef} className={Styles.picker} style={posStyle} onClick={(e) => e.stopPropagation()}>
      <div className="flex flex-col gap-3 flex-1 ">
        <div className="flex flex-wrap w-full gap-2">
          {CONTENT_FIELDS.map((v, i) => (
            <HiButton
              variant="tertiary"
              size="md"
              key={v.value}
              className={`transition-all duration-100 ease-in-out ${i >= CONTENT_FIELDS.length - 8 ? 'w-[calc(25%-6px)]' : 'w-[calc(33.3%-5.5px)]'}`}
              onClick={() => onInsert && onInsert(v.value)}
            >
              <span className={Styles.charInner}>{v.value}</span>
            </HiButton>
          ))}
        </div>
        <Card variant="lightgray" size="xs" className="!border-0 !rounded-[7px]">
          <div className='text-leading-b3 font-bold'>[변수 사용 가이드]</div>
          <ol className="list-decimal list-inside text-leading-d1 text-text-neutral-stronger mb-2 mt-1.5 flex flex-col gap-1 pl-4 ">
            <li className="list-decimal">메시지 내용에 변수를 추가한 뒤, [엑셀 일괄 업로드]를 통해 수신자별 내용을 입력해 주세요.</li>
            <li className="list-decimal">변수는 최대 50자까지 가능하며, 초과 시 자동 삭제(잘림) 됩니다.</li>
            <li className="list-decimal">[*대분류*], [*소분류*] 는 주소록 필터로 활용됩니다. (예: 1학년 / 1반)</li>
          </ol>
          <div className="text-text-primary-base"><span className='text-text-primary-base text-leading-d1'>* 변수 사용 시 글자 수 초과로 발송이 실패할 수 있습니다. 안전하게 LMS로 작성해 주세요.</span></div>
        </Card>
      </div>
    </div>
  );
};

export default VariablePicker;
