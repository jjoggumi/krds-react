import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  ReactNode,
  MouseEvent,
} from "react";
import ReactDOM from "react-dom";
import { OptionLayer, OptionFooter, OptionList, OptionItem } from "./optionLayer";
import styles from "./hiSelectBox.module.scss";
import { HiButton } from "./hiButton";

interface Item {
  value: string | number;
  title: string;
  description?: string;
}

interface HiSelectBoxProps {
  value?: string | number | Array<any> | boolean | null;   /* 선택된 값(제어 컴포넌트) */
  defaultValue?: string | number | Array<any>;             /* 마운트 시 기본값(비제어 초기값) */
  items: Item[];                                           /* 옵션 목록: value/title/(선택)description */
  divide?: number;                                         /* value % divide === 0 항목만 표시 */
  isUseAll?: boolean;                                      /* 전체 선택(초기화) 버튼 표시 */
  disabled?: boolean;                                      /* 비활성화 여부 */
  readonly?: boolean;                                      /* 읽기 전용 여부(열림/변경 방지) */
  emptyTitle?: string;                                     /* 값 없을 때 표시 텍스트 */
  disableClose?: boolean;                                  /* 외부 클릭으로 닫힘 비활성화 */
  className?: string;                                      /* 추가 클래스명 */
  style?: React.CSSProperties;                             /* 인라인 스타일 */
  optionLayerClassName?: string;                           /* 옵션 레이어 추가 클래스명 */
  optionLayerStyle?: React.CSSProperties;                  /* 옵션 레이어 인라인 스타일 */
  position?: LayerPosition;                                  /* 옵션 레이어 전개 방향(기본 bottom) */
  size?: "sm" | "md" | "lg" | "xl";                       /* 선택 박스 크기 */

  /* 이벤트 콜백들 */
  error?: boolean; // 에러 상태 표시
  onChange?: (val: any, item?: Item) => void;              /* 값 변경 핸들러 */
  onClickOutside?: () => void;                             /* 외부 클릭으로 닫힐 때 호출 */
  onOpen?: () => void;                                     /* 레이어가 열릴 때 호출 */
  onOpenSelectBox?: () => void;                            /* 트리거 클릭으로 열릴 때 호출 */

  /* 커스텀 렌더링 콜백들 */
  renderSelected?: (value: any) => ReactNode;              /* 선택된 값 표시 영역 커스텀 렌더링 */
  renderListItem?: (item: Item) => ReactNode;              /* 옵션 아이템 커스텀 렌더링 */
  renderButtonType?: (value: any) => ReactNode;            /* 버튼 타입 UI 커스텀 렌더링 */
  renderCustomOption?: (items: Item[], value: any, selectItem: (i: Item) => void) => ReactNode; /* 옵션 리스트 전체 커스텀 */
  renderCustomBtnOption?: (items: Item[], value: any, selectItem: (i: Item) => void) => ReactNode; /* 옵션 레이어 하단 버튼 영역 */
  renderTrigger?: (args: {
    value: any;
    isOpen: boolean;
    disabled?: boolean;
    readonly?: boolean;
    toggle: (e?: React.MouseEvent) => void;
    getLabel: (val: any) => string;
  }) => ReactNode;                                          /* 트리거 영역 전체 커스텀 렌더링 */
}

type LayerPosition = "top" | "bottom" | "left" | "right";

