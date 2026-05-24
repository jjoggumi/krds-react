import { MsgType, WeblinkCode, WeblinkFile } from '@/components/text/types';
import { isEmpty } from '@/utils/validate';
import HiModal from '@/components/uiux/hiModal';
import { Card, ShowConfirm, CONFIRM_OPTIONS, HiButton } from '@/components/uiux';
import { Download } from 'lucide-react';
import Tooltip from '@/components/uiux/tooltip';
import Icon from '@/components/uiux/icon';
import { WeblinkDetailContent } from '../../weblink/WeblinkDetailContent';
import { useEffect, useState } from 'react';
import axios from 'axios';
import jszip from 'jszip';
import { saveAs } from 'file-saver';
import { showToast } from '@/unimplementeds/toast';
import downloadjs from 'downloadjs';

interface WeblinkViewPopupProps {
  isOpen: boolean;
  onClose: () => void;
  senderName: string;
  messageTitle: string;
  messageContent: string;
  msgType: MsgType;
  files?: WeblinkFile[];
  period?: string;
  isSetInnerHTML?: boolean;
  // mode: 미리보기 모드, 상세보기 모드
  mode?: 'preview' | 'detail';
}

export const WeblinkViewPopup = ({ isOpen, onClose, senderName, messageTitle, messageContent, msgType, files, period, isSetInnerHTML, mode = 'detail' }: WeblinkViewPopupProps) => {
  const hasAnyContent = !isEmpty(messageContent) || (msgType !== MsgType.SMS && !isEmpty(messageTitle));
  const [isDownloading, setIsDownloading] = useState(false);


  useEffect(() => {
    if(isOpen === true) {
      showToast(`⚠️웹 링크는 공개형 URL입니다. 민감 정보가 포함되지 않게 주의해 주세요.`, 2000)
    }
  }, [isOpen]);

  const handleDownloadFiles = async () => {
    if (!files || files.length === 0) {
      //없을수 없음. 그냥 예외처리
      return;
    }

    setIsDownloading(true);
    try {
      if(files.length === 1) {
        const file = files[0];
        const url = file.fileOriginalPath;
        const fileName = file.fileName || `file_1`;

        try {
          const res = await axios({
            method: 'get',
            url,
            responseType: 'blob',
          });
          const blob = new Blob([res.data], { type: 'application/octet-stream' });
          downloadjs(blob, fileName, "text/plain");
        } catch (err) {
          await ShowConfirm(`다운로드에 실패했습니다. 잠시 후 다시 시도해주세요.`, {
            ...CONFIRM_OPTIONS.TEXT,
            confirmLabel: '확인',
            hideCancel: true,
          })
        }

      } else {
        const zip = new jszip();
        const zipName = `${messageTitle}.zip`;
  
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const url = file.fileOriginalPath;
          const fileName = file.fileName || `file_${i + 1}`;
  
          try {
            const res = await axios({
              method: 'get',
              url,
              responseType: 'blob',
            });
            const blob = new Blob([res.data], { type: 'application/octet-stream' });
            zip.file(fileName, blob);
          } catch (err) { }
        }
  
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, zipName);
      }
      showToast('다운로드가 완료되었습니다.', 1500)
    } catch (err) {
      await ShowConfirm(`파일 압축 및 다운로드에 실패했습니다. 잠시 후 다시 시도해주세요.`, {
        ...CONFIRM_OPTIONS.TEXT,
        confirmLabel: '확인',
        hideCancel: true,
      })
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <HiModal
      isOpen={isOpen}
      onClose={onClose}
      dimClose
      size="md"
      modalLayerStyle={{ width:'518px' }}
      heading={
        <>
          {mode === 'preview' ? (
            '웹 링크 미리 보기'
          ) : (
            <span className="inline-flex items-center gap-1">
              웹 링크 상세 보기
              <Tooltip titleHtml="웹 링크는 발송일로부터 7일간 유지됩니다.<br/>중요한 정보는 기간 내에 다운로드 받아 저장해주세요." position="bottom" size="md" tooltipClassName="z-9999" >
                <Icon icon="help-fill" iconSize={18} color="light-gray" className="bg-gray09 hover:bg-bg-primary-base" />
              </Tooltip>
            </span>
          )}
        </>
      }
      desc={mode === 'preview' ? "⚠️웹 링크는 공개형 URL입니다. 민감 정보가 포함되지 않게 주의해 주세요." : undefined}
      content={(
        <>
          {mode === 'detail' &&
            <div className="-mt-3 mb-2 text-leading-b2 font-regular flex items-center justify-between">
              {period}
              <HiButton variant='underline' onClick={handleDownloadFiles} disabled={isDownloading}>
                <Download size={15} color="var(--action-primary-base)" strokeWidth={1.4} />
                <span className="!text-b2">첨부파일 다운로드</span>
              </HiButton>
            </div>
          }
          <Card variant="border" size="lg" className="!p-0">
            <WeblinkDetailContent
              senderName={senderName}
              isSetInnerHTML={isSetInnerHTML}
              messageTitle={hasAnyContent && msgType !== MsgType.SMS ? messageTitle : ''}
              messageContent={hasAnyContent ? messageContent : ''}
              noDataMessage={`메시지 내용을 입력하시면 \n 내용이 표시됩니다.`}
              apiFiles={files}
              style={{ maxHeight: mode === 'detail' ? 'calc(var(--vh)*100 - 267.5px)' : 'calc(var(--vh)*100 - 277px)' }}
            />
          </Card>
        </>
      )}
    />
  );
};
