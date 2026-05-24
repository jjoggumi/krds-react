import { ChangeEvent, useEffect, useRef, useState } from 'react';

import * as XLSX from 'xlsx';

import NoData from '@/components/uiux/noData';
import { HiTab, HiButton, HiIcon, ShowConfirm, CONFIRM_OPTIONS } from '@/components/uiux';
import { User, Download, Upload } from 'lucide-react';
import { ContactSelectorModal } from '@/components/text/components/send/modal/ContactSelectorModal';
import { SendReceiverTable } from '@/components/text/components/send/SendReceiverTable';

import { downloadFromUrl, removeEmojisFromString, showUploadFileInvalidAlert, showUploadFileResetAlert } from '@/components/text/utils';
import { isEmpty, isErrorPhoneNumber } from '@/utils/validate';

import { PermissionFeatureType, PermissionRole, SendRequest, SendTargetWithValidation } from '@/components/text/types';
import { useSendReceiver } from '@/components/text/hooks/send';
import { MaskingProvider } from '../../context/MaskingContext';
import { useTextContext } from '@/components/text/context/TextContext';
import { useLoadingContext } from '../../context/LoadingContext';
import { SEND_TARGET_FIELD_LIMITS } from '@/components/text/constants';
import { v4 as uuidv4 } from 'uuid';

export enum ImportType {
  CONTACTS_SELECTOR = 'CONTACTS_SELECTOR',
  DIRECT = 'DIRECT',
  EXCEL_UPLOAD = 'EXCEL_UPLOAD'
}

const contactsSelectorFields = ['depth1', 'depth2', 'sendTargetType'];

interface SendReceiverProps {
  isDeduplication: boolean;
  onChangeRequestMessage: (field: keyof SendRequest, value: any) => void;
  onChangeTargetCount: (count: number) => void;
}
export const SendReceiver = ({ isDeduplication, onChangeRequestMessage, onChangeTargetCount }: SendReceiverProps) => {
  const [requestTargets, setRequestTargets] = useState<SendTargetWithValidation[]>([]);
  const [selectedTabIndex, setSelectedTadIndex] = useState(0);

  useEffect(() => {
    onChangeTargetCount(requestTargets.filter(t => !t.isDuplication && t.valid.phoneNumber).length);
  }, [requestTargets]);

  const handleChangeTab = async (tabIndex:number) => {
    if (selectedTabIndex === tabIndex) return;

    if (requestTargets.length === 0) {
      setSelectedTadIndex(tabIndex);
      return;
    }

    const isChange = await ShowConfirm('기존에 입력한 데이터는 모두 삭제됩니다.\n진행하시겠습니까?', {
      ...CONFIRM_OPTIONS.TEXT,
      confirmLabel: '삭제',
    });
    if (!isChange) return;

    setSelectedTadIndex(tabIndex);
    setRequestTargets([]);
  }

  const handleUpdateTargets = (targets: SendTargetWithValidation[]) => {
    setRequestTargets(targets);
    onChangeRequestMessage('targets', targets);
  }

  return (
    <div className="mt-7.5 mb-10 relative">
      <HiTab
        size="xl"
        contentAnimation="fade"
        contentAnimationDuration={0.2}
        labels={['주소록 불러오기', '직접 입력', '엑셀 일괄 업로드']}
        variant="underline"
        isControlOuter={true}
        selectedTabIndex={selectedTabIndex}
        onChange={handleChangeTab}
      >
        <MaskingProvider initialIsMasked={true}>
          <ContactSelector isDeduplication={isDeduplication} onUpdateTargets={handleUpdateTargets}/>
        </MaskingProvider>
        <MaskingProvider initialIsMasked={true}>
          <DirectInput isDeduplication={isDeduplication} onUpdateTargets={handleUpdateTargets}/>
        </MaskingProvider>
        <MaskingProvider initialIsMasked={true}>
          <ExcelUpload isDeduplication={isDeduplication} onUpdateTargets={handleUpdateTargets}/>
        </MaskingProvider>
      </HiTab>
    </div>
  );
}

