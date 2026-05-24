import NoData from '@/components/uiux/noData';
import { isEmpty } from '@/utils/validate';
import { Card, Skeleton, HiButton } from '@/components/uiux';
import { Paperclip, CircleAlert } from 'lucide-react';
import { WeblinkFile } from '../../types';
import React, { useState, useRef, type CSSProperties, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileCategory } from '@/types/multipart';
import { AttachFilesViewer, AttachFile } from '@/components/viewer';
import hiclassLogo from '@/assets/img/logo_2x.png';
import { MOBILE_APP_DOWNLOAD_URI } from '../../constants';
import { FADE_IN_UP_ORDERED_VARIANTS, STAGGER_CONTAINER_VARIANTS } from '@/components/text/constants/animations';

interface Props {
	senderName?: string;
	messageTitle?: string;
	messageContent?: string;
	apiFiles?: WeblinkFile[];
	noDataMessage?: string;
	className?: string;
	style?: CSSProperties;
	isSetInnerHTML?: boolean;
	envType?: string;
}

export const WeblinkDetailContent = ({
	senderName,
	messageTitle,
	messageContent,
	apiFiles,
	noDataMessage = '메시지 내용을 입력하시면 \n 내용이 표시됩니다.',
	className = '',
	style,
	isSetInnerHTML,
	envType,
}: Props) => {
	const [viewerItem, setViewerItem] = useState<AttachFile | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);

	let files: WeblinkFile[] = [];

	if (apiFiles && apiFiles.length > 0) {
		files = [...apiFiles];
	}

	const handleFileClick = (file: WeblinkFile) => {
		const win = window as any;
		const url = file.fileOriginalPath || '';
		const name = file.fileName || file.fileOriginalPath || '';
		const category = file.fileCategory as string;

		if (win.AOSHandler) {
			if (win.AOSHandler.onClickFile) {
				win.AOSHandler.onClickFile(url, name, category);
			}
		} else if (win.webkit?.messageHandlers?.iOSHandler) {
			win.webkit.messageHandlers.iOSHandler.postMessage({ command: 'onClickFile', path: url, name, category });
		} else {
			setViewerItem({
				fileOriginalPath: url,
				fileName: name,
				fileContentType: file.fileCategory === FileCategory.IMAGE ? 'image/jpeg' : 'application/pdf',
				fileCategory: file.fileCategory
			});
		}
	};

	const lines = messageContent.split('\n');

	const hasAnyContent = !isEmpty(messageContent) || !isEmpty(messageTitle) || files.length > 0;
	const filterFiles = useMemo(() => {
		if (viewerItem === null) {
			return null;
		}
		const targetFileCategory = viewerItem.fileCategory
		return files.filter(f => f.fileCategory === targetFileCategory)
	}, [files, viewerItem])

  return (
		<>
      {envType === 'mobileWeb' && <WeblinkDetailHeader/>}
			<motion.div
        initial="hidden"
        animate="visible"
        variants={STAGGER_CONTAINER_VARIANTS}
				ref={containerRef}
				className={`min-h-135 overflow-y-auto px-5 py-6 md:px-8 ${className} flex flex-col`}
        style={{
          overflowX: 'hidden',
          height: envType === 'mobileWeb' ? 'calc(100% - 57px)' : '100%',
          ...style,
        }}
			>
				<motion.div
          custom={0}
          variants={FADE_IN_UP_ORDERED_VARIANTS}
          className="flex-1 flex flex-col min-w-0 md:min-w-[390px] "
        >
					{!isEmpty(senderName) && (
            <motion.div
              custom={0}
              variants={FADE_IN_UP_ORDERED_VARIANTS}
            >
              <Card variant="lightgray" className="text-text-neutral-stronger text-center  text-leading-d1 mb-5 !py-2 !px-2.5 brek-all !bg-bg-secondary-subtler" size="xs">
                {senderName}에서 발송한 문자 메시지입니다.
              </Card>
            </motion.div>
					)}
					{hasAnyContent ? (
            <motion.div
              custom={1}
              variants={FADE_IN_UP_ORDERED_VARIANTS}
            >
							{!isEmpty(messageTitle) && (
								<div className="font-strong text-leading-h3">
									{messageTitle}
								</div>
							)}
							{!isEmpty(messageContent) && (
								<div className="text-leading-b2 text-text-inverse whitespace-pre-line mt-2 wrap-break-word">
									{
										(isSetInnerHTML ?
											<span dangerouslySetInnerHTML={{ __html: messageContent }}></span> :
											(lines.map((line: string, index: number) => (
												<span key={index}>
													{line}
                            {index < lines.length - 1 && <br />}
											</span>
                        )))
                    )
                  }
                </div>
              )}
              <div className="flex flex-col gap-4 text-leading-b2 text-text-inverse whitespace-pre-line mt-4">
                {files.sort((a, b) => {
                  if (a.fileCategory === FileCategory.IMAGE && b.fileCategory !== FileCategory.IMAGE) return -1;
                  if (a.fileCategory !== FileCategory.IMAGE && b.fileCategory === FileCategory.IMAGE) return 1;
                  return 0;
                }).map((file, index) => {
                  const name = file.fileName || file.fileOriginalPath || '';
                  const url = file.fileOriginalPath || '';

                  return (
                    <React.Fragment key={index}>
                      {
                        file.fileCategory !== FileCategory.IMAGE
                          ? (
                            <div>
                              <div
                                className='inline-flex items-center gap-2 bg-bg-secondary-subtlest text-text-neutral-stronger text-leading-b2 px-3 py-2 min-h-10 cursor-pointer rounded-sm break-all'
                                onClick={() => handleFileClick(file)}
                              >
                                <Paperclip size={18} color="var(--text-neutral-stronger)" className='min-w-[18px]' strokeWidth={1.5} />
                                {name}
                              </div>
                              <div className='mt-2 flex justify-center h-[220px] bg-[#616161] w-full'>
                                { file.fileThumbnailPath && <img
                                  src={file.fileThumbnailPath}
                                  onClick={() => handleFileClick(file)}
                                  className='h-full'
                                />
                                }
                              </div>
                            </div>
                          )
                          : (
                            <img
                              className='w-full cursor-pointer'
                              src={url}
                              onClick={() => handleFileClick(file)}
                            />
                          )
                      }
                    </React.Fragment>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <div className="flex-grow flex items-center justify-center">
              <NoData message={noDataMessage} />
            </div>
          )}

          {viewerItem && <AttachFilesViewer
            isOpen={!!viewerItem}
            onClose={() => setViewerItem(null)}
            index={viewerItem
              ? (Math.max(0, filterFiles.findIndex(f => f.fileOriginalPath === viewerItem.fileOriginalPath)) )
              : (0)
            }
            items={filterFiles}
          />}
        </motion.div>
				{envType === 'mobileWeb' && (
					<Card variant="lightgray" className="!p-5 mt-4 min-w-0 md:min-w-[390px]" size="sm">
						<div className="text-text-primary-base text-leading-b3 font-bold flex items-center gap-1 mb-1.5">
							<CircleAlert size={18} strokeWidth={1.6} color="var(--action-primary-base)" /> 앱이 실행되지 않으면 확인해주세요!
						</div>
						<div className="text-leading-d1">카카오톡, 네이버 등 인앱 브라우저를 사용 중이라면 
							우측 상단 또는 하단 메뉴(⋮)를 눌러 
							[다른 브라우저로 열기]를 선택해 주세요.
						</div>
					</Card>
				)}
			</motion.div>
		</>
	);
};

const WeblinkDetailHeader = () => {
  const handleClickAppStart = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const { android, ios } = MOBILE_APP_DOWNLOAD_URI;

    if (/iphone|ipad|ipod/.test(userAgent)) {
      window.location.href = ios;
    } else {
      window.location.href = android;
    }
  };

  return (
    <div className='flex justify-between items-center px-6 py-2.5 border-b border-border-neutral-base sticky top-0 bg-bg-base z-10'>
      <img src={hiclassLogo} alt="하이클래스" className='w-20 h-7' />
      <HiButton shape='pill' variant="tertiaryBlue" size="sm" className="text-leading-d1 font-bold" onClick={handleClickAppStart}>
        APP으로 시작하기
      </HiButton>
    </div>
  )
}

export const WeblinkDetailContentSkeleton = ({ envType, className, style }: { envType?: string, className?: string; style?: CSSProperties; }) => {
  return (
    <>
      {envType === 'mobileWeb' && <WeblinkDetailHeader/>}
      <div
        className={`min-h-135 overflow-y-auto px-5 py-6 md:px-8 ${className} flex flex-col`}
        style={style}
      >
        <div className="flex-1 flex flex-col">
          <Card variant="lightgray" className="text-text-primary-base text-center font-bold text-leading-b2 mb-5 !py-2.5 break-all" size="xs">
            <Skeleton width="80%" className="m-auto bg-bg-primary-base/8" />
          </Card>
          <Skeleton width="50%" className="mt-5" />
          <Skeleton width="100%" className="mt-2" />
          <Skeleton width="80%" className="mt-2" />
          <Skeleton width="40%" className="mt-2" />
          <Skeleton width="70%" className="mt-2" />
          <Skeleton width="30%" className="mt-2" />
          <Skeleton width="90%" className="mt-2" />
          <Skeleton width="40%" className="mt-2" />
          <Skeleton width="100%" height="260px" className="mt-5" />
          <Skeleton width="100%" height="260px" className="mt-5" />
        </div>
      </div>
      </>
  )
}
