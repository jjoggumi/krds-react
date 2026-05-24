import clsx from 'clsx';
import { HiButton } from './hiButton'
import { X, Search } from 'lucide-react';
import React, { useState } from 'react';

type InputSize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export interface HiInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'size'> {
  inputId?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement> | { target: { value: string } }) => void;

  // HiInput 고유 props
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  styles?: React.CSSProperties;
  className?: string;
  disabled?: boolean;

  // wrapper / custom
  wrapClass?: string; // wrapper class
  wrapStyle?: React.CSSProperties; // wrapper style
  showClearButton?: boolean;
  showSearch?: boolean;
  showSearchIco?: boolean;
  inTable?: boolean;
  state?: 'error' | 'success';
  
  /** 상태에 따라 input 아래에 표시할 메시지 (string). `state==='error'`이면 에러, `state==='success'`이면 성공 메시지로 사용됩니다. */
  message?: string;
  size?: InputSize;
  children?: React.ReactNode;
}

/** 사이즈별 클래스 (height · borderRadius · fontSize · padding) */
const sizeClass: Record<InputSize, string> = {
  sm:  'h-(--ctl-sm-h)  rounded-(--ctl-sm-r)  [font-size:var(--ctl-sm-f)]  pl-3 pr-3',
  md:  'h-(--ctl-md-h)  rounded-(--ctl-md-r)  [font-size:var(--ctl-md-f)]  pl-3 pr-3',
  lg:  'h-(--ctl-lg-h)  rounded-(--ctl-lg-r)  [font-size:var(--ctl-lg-f)]  pl-3 pr-3',
  xl:  'h-(--ctl-xl-h)  rounded-(--ctl-xl-r)  [font-size:var(--ctl-xl-f)]  pl-4 pr-4',
  xxl: 'h-(--ctl-xxl-h) rounded-(--ctl-xxl-r) [font-size:var(--ctl-xxl-f)] pl-4 pr-4',
};

// 기본 input
const INPUT_BASE_CLASSES = [
  'border border-(--control-neutral-strong)',
  '[&:hover:not(:disabled)]:border-(--control-secondary-subtle)',
  '[&:focus:not(:disabled)]:border-(--control-secondary-subtle) [&:focus:not(:disabled)]:bg-(--control-secondary-subtlest)',
  'disabled:border-(--control-neutral-strong) disabled:bg-(--control-neutral-base) disabled:text-(--text-neutral-base)',
  '[&:read-only:not(:disabled)]:border-(--control-neutral-strong) [&:read-only:not(:disabled)]:bg-(--control-neutral-base) [&:read-only:not(:disabled)]:text-(--text-default)',
];

// 기본 input error
const INPUT_ERROR_CLASSES = [
  'border-(--control-red-subtle)! text-(--graphic-red)!',
  '[&:hover:not(:disabled)]:border-(--control-red-subtle)!',
  '[&:focus:not(:disabled)]:border-(--control-red-subtle)! [&:focus:not(:disabled)]:bg-(--control-red-subtlest)!',
];

// 테이블 내 input
const INTABLE_BASE_CLASSES = [
  'border-0 rounded-none! h-full! px-3 text-leading-b3',
  'placeholder:text-leading-b3',
  '[&:hover:not(:disabled)]:shadow-[0_0_0_1px_var(--control-secondary-subtle)]',
  '[&:focus:not(:disabled)]:shadow-[0_0_0_1px_var(--control-secondary-subtle)]',
  'disabled:shadow-[0_0_0_1px_var(--control-neutral-strong)]',
  '[&:read-only:not(:disabled)]:shadow-[0_0_0_1px_var(--control-neutral-strong)] ',
];

// 테이블 내에서 input error
const INTABLE_ERROR_CLASSES = [
  'relative z-2 text-(--graphic-red)!',
  'shadow-[0_0_0_1px_var(--control-red-subtle)]!',
  '[&:hover:not(:disabled)]:shadow-[0_0_0_1px_var(--control-red-subtle)]!',
  '[&:focus:not(:disabled)]:shadow-[0_0_0_1px_var(--control-red-subtle)]!',
];

const ICON_BTNS_CLASSES = 'absolute top-1/2 -translate-y-1/2 flex items-center gap-1.25';
const SEARCH_BTN_CLASSES = '!w-5 !h-5 flex justify-center items-center';

// close button: base classes + size-specific w/h classes
const CLOSE_BTN_BASE_CLASSES = '!bg-text-neutral-strong !rounded-full flex justify-center items-center';
const CLOSE_BTN_SIZE_CLASSES: Record<InputSize, string> = {
  sm: '!w-3.5 !h-3.5 p-0.5',
  md: '!w-4 !h-4 p-0.75',
  lg: '!w-4 !h-4 p-0.75',
  xl: '!w-4.5 !h-4.5 p-1',
  xxl: '!w-4.5 !h-4.5 p-1',
};

