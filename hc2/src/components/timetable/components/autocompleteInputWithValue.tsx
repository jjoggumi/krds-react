import React, { useEffect, useRef, useState } from "react";
import styles from "./autocompleteInputWithValue.module.scss";

export interface AutocompleteOption {
  text: string;
  value: string;
  options?: {
    disabled?: boolean;
  };
}

interface Props {
  value?: string;
  options: AutocompleteOption[];
  placeholder?: string;
  nodata?: string;
  isError?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  onFocus?: () => void;
  onBlur?: () => void;
  onKeydown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onUpdate?: (value: string) => void;
  onRemoveValue?: () => void;
  className?: string;
}

const AutocompleteInputWithValue: React.FC<Props> = ({
  value = "",
  options,
  placeholder = "항목 입력",
  nodata = "일치하는 항목이 없습니다.",
  isError = false,
  readonly = false,
  disabled = false,
  size = "md",
  onFocus,
  onBlur,
  onKeydown,
  onUpdate,
  onRemoveValue,
  className,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [keyword, setKeyword] = useState("");
  const [showList, setShowList] = useState(false);

  const filteredItems = keyword
    ? options.filter((item) => item.text.includes(keyword))
    : options;

  const handleFocus = () => {
    setShowList(true);
    onFocus?.();
  };

  const handleBlur = () => {
    onBlur?.();
    setTimeout(() => setShowList(false), 150);
  };

  const handleKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeydown?.(e);
    if (e.key === "Enter") {
      setShowList(false);
    }
  };

  const handleSelectItem = (item: AutocompleteOption) => {
    if (item.options?.disabled) return;
    setKeyword("");
    setShowList(false);
    onUpdate?.(item.value);
  };

  const handleRemoveValue = () => {
    setKeyword("");
    onRemoveValue?.();
  };

  useEffect(() => {
    if (value) {
      setKeyword("");
    }
  }, [value]);

  return (
    <div className={`autocomplete-wrap ${className ?? ""}`}>
      <div className={`input-wrap`}>
        {!value ? (
          <input
            ref={inputRef}
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeydown}
            placeholder={placeholder}
            className={`bg-bg-base clickable ${isError ? "error" : ""} ${size}`}
            readOnly={readonly}
            disabled={disabled}
            spellCheck={false}
          />
        ) : (
          <div className="text-box-wrap">
            <div className="text-box">
              {value}
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleRemoveValue();
                }}
                className={styles.delBtn}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {showList && (
        <div className={`autocomplete-list custom-scr`}>
          {filteredItems.map((item) => (
            <div
              key={`item-${item.value}`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelectItem(item);
              }}
              className={`${styles.item} ${
                item.options?.disabled ? styles.disabledClass : "clickable"
              }`}
            >
              {item.text}
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="hi-nodata sm">
              <p>{nodata}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInputWithValue;
