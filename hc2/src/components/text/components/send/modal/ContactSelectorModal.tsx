import { useState, KeyboardEvent, MouseEvent, ChangeEvent, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';

import styles from './ContactSelectorModal.module.scss';
import { HiButton, Card, HiInput, ShowConfirm, CONFIRM_OPTIONS } from '@/components/uiux';
import SideModal from '@/components/uiux/sideModal';
import { ContactGroupList } from '@/components/text/components/contact/ContactGroupList';
import { ContactTable } from '@/components/text/components/contact/ContactTable';

import { ContactGroupContextProvider, useContactGroupContext } from '@/components/text/context/ContactContext';
import { useContact } from '@/components/text/queries/useContact';
import {
  Contact,
  ContactGroupDepthType,
  ContactWithValidation, SendTargetType,
  SendTargetWithValidation,
} from '@/components/text/types';
import { useTextContext } from '@/components/text/context/TextContext';

import { isEmpty, isErrorPhoneNumber } from '@/utils/validate';
import { SendTarget } from '@/components/text/types/send';
import { getContactsIds } from '@/components/text/utils';
import { SendTargetSelectorTableRow } from '@/components/text/components/send/SendTargetSelectorTableRow';
import { MaskingProvider } from '@/components/text/context/MaskingContext';
import { ApiError } from '@/components/text/api/error';
import { useLoadingContext } from '@/components/text/context/LoadingContext';
import { useVirtualRows } from '@/components/text/hooks/virtualRows';
import { CONTACT_LABELS } from '@/components/text/constants';
import { VirtualItem } from '@tanstack/react-virtual';

interface ContactSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateSendTargets: (targets: SendTargetWithValidation[]) => void;
}

