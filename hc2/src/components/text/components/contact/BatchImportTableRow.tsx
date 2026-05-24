import { FocusEvent, KeyboardEvent, useEffect } from 'react';

import { Icon, HiInput, Tooltip } from '@/components/uiux';

import { CONTACT_LABELS, CONTACT_LIMITS, parentPhoneNumberFields, phoneNumberFields } from '@/components/text/constants';
import {
  generateContactWithValidation,
  getContactInputErrorMessages,
  getContactValidation,
  isEmptyRow
} from '@/components/text/utils';

import { ContactWithValidation } from '@/components/text/types';
import { useMasking } from '../../hooks/masking';

const readOnlyFields = [];
const requiredFields = ['depth1GroupName', 'depth2GroupName', 'contactName'];

interface BatchImportTableRowProps {
  contact: ContactWithValidation;
  rowIndex: number;
  onUpdateContactsRow: (row: ContactWithValidation) => void;
  onDeleteContactById: (tempId: string) => void;
  focusedCell: { r: number, c: number };
  handleChangeFocusedInput: (e: KeyboardEvent<HTMLInputElement>, rowIndex: number, cellIndex: number) => void;
  setFocusedCell: (focusedCell: { r: number, c: number }) => void;
}

export const BatchImportTableRow = ({ contact, rowIndex, onUpdateContactsRow, onDeleteContactById, focusedCell, handleChangeFocusedInput, setFocusedCell }: BatchImportTableRowProps) => {
  const handleBlur = (inputValue: string, updatedField: string) => {
    const newContact = { ...contact, [updatedField]: inputValue };

    onUpdateContactsRow({
      ...newContact,
      valid: getContactValidation(newContact, requiredFields, contact.valid)
    });
  };

  const handleClickDelete = () => {
    onDeleteContactById(contact.tempId);
  };

  return (
    <tr>
      <td>
        <Icon icon="close" className="p-1 cursor-pointer bg-text-neutral-stronger" color="gray" onClick={handleClickDelete} />
      </td>

      {Object.keys(CONTACT_LABELS).map((key: string, cellIndex: number) => {
        const isError = contact.contactId ? !contact.valid[key] : isEmptyRow(contact, readOnlyFields) ? false : !contact.valid[key];

        const cellBody = (
          <ContactTableCell
            initValue={contact[key]}
            fieldKey={key}
            rowIndex={rowIndex}
            cellIndex={cellIndex}
            focusedCell={focusedCell}
            isError={isError}
            isReset={false}
            onBlurContactInput={handleBlur}
            handleChangeFocusedInput={handleChangeFocusedInput}
            setFocusedCell={setFocusedCell}
          />
        );

        const cellKey = `${contact.tempId}-cell-${key}`;

        return (
          <td key={cellKey}>
            {isError ? (
              <Tooltip titleHtml={getContactInputErrorMessages(isError, key, contact[key])} position="center-bottom" className="w-full h-full" tooltipClassName='z-11'>
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

interface BatchImportTableEmptyRowProps {
  rowIndex: number;
  focusedCell: { r: number, c: number };
  onAddContactsRow: (row: ContactWithValidation) => void;
  handleChangeFocusedInput: (e: KeyboardEvent<HTMLInputElement>, rowIndex: number, cellIndex: number) => void;
  setFocusedCell: (focusedCell: { r: number, c: number }) => void;
}

export const BatchImportTableEmptyRow = ({ onAddContactsRow, rowIndex, focusedCell, handleChangeFocusedInput, setFocusedCell }: BatchImportTableEmptyRowProps) => {
  const emptyContact = generateContactWithValidation({ depth1GroupName: null, depth2GroupName: null });

  const handleBlur = (inputValue: string, updatedField: string) => {
    const newContact = { ...emptyContact, [updatedField]: inputValue };

    onAddContactsRow({
      ...newContact,
      valid: getContactValidation(newContact, requiredFields, emptyContact.valid)
    });
  };

  return (
    <tr>
      <td></td>

      {Object.keys(CONTACT_LABELS).map((key: string, cellIndex: number) => {
        return (
          <td key={`empty-row-cell-${key}`}>
            <ContactTableCell
              initValue={''}
              fieldKey={key}
              rowIndex={rowIndex}
              focusedCell={focusedCell}
              cellIndex={cellIndex}
              isError={false}
              isReset={true}
              onBlurContactInput={handleBlur}
              handleChangeFocusedInput={handleChangeFocusedInput}
              setFocusedCell={setFocusedCell}
            />
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
  isError: boolean;
  isReset: boolean;
  onBlurContactInput: (inputValue: string, fieldKey: string) => void;
  handleChangeFocusedInput: (e: KeyboardEvent<HTMLInputElement>, rowIndex: number, cellIndex: number) => void;
  setFocusedCell: (focusedCell: { r: number, c: number }) => void;
}

const ContactTableCell = ({ initValue, fieldKey, rowIndex, cellIndex, focusedCell, isError, isReset, onBlurContactInput, handleChangeFocusedInput, setFocusedCell }: ContactTableCellProps) => {
  const isPhoneNumber = phoneNumberFields.includes(fieldKey);
  const isNumeric = fieldKey === 'studentNumber' || isPhoneNumber;
  const maxLength = CONTACT_LIMITS[fieldKey] || undefined;

  useEffect(() => {
    if (!focusedCell) return;

    const nextId = `batch-cell-${focusedCell.r}-${focusedCell.c}`;
    const nextElement = document.getElementById(nextId);

    if (nextElement) {
      nextElement.focus();
    }
  }, [focusedCell]);

  const masking = useMasking<HTMLInputElement>({
    initialValue: initValue || '',
    maskable: isPhoneNumber,
    numericOnly: isNumeric,
    maxLength: maxLength,
    useInternalMask: false,
  });

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    if (e.relatedTarget?.id?.includes('batch-cell-')) {
      const data = e.relatedTarget.id?.split('-');
      setFocusedCell({r: parseInt(data[2]), c: parseInt(data[3])});
    } else {
      setFocusedCell(null);
    }

    masking.setValue(masking.realValue.trim());

    if ((initValue || '') == masking.realValue.trim()) return;
    onBlurContactInput(masking.realValue.trim(), fieldKey);
    isReset && masking.setValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    handleChangeFocusedInput(e, rowIndex, cellIndex);
  };

  const placeholder = parentPhoneNumberFields.includes(fieldKey) ? '휴대폰번호' : CONTACT_LABELS[fieldKey];

  return (
    <>
      <HiInput
        inputId={`batch-cell-${rowIndex}-${cellIndex}`}
        value={masking.value}
        onChange={masking.onChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        showClearButton={false}
        placeholder={placeholder}
        inTable={true}
        wrapClass="h-full"
        className="text-center h-full!"
        state={isError ? 'error' : undefined}
      />
    </>
  );
};