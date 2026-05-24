import * as React from 'react';
import { useEffect, useImperativeHandle, useRef } from 'react';
import styles from './textarea.module.scss';

interface TextareaProps extends React.ComponentProps<'textarea'> {
  isAutoGrow?: boolean;      // 입력 내용에 따라 높이 자동 조절
  showByte?: boolean;        // 바이트 수 표시
  maxBytes?: number | null;  // 최대 바이트 수 (null일 경우 제한 없음)
  inTable?: boolean;         // 테이블 내부용 스타일 클래스 추가
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;  // 변경 이벤트 핸들러
  resizable?: boolean;   // 크기 조절 가능 여부 (기본값: true)
  canNewLine?: boolean;    // Enter 키로 줄바꿈 가능 여부 (기본값: true)
}

function Textarea({
  className,
  readOnly,
  isAutoGrow,
  inTable,
  showByte = false,
  maxBytes = null,
  ref,
  resizable,
  canNewLine = true,
  ...props
}: TextareaProps) {

  // 현재 value의 byte 크기 계산 함수
  const getByteSize = (str: string) => new Blob([str]).size;

  // 최종적으로 textarea에 적용되는 클래스
  const textareaClassName = [
    styles.textareaBase,
    className,
    inTable ? styles.inTable : '',
    readOnly ? styles.readOnlyClass : '',
    isAutoGrow ? styles.autoGrowClass : '',
    resizable === false ? styles.noResize : '',
  ].filter(Boolean).join(' ');

  const innerRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isAutoGrow && innerRef.current) {
      innerRef.current.style.height = 'auto';
      innerRef.current.style.height = innerRef.current.scrollHeight + 'px';
    }
  }, [isAutoGrow, props.value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!canNewLine && e.key === 'Enter') {
      e.preventDefault();
    }
    if (typeof props.onKeyDown === 'function') props.onKeyDown(e);
  };

  // 부모에서 ref 사용 가능하도록 연결
  useImperativeHandle(ref, () => innerRef.current!);
  return (
    <>
      <textarea
        aria-describedby={props['aria-describedby']}
        aria-invalid={props['aria-invalid']}
        aria-label={props['aria-label']}
        className={textareaClassName}
        data-slot='textarea'
        id={props.id}
        readOnly={readOnly}
        ref={innerRef}
        onInput={(e) => {
          // 전달된 onInput 핸들러가 있으면 호출
          if (typeof props.onInput === 'function') props.onInput(e as any);
        }}
        onKeyDown={handleKeyDown}
        style={props.style}
        {...props}
      />
      {showByte && (
        <div className={styles.byte}>
          <span className={styles.current}>{getByteSize(String(props.value ?? ''))}</span>
          {maxBytes ? <span className={styles.total}> / {maxBytes} byte</span> : <span className={styles.total}> byte</span>}
        </div>
      )}
    </>
  );
}

export { Textarea };