const HiSelectBox: React.FC<HiSelectBoxProps> = ({
  value,
  defaultValue,
  items,
  divide,
  isUseAll = false,
  disabled,
  readonly,
  emptyTitle,
  disableClose = false,
  onChange,
  onClickOutside,
  onOpen,
  onOpenSelectBox,
  renderSelected,
  renderListItem,
  renderButtonType,
  renderCustomOption,
  renderCustomBtnOption,
  renderTrigger,
  className,
  style,
  optionLayerClassName,
  optionLayerStyle,
  position = "bottom",
  size = "md",
  error,
  ...rest
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const optionLayerRef = useRef<HTMLDivElement>(null);

  // dividedItems 계산
  const dividedItems = useMemo(() => {
    return divide
      ? items.filter((item) => Number(item.value) % divide === 0)
      : items;
  }, [items, divide]);

  // mount 시 defaultValue 적용
  useEffect(() => {
    if (!value && defaultValue !== undefined && onChange) {
      onChange(defaultValue);
    }
  }, [defaultValue, value, onChange]);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | any) => {
      if (disableClose) return;
      const targetEl = event.target as Element | null;
      const inWrapper = !!(wrapperRef.current && targetEl && wrapperRef.current.contains(targetEl as Node));
      // 포털로 body에 렌더되는 옵션 레이어 내부 클릭 여부를 클래스 기준으로 판별
      const inOptionLayer = !!(targetEl && targetEl.closest('.option-layer'));
      if (!inWrapper && !inOptionLayer && isOpen) {
        setIsOpen(false);
        onClickOutside && onClickOutside();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, disableClose, onClickOutside]);


  // 상태 변화 감시: isOpen
  useEffect(() => {
    if (isOpen) {
      onOpen && onOpen();
    }
  }, [isOpen, onOpen]);

  const toggleSelectBox = (e?: React.MouseEvent) => {
    if (disabled || readonly) return; // 비활성/읽기전용 보호
    setIsOpen((prev) => {
      const newState = !prev;
      if (!newState) {
        onClickOutside && onClickOutside();
      } else {
        onOpenSelectBox && onOpenSelectBox();
      }
      return newState;
    });
    if (e) e.preventDefault();
  };

  const getValueTitle = (val: any) => {
    const foundItem = dividedItems.find((item) => item.value === val);
    return foundItem
      ? foundItem.title
      : emptyTitle || "선택해주세요.";
  };

  const selectItem = (item: Item) => {
    onChange && onChange(item.value, item);
    setIsOpen(false);
  };

  const selectAll = () => {
    onChange && onChange(dividedItems.map(i => i.value));
    setIsOpen(false);
  };

  return (
    <div
      ref={wrapperRef}
      className={`hi-selectbox-wrap ${styles['hi-selectbox-wrap']} ${styles[size]} ${size} ${isOpen ? `is-opened ${styles['is-opened']}` : ""} ${className || ""}`}
      style={style}
    >
      {renderTrigger ? (
        renderTrigger({
          value,
          isOpen,
          disabled,
          readonly,
          toggle: toggleSelectBox,
          getLabel: getValueTitle,
        })
      ) : (
        <HiButton
          variant="link"
          className={`selected !justify-start ${styles['selected']} ${styles[size]} ${size} ${(value === null || value === '') ? styles['default'] : ""} ${readonly ? styles['readonly'] : ""} ${error ? styles['error'] + ' error' : ""}`}
          disabled={disabled}
          onClick={toggleSelectBox}
        >
          {renderButtonType ? (
            // null-safe wrapper for renderButtonType
            (() => {
              if (value === null || value === undefined) {
                // 기본 전체/비어있음 표시
                return emptyTitle || "전체";
              }
              try {
                return renderButtonType(value);
              } catch (e) {
                // fallback: 안전하게 전체/비어있음 표시
                return emptyTitle || "전체";
              }
            })()
          ) : renderSelected ? (
            renderSelected(value)
          ) : (
            <>
              {getValueTitle(value)}
            </>
          )}
        </HiButton>
      )}
      {isOpen && (
        <OptionLayer
          isOpen={isOpen}
          position={position}
          anchorRef={wrapperRef as any}
          className={`option-layer ${styles['option-layer']} ${className ? className + '-layer ' : ''}${optionLayerClassName || ''}`}
          style={optionLayerStyle}
          onRequestClose={() => setIsOpen(false)}
        >
          <OptionList size={size as any}>
            {renderCustomOption ? (
              renderCustomOption(dividedItems, value, selectItem)
            ) : (
              <>
                {isUseAll && (
                  <HiButton variant="link" className={`item ${styles['item']}`} onClick={selectAll}>
                    {emptyTitle}
                  </HiButton>
                )}
                {dividedItems.map((item) => (
                  <OptionItem
                    key={item.value}
                    tag="button"
                    className={styles['item']}
                    selected={item.value === value}
                    onClick={() => selectItem(item)}
                  >
                    {renderListItem ? renderListItem(item) : item.title}
                    {item.description && (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: item.description,
                        }}
                      />
                    )}
                  </OptionItem>
                ))}
              </>
            )}
          </OptionList>
          {renderCustomBtnOption ? (
            <OptionFooter>
              {renderCustomBtnOption(dividedItems, value, selectItem)}
            </OptionFooter>
          ) : null}
        </OptionLayer>
      )}
    </div>
  );
};

export default HiSelectBox;
