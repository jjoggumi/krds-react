import { useEffect, useState } from 'react';

import { WeblinkCreateResponse, WeblinkFile } from '@/components/text/types';
import { ACCEPT_FILE_TYPE, HiFileUploader, PreviewFile, UPLOAD_ERROR } from '@/components/uiux/hiFileUploader';

import { HiButton } from '@/components/uiux';
import { showToast } from '@/unimplementeds/toast';
import { ShowConfirm, CONFIRM_OPTIONS } from '@/components/uiux/modal'
import Tooltip from '@/components/uiux/tooltip';
import Icon from '@/components/uiux/icon';
import { RadioBoxGroup } from '@/components/uiux/radiobox';

import { useWeblinkMutation } from '@/components/text/queries/useWeblink';
import { useTextContext } from '@/components/text/context/TextContext';
import { deleteUploadedFile, upload } from '@/apis/multipart';
import { Multipart, UploadMultipartsResponse } from '@/types/multipart';
import { getFileCategoryByFileType } from '@/utils/multipart';
import { getByteLength } from '../../utils/send';
import { SEND_MAX_BYTE } from '../../constants';
import { AnimatePresence, motion } from 'framer-motion';

const PANEL_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const webLinkModeOptions = [
  { label: '사용안함', value: false },
  { label: '사용', value: true },
];

interface WeblinkSettingProps {
  isWeblink: boolean;
  requestContent: string;
  setRequestIsWeblink: (isWebLink: boolean) => void;
  generatedWebLink: WeblinkCreateResponse | null;
  setGeneratedWebLink: (weblink: WeblinkCreateResponse | null) => void;
  onOpenWeblinkPreview: () => void;
  weblinkFiles: WeblinkFile[] | null;
  onChangeWeblinkFiles: (weblinkFiles: WeblinkFile[]) => void;
}

