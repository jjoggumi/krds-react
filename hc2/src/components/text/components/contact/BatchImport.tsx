import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';

import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';

import { CONTACT_LABELS, CONTACT_LIMITS } from '@/components/text/constants';

import { Card, HiIcon, ShowConfirm, CONFIRM_OPTIONS, HiButton } from '@/components/uiux';
import SideModal from '@/components/uiux/sideModal';
import { ContactTable } from '@/components/text/components/contact/ContactTable';

import { useBatchCreateContact } from '@/components/text/queries/useContact';
import { useContactGroupContext } from '@/components/text/context/ContactContext';
import { useTextContext } from '@/components/text/context/TextContext';
import { useQueryClient } from '@tanstack/react-query';



import {
  dispatchRouteChange,
  downloadFromUrl, getContactValidation,
  isEmptyRow,
  showUploadFileInvalidAlert,
  showUploadFileResetAlert,
} from '@/components/text/utils';

import { Contact, ContactWithValidation } from '@/components/text/types/contact';
import { TextAuthority } from '@/components/text/types';
import {
  BatchImportTableEmptyRow,
  BatchImportTableRow,
} from '@/components/text/components/contact/BatchImportTableRow';
import { showToast } from '@/unimplementeds/toast';
import { useMaskingContext } from '../../context/MaskingContext';
import { useApiErrorHandler } from '@/components/text/hooks/apiErrorHandler';
import { useLoadingContext } from '@/components/text/context/LoadingContext';
import { useVirtualRows } from '@/components/text/hooks/virtualRows';
import { VirtualItem } from '@tanstack/react-virtual';
import { useGridNavigation } from '@/components/text/hooks/gridNavigation';
import { contactKeys } from '@/components/text/queries/keys';
import { Upload } from 'lucide-react';

interface ContactBatchImportProps {
  isOpen: boolean;
  onClose: () => void;
  onReadyDownload: (fileName: string, options: { isEletter?: boolean }) => void;
}

