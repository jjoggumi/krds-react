import { ReactNode, ChangeEvent, KeyboardEvent, FocusEvent, CSSProperties, useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { sortBy } from 'lodash';

import { HiInput, ShowConfirm, CONFIRM_OPTIONS, Icon } from '@/components/uiux';

import { SEND_TARGET_FIELD_NAME, SEND_TARGET_TYPE_NAME, SEND_TARGET_FIELD_LIMITS } from '@/components/text/constants/send';
import { ImportType } from '@/components/text/components/send/SendReceiver';
import { SendTargetWithValidation } from '@/components/text/types';
import { isErrorPhoneNumber } from '@/utils/validate';
import Tooltip from '@/components/uiux/tooltip';
import { useSendReceiverContext } from '@/components/text/context/SendContext';
import { CONTACT_LIMITS, phoneNumberFields } from '../../constants';
import { useMasking } from '../../hooks/masking';
import { useMaskingContext } from '../../context/MaskingContext';
import { VirtualItem } from '@tanstack/react-virtual';
import { useVirtualRows } from '@/components/text/hooks/virtualRows';
import { useGridNavigation } from '@/components/text/hooks/gridNavigation';
import { extractEmojisFromString } from '../../utils';

const defaultFields = ['contactName', 'phoneNumber', 'field1', 'field2', 'field3', 'field4', 'field5', 'field6', 'field7', 'field8'];

const VARIABLE_FIELD_MAX_WIDTH_PX = 272; // 변수 필드(field*) 입력 컬럼 최대 너비

interface SendReceiverTableProps {
  children?: ReactNode;
  importType: ImportType;
  targets: SendTargetWithValidation[];
  fields?: string[];
  onDeleteAll: () => void;
  onDelete: (rowIndex: number) => void;
  onChangeTargets: (targets: SendTargetWithValidation[]) => void;
}

export const SendReceiverTable = ({
  children,
  importType,
  targets,
  fields,
  onDeleteAll,
  onDelete,
  onChangeTargets,
}: SendReceiverTableProps) => {
  const isSelectorImport = importType === ImportType.CONTACTS_SELECTOR;
  const isDirectImport = importType === ImportType.DIRECT;

  // field1~ 컬럼에서만 입력값에 따라 width가 늘어나되, max-width만 제한

  const [sortedField, setSortedField] = useState<string | null>(null);
  const visibleFields = useMemo(() => ([...(fields || []), ...defaultFields]), [fields]);

  const maskingContext = useMaskingContext();

  const maxRow = targets.length + 1;
  const maxCell = visibleFields.length;
  const startCellIndex = 0;
  const { handleChangeFocusedInput, focusedCell, setFocusedCell } = useGridNavigation({ maxRow, maxCell, startCellIndex });

  const { virtualRows, virtualRowsParentRef, paddingTop, bottom } = useVirtualRows({
    estimateSize: 40,
    overscan: 7,
    getItemKey: (index: number) => targets[index].contactId,
    rows: targets
  });

  // 신규행 추가시 스크롤 자동 이동 처리
  const prevTargetCountRef = useRef<number>(targets.length);
  useEffect(() => {
    if (targets.length > prevTargetCountRef.current) {
      const el = virtualRowsParentRef.current as HTMLElement | null;
      if (el) {
        // 다음 렌더 후 스크롤 (virtual list가 렌더링된 뒤에 실행)
        setTimeout(() => {
          el.scrollTop = el.scrollHeight;
        }, 0);
      }
    }
    prevTargetCountRef.current = targets.length;
  }, [targets.length, virtualRowsParentRef]);

  const handleBlurInput = useCallback((rowIndex: number | null, inputValue: string, fieldKey: string) => {
    const newTargets = [...targets];

    if (rowIndex === null) {
      const addRow: SendTargetWithValidation = {
        contactId: uuidv4(),
        contactName: '',
        phoneNumber: '',
        field1: '',
        field2: '',
        field3: '',
        field4: '',
        field5: '',
        field6: '',
        field7: '',
        field8: '',
        valid: { phoneNumber: true },
        isDuplication: false,
      };
      if (isSelectorImport) {
        addRow.depth1 = '';
        addRow.depth2 = '';
        addRow.sendTargetType = '';
      }
      addRow[fieldKey] = inputValue;
      addRow.valid.phoneNumber = !isErrorPhoneNumber(addRow.phoneNumber);

      newTargets.push(addRow);
      onChangeTargets(newTargets);
      return;
    }

    newTargets[rowIndex][fieldKey] = inputValue;
    if (fieldKey === 'phoneNumber') {
      newTargets[rowIndex].valid.phoneNumber = !isErrorPhoneNumber(inputValue);
    }
    onChangeTargets(newTargets);
  }, [targets, onChangeTargets]);

  const handleClickAllDelete = async () => {
    const isDelete = await ShowConfirm('기존 입력한 데이터는 모두 삭제됩니다.\n삭제 하시겠습니까?', {
      ...CONFIRM_OPTIONS.TEXT,
      confirmLabel: '삭제',
    });
    if (!isDelete) return;
    onDeleteAll();
  };

  const handleClickDelete = (rowIndex: number) => {
    onDelete(rowIndex);
  };

  const handleClickToggleMasking = () => {
    maskingContext.toggleMasked();
  };

  const handleClickSort = (fieldToSort: string) => {
    let sortedTargets = [...targets];
    sortedTargets = sortBy(sortedTargets, (item) => item[fieldToSort].toLowerCase());
    onChangeTargets(fieldToSort === sortedField ? sortedTargets.reverse() : sortedTargets);
    setSortedField(fieldToSort === sortedField ? null : fieldToSort);
  };

  return (
    <div
      ref={virtualRowsParentRef}
      className={`h-100 table-content table-form table-box sticky-wrap ${!isDirectImport && targets.length === 0 ? '!bg-bg-secondary-subtlest !overflow-hidden' : ''}`}>
      <table className='!table-auto'>
        <colgroup>
          <col style={{ width: '50px', minWidth: '50px' }} />
          {isSelectorImport && <col style={{ width: '140px', minWidth: '140px' }} />}
          {isSelectorImport && <col style={{ width: '140px', minWidth: '140px' }} />}
          {isSelectorImport && <col style={{ width: '100px', minWidth: '100px' }} />}
          <col style={{ width: '118px', minWidth: '118px' }} />
          <col style={{ width: '200px', minWidth: '200px' }} />
          <col style={{ width: 'auto', minWidth: isSelectorImport ? '90px' : '90px' }} />
          <col style={{ width: 'auto', minWidth: isSelectorImport ? '90px' : '90px' }} />
          <col style={{ width: 'auto', minWidth: isSelectorImport ? '90px' : '90px' }} />
          <col style={{ width: 'auto', minWidth: isSelectorImport ? '90px' : '90px' }} />
          <col style={{ width: 'auto', minWidth: isSelectorImport ? '90px' : '90px' }} />
          <col style={{ width: 'auto', minWidth: isSelectorImport ? '90px' : '90px' }} />
          <col style={{ width: 'auto', minWidth: isSelectorImport ? '90px' : '90px' }} />
          <col style={{ width: 'auto', minWidth: isSelectorImport ? '90px' : '90px' }} />
        </colgroup>
        <thead>
        <tr>
          <th className="sticky-top">
            {targets.length !== 0 &&
              <Icon icon="close" className="p-1 cursor-pointer bg-text-neutral-stronger" color="gray"  onClick={handleClickAllDelete}/>
            }
          </th>
          {visibleFields.map((fieldKey) => {
            const trClass = [
              fieldKey === 'contactName' ? 'left-0 !z-7' : '',
              fieldKey === 'phoneNumber' ? 'left-[118px] !z-7' : '',
            ].filter(Boolean).join(' ');
            
            return (
              <th className={`sticky-top ${trClass}`}>
                <div className="flex items-center justify-center">
                  {fieldKey === 'phoneNumber' && <span className="text-graphic-coral pt-1">*</span>}
                  {SEND_TARGET_FIELD_NAME[fieldKey]}
                  {
                    fieldKey === 'phoneNumber' ?
                      <Icon
                        onClick={handleClickToggleMasking}
                        icon={maskingContext.isMasked ? 'eye-off' : 'eye-on'}
                        iconSize={15}
                        className="align-sub"
                        style={{ width: 20, height: 20 }} // 프레임은 20 유지
                      /> :
                      <Icon
                        onClick={() => handleClickSort(fieldKey)}
                        icon={sortedField === fieldKey ? 'arrow-up-sort' : 'arrow-down-sort'}
                        className="-mr-1.5"
                      />
                  }
                </div>
              </th>
            );
          })}
        </tr>
        </thead>
        <tbody>
        {isDirectImport || targets.length > 0 ? (
          <>
            {paddingTop > 0 && (
              <tr key="spacer-top" aria-hidden="true">
                <td colSpan={visibleFields.length} style={{ height: paddingTop }} />
              </tr>
            )}
            {virtualRows.map((virtualRow: VirtualItem) => {
              const row = targets[virtualRow.index];

              return (
                <SendReceiverRow
                  key={row.contactId}
                  row={row}
                  rowIndex={virtualRow.index}
                  fields={visibleFields}
                  focusedCell={focusedCell}
                  onDelete={handleClickDelete}
                  onBlurInput={handleBlurInput}
                  handleChangeFocusedInput={handleChangeFocusedInput}
                  setFocusedCell={setFocusedCell}
                />
              );
            })}
            {bottom > 0 && (
              <tr key="spacer-bottom" aria-hidden="true">
                <td colSpan={visibleFields.length} style={{ height: bottom }} />
              </tr>
            )}
            <SendReceiverEmptyRow
              fields={visibleFields}
              focusedCell={focusedCell}
              onBlurInput={handleBlurInput}
              targets={targets}
              handleChangeFocusedInput={handleChangeFocusedInput}
              setFocusedCell={setFocusedCell}
            />
          </>
        ) : null}
        </tbody>
      </table>
      {!isDirectImport && targets.length === 0 && (children)}
    </div>
  );
};

interface SendReceiverRowProps {
  row: SendTargetWithValidation;
  rowIndex: number;
  fields: string[];
  focusedCell: { r: number, c: number };
  onDelete: (rowIndex: number) => void;
  onBlurInput: (rowIndex: number | null, inputValue: string, fieldKey: string) => void;
  handleChangeFocusedInput: (e: KeyboardEvent<HTMLInputElement>, rowIndex: number, cellIndex: number) => void;
  setFocusedCell: (focusedCell: { r: number, c: number }) => void;
}

const SendReceiverRow = ({ row, rowIndex, fields, focusedCell, onDelete, onBlurInput, handleChangeFocusedInput, setFocusedCell }: SendReceiverRowProps) => {
  const handleClickDelete = () => {
    onDelete(rowIndex);
  }

  const handleBlurInput = (rowIndex: number, inputValue: string, fieldKey: string) => {
    onBlurInput(rowIndex, inputValue, fieldKey);
  }

  return (
    <tr className={`${row.isDuplication ? '!bg-bg-primary-subtlest' : ''}`}>
      <td onClick={handleClickDelete} className='bg-transparent'>
        <Icon icon="close" className="p-1 cursor-pointer bg-text-neutral-stronger" color="gray" />
      </td>
      {fields.map((fieldKey, cellIndex) => {
        let initValue = row[fieldKey];
        if (fieldKey === 'sendTargetType' && Object.keys(SEND_TARGET_TYPE_NAME).includes(row.sendTargetType)) {
          initValue = SEND_TARGET_TYPE_NAME[row.sendTargetType];
        }
        return (
          <SendReceiverTableCell
            key={`${row.contactId}-${fieldKey}`}
            initInputValue={initValue}
            isReset={false}
            fieldKey={fieldKey}
            row={row}
            rowIndex={rowIndex}
            cellIndex={cellIndex}
            focusedCell={focusedCell}
            onBlurInput={handleBlurInput}
            handleChangeFocusedInput={handleChangeFocusedInput}
            setFocusedCell={setFocusedCell}
          />
        );
      })}
    </tr>
  )
}

interface SendReceiverEmptyRowProps {
  fields: string[];
  onBlurInput: (rowIndex: number | null, inputValue: string, fieldKey: string) => void;
  targets: SendTargetWithValidation[];
  focusedCell: { r: number, c: number };
  handleChangeFocusedInput: (e: KeyboardEvent<HTMLInputElement>, rowIndex: number, cellIndex: number) => void;
  setFocusedCell: (focusedCell: { r: number, c: number }) => void;
}

const SendReceiverEmptyRow = ({ fields, onBlurInput, targets, focusedCell, handleChangeFocusedInput, setFocusedCell }: SendReceiverEmptyRowProps) => {
  const handleBlurInput = (rowIndex: number, inputValue: string, fieldKey: string) => {
    if (inputValue.trim().length === 0) return;
    onBlurInput(null, inputValue, fieldKey);
  };

  return (
    <tr>
      <td></td>
      {
        fields.map((fieldKey, cellIndex) => (
          <SendReceiverTableCell
            key={`empty-${fieldKey}-${targets.length}`}
            initInputValue={''}
            isReset={true}
            fieldKey={fieldKey}
            row={null}
            rowIndex={targets.length}
            cellIndex={cellIndex}
            focusedCell={focusedCell}
            onBlurInput={handleBlurInput}
            handleChangeFocusedInput={handleChangeFocusedInput}
            setFocusedCell={setFocusedCell}
          />
        ))
      }
    </tr>
  );
};

interface SendReceiverTableCellProps {
  initInputValue: string;
  isReset: boolean;
  fieldKey: string;
  row: SendTargetWithValidation | null;
  rowIndex: number;
  cellIndex: number;
  focusedCell: { r: number, c: number };
  onBlurInput: (index: number, inputValue: string, fieldKey: string) => void;
  handleChangeFocusedInput: (e: KeyboardEvent<HTMLInputElement>, rowIndex: number, cellIndex: number) => void;
  setFocusedCell: (focusedCell: { r: number, c: number }) => void;
}

const SendReceiverTableCell = ({
  initInputValue,
  isReset,
  fieldKey,
  row,
  rowIndex = null,
  cellIndex,
  focusedCell,
  onBlurInput,
  handleChangeFocusedInput,
  setFocusedCell
}: SendReceiverTableCellProps) => {
  const { handleFocusRow } = useSendReceiverContext();

  const isPhoneNumber = phoneNumberFields.includes(fieldKey);
  const isNumeric = isPhoneNumber;
  const isDuplication = row?.isDuplication || false;
  const isPhoneNumberError = row ? isPhoneNumber && !row.valid?.phoneNumber : false;
  const maxLength = CONTACT_LIMITS[fieldKey] || undefined;
  const isVariableField = fieldKey.startsWith('field');

  const inputId = useMemo(() => `receiver-cell-${rowIndex}-${cellIndex}`, [rowIndex, cellIndex]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [variableInputWidthPx, setVariableInputWidthPx] = useState<number | null>(null);

  const masking = useMasking<HTMLInputElement>({
    initialValue: initInputValue || '',
    numericOnly: isNumeric,
    maskable: isPhoneNumber,
    maxLength: maxLength,
    useInternalMask: false,
  });

  useEffect(() => {
    if (!focusedCell) return;

    const nextId = `receiver-cell-${focusedCell.r}-${focusedCell.c}`;
    const nextElement = document.getElementById(nextId);

    if (nextElement) {
      nextElement.focus();
    }
  }, [focusedCell]);

  // field1~ 컬럼에서만: 입력값 길이에 따라 min~max 범위로 자연스럽게 width 확장
  useLayoutEffect(() => {
    if (!isVariableField) return;

    const el = document.getElementById(inputId) as HTMLInputElement | null;
    if (!el) {
      if (variableInputWidthPx !== null) setVariableInputWidthPx(null);
      return;
    }

    const computed = window.getComputedStyle(el);
    const font = computed.font || [
      computed.fontStyle,
      computed.fontVariant,
      computed.fontWeight,
      computed.fontSize,
      computed.lineHeight ? `/${computed.lineHeight}` : '',
      computed.fontFamily,
    ].filter(Boolean).join(' ');

    if (!canvasRef.current) canvasRef.current = document.createElement('canvas');
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.font = font;

    const text = String(masking.value ?? '');
    const paddingLeft = parseFloat(computed.paddingLeft || '0') || 0;
    const paddingRight = parseFloat(computed.paddingRight || '0') || 0;
    const borderLeft = parseFloat(computed.borderLeftWidth || '0') || 0;
    const borderRight = parseFloat(computed.borderRightWidth || '0') || 0;

    // caret 여유(1ch 정도)를 약간 더해줌
    const measured = ctx.measureText(text.length === 0 ? ' ' : text).width;
    const next = Math.min(VARIABLE_FIELD_MAX_WIDTH_PX, Math.ceil(measured + paddingLeft + paddingRight + borderLeft + borderRight + 12));

    if (next !== variableInputWidthPx) setVariableInputWidthPx(next);
  }, [isVariableField, inputId, masking.value, variableInputWidthPx]);

  const handleChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    masking.onChange(e);
    handleFocusRow({ ...row, [fieldKey]: masking.realValue });
  };

  const handleBlurInput = async (e?: FocusEvent<HTMLInputElement>) => {
    handleFocusRow(null);
    if (e.relatedTarget?.id?.includes('receiver-cell-')) {
      const data = e.relatedTarget.id?.split('-');
      setFocusedCell({r: parseInt(data[2]), c: parseInt(data[3])});
    } else {
      setFocusedCell(null);
    }

    const value = masking.realValue;
    if (initInputValue === value) return;

    const emojis = extractEmojisFromString(value);
    onBlurInput(rowIndex, value, fieldKey);
    isReset && masking.setValue('');

    if(emojis.length > 0) {
      await ShowConfirm(`지원하지 않는 문자가 포함되어 있습니다.\n[${emojis.join(', ')}]`, {
        ...CONFIRM_OPTIONS.TEXT,
        confirmLabel: '확인',
        hideCancel: true,
      });
    }
  };

  const handleFocusInput = () => {
    handleFocusRow(row);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (row === null && e.key=== 'Enter') {
      handleBlurInput();
    }
    handleChangeFocusedInput(e, rowIndex, cellIndex);
  };

  const showPlaceholder = row === null && ['phoneNumber', 'contactName'].includes(fieldKey) ? SEND_TARGET_FIELD_NAME[fieldKey] : ''
  // 변수 필드(field1, field2, ...)일 때 입력값 길이에 따라 width 조절 (max-width만 제한)
  const variableFieldWrapperStyles: CSSProperties | undefined = isVariableField
    ? {
      minWidth: '100%',
      width: variableInputWidthPx ?? '100%',
      maxWidth: VARIABLE_FIELD_MAX_WIDTH_PX,
    }
    : undefined;
  const renderInput = (
    <HiInput
      inputId={inputId}
      value={masking.value}
      onChange={handleChangeInput}
      onBlur={handleBlurInput}
      onFocus={handleFocusInput}
      onKeyDown={handleKeyDown}
      inTable={true}
      wrapClass='h-full'
      wrapStyle={variableFieldWrapperStyles}
      className={getInputClass(fieldKey, isDuplication)}
      showClearButton={false}
      state={isPhoneNumberError && 'error'}
      placeholder={showPlaceholder}
      maxLength={SEND_TARGET_FIELD_LIMITS[fieldKey] ?? (fieldKey.startsWith('field') ? SEND_TARGET_FIELD_LIMITS['field'] : undefined)}
    />
  );

  const tdClass = [
    isDuplication ? '!bg-bg-secondary-subtlest' : '',
    fieldKey === 'contactName' ? '!sticky left-0 z-5' : '',
    fieldKey === 'phoneNumber' ? '!sticky left-[118px] z-5' : '',
  ].filter(Boolean).join(' ');

  return (
    <td className={tdClass} data-field={fieldKey}>
      {isDuplication && isPhoneNumber && (
        <span className="absolute top-0 left-0 z-10 w-5.5 h-4 bg-graphic-coral text-text-base text-[10px] rounded-[0_0.5_0.5_0] py-0.5">중복</span>
      )}
      {isPhoneNumberError ? (
        <Tooltip
          titleHtml={'하이픈(-) 없이 숫자 10-11자리를 입력해주세요.'}
          position="center-bottom"
          className="w-full h-full"
          tooltipClassName='z-11'
        >
          {renderInput}
        </Tooltip>
      ) : (
        renderInput
      )}
    </td>
  );
};

const getInputClass = (fieldKey: string, isDuplication: boolean) => {
  // 변수 필드(field1, field2, ...)일 때 text-left 추가
  const isVariableField = fieldKey.startsWith('field');
  const alignClass = isVariableField ? 'text-left justify-start' : 'text-center justify-center';
  const duplicationClass = isDuplication ? '!bg-bg-secondary-subtlest' : '';
  return [alignClass, 'h-full!', duplicationClass].join(' ');
}


// 보기 <-> 쓰기 모드 전환 용 div
// const renderDisplayClass = [
// 'flex items-center cursor-text px-3 select-none hover:shadow-[0_0_0_1px_#8ea4d1] focus:outline-none focus:shadow-[0_0_0_1px_#8ea4d1] focus:bg-[#f1f4fc]',
// isPhoneNumberError ? 'text-graphic-red shadow-[0_0_0_1px_#f37079]' : '',
// ].filter(Boolean).join(' ');
//
// const renderDisplay = (
//   <div
//     className={[renderDisplayClass, getInputClass(fieldKey, isDuplication)].join(' ')}
//     tabIndex={0}
//     onClick={handleClickDisplay}
//     onKeyDown={(e) => handleChangeFocusedCell(e, rowIndex as number, cellIndex, maxRow, maxCell)}
//   >
//     {masking.value}
//   </div>
// );