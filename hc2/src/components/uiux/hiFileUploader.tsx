import { ChangeEvent, type DragEventHandler, Fragment, useRef, useState } from 'react';
import { Button, Card, Icon } from '@/components/uiux';
import Loading from './loading';
import { Reorder, motion } from 'framer-motion';

import { FileCategory } from '@/types/multipart';
import { isImage, isPdf } from '@/utils/multipart';
import { HiButton } from './hiButton';
import { X, Plus } from 'lucide-react';

export enum ACCEPT_FILE_TYPE {
  IMAGE = 'IMAGE',
  PDF = 'PDF'
}

export enum UPLOAD_ERROR {
  EXCEED_IMAGE_LENGTH = 'EXCEED_IMAGE_LENGTH',
  EXCEED_PDF_LENGTH = 'EXCEED_PDF_LENGTH',
  UNSUPPORTED_FILE = 'UNSUPPORTED_FILE'
}

export interface PreviewFile {
  fileName: string;
  fileCategory: FileCategory;
  fileOriginalPath: string;
  fileThumbnailPath: string;
  fileConvertPath: string; // https://image.hiclass.net 으로 시작하는 파일. 이미지 썸네일에 사용
}

interface HiFileUploaderProps {
  previewFiles: PreviewFile[] | null;
  acceptFileType: ACCEPT_FILE_TYPE[];
  fileMaxlength?: Record<ACCEPT_FILE_TYPE, number>;
  guideTitle: string;
  guideText: string;
  imageThumbnailSize?: { width: number, height: number };
  isUploading: boolean;
  onUploadError: (error: UPLOAD_ERROR) => void;
  onAddFiles: (files: FileList) => void;
  onDeleteFileByOriginalPath: (fileOriginalPath: string) => void;
  onReorderFiles?: (files: PreviewFile[]) => void;
}

const defaultAllowedExtension = {
  [ACCEPT_FILE_TYPE.IMAGE]: 'image/*',
  [ACCEPT_FILE_TYPE.PDF]: 'application/pdf'
}