interface ImportComponentProps {
  isDeduplication: boolean;
  onUpdateTargets?: (targets: SendTargetWithValidation[]) => void;
}

const ContactSelector = ({ isDeduplication, onUpdateTargets }: ImportComponentProps) => {
  const [isAddressBookOpen, setIsAddressBookOpen] = useState(false);
  const handleOpenAddressBook = () => {
    setIsAddressBookOpen(true);
  }
  const handleCloseAddressBook = () => setIsAddressBookOpen(false);

  const {
    targets,
    handleImportTargets,
    handleClickAllDelete,
    handleClickDelete,
    handleChangeTargets
  } = useSendReceiver({ isDeduplication, onUpdateTargets });

  return (
    <>
      {/* 첫번째 탭 */}
      {targets.length !== 0 && (
        <div className="absolute top-3 right-0">
        <HiButton variant="tertiaryBlue" onClick={handleOpenAddressBook}>
          <HiIcon icon="user" size={20} />
          주소록 불러오기
        </HiButton>
      </div>
      )}

      <SendReceiverTable
        importType={ImportType.CONTACTS_SELECTOR}
        targets={targets}
        fields={contactsSelectorFields}
        onDeleteAll={handleClickAllDelete}
        onDelete={handleClickDelete}
        onChangeTargets={handleChangeTargets}
      >
          <NoData size="md" message="학생과 학부모님의 연락처 정보를 간편하게 불러올 수 있습니다." className="py-34 border-0 gap-2">
          <HiButton variant="tertiaryBlue" onClick={handleOpenAddressBook}>
            <HiIcon icon="user" size={18} />
            주소록 불러오기
          </HiButton>
        </NoData>
      </SendReceiverTable>

      {/* 주소록 사이드 모달 */}
      <ContactSelectorModal
        isOpen={isAddressBookOpen}
        onClose={handleCloseAddressBook}
        onUpdateSendTargets={(newTargets: SendTargetWithValidation[]) =>
          handleImportTargets([...targets, ...newTargets])
        }
      />
    </>
  )
}

const DirectInput = ({ isDeduplication, onUpdateTargets }: ImportComponentProps) => {
  const {
    targets,
    handleClickAllDelete,
    handleClickDelete,
    handleChangeTargets
  } = useSendReceiver({ isDeduplication, onUpdateTargets });

  return (
    <SendReceiverTable
      importType={ImportType.DIRECT}
      targets={targets}
      onDeleteAll={handleClickAllDelete}
      onDelete={handleClickDelete}
      onChangeTargets={handleChangeTargets}
    />
  )
}

const ExcelUpload = ({ isDeduplication, onUpdateTargets }: ImportComponentProps) => {
  const {
    targets,
    handleImportTargets,
    handleClickAllDelete,
    handleClickDelete,
    handleChangeTargets
  } = useSendReceiver({ isDeduplication, onUpdateTargets });
  
  return (
  <>  
    {targets.length !== 0 &&(
      <ExcelUploadButtons
        divClass={'absolute top-3 right-0 space-x-2 flex items-center'}
        targets={targets}
        onUpload={handleImportTargets}
      />
    )}

    <SendReceiverTable
      importType={ImportType.EXCEL_UPLOAD}
      targets={targets}
      onDeleteAll={handleClickAllDelete}
      onDelete={handleClickDelete}
      onChangeTargets={handleChangeTargets}
    >
      <NoData size="md" message='샘플 양식 작성 후 파일을 업로드 해주세요.' className="py-34 border-0 gap-2" >
        <ExcelUploadButtons
          divClass={'flex gap-2'}
          targets={targets}
          onUpload={handleImportTargets}
        />
      </NoData>
    </SendReceiverTable>
  </>
  )
}