function HiInputInner({
  inputId,
  value,
  onChange,
  onBlur,
  onFocus,
  onKeyDown,
  onSearch,
  placeholder = '',
  maxLength = -1,
  disabled = false,
  wrapClass,
  wrapStyle,
  showClearButton = true,
  showSearch = false,
  showSearchIco = false,
  inTable = false,
  state,
  message,
  size = 'md',
  children = null,
  ...rest
}: HiInputProps, ref: React.Ref<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);

  const isError = state === 'error';
  const isSuccess = state === 'success';

  const {
    className: nativeInputClassName,
    style: nativeInputStyle,
    inputClassName: legacyInputClassName,
    inputStyle: legacyInputStyle,
    ...restProps
  } = rest as any;

  // keep using inputId as the canonical id (do not fall back to restProps.id)
  const elementId = inputId;

  // combine classes and styles for the input element
  const rightPaddingClass = !inTable
    ? (showClearButton && showSearch ? 'pr-15.75!' : showSearch ? 'pr-10!' : showClearButton ? 'pr-10' : undefined)
    : undefined;

  const combinedInputClassName = clsx(
    'w-full font-normal leading-[150%] outline-none',
    !inTable && [
      ...INPUT_BASE_CLASSES,
      isError && [...INPUT_ERROR_CLASSES],
      sizeClass[size],
      showSearchIco && 'pl-10!',
      rightPaddingClass,
    ],
    inTable && [
      ...INPUT_BASE_CLASSES,
      ...INTABLE_BASE_CLASSES,
      isError && [...INPUT_ERROR_CLASSES, ...INTABLE_ERROR_CLASSES],
    ],
    nativeInputClassName,
    legacyInputClassName,
  );
  const combinedInputStyle = Object.assign({}, nativeInputStyle || {}, legacyInputStyle || {});

  return (
    <>
      <div
        className={clsx(
          'text-input relative p-0 bg-(--control-base) h-full box-border',
          inTable && 'hover:z-1 focus-within:z-1',
          wrapClass,
        )}
        style={wrapStyle}
      >
        <input
          ref={ref}
          {...restProps}
          id={inputId}
          type={rest.type ?? 'text'}
          value={value}
          onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength < 0 ? undefined : maxLength}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => {
            if ((e.relatedTarget as HTMLElement | null)?.classList.contains('icon-button')) return;
            setFocused(false);
            onBlur?.(e);
          }}
          onKeyDown={onKeyDown}
          className={combinedInputClassName}
          style={combinedInputStyle}
          aria-invalid={isError}
          aria-describedby={message && elementId ? `${elementId}-message` : undefined}
        />
        {(showSearchIco || showSearch) && (
          <div className={clsx(
            ICON_BTNS_CLASSES, 'left-3',
            disabled && 'pointer-events-none',
          )}>
            {showSearchIco && !showSearch && <Search size={20} />}
          </div>
        )}
        {/* 클리어 / 검색 버튼 */}
        {(showClearButton || showSearch) && (          
          <div className={clsx(
            ICON_BTNS_CLASSES, 'right-3',
          )}>
            {showClearButton && focused && value && !disabled && !(restProps as any)?.readOnly && (
            <HiButton
              variant="link"
              className={clsx(CLOSE_BTN_SIZE_CLASSES[size], CLOSE_BTN_BASE_CLASSES)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onChange({ target: { value: '' } })}
              >
              <X style={{ width: '100%' }} strokeWidth={3} color="var(--text-base)" />
            </HiButton>
            )}
            {showSearch && (
              <HiButton
                variant="link"
                className={SEARCH_BTN_CLASSES}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  if (typeof onSearch === 'function') {
                    onSearch(String(value ?? ''));
                  }
                }}
                >
                <Search size={20} />  
              </HiButton>
            )}
          </div>
        )}
        {children}
      </div>
      {(isError || isSuccess) && message && (
        <div
          id={inputId ? `${inputId}-message` : undefined}
          role={isError ? 'alert' : 'status'}
          aria-live={isError ? 'assertive' : 'polite'}
          className={clsx(
            'mt-1 text-leading-d2',
            isError ? 'text-(--graphic-red)' : 'text-(--graphic-green)'
          )}
        >
          {message}
        </div>
      )}
    </>
  );
}

export const HiInput = React.forwardRef<HTMLInputElement, HiInputProps>(HiInputInner);

export default HiInput;