export const ContactSelectorModal = ({ isOpen, onClose, onUpdateSendTargets }: ContactSelectorModalProps) => {
  const { showLoading, hideLoading } = useLoadingContext();

  const [selectedSendTargets, setSelectedSendTargets] = useState<SendTarget[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const isClickButton = useRef(false);

  const handleUpdateSelectedSendTargets = (newTargets: SendTarget[]) => {
    setSelectedSendTargets(newTargets);
  }

  const handleClickSelectButton = (e: MouseEvent<HTMLButtonElement>) => {
    if (isClickButton.current) return;

    isClickButton.current = true;
    showLoading();

    const newTargets: SendTargetWithValidation[] = selectedSendTargets.map(t => ({
      ...t,
      field1: '',
      field2: '',
      field3: '',
      field4: '',
      field5: '',
      field6: '',
      field7: '',
      field8: '',
      valid: {
        phoneNumber: !isEmpty(t.phoneNumber) && !isErrorPhoneNumber(t.phoneNumber),
      },
      isDuplication: false
    }));
    onUpdateSendTargets(newTargets);

    hideLoading();
    isClickButton.current = false;
    onClose();
  };

  return (
    <AdaptivePortal>
      <SideModal
        isOpen={isOpen}
        onClose={onClose}
        heading="주소록 불러오기"
        size="xl"
        className={styles.contactSelector}
        footer={
          <>
            <HiButton variant="tertiaryBlue" className="btn-lg w-47.5!" onClick={onClose}>
              취소
            </HiButton>
            <HiButton
              variant="primary"
              className=" w-47.5!"
              onClick={handleClickSelectButton}
              disabled={selectedSendTargets.length === 0}
            >
              선택 완료
            </HiButton>
          </>
        }
      >
        <div className="flex gap-10">
          <ContactGroupContextProvider isPermissionRequired={false}>
            <ContactGroupList
              //className="max-h-[calc(100vh-276px)]"
              isChangeRouteMode={false}
              isEditable={false}
              keyword={searchKeyword}
              setKeyword={setSearchKeyword}
            />
            <ContactContainer
              searchKeyword={searchKeyword}
              setSearchKeyword={setSearchKeyword}
              selectedSendTargets={selectedSendTargets}
              onUpdateSelectedSendTargets={handleUpdateSelectedSendTargets}
              onClose={onClose}
            />
          </ContactGroupContextProvider>
        </div>
      </SideModal>
    </AdaptivePortal>
  );
};

const AdaptivePortal = ({ children }) => {
  const mountNode = document.getElementById('contact-selector-modal');

  if (mountNode) {
    return createPortal(children, mountNode);
  }

  return <>{children}</>;
};

interface ContactContainerProps {
  searchKeyword: string;
  setSearchKeyword: (keyword: string) => void;
  selectedSendTargets: SendTarget[];
  onUpdateSelectedSendTargets: (targets: SendTarget[]) => void;
  onClose: () => void;
}

const DEFAULT_CONTACTS = { contacts: [] };

const ContactContainer = ({ searchKeyword, setSearchKeyword, selectedSendTargets, onUpdateSelectedSendTargets, onClose }: ContactContainerProps) => {
  const { currentSchool } = useTextContext();
  const { selectedGroupId, selectedParentGroupId } = useContactGroupContext();

  const [keyword, setKeyword] = useState<string>(searchKeyword);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    generateSendTargets();
  }, [selectedIds]);

  useEffect(() => {
    setKeyword(searchKeyword);
  }, [searchKeyword]);

  const selectedLabelGroupByDepth1 = useMemo(() => {
    return selectedSendTargets.reduce(
      (acc, target) => {
        if (!target) return acc;

        if (!acc[target.depth1]) {
          acc[target.depth1] = 1;
        } else {
          acc[target.depth1] += 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );
  }, [selectedSendTargets]);

  const { isError, error, isPending, data } = useContact(currentSchool.schoolId, {
    groupId: selectedGroupId,
    depthType: selectedGroupId ?
      (selectedGroupId === selectedParentGroupId ? ContactGroupDepthType.DEPTH1 : ContactGroupDepthType.DEPTH2) :
      null,
    keyword: isEmpty(searchKeyword) ? undefined : searchKeyword,
  }, false);

  useEffect(() => {
    if (isError && error instanceof ApiError) {
      if (error.status === 406) {
        ShowConfirm('주소록 접근 권한이 없어 정보를 불러올 수 없습니다.', {
          ...CONFIRM_OPTIONS.TEXT,
          withCloseButton: true,
          hideCancel: true
        })
        onClose();
      }
    }
  }, [isError, error]);

  const { contacts } = data || DEFAULT_CONTACTS;
  const { contactIds, contactParent1Ids, contactParent2Ids, allContactIds } = getContactsIds(contacts);

  const isAllChecked = selectedIds.length > 0 && allContactIds.length > 0 && allContactIds.every(id => selectedIds.includes(id));
  const isColumnChecked = {
    phoneNumber: selectedIds.length > 0 && contactIds.length > 0 && contactIds.every(id => selectedIds.includes(id)),
    phoneNumberParent1: selectedIds.length > 0 && contactParent1Ids.length > 0 && contactParent1Ids.every(id => selectedIds.includes(id)),
    phoneNumberParent2: selectedIds.length > 0 && contactParent2Ids.length > 0 && contactParent2Ids.every(id => selectedIds.includes(id))
  };

  const { virtualRows, virtualRowsParentRef, paddingTop, bottom } = useVirtualRows({
    estimateSize: 40,
    overscan: 7,
    getItemKey: (index: number) => contacts[index].contactId,
    rows: contacts
  });

  const generateSendTargets = () => {
    const beforeSelectedIds = selectedSendTargets.map(t => t.contactId);
    const newTargets = selectedIds.map(contactId => {
      if (beforeSelectedIds.includes(contactId)) {
        return selectedSendTargets.find(t => t.contactId === contactId);
      }

      const contact = contacts.find(c => Object.values(c).includes(contactId));
      if (!contact) return;

      const [contactIdKey, _] = Object.entries(contact).find(([_, value]) => value === contactId);
      const phoneNumberKey = getPhoneNumberKeyByContactIdFieldName(contactIdKey);

      const sendTargetType = {
        contactId: SendTargetType.STUDENT,
        contactParent1Id: SendTargetType.PARENTS_1,
        contactParent2Id: SendTargetType.PARENTS_2
      }[contactIdKey]

      return {
        contactId: contactId,
        phoneNumber: contact[phoneNumberKey],
        contactName: contact.contactName,
        depth1: contact.depth1GroupName,
        depth2: contact.depth2GroupName,
        sendTargetType
      }
    }).filter(item => item !== undefined);

    onUpdateSelectedSendTargets(newTargets);
  }

  const handleChangeKeywordInput = (e: ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };

  const handleSearch = () => {
    setSearchKeyword(keyword);
  };

  const handleCheckAll = (isChecked: boolean) => {
    const currentGroupIds = contacts.flatMap((c: Contact) => getCheckableContactIds(c));
    const newSelectedIds = isChecked ?
      Array.from(new Set([...selectedIds, ...currentGroupIds])) :
      selectedIds.filter(id => !currentGroupIds.includes(id));
    setSelectedIds(newSelectedIds);
  }

  const handleCheckRow = (contact: Contact, isChecked: boolean) => {
    const contactIds = getCheckableContactIds(contact);
    const newSelectedIds = isChecked ?
      Array.from(new Set([...selectedIds, ...contactIds])) :
      selectedIds.filter(id => !contactIds.includes(id));
    setSelectedIds(newSelectedIds);
  }

  const handleCheckCell = (contactId: string, isChecked: boolean) => {
    const newSelectedIds = isChecked ?
      Array.from(new Set([...selectedIds, contactId])) :
      selectedIds.filter(id => id !== contactId);
    setSelectedIds(newSelectedIds);
  }

  const handleCheckColumn = (isChecked: boolean, fieldKey: string) => {
    const contactIdKey = {
      phoneNumber: 'contactId',
      phoneNumberParent1: 'contactParent1Id',
      phoneNumberParent2: 'contactParent2Id'
    }[fieldKey];

    const contactIds = contacts
      .filter(c => !isEmpty(c[fieldKey]))
      .map(c => c[contactIdKey])
      .filter(id => !isEmpty(id));
    const newSelectedIds = isChecked ?
      Array.from(new Set([...selectedIds, ...contactIds])) :
      selectedIds.filter(id => !contactIds.includes(id));
    setSelectedIds(newSelectedIds);
  }

  const handleClickReset = () => {
    setSelectedIds([]);
  }

  if (isPending) return (<></>);

  return (
    <div className="flex-1 min-w-0 flex flex-col gap-4">
      <HiInput
        value={keyword}
        onChange={handleChangeKeywordInput}
        placeholder="이름, 휴대폰 번호(숫자만) 검색"
        showSearch
        wrapStyle={{ width: '290px', height: 'auto', ml: 'auto' }}
        onSearch={handleSearch}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter') handleSearch();
        }}
      />
      <MaskingProvider>
        <ContactTable
          ref={virtualRowsParentRef}
          tableOption={{
            caption: '주소록 일괄 등록',
            tableStyle: 'sendBatchImportTable',
            showAllCheckbox: true,
            showPhoneNumberCheckBox: true,
            showEmptyBody: true
          }}
          contacts={contacts}
          emptyMessage={isEmpty(searchKeyword) ? '리스트가 없습니다' : '검색 결과가 없습니다.'}
          isAllChecked={isAllChecked}
          isColumnChecked={isColumnChecked}
          onChangeAllCheckbox={handleCheckAll}
          onChangeColumnCheckbox={handleCheckColumn}
          renderColGroup={() => (
            <colgroup>
              <col style={{ width: '50px', minWidth: '50px' }} />
              <col style={{ width: 'auto', minWidth: '160px' }} />
              <col style={{ width: 'auto', minWidth: '160px' }} />
              <col style={{ width: '65px', minWidth: '65px' }} />
              <col style={{ width: 'auto', minWidth: '160px' }} />
              <col style={{ width: 'auto', minWidth: '160px' }} />
              <col style={{ width: 'auto', minWidth: '160px' }} />
              <col style={{ width: 'auto', minWidth: '160px' }} />
            </colgroup>
          )}
        >
          <>
            {paddingTop > 0 && (
              <tr key="spacer-top" aria-hidden="true">
                <td colSpan={Object.keys(CONTACT_LABELS).length} style={{ height: paddingTop }} />
              </tr>
            )}
            {virtualRows.map((virtualRow: VirtualItem) => {
              const contact = contacts[virtualRow.index];
              const isRowChecked = getCheckableContactIds(contact).length > 0 && getCheckableContactIds(contact).every(id => selectedIds.includes(id));

              return (
                <SendTargetSelectorTableRow
                  key={contact.contactId}
                  contact={contact}
                  selectedIds={selectedIds}
                  isShowCheckbox={getCheckableContactIds(contact).length > 0}
                  isRowChecked={isRowChecked}
                  onChangeRowCheckbox={handleCheckRow}
                  onChangeCellCheckbox={handleCheckCell}
                />
              )
            })}
            {bottom > 0 && (
              <tr key="spacer-bottom" aria-hidden="true">
                <td colSpan={Object.keys(CONTACT_LABELS).length} style={{ height: bottom }} />
              </tr>
            )}
          </>

        </ContactTable>
      </MaskingProvider>
      <Card variant="lightblue" size="md" className="flex gap-10 items-center !bg-bg-secondary-subtlest !border-0">
        <HiButton variant="tertiaryBlue" onClick={handleClickReset} disabled={selectedSendTargets.length === 0}>
          선택 초기화
        </HiButton>
        <div className="flex flex-col gap-0.5">
          <div className="text-leading-b2 font-medium">
            총 <span className="text-text-primary-base">{selectedSendTargets.length.toLocaleString()}</span>명
          </div>
          <div className="text-leading-b3">
            {selectedSendTargets.length === 0 ? (
              <span className="text-text-neutral-strong">선택된 인원이 없습니다.</span>
            ) : (
              <span className="text-text-primary-base">
                {Object.entries(selectedLabelGroupByDepth1)
                  .map(([key, value]) => `${key} ${value.toLocaleString()}명`)
                  .join(', ')}
              </span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

const getCheckableContactIds = (contact: ContactWithValidation | Contact) => {
  const targets = [
    { idKey: 'contactId', phone: contact.phoneNumber },
    { idKey: 'contactParent1Id', phone: contact.phoneNumberParent1 },
    { idKey: 'contactParent2Id', phone: contact.phoneNumberParent2 },
  ];

  return targets
    .filter((t) => !isEmpty(t.phone))
    .map((t) => contact[t.idKey]);
}

const getPhoneNumberKeyByContactIdFieldName = (contactIdFieldName: string) => {
  return {
    contactId: 'phoneNumber',
    contactParent1Id: 'phoneNumberParent1',
    contactParent2Id: 'phoneNumberParent2'
  }[contactIdFieldName];
}