interface ExcelUploadButtonsProps {
  divClass: string;
  targets: SendTargetWithValidation[];
  onUpload: (newTargets: SendTargetWithValidation[]) => void;
}
const ExcelUploadButtons = ({divClass, targets, onUpload}: ExcelUploadButtonsProps) => {

  const { showLoading, hideLoading } = useLoadingContext();

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleClickDownloadSampleFile = () => {
    const fileName = '수신자 등록 샘플 양식.xls';
    const fileUrl = 'https://download.hiclass.net/static/document/text-send-target-upload-form.xls';
    downloadFromUrl(fileName, fileUrl).then();
  }

  const handleFileInput = async () => {
    if (targets.length === 0) {
      fileInputRef.current?.click();
      return;
    }

    const isUpload = await showUploadFileResetAlert();
    if (!isUpload) return;

    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files.length !== 1) return;

    const file = files[0];

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    showLoading();
    readExcelFile(file)
      .then((newTargets) => {
        onUpload(newTargets);
      })
      .finally(() => hideLoading());
  };
  
  return (
    <div className={divClass}>
      <HiButton variant="tertiary" onClick={handleClickDownloadSampleFile}>
        <HiIcon icon="file-excel" size={18} /> 샘플 양식 다운로드
      </HiButton>
      <HiButton variant="tertiaryBlue" onClick={handleFileInput}>
        <Upload size={16} className="inline align-text-bottom stroke-text-primary-base" /> 파일 업로드
      </HiButton>
      <input type="file" accept=".xls, .xlsx" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
    </div>
  )
}

const readExcelFile = async (file: File) => {
  const list: SendTargetWithValidation[] = [];

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
    if (rowNum <= 0) return;
    if (row.length === 0) return;

    const contactName = row[0]?.substring(0, SEND_TARGET_FIELD_LIMITS.contactName) || '';
    const phoneNumber = row[1] || '';
    const field1 = row[2]?.substring(0, SEND_TARGET_FIELD_LIMITS.field) || '';
    const field2 = row[3]?.substring(0, SEND_TARGET_FIELD_LIMITS.field) || '';
    const field3 = row[4]?.substring(0, SEND_TARGET_FIELD_LIMITS.field) || '';
    const field4 = row[5]?.substring(0, SEND_TARGET_FIELD_LIMITS.field) || '';
    const field5 = row[6]?.substring(0, SEND_TARGET_FIELD_LIMITS.field) || '';
    const field6 = row[7]?.substring(0, SEND_TARGET_FIELD_LIMITS.field) || '';
    const field7 = row[8]?.substring(0, SEND_TARGET_FIELD_LIMITS.field) || '';
    const field8 = row[9]?.substring(0, SEND_TARGET_FIELD_LIMITS.field) || '';

    list.push({
      contactId: uuidv4(),
      contactName: removeEmojisFromString(contactName),
      phoneNumber: phoneNumber,
      field1: removeEmojisFromString(field1),
      field2: removeEmojisFromString(field2),
      field3: removeEmojisFromString(field3),
      field4: removeEmojisFromString(field4),
      field5: removeEmojisFromString(field5),
      field6: removeEmojisFromString(field6),
      field7: removeEmojisFromString(field7),
      field8: removeEmojisFromString(field8),
      valid: {
        phoneNumber: !isEmpty(phoneNumber) && !isErrorPhoneNumber(phoneNumber)
      },
      isDuplication: false
    });
  });

  return list;
};

const validateHederColumn = (header: string[]) => {
  if (header[0] !== '[*이름*]') return false;
  if (header[1] !== '*휴대폰번호') return false;
  if (header[2] !== '[*1*]') return false;
  if (header[3] !== '[*2*]') return false;
  if (header[4] !== '[*3*]') return false;
  if (header[5] !== '[*4*]') return false;
  if (header[6] !== '[*5*]') return false;
  if (header[7] !== '[*6*]') return false;
  if (header[8] !== '[*7*]') return false;
  if (header[9] !== '[*8*]') return false;
  return true;
};