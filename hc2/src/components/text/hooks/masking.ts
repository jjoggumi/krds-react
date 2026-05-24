import { useState, useRef, useEffect, type ChangeEvent, useLayoutEffect } from 'react';
import { useMaskingContext } from '../context/MaskingContext';

interface UseMaskingProps {
   initialValue?: string;
   maskable?: boolean;
   onChange?: (value: string) => void;
}

export const useMasking = <T extends HTMLTextAreaElement | HTMLInputElement>(
   { initialValue = '', onChange, numericOnly = true, maxLength, maskable = true, useInternalMask = false }
: UseMaskingProps & { numericOnly?: boolean; maxLength?: number; useInternalMask?: boolean } = {}) => {
   const [value, setValue] = useState(initialValue);
   const [internalIsMasked, setInternalIsMasked] = useState(true);
   const inputRef = useRef<T>(null);
   const internalInputRef = useRef<T | null>(null); // To capture DOM even if ref is not bound
   const cursorRef = useRef<number | null>(null);

   const context = useMaskingContext();

   let isMasked = false;
   if(useInternalMask === true) {
      isMasked = maskable && internalIsMasked;
   } else {
      isMasked = maskable && context.isMasked;
   }

   const setIsMasked = (newValue: boolean) => {
      if(useInternalMask === true) {
         setInternalIsMasked(newValue);
      } else {
         context.setIsMasked(newValue);
      }
   };

   useEffect(() => {
      setValue(initialValue);
   }, [initialValue]);

   const getMasked = (raw: any) => {
      const str = String(raw ?? '');
      if (str.length < 7) return str;
      return str.substring(0, 3) + '*'.repeat(str.length - 7) + str.substring(str.length - 4);
   };

   const displayValue = isMasked ? getMasked(value) : value;

   const handleChange = (e: ChangeEvent<T>) => {
      const target = e.target as T;
      internalInputRef.current = target;

      const val = target.value;
      const selectionStart = target.selectionStart || 0;

      if (!isMasked) {
         let cleanVal = numericOnly ? val.replace(/[^0-9]/g, '') : val;
         if (maxLength && cleanVal.length > maxLength) {
               cleanVal = cleanVal.slice(0, maxLength);
         }
         setValue(cleanVal);
         onChange?.(cleanVal);
         return;
      }

      const prevVal = getMasked(value);

      let prefixLen = 0;
      while (prefixLen < val.length && prefixLen < prevVal.length && val[prefixLen] === prevVal[prefixLen]) {
            prefixLen++;
      }

      let suffixLen = 0;
      while (
            suffixLen < val.length - prefixLen &&
            suffixLen < prevVal.length - prefixLen &&
            val[val.length - 1 - suffixLen] === prevVal[prevVal.length - 1 - suffixLen]
      ) {
            suffixLen++;
      }

      const inserted = val.slice(prefixLen, val.length - suffixLen);
      const cleanInserted = numericOnly ? inserted.replace(/[^0-9]/g, '') : inserted;

      let nextNum = value.slice(0, prefixLen) + cleanInserted + value.slice(value.length - suffixLen);

      if (maxLength && nextNum.length > maxLength) {
            nextNum = nextNum.slice(0, maxLength);
      }

      cursorRef.current = selectionStart;
      setValue(nextNum);
      onChange?.(nextNum);
   };

   useLayoutEffect(() => {
      const el = inputRef.current || internalInputRef.current;
      if (el && cursorRef.current !== null && isMasked) {
         el.setSelectionRange(cursorRef.current, cursorRef.current);
         cursorRef.current = null;
      }
   }, [displayValue, isMasked]);

   return {
      value: displayValue,
      realValue: value,
      onChange: handleChange,
      isMasked,
      setIsMasked,
      setValue
   };
};
