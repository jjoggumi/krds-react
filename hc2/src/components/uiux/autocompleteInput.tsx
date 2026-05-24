/**
 * @File(Method): AutocompleteInput.tsx
 * @Description: input 자동완성
 * @Modified: 2025-05-14
 */

import React, {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  ChangeEvent,
  FocusEvent,
} from "react";
import { OptionLayer, OptionList, OptionItem, OptionFooter } from "./optionLayer";
import { HiInput } from "./../uiux/hiInput";

import styles from "./autocompleteInput.module.scss";
interface AutocompleteInputProps {
  value: string;
  placeholder?: string;
  nodata?: string;
  options: string[];
  isError?: boolean;
  inTable?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeydown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  onChange: (val: string) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  renderCustomOption?: (items: string[], selectItem: (item: string) => void) => React.ReactNode;
  renderCustomBtnOption?: (items: string[], selectItem: (item: string) => void) => React.ReactNode;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  placeholder = "항목 입력",
  nodata = "일치하는 항목이 없습니다.",
  options,
  isError = false,
  onFocus,
  onBlur,
  onKeydown,
  onChange,
  inTable = false,
  disabled = false,
  size = "md",
  renderCustomOption,
  renderCustomBtnOption,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [showList, setShowList] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // 필터링된 리스트
  const filteredSubjects = !value
    ? options
    : options.filter((subject) => subject.includes(value));

  // value 바뀌면 index 초기화
  useEffect(() => {
    // 자동완성 레이어가 열릴 때 첫 번째 아이템으로 포커스/선택이 이동하는 것처럼 보이지 않도록
    // 기본 focusedIndex는 -1로 유지하고, 키보드(↑/↓)로 이동할 때만 인덱스를 잡습니다.
    setFocusedIndex(-1);
  }, [value, options]);

  // 이벤트 핸들러
  const handleFocus = () => {
    setShowList(true);
    setFocusedIndex(-1);
    onFocus?.();
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    onBlur?.();
    setTimeout(() => setShowList(false), 150); // blur 후 닫힘 딜레이
  };

  const handleKeydown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeydown?.(event);

    if (!showList) return;
    const len = filteredSubjects.length;
    if (len <= 0) return;

    if (event.key === "ArrowDown") {
      setFocusedIndex((prev) => (prev < 0 ? 0 : (prev + 1) % len));
      event.preventDefault();
    } else if (event.key === "ArrowUp") {
      setFocusedIndex((prev) => (prev < 0 ? len - 1 : (prev - 1 + len) % len));
      event.preventDefault();
    } else if (event.key === "Enter") {
      if (focusedIndex >= 0 && len > 0) {
        selectSubject(filteredSubjects[focusedIndex]);
      } else {
        setShowList(false);
      }
    }
  };

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setShowList(true);
  };

  const selectSubject = (subject: string) => {
    onChange(subject);
    setShowList(false);
  };

  // 외부에서 focus() 호출할 수 있게
  const focus = () => {
    inputRef.current?.focus();
  };

  return (
    <div ref={wrapperRef} className={`${styles["autocomplete-wrap"]} autocomplete-wrap`}>
      <HiInput
        value={value}
        onChange={handleInput}
        onBlur={handleBlur}
        onKeyDown={handleKeydown}
        placeholder={placeholder}
        disabled={disabled}
        state={isError ? 'error' : undefined}
        size={size}
        className={size}
        onFocus={handleFocus}
        inTable ={inTable}
        // ref={inputRef}
      />

      {showList && (
        <OptionLayer
          isOpen={showList}
          anchorRef={wrapperRef as any}
          className={`option-layer ${styles['option-layer']}`}
          onRequestClose={() => setShowList(false)}
        >
          <OptionList size={size as any}>
            {renderCustomOption ? (
              renderCustomOption(filteredSubjects, selectSubject)
            ) : (
              <>
                {filteredSubjects.map((subject, index) => (
                  <OptionItem
                    key={subject}
                    tag="button"
                    className={`item${index === focusedIndex ? ' focused' : ''} ${styles['item']}`}
                    selected={index === focusedIndex}
                    onClick={() => selectSubject(subject)}
                  >
                    {subject}
                  </OptionItem>
                ))}
                {filteredSubjects.length === 0 && (
                  <div className="hi-nodata sm">
                    <p>{nodata}</p>
                  </div>
                )}
              </>
            )}
          </OptionList>
          {renderCustomBtnOption ? (
            <OptionFooter>
              {renderCustomBtnOption(filteredSubjects, selectSubject)}
            </OptionFooter>
          ) : null}
        </OptionLayer>
      )}
    </div>
  );
};

export default AutocompleteInput;
