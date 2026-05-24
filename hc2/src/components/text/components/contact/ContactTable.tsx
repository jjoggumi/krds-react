import { ReactNode, useState, RefObject } from 'react';

import styles from './ContactTable.module.scss';

import { Button, IconButton } from '@/components/uiux/buttons';
import {Icon, Badge, CheckBox, HiSelectBox} from '@/components/uiux';

import NoData from '@/components/uiux/noData';
import { getContactsIds } from '@/components/text/utils';

import { CONTACT_LABELS, phoneNumberFields } from '@/components/text/constants';
import { Contact, ContactWithValidation } from '@/components/text/types';

export interface TableOption {
  caption: string;
  tableStyle: string | null;
  showAllCheckbox?: boolean;
  showPhoneNumberCheckBox?: boolean;
  showEmptyBody: boolean;
  formType?: boolean;
}

interface ContactTableProps {
  ref: RefObject<HTMLTableElement>;
  children: ReactNode;
  isAllChecked?: boolean;
  isColumnChecked?: {
    phoneNumber: boolean;
    phoneNumberParent1: boolean;
    phoneNumberParent2: boolean;
  };
  tableOption: TableOption;
  contacts: ContactWithValidation[] | Contact[];
  emptyMessage?: string;
  onChangeAllCheckbox?: (isChecked: boolean) => void;
  onChangeColumnCheckbox?: (isChecked: boolean, fieldKey: string) => void;
  onReset?: () => void;
  renderColGroup?: () => ReactNode;
}

export const ContactTable = ({
  ref,
  children,
  tableOption,
  isAllChecked,
  isColumnChecked,
  contacts,
  emptyMessage,
  onChangeAllCheckbox,
  onChangeColumnCheckbox,
  onReset,
  renderColGroup,        // 테이블 컬럼그룹 커스텀 렌더링 함수
}: ContactTableProps) => {
  const { contactIds, contactParent1Ids, contactParent2Ids, allContactIds } = getContactsIds(contacts);
  
  const handleChangeAllCheckbox = (isChecked: boolean) => {
    onChangeAllCheckbox(isChecked);
  };

  const handleChangeColumnCheckbox = (isChecked: boolean, fieldKey: string) => {
    onChangeColumnCheckbox(isChecked, fieldKey);
  }

  const showNoData = tableOption.showEmptyBody && contacts.length <= 0;
  return (
    <div
      ref={ref}
      className={`
        ${showNoData ? styles.tableNodata : ''}
        ${tableOption.tableStyle ? [styles[tableOption.tableStyle], tableOption.tableStyle].join(' ') : styles.contactTable}
        ${tableOption.formType ? 'table-form' : ''}
        table-content table-box sticky-wrap
      `}
    >
      <table>
        <caption>{tableOption.caption}</caption>
        {renderColGroup ? renderColGroup() : (
          <colgroup>
            <col style={{ width: '40px', minWidth: '40px' }} />
            <col style={{ width: '153px', minWidth: '153px' }} />
            <col style={{ width: '153px', minWidth: '153px' }} />
            <col style={{ width: '65px', minWidth: '65px' }} />
            <col style={{ width: '223px', minWidth: '223px' }} />
            <col style={{ width: '200px', minWidth: '200px' }} />
            <col style={{ width: '200px', minWidth: '200px' }} />
            <col style={{ width: '200px', minWidth: '200px' }} />
          </colgroup>
        )}
        <thead>
        <tr>
          <th className="sticky-top">
            {tableOption.showAllCheckbox ? (
              <CheckBox
                checked={isAllChecked}
                onChange={handleChangeAllCheckbox}
                disabled={contacts.length <= 0 || (tableOption.showPhoneNumberCheckBox && allContactIds.length <= 0)}
                className="align-middle"
              />
            ):(
                contacts.length > 0 && onReset && (
                  <Icon icon="close" className="p-1 cursor-pointer bg-text-neutral-stronger" color="gray" onClick={onReset} />
                )
            )}
          </th>
          {Object.entries(CONTACT_LABELS).map(([key, value], index) => {
            const targetIds = {
              phoneNumber: contactIds,
              phoneNumberParent1: contactParent1Ids,
              phoneNumberParent2: contactParent2Ids,
            }[key];
            return (
              <th key={`header-${index}`} 
              className={`sticky-top${tableOption.showPhoneNumberCheckBox && phoneNumberFields.includes(key) && !showNoData ? ' !text-left' : ''}`}>
                {tableOption.showPhoneNumberCheckBox &&
                  phoneNumberFields.includes(key) &&
                  !showNoData &&
                  <CheckBox
                    checked={targetIds.length > 0 && isColumnChecked[key]}
                    disabled={targetIds.length <= 0}
                    onChange={(isChecked: boolean) => handleChangeColumnCheckbox(isChecked, key)}
                    className="mr-2"
                  />
                }
                {(tableOption.tableStyle === 'batchImportTable') && (key === 'depth1GroupName' || key === 'depth2GroupName') ? (
                  <>
                    <span className="text-graphic-coral">*</span>
                    {value}
                  </>
                ) : (
                  <>{value}</>
                )}
              </th>
            );
          })}
        </tr>
        </thead>
        <ContactTableBody
          contacts={contacts}
          showEmptyBody={tableOption.showEmptyBody}
          emptyMessage={emptyMessage}
        >
          {children}
        </ContactTableBody>
      </table>
      {showNoData && (
        <NoData message={emptyMessage ?? '리스트가 없습니다'} size="md" className={styles.noData}/>
      )}
    </div>
  );
};

interface BatchImportTableBodyProps {
  children: ReactNode;
  contacts: ContactWithValidation[] | Contact[];
  showEmptyBody: boolean;
  emptyMessage?: string;
}

const ContactTableBody = ({ children }: BatchImportTableBodyProps) => {
  return (
    <tbody>
      {children}
    </tbody>
  );
};

// 문자 2차 범위 : 언어 선택 박스 수정
export const LanguageSelectBox = () => {
  const [language, setLanguage] = useState<number | null>(null);

  // 언어 선택 아이템
  const languageItems: { value: number; title: string; label: string }[] = [
    { value: 1, title: '한국어 (선택 안함)', label: '한국어' },
    { value: 2, title: '영어 (English)', label: '영어' },
    { value: 3, title: '일어 (日本語)', label: '일어' },
    { value: 4, title: '중국어 (中文)', label: '중국어' },
    { value: 5, title: '베트남어 (Tiếng Việt)', label: '베트남' },
  ];

  return (
    <div className="inline-block absolute right-0 z-1 top-[50%] translate-y-[-50%]">
      <HiSelectBox
        className="border-0"
        value={language}
        items={languageItems}
        onChange={setLanguage}
        emptyTitle="언어 선택"
        optionLayerStyle={{ transform: 'translate(-130px, 0px)' }}
        renderTrigger={({ toggle, value, getLabel }) =>
          value == null ? (
            <Button variant="link" onClick={toggle} className="w-11 h-10 p-2.5 ">
              <Icon icon="global" className="w-8 h-8 rounded p-2.5 hover:bg-bg-primary-subtler"  />
            </Button>
          ) : (
            <Button variant="link" onClick={toggle} className="h-full mr-2 transition-none">
              <Badge size="sm" variant="purple">
                {languageItems.find((item) => item.value === value)?.label ?? getLabel(value)}
              </Badge>
            </Button>
          )
        }
      />
    </div>
  );
};