export const BatchImport = ({ isOpen, onClose, onReadyDownload }: ContactBatchImportProps) => {
  const { currentSchool } = useTextContext();
  const { onSelectAll } = useContactGroupContext();
  const { showLoading, hideLoading } = useLoadingContext();
  const maskingContext = useMaskingContext();
  const queryClient = useQueryClient();

  const {
    createContactsAllMutateAsync,
    createContactsAllAddMutateAsync
  } = useBatchCreateContact();

  const { handleError } = useApiErrorHandler();

  const [contacts, setContacts] = useState<ContactWithValidation[]>([]);
  const filteredContacts = contacts.filter((c) => !isEmptyRow(c));
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setContacts([]);
    }
  }, [isOpen]);

  const isAllValid = useMemo(() => {
    return filteredContacts.length > 0 && filteredContacts.every((c) => Object.values(c.valid).every((v) => v));
  }, [contacts]);

  const { virtualRows, virtualRowsParentRef, paddingTop, bottom } = useVirtualRows({
    estimateSize: 40,
    overscan: 7,
    getItemKey: (index: number) => contacts[index].tempId,
    rows: contacts
  });

  const maxRow = contacts.length + 1;
  const maxCell = Object.keys(CONTACT_LABELS).length;
  const startCellIndex = 0;
  const { handleChangeFocusedInput, focusedCell, setFocusedCell } = useGridNavigation({ maxRow, maxCell, startCellIndex });

  const handleFileInput = async () => {
    const hasOnlyDefaultRow = contacts.length === 1 && isEmptyRow(contacts[0]);
    if (!hasOnlyDefaultRow && contacts.length > 0) {
      const isUpload = await showUploadFileResetAlert();
      if (!isUpload) return;
    }
    fileInputRef.current?.click();
  };

  const handleMasking = () => {
    if(maskingContext) {
      maskingContext.toggleMasked();
    }
  }

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files.length !== 1) return;
    showLoading();

    const file = files[0];

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    readExcelFile(file)
      .then((list) => {
        setContacts(list);
        showToast(`총 ${list.length.toLocaleString()}건이 업로드 되었습니다.`, 2000);
      })
      .finally(() => {
        hideLoading()
      });
  };

  const handleClickDownloadSampleFile = () => {
    const fileName = '주소록 등록 샘플 양식.xls';
    const fileUrl = 'https://download.hiclass.net/static/document/text-contact-upload-form.xls';
    downloadFromUrl(fileName, fileUrl).then();
  }

  const readExcelFile = async (file: File) => {
    const list: ContactWithValidation[] = [];

    const fileBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(fileBuffer, { type: 'array' });

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return list;

    const sheet = workbook.Sheets[sheetName];
    const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });

    const header = rows[0];
    if (!validateHederColumn(header)) {
      await showUploadFileInvalidAlert('text-alert');
      return list;
    }

    rows.forEach((row, rowNum) => {
      if (rowNum === 0) return;
      if (row.length === 0) return;

      const depth1GroupName = row[0]?.substring(0, CONTACT_LIMITS.depth1GroupName).trim() || '';
      const depth2GroupName = row[1]?.substring(0, CONTACT_LIMITS.depth2GroupName).trim() || '';
      const rowStudentNumber = row[2]?.substring(0, CONTACT_LIMITS.studentNumber) || null;
      const contactName = row[3]?.substring(0, CONTACT_LIMITS.contactName).trim() || '';
      const phoneNumber = row[4]?.replaceAll('-', '') || '';
      const phoneNumberParent1 = row[5]?.replaceAll('-', '') || '';
      const phoneNumberParent2 = row[6]?.replaceAll('-', '') || '';
      const studentNumber = rowStudentNumber ? Number(rowStudentNumber) : null
      list.push({
        tempId: uuidv4(),
        depth1GroupName,
        depth2GroupName,
        contactName,
        studentNumber,
        phoneNumber,
        phoneNumberParent1,
        phoneNumberParent2,
        valid: getContactValidation(
          {
            depth1GroupName,
            depth2GroupName,
            contactName,
            studentNumber,
            phoneNumber,
            phoneNumberParent1,
            phoneNumberParent2
          },
          ['depth1GroupName', 'depth2GroupName', 'contactName']
        )
      })
    });

    return list;
  };

  const handleUpdateContactsRow = (row: ContactWithValidation) => {
    setContacts((prev: ContactWithValidation[]) => {
      return prev.map((prevContact) => (prevContact.tempId === row.tempId ? row : prevContact));
    });
  };
  
  const handleAddContactsRow = (row: ContactWithValidation) => {
    setContacts((prev: ContactWithValidation[]) => [...prev, row]);
  };

  const handleDeleteContactById = (tempId: string) => {
    setContacts((prev: ContactWithValidation[]) =>
      prev.filter((c) => c.tempId !== tempId)
    );
  }

  const createContacts = async (isAdd: boolean) => {
    if (!isAllValid) return;

    const confirmMessage = isAdd
      ? '기존 주소록에 추가로 등록하시겠습니까?'
      : '한번 삭제된 주소록은 복구가 불가합니다.\n기존 주소록 삭제 후 새로 등록하시겠습니까?';

    const isCreate = await ShowConfirm(confirmMessage, {      
      ...CONFIRM_OPTIONS.TEXT,
    });

    if (!isCreate) return;

    showLoading();

    const requestContacts: Contact[] = filteredContacts.map((c) => {
      return {
        depth1GroupName: c.depth1GroupName,
        depth2GroupName: c.depth2GroupName,
        studentNumber: c.studentNumber,
        contactName: c.contactName,
        phoneNumber: c.phoneNumber,
        phoneNumberParent1: c.phoneNumberParent1,
        phoneNumberParent2: c.phoneNumberParent2,
      };
    });

    const requestData = {
      schoolId: currentSchool.schoolId,
      contacts: { contacts: requestContacts },
    };

    try {
      const totalCreateCount = isAdd ?
        await createContactsAllAddMutateAsync(requestData) :
        await createContactsAllMutateAsync(requestData);

      await sleep(1500);

      queryClient.invalidateQueries({ queryKey: contactKeys.groups(currentSchool.schoolId) }).then();
      queryClient.invalidateQueries({ queryKey: contactKeys.searchBase(currentSchool.schoolId) }).then();
      queryClient.invalidateQueries({ queryKey: contactKeys.changeHistoryBase(currentSchool.schoolId) }).then();

      dispatchRouteChange({ menu: 'contact', query: {} });
      onClose();

      const toastMsg = isAdd && totalCreateCount === 0 ?
        `기존 주소록과 동일합니다.` :
        `${totalCreateCount.toLocaleString()}건을 주소록에 등록했습니다.`;
      showToast(toastMsg, 2000);

    } catch (e) {
      await handleError(e);
    } finally {
      hideLoading();
    }
  };

  const resetContacts = async () => {
    if (contacts.length === 0) return;

    const isReset = await ShowConfirm(`기존 입력한 데이터는 모두 삭제됩니다.\n초기화 하시겠습니까?`, {        
      ...CONFIRM_OPTIONS.TEXT,
      confirmLabel: '초기화',
      cancelLabel: '취소',
      confirmClassName: 'bg-action-red-base! text-text-base!',
    });
    if (!isReset) return;

    setContacts([]);
  };

  const downloadElContact = (currentSchool: TextAuthority) => {
    const { schoolName } = currentSchool;
    const fileName = `${schoolName}_전체 학급명단_${moment().format('YYYYMMDD')}.xlsx`;
    onReadyDownload(fileName, { isEletter: true });
  };

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      heading="주소록 일괄 등록"
      width="1500"
      className="max-w-full lg:max-w-[890px] 2xl:max-w-[calc(100vw-588px)] 2xl:!min-w-[calc(100vw-588px)] "
      anyOutsideClose
      footer={
        <>
          <HiButton variant="warningLine" className="btn-lg w-47.5!" onClick={() => createContacts(false)} disabled={!isAllValid}>
            전체 삭제 후 새로 등록
          </HiButton>
          <HiButton variant="primary" className="btn-lg w-47.5!" onClick={() => createContacts(true)} disabled={!isAllValid}>
            기존 주소록에 추가 등록
          </HiButton>
        </>
      }
    >
      <div className="w-full min-w-[810px] overflow-x-auto">
        <Card variant="lightgray" size="md" className="mb-5 relative">
          <ul className="text-leading-b3 flex flex-col gap-2">
            <li>리스트에서 직접 입력하거나 샘플 등록 양식 또는 학교알리미 학급명단을 다운로드 받으신 후 파일을 업로드 해주세요.</li>
            <li>학교알리미의 학생명단을 다운로드 받으시면 학생, 그룹, 교직원 명단을 한번에 등록 하실 수 있습니다.</li>
          </ul>
          <HiButton size="md" variant="primary" className="absolute right-6 top-7" onClick={handleFileInput}>
            <Upload size={18} className="stroke-text-base" />
            파일 업로드
          </HiButton>
          <input type="file" accept=".xls, .xlsx" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />

          <div className="mt-[17px] flex gap-4">
            <HiButton variant="underline" size="xs" className="!text-graphic-forest" onClick={handleClickDownloadSampleFile}>
              <HiIcon icon="file-excel" size={18} /> 샘플 양식 다운로드
            </HiButton>
            <HiButton variant="underline" size="xs" className="!text-graphic-forest" onClick={() => downloadElContact(currentSchool)}>
              <HiIcon icon="file-excel" size={18} /> 학교알리미 학급 명단 다운로드
            </HiButton>
          </div>
        </Card>

        <div className="flex items-center justify-between w-full mb-3">
          <div className="text-leading-b2">
            총 <span className="text-text-primary-base font-bold">{filteredContacts.length.toLocaleString()}</span>명
          </div>
          <div className="btn-area gap-2">
            <HiButton variant="tertiary" onClick={handleMasking}>
              <HiIcon icon={maskingContext.isMasked ? 'eye-off' : 'eye-on'} size={18} />
              휴대폰번호 암호화
            </HiButton>
          </div>
        </div>
        <ContactTable
          ref={virtualRowsParentRef}
          tableOption={{
            caption: '주소록 일괄 등록',
            tableStyle: 'batchImportTable',
            showAllCheckbox: false,
            showEmptyBody: false,
            formType: true,
          }}
          contacts={contacts}
          onReset={resetContacts}
        >
          <>
            {paddingTop > 0 && (
              <tr key="spacer-top" aria-hidden="true">
                <td colSpan={Object.keys(CONTACT_LABELS).length} style={{ height: paddingTop }} />
              </tr>
            )}
            {virtualRows.map((virtualRow: VirtualItem) =>{
              const contact = contacts[virtualRow.index];

              return (
                <BatchImportTableRow
                  key={contact.tempId}
                  contact={contact}
                  rowIndex={virtualRow.index}
                  focusedCell={focusedCell}
                  onUpdateContactsRow={handleUpdateContactsRow}
                  onDeleteContactById={handleDeleteContactById}
                  handleChangeFocusedInput={handleChangeFocusedInput}
                  setFocusedCell={setFocusedCell}
                />
              )
            })}
            {bottom > 0 && (
              <tr key="spacer-bottom" aria-hidden="true">
                <td colSpan={Object.keys(CONTACT_LABELS).length} style={{ height: bottom }} />
              </tr>
            )}
            <BatchImportTableEmptyRow
              rowIndex={contacts.length}
              focusedCell={focusedCell}
              onAddContactsRow={handleAddContactsRow}
              handleChangeFocusedInput={handleChangeFocusedInput}
              setFocusedCell={setFocusedCell}
            />
          </>
        </ContactTable>
      </div>
    </SideModal>
  );
};

const validateHederColumn = (header: string[]) => {
  if (!(header[0] === '대분류' || header[0] === '*대분류')) return false;
  if (!(header[1] === '소분류' || header[1] === '*소분류')) return false;
  if (header[2] !== '번호') return false;
  if (!(header[3] === '이름' || header[3] === '*이름')) return false;
  if (header[4] !== '휴대폰번호') return false;
  if (!(header[5] === '학부모1' || header[5] === '학부모1 휴대폰번호')) return false;
  if (!(header[6] === '학부모2' || header[6] === '학부모2 휴대폰번호')) return false;
  return true;
};

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
}