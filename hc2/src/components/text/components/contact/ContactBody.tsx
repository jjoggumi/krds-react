import { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';

import moment from 'moment';

import styles from './ContactBody.module.scss';

import { ContactEmpty } from '@/components/text/components/contact/ContactEmpty';
import { ContactHistoryModal } from '@/components/text/components/contact/modal/ContactHistoryModal';
import { ContactDownloadModal } from '@/components/text/components/contact/modal/ContactDownloadModal';
import { ContactTable } from '@/components/text/components/contact/ContactTable';
import { HiButton, Card, Icon, ShowConfirm, CONFIRM_OPTIONS, HiInput, Loading, TitleArea } from '@/components/uiux';

import { useContact, useContactMutation } from '@/components/text/queries/useContact';
import { useTextContext } from '@/components/text/context/TextContext';
import { useContactGroupContext } from '@/components/text/context/ContactContext';
import { useApiErrorHandler } from '@/components/text/hooks/apiErrorHandler';
import { VirtualItem } from '@tanstack/react-virtual';

import { ContactGroupDepthType, ContactWithValidation } from '@/components/text/types/contact';

import { isEmpty } from '@/utils/validate';
import { generateContactWithValidation, getContactValidation } from '@/components/text/utils/contact';
import { useLocation } from 'react-router-dom';
import { UpdateChangeType } from '@/components/text/types';
import { ContactTableRow } from '@/components/text/components/contact/ContactTableRow';
import { CONTACT_LABELS, phoneNumberFields } from '@/components/text/constants';
import { dispatchRouteChange } from '@/components/text/utils';
import { MaskingProvider } from '../../context/MaskingContext';
import { useVirtualRows } from '@/components/text/hooks/virtualRows';
import { useGridNavigation } from '@/components/text/hooks/gridNavigation';
import { Download, ChevronRight } from 'lucide-react';
import {
  STAGGER_CONTAINER_VARIANTS,
  FADE_IN_UP_VARIANTS,
  FADE_IN_UP_ORDERED_VARIANTS,
} from '@/components/text/constants/animations';
import { useLoadingContext } from '../../context/LoadingContext';

type ContactBodyProps = {
  className?: string;
  onOpenModal: () => void;
  onReadyDownload: (fileName: string, options: { reasonItem: any }) => void;
};

const DEFAULT_CONTACTS_DATA = { contacts: [], totalCount: 0, changeTimestamp: null };

export const ContactBody = ({ className, onOpenModal, onReadyDownload }: ContactBodyProps) => {
  const { state } = useLocation();
  const keyword = state.keyword || '';

  const { currentSchool } = useTextContext();
  const { groups, selectedGroupId, selectedGroup, selectedGroupName, selectedParentGroupId, selectedParentGroup, isGroupsPending } = useContactGroupContext();
  const { showLoading, hideLoading } = useLoadingContext();

  const { handleError } = useApiErrorHandler();
  
  const [contactsWithValidation, setContactsWithValidation] = useState<ContactWithValidation[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedTempIds, setSelectedTempIds] = useState<string[]>([]);
  const [localChangeTimestamp, setLocalChangeTimestamp] = useState<number | null>(null);

  const { isError, error, isPending: isContactsPending, data, isLoading } = useContact(currentSchool.schoolId, {
    groupId: state.groupId || undefined,
    depthType: state.groupId ? ContactGroupDepthType.DEPTH2 : null,
    keyword: state.keyword || undefined,
  }, true);
  const { createContactMutateAsync, updateContactMutateAsync } = useContactMutation();

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const openChangeHistoryModal = () => setIsHistoryOpen(true);
  const closeChangeHistoryModal = () => setIsHistoryOpen(false);

  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const closeDownloadModal = () => setIsDownloadOpen(false);
  
  const handleIsReadyDownload = (reasonItem: any, fileName: string) => {
    setIsDownloadOpen(false);
    onReadyDownload(fileName, { reasonItem });
  };
  
  const { contacts, totalCount, changeTimestamp } = data || DEFAULT_CONTACTS_DATA;
  const contactIds = contacts.filter(c => c.contactId).map(c => c.contactId);

  const [contactTotalCount, setContactTotalCount] = useState(totalCount);

  const [tempContacts, setTempContacts] = useState<ContactWithValidation[]>([]);
  const tempIds = tempContacts.map(c => c.tempId);

  const allSelectedIds = [...selectedIds, ...selectedTempIds];
  const isAllChecked = [...contactIds, ...tempIds].length > 0 && [...contactIds, ...tempIds].every(id => allSelectedIds.includes(id));

  const allContactsWithValidation = [...contactsWithValidation, ...tempContacts];
  const { virtualRows, virtualRowsParentRef, paddingTop, bottom } = useVirtualRows({
    estimateSize: 40,
    overscan: 7,
    getItemKey: (index: number) => allContactsWithValidation[index].contactId || allContactsWithValidation[index].tempId,
    rows: allContactsWithValidation
  });

  const maxRow = allContactsWithValidation.length + 1;
  const maxCell = Object.keys(CONTACT_LABELS).length;
  const startCellIndex = 2;
  const { handleChangeFocusedInput, focusedCell, setFocusedCell } = useGridNavigation({ maxRow, maxCell, startCellIndex });

  useEffect(() => {
    setSelectedIds([]);
    setTempContacts([]);
  }, [selectedGroupId]);

  useEffect(() => {
    if (!selectedParentGroup) return;
    const depth1GroupName = selectedParentGroup.groupName;
    setTempContacts((prev: ContactWithValidation[]) => prev.map(p => {
      return { ...p, depth1GroupName }
    }));
  }, [selectedParentGroup]);

  useEffect(() => {
    if (!selectedGroup) return;
    const depth2GroupName = selectedGroup.groupName;
    setTempContacts((prev: ContactWithValidation[]) => prev.map(p => {
      return { ...p, depth2GroupName }
    }));
  }, [selectedGroup]);

  useEffect(() => {
    setLocalChangeTimestamp(changeTimestamp);
  }, [changeTimestamp]);

  useEffect(() => {
    if (contactTotalCount !== contacts.length) {
      setContactTotalCount(contacts.length);
    }
    setContactsWithValidation(
      contacts.map((c) => {
        return {
          ...c,
          valid: getContactValidation(c, ['depth1GroupName', 'depth2GroupName', 'contactName'])
        };
      })
    );
  }, [contacts]);

  const handleUpdateContactRow = async (row: ContactWithValidation, initValue: string, updatedField: string) => {
    try {
      if (row.contactId) {
        await updateContact(row, updatedField, initValue);
      } else {
        await createContact(row);
      }

      setContactsWithValidation((prev: ContactWithValidation[]) => {
        return prev.map((prevContact) => (prevContact.contactId === row.contactId ? row : prevContact));
      });
    } catch (e) {
      handleError(e);
    }
  };

  const createContact = async (row: ContactWithValidation) => {
    const contactForCreate = {
      groupId: row.depth2GroupId || selectedGroupId,
      contactName: row.contactName,
      studentNumber: row.studentNumber,
      phoneNumber: row.phoneNumber,
      phoneNumberParent1: row.phoneNumberParent1,
      phoneNumberParent2: row.phoneNumberParent2,
      depth1GroupName: selectedGroupName[0],
      depth2GroupName: selectedGroupName[1]
    };

    await createContactMutateAsync({ schoolId: currentSchool.schoolId, contactForCreate, parentGroupId: selectedParentGroupId });

    setTempContacts((prev) => {
      return prev.filter(p => p.tempId !== row.tempId);
    })
  }

  const updateContact = async (row: ContactWithValidation, updatedField: string, initValue: string) => {
    const contactForUpdate = {
      groupId: row.depth2GroupId || selectedGroupId,
      contactId: row.contactId,
      [updatedField]: row[updatedField]
    };

    if (phoneNumberFields.includes(updatedField)) {
      contactForUpdate.updateChangeType = isEmpty(initValue) ? UpdateChangeType.CURRENT : null;
    }

    const res = await updateContactMutateAsync({ schoolId: currentSchool.schoolId, contactForUpdate, updatedField });
    if (res[0].sameCount) {
      const sameCount = res[0].sameCount;

      if (sameCount === 0) {
        contactForUpdate.updateChangeType = UpdateChangeType.CURRENT;
        await updateContactMutateAsync({ schoolId: currentSchool.schoolId, contactForUpdate, updatedField });
      } else {
        const isBatchUpdate = await ShowConfirm(`주소록 내에 동일한 휴대폰 번호가 ${sameCount}건 존재합니다.\n일괄 변경하시겠습니까?`, {
          ...CONFIRM_OPTIONS.TEXT,
          confirmLabel: '일괄 변경',
          cancelLabel: '현재 건만 변경',
        })
        contactForUpdate.updateChangeType = isBatchUpdate ? UpdateChangeType.BATCH : UpdateChangeType.CURRENT;
        await updateContactMutateAsync({ schoolId: currentSchool.schoolId, contactForUpdate, updatedField });
      }
    }
  }

  const handleCheckRow = (contactId: string, isChecked: boolean, isTemp: boolean) => {
    if (isTemp) {
      const newSelectedIds = isChecked ?
        Array.from(new Set([...selectedTempIds, contactId])) :
        selectedTempIds.filter(id => id !== contactId);
      setSelectedTempIds(newSelectedIds);
    } else {
      const newSelectedIds = isChecked ?
        Array.from(new Set([...selectedIds, contactId])) :
        selectedIds.filter((id) => id !== contactId);
      setSelectedIds(newSelectedIds);
    }
  }

  const handleCheckAll = (isChecked: boolean) => {
    if (isChecked) {
      setSelectedIds(contactIds);
      setSelectedTempIds(tempIds);
    } else {
      setSelectedIds([]);
      setSelectedTempIds([]);
    }
  }

  const handleAddRow = () => {
    setTempContacts((prev: ContactWithValidation[]) => {
      return [...prev, generateContactWithValidation({ depth1GroupName: selectedGroupName[0], depth2GroupName: selectedGroupName[1] })];
    });
  };

  const handleDeleteTempContacts = () => {
    const newContacts = tempContacts.filter(c => !selectedTempIds.includes(c.tempId));
    setTempContacts(newContacts);
  }

  const handleResetSelectedIds = () => {
    setSelectedIds([]);
    setSelectedTempIds([]);
  }

  if (isGroupsPending) {
    return <></>;
  }

  return (
    <motion.div
      className={`${styles.contactBody} ${className ?? ''}`}
      initial="hidden"
      animate="visible"
      variants={STAGGER_CONTAINER_VARIANTS}
    >
      {groups.length === 0 ? (
        <ContactEmpty onOpenModal={onOpenModal} />
      ) : (
        <>
          <motion.div custom={0} variants={FADE_IN_UP_ORDERED_VARIANTS}>
            <ContactTitleArea
              totalCount={contactTotalCount}
              localChangeTimestamp={localChangeTimestamp}
              keyword={keyword}
              openChangeHistoryModal={openChangeHistoryModal}
            />
          </motion.div>

          {isEmpty(keyword) && (
            <motion.div custom={0} variants={FADE_IN_UP_ORDERED_VARIANTS}>
              <Card variant="lightgray" size="md" className="mb-5">
                <ul className="flex flex-col gap-1">
                  <li className="text-leading-b3">• 주소록 등록 및 수정은 권한이 있는 교직원만 가능합니다.</li>
                  <li className="text-leading-b3">• 주소록에서 수정한 사항은 학교알리미 학급명단에 반영되지 않으니 유의해 주세요.</li>
                  <li className="text-leading-b3">• 휴대폰 번호 수정 시, 동일한 번호가 여러 개라면 '일괄 변경' 기능을 통해 한 번에 변경 하실 수 있습니다.</li>
                  {/*다국어 설정 1차 제외*/}
                  {/*<li>*/}
                  {/*  · 다국어 설정을 하시면 메시지 수신 시 설정된 언어로 자동 번역되어 발송됩니다. (*휴대폰 번호 마우스 오버 &gt; 언어 아이콘 클릭 &gt;*/}
                  {/*  언어설정)*/}
                  {/*</li>*/}
                </ul>
              </Card>
            </motion.div>
          )}

          {isContactsPending ? (
            <></>
          ) : (
            <>
              <motion.div custom={0} variants={FADE_IN_UP_ORDERED_VARIANTS}>
                <TableButtons
                  selectedIds={selectedIds}
                  allSelectedIds={allSelectedIds}
                  keyword={keyword}
                  onOpenModal={() => setIsDownloadOpen(true)}
                  onAddRow={handleAddRow}
                  onDeleteTempContacts={handleDeleteTempContacts}
                  onResetSelectedIds={handleResetSelectedIds}
                />
              </motion.div>
              <motion.div custom={1} variants={FADE_IN_UP_ORDERED_VARIANTS}>
                <MaskingProvider>
                  <ContactTable
                    ref={virtualRowsParentRef}
                    tableOption={{
                      caption: '주소록',
                      tableStyle: 'addListTable',
                      showAllCheckbox: true,
                      showEmptyBody: true,
                      formType: true,
                    }}
                    isAllChecked={isAllChecked}
                    contacts={allContactsWithValidation}
                    emptyMessage={isEmpty(keyword) ? '리스트가 없습니다' : '검색 결과가 없습니다.'}
                    onChangeAllCheckbox={handleCheckAll}
                  >
                    <>
                      {paddingTop > 0 && (
                        <tr key="spacer-top" aria-hidden="true">
                          <td colSpan={Object.keys(CONTACT_LABELS).length} style={{ height: paddingTop }} />
                        </tr>
                      )}
                      {virtualRows.map((virtualRow: VirtualItem) => {
                        const contact = allContactsWithValidation[virtualRow.index];
                        const isTemp = !contact.contactId;
                        const id = isTemp ? contact.tempId : contact.contactId;
                        const isRowChecked = allSelectedIds.includes(id);

                        return (
                          <ContactTableRow
                            key={id}
                            contact={contact}
                            isTemp={isTemp}
                            isRowChecked={isRowChecked}
                            rowIndex={virtualRow.index}
                            onUpdateContactsRow={handleUpdateContactRow}
                            onChangeRowCheckbox={handleCheckRow}
                            handleChangeFocusedInput={handleChangeFocusedInput}
                            focusedCell={focusedCell}
                            setFocusedCell={setFocusedCell}
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
              </motion.div>
              {isHistoryOpen &&
                <ContactHistoryModal
                  isOpen={isHistoryOpen}
                  onClose={closeChangeHistoryModal}
                  setLocalChangeTimestamp={setLocalChangeTimestamp}
                />
              }

              {isDownloadOpen &&
                <ContactDownloadModal
                  isOpen={isDownloadOpen}
                  keyword={keyword}
                  onClose={closeDownloadModal}
                  onSuccess={handleIsReadyDownload}
                />
              }
            </>
          )}
        </>
      )}
    </motion.div>
  );
};

interface TitleProps {
  totalCount: number;
  localChangeTimestamp: number | null;
  keyword: string | null;
  openChangeHistoryModal: () => void;
}

const ContactTitleArea = ({ totalCount, localChangeTimestamp, keyword, openChangeHistoryModal }: TitleProps) => {
  const { state } = useLocation();
  const { selectedGroupName } = useContactGroupContext();

  const [inputValue, setInputValue] = useState<string>('');

  useEffect(() => {
    setInputValue(keyword);
  }, [keyword]);

  const groupTitle = `${selectedGroupName.join(' ')} (${totalCount.toLocaleString()}명)`;
  const searchedTitle = `검색 결과 (${totalCount}건)`;

  const handleClickHistory = () => {
    openChangeHistoryModal();
  };

  const handleSearch = () => {
    const query: { groupId: string; keyword?: string } = { groupId: state.groupId };
    if (!isEmpty(inputValue)) {
      query.keyword = inputValue;
    }
    dispatchRouteChange({ menu: 'contact', query });
  };

  return (
    <TitleArea level={2} variant="col" className={`${styles.title2} gap-[9px] mb-5 ${!isEmpty(keyword) ? 'items-center min-h-10' : ''}`}>
      <TitleArea.Title>{!isEmpty(keyword) ? searchedTitle : groupTitle}</TitleArea.Title>
      {isEmpty(keyword) && (
        <TitleArea.Summary>
          <HiButton variant="underline" className="" onClick={handleClickHistory}>
            <span className='flex items-center'>
              변경 이력
              {localChangeTimestamp && ` (${moment(localChangeTimestamp).format('YYYY.MM.DD HH:mm:ss')})`}
              <ChevronRight size={18} className="stroke-text-primary-base" />
            </span>
          </HiButton>
        </TitleArea.Summary>
      )}
      <TitleArea.Etc>
        <HiInput
          value={inputValue}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
          placeholder="이름, 휴대폰 번호(숫자만) 검색"
          showSearch
          wrapStyle={{ width: '320px' }}
          onSearch={handleSearch}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') handleSearch();
          }}
        />
      </TitleArea.Etc>
    </TitleArea>
  );
};

interface TableButtonsProps {
  selectedIds: string[];
  allSelectedIds: string[];
  keyword: string;
  onOpenModal: () => void;
  onAddRow: () => void;
  onDeleteTempContacts: () => void;
  onResetSelectedIds: () => void;
}
const TableButtons = ({ selectedIds, allSelectedIds, keyword, onOpenModal, onAddRow, onDeleteTempContacts, onResetSelectedIds }: TableButtonsProps) => {
  const { currentSchool } = useTextContext();
  const { selectedGroupId, selectedParentGroupId } = useContactGroupContext();
  const { deleteContactMutateAsync } = useContactMutation();
  const { handleError } = useApiErrorHandler();

  const isShowAddButton = selectedGroupId && isEmpty(keyword);

  const handleClickDownload = () => {
    onOpenModal();
  }

  const handleDeleteRows = async () => {
    const isDelete = await ShowConfirm('한번 삭제한 명단은 복구할 수 없습니다.\n정말 삭제하시겠습니까?', {
      ...CONFIRM_OPTIONS.TEXT,
      confirmLabel: '삭제',
      cancelLabel: '취소',
    });
    if (!isDelete) return;

    if (selectedIds.length > 0) {
      try {
        await deleteContactMutateAsync({
          schoolId: currentSchool.schoolId,
          contactForDelete: {
            groupId: selectedGroupId || null,
            contactIds: selectedIds
          },
          parentGroupId: selectedParentGroupId
        })
      } catch (e) {
        await handleError(e);
      }
    }

    onDeleteTempContacts();
    onResetSelectedIds();
  };

  const handleClickAddRow = () => {
    onAddRow();
  };

  return (
    <div className="flex items-center justify-between w-full mb-3">
      <div className="flex items-center gap-4">
        <div className="gap-2 flex">
          <HiButton style={{ minWidth: 95 }} variant="secondary" disabled={allSelectedIds.length === 0} onClick={handleDeleteRows}>
            {`${allSelectedIds.length.toLocaleString()}명 삭제`}
          </HiButton>
          {
            isShowAddButton &&
            <HiButton variant="primary" onClick={handleClickAddRow}>
              추가
            </HiButton>
          }
        </div>
      </div>
      <div className="btn-area gap-2">
        <HiButton variant="tertiaryBlue" onClick={handleClickDownload}>
          <Download size={18} className="stroke-text-primary-base" />
          명단 다운로드
        </HiButton>
      </div>
    </div>
  );
};