export const WeblinkSetting = ({
  isWeblink,
  requestContent,
  setRequestIsWeblink,
  generatedWebLink,
  setGeneratedWebLink,
  onOpenWeblinkPreview,
  weblinkFiles,
  onChangeWeblinkFiles
}: WeblinkSettingProps) => {
  const { currentSchool } = useTextContext();
  const { createMutateAsync } = useWeblinkMutation();

  const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  useEffect(() => {
    if (isWeblink && generatedWebLink === null) {
      createMutateAsync({ schoolId: currentSchool.schoolId }).then(res => {
        setGeneratedWebLink(res);
      });
    }
  }, [isWeblink, generatedWebLink]);

  useEffect(() => {
    if (!weblinkFiles || weblinkFiles.length === 0) {
      setPreviewFiles([]);
      return;
    }

    const newPreviews = weblinkFiles.map((file) => ({
      fileName: file.fileName,
      fileCategory: file.fileCategory,
      fileOriginalPath: file.fileOriginalPath,
      fileThumbnailPath: file.fileThumbnailPath,
      fileConvertPath: file.fileConvertPath
    }));

    setPreviewFiles(newPreviews);
  }, [weblinkFiles]);

  const handleChangeWebLinkMode = async (isUsed: boolean) => {
    if (isWeblink && !isUsed && weblinkFiles.length > 0) {
      const isConfirm = await ShowConfirm('첨부된 파일이 있습니다.\n사용안함으로 변경 시 모두 삭제됩니다.\n변경하시겠습니까?', {
        ...CONFIRM_OPTIONS.TEXT,
        hideCancel: false,
      })
      if (!isConfirm) return;

      for (const f of weblinkFiles) {
        handleDeleteFileByOriginalPath(f.fileOriginalPath);
      }

      onChangeWeblinkFiles([]);
      setRequestIsWeblink(isUsed);
    } else if(!isWeblink && isUsed) {
      const messageByte = getByteLength(requestContent);
      if(messageByte > SEND_MAX_BYTE.LMS_WEB_LINK) {
        const result = await ShowConfirm(`웹 링크 첨부파일 사용 시, ${SEND_MAX_BYTE.LMS_WEB_LINK.toLocaleString()}byte를 초과한 내용은 삭제됩니다. 변경하시겠습니까?`, {
          ...CONFIRM_OPTIONS.TEXT,
          confirmLabel: '확인',
          cancelLabel: '취소',
        })
        if(result) {
          setRequestIsWeblink(isUsed);
        }
      } else {
        setRequestIsWeblink(isUsed);
      }
    } else {
      setRequestIsWeblink(isUsed);
    }
  };

  const handleClickWeblinkPreview = () => {
    onOpenWeblinkPreview();
  };

  const handleUploadError = (error: UPLOAD_ERROR) => {
    showToast(getUploadErrorMessage(error), 2000);
  };

  const handleAddFiles = async (files: FileList) => {
    try {
      setIsUploading(true);
      const { _embedded: { multiparts } }: UploadMultipartsResponse = await upload(Array.from(files));
      const currentFiles = weblinkFiles ? weblinkFiles : [];
      const newFiles: WeblinkFile[] = multiparts.map((multipart: Multipart, index: number) => ({
        sortNo: currentFiles.length + index + 1,
        fileCategory: getFileCategoryByFileType(multipart.contentType),
        fileName: multipart.filename,
        fileContentType: multipart.contentType,
        fileOriginalPath: multipart._links.original.href,
        fileThumbnailPath: multipart._links.thumbnail?.href || null,
        fileConvertPath: multipart._links.convert?.href || null,
        fileWidth: null,
        fileHeight: null,
      }));

      onChangeWeblinkFiles([...currentFiles, ...newFiles]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFileByOriginalPath = (fileOriginalPath: string) => {
    const deleteFile = weblinkFiles.find(f => f.fileOriginalPath === fileOriginalPath);
    if (!deleteFile) return;

    const params = {
      fileOriginalPath: deleteFile.fileOriginalPath,
      fileThumbnailPath: deleteFile.fileThumbnailPath,
      fileConvertPath: deleteFile.fileConvertPath
    };

    deleteUploadedFile(params).then()
      .catch((err) => console.error(err));

    const currentFiles = weblinkFiles
      .filter(f => f.fileOriginalPath !== fileOriginalPath)
      .map((f, index) => ({ ...f, sortNo: index }));

    onChangeWeblinkFiles(currentFiles);
  };

  const handleReorderFiles = (reorderedPreviews: PreviewFile[]) => {
    if (!weblinkFiles) return;

    const reorderedWeblinkFiles = reorderedPreviews.map((preview, index) => {
      const originalFile = weblinkFiles.find(f => f.fileOriginalPath === preview.fileOriginalPath);
      return {
        ...originalFile!,
        sortNo: index + 1,
      };
    });

    onChangeWeblinkFiles(reorderedWeblinkFiles);
  };

  return (
    <div className='border-border-neutral-base border-b py-3'>
      <div className="flex items-center gap-4 pl-4">
        <div className='flex items-center gap-10'>
          <div className="flex items-center gap-1 min-w-30">
            <span className="text-leading-b2 font-bold leading-6.5">웹 링크 첨부파일</span>
            <Tooltip titleHtml="LMS에 파일을 첨부하여 웹 링크로 전송하실 수 있습니다." position="top" size="sm" tooltipClassName="z-1">
              <Icon icon="help-fill" iconSize={16} color="light-gray" className="bg-gray09 hover:bg-bg-primary-base" />
            </Tooltip>
          </div>
          <RadioBoxGroup
            options={webLinkModeOptions}
            value={isWeblink}
            onChange={handleChangeWebLinkMode}
            name="send-lms-web-link"
            className="flex items-center flex-nowrap h-10 gap-8"
          />
        </div>
        {isWeblink && (
          <HiButton variant="tertiary" size="xs" onClick={handleClickWeblinkPreview}>
            미리보기
          </HiButton>
        )}
      </div>
      <AnimatePresence mode="wait">
        {isWeblink && (
          <motion.div
            key="weblink-uploader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <HiFileUploader
              previewFiles={previewFiles}
              acceptFileType={[ACCEPT_FILE_TYPE.IMAGE, ACCEPT_FILE_TYPE.PDF]}
              fileMaxlength={{
                [ACCEPT_FILE_TYPE.IMAGE]: 5,
                [ACCEPT_FILE_TYPE.PDF]: 1
              }}
              guideTitle={'이미지 또는 문서'}
              guideText={'이미지 또는 문서를 끌어다 놓거나, [+] 버튼을 선택하세요. (이미지 최대 5개, pdf 1개)'}
              // imageThumbnailSize={{ width: 100, height: 100 }}
              isUploading={isUploading}
              onUploadError={handleUploadError}
              onAddFiles={handleAddFiles}
              onDeleteFileByOriginalPath={handleDeleteFileByOriginalPath}
              onReorderFiles={handleReorderFiles}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const uploadErrorMsg = {
  [UPLOAD_ERROR.UNSUPPORTED_FILE]: '업로드를 지원하지 않는 파일형식입니다.',
  [UPLOAD_ERROR.EXCEED_IMAGE_LENGTH]: '이미지는 최대 5장까지 가능합니다.',
  [UPLOAD_ERROR.EXCEED_PDF_LENGTH]: '문서는 최대 1개까지 가능합니다.',
};

const getUploadErrorMessage = (error: UPLOAD_ERROR) => {
  return uploadErrorMsg[error];
};