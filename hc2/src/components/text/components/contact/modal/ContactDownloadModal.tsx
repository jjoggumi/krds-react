import { useState, ChangeEvent } from 'react';

import moment from 'moment';

import HiModal from '@/components/uiux/hiModal';
import { HiButton } from '@/components/uiux';
import { Textarea } from '@/components/uiux/textarea';

import { useTextContext } from '@/components/text/context/TextContext';
import { useContactGroupContext } from '@/components/text/context/ContactContext';
import { useApiErrorHandler } from '@/components/text/hooks/apiErrorHandler';

import { isEmpty } from '@/utils/validate';
import { ContactGroupDepthType } from '@/components/text/types/contact';

interface ContactDownloadModalProps {
  isOpen: boolean;
  keyword: string;
  onClose: () => void;
  onSuccess: (reasonItem: any, fileName: string) => void;
}

export const ContactDownloadModal = ({ isOpen, keyword, onClose, onSuccess }: ContactDownloadModalProps) => {
  const { currentSchool } = useTextContext();
  const { selectedGroupId, selectedGroupName } = useContactGroupContext();

  const { handleError } = useApiErrorHandler();

  const [reason, setReason] = useState<string>('');

  const handleChangeTextarea = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setReason(e.target.value.slice(0, 100));
  };

  const handleClickDownload = () => {
    const reasonItem = {
      depthType: selectedGroupId ? ContactGroupDepthType.DEPTH2 : null,
      groupId: selectedGroupId,
      keyword: isEmpty(keyword) ? null : keyword,
      reason
    }

    const fileName = `주소록_${selectedGroupName.join(' ')}_${moment().format('YYYYMMDD')}.xlsx`;
    onSuccess(reasonItem, fileName);
  }

  return (
    <HiModal
      isOpen={isOpen}
      onClose={onClose}
      dimClose
      size="md"
      content={(
        <>        
        <div className="mb-4 -mt-4">
          <div className="text-leading-b1 font-bold">다운로드 사유 입력</div>
          <div className="text-leading-b2">개인 정보 보호를 위해 사용 목적을 확인하고 있습니다.</div>
        </div>
        <Textarea
          value={reason}
          placeholder="구체적인 사유를 입력해주세요."
          rows={2}
          resizable={false}
          onChange={handleChangeTextarea}
          maxLength={100}
          />
        </>
      )}
      footer={(
        <>
          <HiButton variant="tertiary" size="lg" onClick={onClose}>취소</HiButton>
          <HiButton variant="primary" size="lg" onClick={handleClickDownload} disabled={isEmpty(reason)}>등록</HiButton>
        </>
      )}
    />
  );
};