export const HiFileUploader = ({
  previewFiles,
  acceptFileType,
  fileMaxlength,
  guideTitle,
  guideText,
  imageThumbnailSize,
  isUploading,
  onUploadError,
  onAddFiles,
  onDeleteFileByOriginalPath,
  onReorderFiles
}: HiFileUploaderProps) => {
  const acceptExtension = acceptFileType.map(type => defaultAllowedExtension[type]).join(', ');
  const totalFileMaxLength = fileMaxlength ? Object.values(fileMaxlength).reduce((a, b) => a + b, 0) : Infinity;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClickAddButton = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    fileInputRef.current?.click();
  };

  const handleChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
  };

  const handleDropAttachments: DragEventHandler<HTMLDivElement> = (e) => {
    preventDragDefaults(e);
    if (e.dataTransfer?.files) addFiles(e.dataTransfer?.files);
  };

  const handleFileDelete = (fileOriginalPath: string) => {
    onDeleteFileByOriginalPath(fileOriginalPath);
  };

  const preventDragDefaults: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const addFiles = (files: FileList) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    const imageFiles = fileList.filter(file => isImage(file.type));
    const pdfFiles = fileList.filter(file => isPdf(file.type));

    const supportedFilesCount =
      (acceptFileType.includes(ACCEPT_FILE_TYPE.IMAGE) ? imageFiles.length : 0) +
      (acceptFileType.includes(ACCEPT_FILE_TYPE.PDF) ? pdfFiles.length : 0);

    if (supportedFilesCount !== fileList.length) {
      onUploadError(UPLOAD_ERROR.UNSUPPORTED_FILE);
      return;
    }

    if (fileMaxlength) {
      const currentImageFileLength = previewFiles?.filter(file => file.fileCategory === FileCategory.IMAGE).length || 0;
      const currentPdfFileLength = previewFiles?.filter(file => file.fileCategory === FileCategory.PDF).length || 0;

      const isImageExceeded = acceptFileType.includes(ACCEPT_FILE_TYPE.IMAGE) &&
        imageFiles.length + currentImageFileLength > (fileMaxlength[ACCEPT_FILE_TYPE.IMAGE] ?? Infinity);
      const isPdfExceeded = acceptFileType.includes(ACCEPT_FILE_TYPE.PDF) &&
        pdfFiles.length + currentPdfFileLength > (fileMaxlength[ACCEPT_FILE_TYPE.PDF] ?? Infinity);

      if (isImageExceeded) {
        onUploadError(UPLOAD_ERROR.EXCEED_IMAGE_LENGTH);
        return;
      }
      if (isPdfExceeded) {
        onUploadError(UPLOAD_ERROR.EXCEED_PDF_LENGTH);
        return;
      }
    }

    onAddFiles(files);
  };

  return (
    <div className="flex flex-col gap-2 mt-3">
      <div className="bg-bg-neutral-subtlest rounded-md p-5">
        <div
          onDragEnter={preventDragDefaults}
          onDragOver={preventDragDefaults}
          onDrop={handleDropAttachments}
        >
          {!previewFiles || previewFiles.length === 0 ? (
            <div className="flex items-center gap-4">
              <FileAddButton onClick={handleClickAddButton} isUploading={isUploading}/>
              <div className="flex flex-col">
                <div className="txt-body-b2 font-strong">{guideTitle}</div>
                <div className="txt-detail-d1 text-text-neutral-stronger">{guideText}</div>
              </div>
            </div>
          ) : (
            <Reorder.Group
              axis="x"
              values={previewFiles}
              onReorder={onReorderFiles || (() => {})}
              className="flex items-center gap-5.5"
            >
              {previewFiles.map((previewFile: PreviewFile, index: number) => (
                <Reorder.Item
                  key={previewFile.fileOriginalPath || previewFile.fileConvertPath || `${previewFile.fileName}-${index}`}
                  value={previewFile}
                  dragListener={!isUploading}
                >
                  {previewFile.fileCategory === FileCategory.IMAGE && (
                    <ImageThumbnail previewFile={previewFile} onClickDelete={handleFileDelete} imageThumbnailSize={imageThumbnailSize}/>
                  )}
                  {previewFile.fileCategory === FileCategory.PDF &&
                    <PdfThumbnail previewFile={previewFile} onClickDelete={handleFileDelete}/>
                  }
                </Reorder.Item>
              ))}
              {previewFiles.length < totalFileMaxLength && (
                <div className="flex items-center gap-4">
                  <FileAddButton ariaLabel="첨부 추가" onClick={handleClickAddButton} isUploading={isUploading}/>
                </div>
              )}
            </Reorder.Group>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={acceptExtension}
            multiple
            className="hidden"
            onChange={handleChangeInput}
          />
        </div>
      </div>
    </div>
  );
};

const FileAddButton = ({ onClick, ariaLabel, isUploading }: { onClick: () => void; ariaLabel?: string; isUploading: boolean }) => {
  return (
    isUploading ? (
      <Loading variant="spinner" className="static transform-none" />
    ) : (
    <HiButton
      variant="tertiary"
      className="!w-14 !h-14 !border-dashed !border-border-neutral-strong rounded-none! flex items-center justify-center"
      onClick={onClick}
      aria-label={ariaLabel}
      >
      <Plus color="var(--text-default)" size={26} strokeWidth={1.6} />
    </HiButton>
    )
  );
};

interface ThumbnailProps {
  previewFile: PreviewFile;
  onClickDelete: (fileOriginalPath: string) => void;
  imageThumbnailSize?: { width: number, height: number };
}

const ImageThumbnail = ({ previewFile, onClickDelete, imageThumbnailSize }: ThumbnailProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
	const REMOVE_ANIMATION_SEC = 0.2;
	const REMOVE_ANIMATION_MS = REMOVE_ANIMATION_SEC * 1000;
  const thumbnailPath = previewFile.fileConvertPath ?
    `${previewFile.fileConvertPath}?${imageThumbnailSize ? `width=${imageThumbnailSize.width}&height=${imageThumbnailSize.height}` : ''}` :
    previewFile.fileOriginalPath;

  const handleClickDelete = () => {
    // 먼저 페이드아웃 애니메이션을 실행한 뒤 실제 삭제 콜백 호출
    setIsRemoving(true);
    setTimeout(() => {
      onClickDelete(previewFile.fileOriginalPath);
		}, REMOVE_ANIMATION_MS);
  };

  return (
    <div className="relative w-20 h-20">
      <motion.div      
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded && !isRemoving ? 1 : 0 }}
			transition={{ duration: REMOVE_ANIMATION_SEC, ease: 'easeInOut' }}
        className="overflow-hidden bg-white border border-border-neutral-base rounded-sm flex items-center justify-center w-full h-full relative cursor-pointer "
        title={previewFile.fileName}
      >
        <img
          src={thumbnailPath}
          alt={previewFile.fileName}
          className="h-full max-w-fit object-cover"
          onLoad={() => setIsLoaded(true)}
          draggable="false"
        />
         {/* 하단 파일명 바 */}
        <div className="absolute left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.50)] text-white pt-[4px] pr-[8px] pb-[6px] pl-[4px] ">
          <span className="block truncate text-leading-d2">{previewFile.fileName}</span>
        </div>
      </motion.div>
      <HiButton
        type="button"
        variant="tertiary"
        className="!p-0.25 absolute -top-1.5 -right-1.5 bg-white !rounded-full !w-4.5 !h-4.5 flex items-center justify-center"
        onClick={handleClickDelete}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label="이미지 삭제"
      >       
        <X color="var(--text-neutral-stronger)" size={16} strokeWidth={2.5} />
      </HiButton>
    </div>
  )
};

const PdfThumbnail = ({ previewFile, onClickDelete }: ThumbnailProps) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const REMOVE_ANIMATION_SEC = 0.2;
  const REMOVE_ANIMATION_MS = REMOVE_ANIMATION_SEC * 1000;

  const handleClickDelete = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onClickDelete(previewFile.fileOriginalPath);
		}, REMOVE_ANIMATION_MS);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isRemoving ? 0 : 1 }}
			transition={{ duration: REMOVE_ANIMATION_SEC, ease: 'easeInOut' }}
      className="relative w-20 h-20 overflow-visible"
      title={previewFile.fileName || previewFile.fileOriginalPath}
    >
      {/* 1. 실제 파일 카드 영역 (라운드 적용) */}
      <div className="relative w-full h-full rounded-sm bg-white border border-border-neutral-base flex items-center justify-center overflow-hidden">
        <Icon
          icon="file-pdf-text"
          className="min-w-20 min-h-20 w-20 h-20"
        />

        {/* 하단 파일명 바 */}
        <div className="absolute left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.50)] text-white pt-[4px] pr-[8px] pb-[6px] pl-[4px] ">
          <span className="block truncate text-leading-d2">{previewFile.fileName}</span>
        </div>
      </div>

      {/* 2. 삭제 버튼 (overflow-visible인 부모 바로 아래에 두어 잘리지 않게 함) */}
      <HiButton
        type="button"
        variant="tertiary"
        className="!p-0.25 absolute -top-1.5 -right-1.5 bg-white !rounded-full !w-4.5 !h-4.5 flex items-center justify-center"
        onClick={handleClickDelete}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label="이미지 삭제"
      >       
        <X color="var(--text-neutral-stronger)" size={16} strokeWidth={2.5} />
      </HiButton>
    </motion.div>
  );
};