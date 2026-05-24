import { FocusEvent, KeyboardEvent, useEffect, useState } from 'react';

import { CheckBox, HiInput, IconButton } from '@/components/uiux';
import Tooltip from '@/components/uiux/tooltip';
import { useMasking } from '../../hooks/masking';
import { LanguageSelectBox } from '@/components/text/components/contact/ContactTable';  // 문자 2차 범위 : 언어 선택 박스 import

import {
  CONTACT_LABELS,
  CONTACT_LIMITS,
  parentPhoneNumberFields,
  phoneNumberFields,
} from '@/components/text/constants';
import { getContactInputErrorMessages, isEmptyRow } from '@/components/text/utils';

import { ContactWithValidation } from '@/components/text/types';

const readOnlyFields = ['depth1GroupName', 'depth2GroupName'];

interface ContactTableRowProps {
  contact: ContactWithValidation;
  isRowChecked: boolean;
  isTemp: boolean;
  rowIndex: number;
  onUpdateContactsRow: (row: ContactWithValidation, initValue: string, updatedField: string) => void;
  onChangeRowCheckbox: (contactId: string, isChecked: boolean, isTemp: boolean) => void;
  focusedCell: { r: number, c: number };
  handleChangeFocusedInput: (e: KeyboardEvent<HTMLInputElement>, rowIndex: number, cellIndex: number) => void;
  setFocusedCell: (focusedCell: { r: number, c: number }) => void;
}

export const ContactTableRow = ({ contact, isRowChecked, isTemp, rowIndex, onUpdateContactsRow, onChangeRowCheckbox, focusedCell, handleChangeFocusedInput, setFocusedCell }: ContactTableRowProps) => {
  const handleChangeCheckbox = (isChecked: boolean) => {
    const id = contact.contactId ? contact.contactId : contact.tempId;
    onChangeRowCheckbox(id, isChecked, isTemp);
  };

  const handleBlurContactInput = (initValue: string, inputValue: string, updatedField: string) => {
    const newContact = { ...contact, [updatedField]: inputValue }
    onUpdateContactsRow({ ...newContact }, initValue, updatedField);
  };

  return (
    <tr>
      <td>
        <CheckBox checked={isRowChecked} onChange={handleChangeCheckbox} className="align-middle" />
      </td>

      {Object.keys(CONTACT_LABELS).map((key: string, cellIndex: number) => {
        const isReadOnly = readOnlyFields.includes(key);
        const isError = isReadOnly
          ? false
          : contact.contactId
            ? !contact.valid[key]
            : isEmptyRow(contact, readOnlyFields)
              ? false
              : !contact.valid[key];

        const cellBody = (
          <ContactTableCell
            fieldKey={key}
            rowIndex={rowIndex}
            cellIndex={cellIndex}
            focusedCell={focusedCell}
            initValue={contact[key]}
            isReadOnly={isReadOnly}
            isError={isError}
            onBlurContactInput={handleBlurContactInput}
            handleChangeFocusedInput={handleChangeFocusedInput}
            setFocusedCell={setFocusedCell}
          />
        );
        const cellKey = `${contact.contactId || contact.tempId}-cell-${key}`;
        return (
          <td key={cellKey} className="relative">
            {isError ? (
              <Tooltip titleHtml={getContactInputErrorMessages(isError, key, contact[key])} position="center-bottom" className="w-full h-full">
                {cellBody}
              </Tooltip>
            ) : (
                cellBody
            )}
          </td>
        );
      })}
    </tr>
  );
};

interface ContactTableCellProps {
  initValue: string | null;
  fieldKey: string;
  rowIndex: number;
  cellIndex: number;
  focusedCell: { r: number, c: number };
  isReadOnly: boolean;
  isError: boolean;
  onBlurContactInput: (initValue: string, inputValue: string, fieldKey: string) => void;
  handleChangeFocusedInput: (e: KeyboardEvent<HTMLInputElement>, rowIndex: number, cellIndex: number) => void;
  setFocusedCell: (focusedCell: { r: number, c: number }) => void;
}

const ContactTableCell = ({ initValue, fieldKey, rowIndex, cellIndex, focusedCell, isReadOnly, isError, onBlurContactInput, handleChangeFocusedInput, setFocusedCell }: ContactTableCellProps) => {
  const isPhoneNumber = phoneNumberFields.includes(fieldKey);
  const isNumeric = fieldKey === 'studentNumber' || isPhoneNumber;
  const maxLength = CONTACT_LIMITS[fieldKey] || undefined;
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!focusedCell) return;

    const nextId = `contact-cell-${focusedCell.r}-${focusedCell.c}`;
    const nextElement = document.getElementById(nextId);

    if (nextElement) {
      nextElement.focus();
    }
  }, [focusedCell]);

  const masking = useMasking<HTMLInputElement>({
    initialValue: initValue || '',
    numericOnly: isNumeric,
    maskable: isPhoneNumber,
    maxLength: maxLength,
    useInternalMask: true,
  });

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);

    if (e.relatedTarget?.id?.includes('contact-cell-')) {
      const data = e.relatedTarget.id?.split('-');
      setFocusedCell({r: parseInt(data[2]), c: parseInt(data[3])});
    } else {
      setFocusedCell(null);
    }

    masking.setIsMasked(true);
    masking.setValue(masking.realValue.trim());

    if ((initValue || '') == masking.realValue.trim()) return;
    onBlurContactInput(initValue, masking.realValue.trim(), fieldKey);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    handleChangeFocusedInput(e, rowIndex, cellIndex);
  };

  if (isReadOnly) {
    return <>{isError ? <span className="text-graphic-red">{masking.value}</span> : <>{masking.value}</>}</>;
  }

  const placeholder = parentPhoneNumberFields.includes(fieldKey) ? '휴대폰번호' : CONTACT_LABELS[fieldKey];

  return (
    <>
      <HiInput
        inputId={`contact-cell-${rowIndex}-${cellIndex}`}
        value={masking.value}
        onChange={masking.onChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        showClearButton={false}
        placeholder={placeholder}
        inTable={true}
        wrapClass="h-full w-full"
        className={`text-center h-full!`}
        state={isError ? 'error' : undefined}
      />
      {/* 문자 2차 범위 : 언어 선택 박스 추가 */}
      {isPhoneNumber && (
        isFocused ? (
          <div
            className="absolute right-0 top-0 h-full z-2 flex items-center"
            onMouseDown={(e) => e.preventDefault()}
          >
            <IconButton
              tabIndex={-1}
              onClick={() => masking.setIsMasked(!masking.isMasked)}
              icon={masking.isMasked ? "eye-off" : "eye-on"} className="w-11 h-full p-3!"
            />
          </div>
        ) : (
          // <LanguageSelectBox />
          <></>
        )
      )}
    </>
  );
};