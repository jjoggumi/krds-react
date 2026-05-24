import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import downloadjs from 'downloadjs';
import jszip from 'jszip';
import { saveAs } from 'file-saver';

interface AttachMediaFile {
    fileContentType: string;
    fileOriginalPath: string;
    fileTranscodePath?: string;
    fileThumbnailPath?: string;
    fileName: string;
    fileFlag?: string;
}

interface ImageViewerProps {
    items: AttachMediaFile[];
    initialIndex?: number;
    onClose: (e?: React.MouseEvent) => void;
}

const HcVideoReact: React.FC<{ file: AttachMediaFile }> = ({ file }) => {
    const isPlayableType = file.fileContentType.includes('video/mp4') || file.fileOriginalPath.includes('rtmp.i-scream.co.kr');
    const isEncoding = !isPlayableType && !file.fileTranscodePath;
    const playSrc = (file.fileTranscodePath || file.fileOriginalPath)?.replace('https://download.hiclass.net', 'https://streaming.hiclass.net');

    if (isEncoding) {
        return (
            <div className="img-vedio-view-wrap" style={{ cursor: 'pointer', height: '100%', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="img-vedio-view-inner">
                    <div className="img-view-wrap">
                        <div className="center-wrap">
                            <div className="img">
                                <div className="cover-empty">
                                    <div className="empty-icon01"><span>인코딩 중</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <video
            controls
            className="video-js vjs-theme-forest"
            src={playSrc}
            style={{ maxWidth: '100%', maxHeight: '900px', width: '100%' }}
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
        />
    );
};

export const ImageViewer: React.FC<ImageViewerProps> = ({ items, initialIndex = 0, onClose }) => {
    const [curIndex, setCurIndex] = useState(initialIndex);
    const [isShowSelectDownload, setIsShowSelectDownload] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);

    const curPage = curIndex + 1;
    const isFirstSlide = curIndex === 0;
    const isLastSlide = curIndex === items.length - 1;
    const curItem = items[curIndex];

    const curItemContentType = curItem?.fileContentType.startsWith('video') ? 'VIDEO' : 'IMAGE';
    const isDownload = true;
    const isAvailableDownload = true;

    const isShowPrintButton = curItemContentType !== 'VIDEO';
    const isAvailableSelectDownload = items.length > 1 && !items.some(v => v.fileContentType.includes('video'));

    useEffect(() => {
        document.body.classList.add('hidden');
        return () => {
            document.body.classList.remove('hidden');
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft' && !isFirstSlide) setCurIndex(prev => prev - 1);
            if (e.key === 'ArrowRight' && !isLastSlide) setCurIndex(prev => prev + 1);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFirstSlide, isLastSlide, onClose]);

    const handleModalInnerClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.matches('.modal-cont-inner') || target.matches('.modal-cont-inner .slide-wrap div:not(.vjs-control)')) {
            onClose(e);
        }
    };

    const downloadFile = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            setDownloading(true);
            const fileDownload = curItem.fileTranscodePath || curItem.fileOriginalPath;
            const fileName = curItem.fileName;

            const res = await axios({
                method: 'get',
                url: fileDownload,
                responseType: 'blob',
                onDownloadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setDownloadProgress(percentCompleted);
                    }
                }
            });
            const blob = new Blob([res.data], { type: 'application/octet-stream' });
            downloadjs(blob, fileName, "text/plain");
        } catch (err) {
            alert('파일 다운로드를 실패했습니다.\r잠시 후 다시 시도해주세요.');
        } finally {
            setDownloading(false);
            setIsShowSelectDownload(false);
        }
    };

    const downloadAll = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsShowSelectDownload(false);

        try {
            const zip = new jszip();
            let fileCount = 0;
            const archiveFileName = `묶음사진_전체저장_${new Date().toISOString().replace(/[:.]/g, '-')}.zip`;

            for (const file of items) {
                const url = (file.fileTranscodePath || file.fileOriginalPath).split("?")[0];
                const res = await axios({ method: 'get', url, responseType: 'blob' });
                const blob = new Blob([res.data], { type: 'application/octet-stream' });
                zip.file(`${fileCount + 1}_${file.fileName}`, blob);
                fileCount++;
            }

            const blob = await zip.generateAsync({ type: 'blob' });
            saveAs(blob, archiveFileName);
            alert('묶음사진 전체저장이 완료되었습니다.');
        } catch (err) {
            alert('묶음사진 전체저장이 실패하였습니다.');
        }
    };

    const onClickDownload = (e: React.MouseEvent) => {
        if (isAvailableSelectDownload) {
            setIsShowSelectDownload(true);
        } else {
            downloadFile(e);
        }
    };

    const onClickPrint = () => {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        iframe.contentWindow?.document.write(`<html><head><style>@media print { body { margin: 0; } img { max-width: 100%; height: auto; } }</style></head><body><img src="${curItem.fileOriginalPath}" /></body></html>`);
        iframe.contentWindow?.document.close();

        const img = iframe.contentWindow?.document.querySelector('img');
        if (img) {
            img.onload = () => {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 1000);
            };
        } else {
            document.body.removeChild(iframe);
        }
    };

    return (
        <div className="modal slick-modal view-album-modal has-top-btn-wrap" style={{ display: 'block' }}>
            <div className="modal-cont-wrap">
                <div className="modal-cont">
                    <div className="modal-cont-inner" onClick={handleModalInnerClick}>
                        <div className="modal-top-btn-wrap flex md:block">
                            {items.length !== 1 && (
                                <div className="page-conut-wrap !w-auto px-4 mx-4">
                                    {curPage} / {items.length}
                                </div>
                            )}
                            <div className="right-wrap">
                                {isShowPrintButton && isDownload && (
                                    <button className="print-btn" onClick={onClickPrint}>
                                        <span>인쇄</span>
                                    </button>
                                )}

                                {isAvailableDownload && isDownload && (
                                    <button className="download-btn" onClick={onClickDownload} disabled={downloading} style={{ position: 'relative' }}>
                                        <span>{downloading ? `다운중(${downloadProgress}%)` : "다운로드"}</span>
                                        {isShowSelectDownload && (
                                            <div className="download-select" style={{ whiteSpace: 'nowrap' }}>
                                                <span role="button" onClick={downloadAll}>묶음사진 전체 저장하기</span>
                                                <span role="button" onClick={downloadFile}>이 사진만 저장하기</span>
                                            </div>
                                        )}
                                    </button>
                                )}

                                <div className="modal-close-btn modal-close-icon" onClick={onClose} />
                            </div>
                        </div>

                        <div className="slide-wrap">
                            {items.length !== 1 && (
                                <>
                                    <button
                                        className={`slick-next slick-arrow ${isLastSlide ? 'slick-disabled' : ''} !bg-black/40 md:!bg-white/40`}
                                        onClick={(e) => { e.stopPropagation(); if (!isLastSlide) setCurIndex(prev => prev + 1); }}
                                        aria-label="Next"
                                        type="button"
                                    >
                                        Next
                                    </button>
                                    <button
                                        className={`slick-prev slick-arrow ${isFirstSlide ? 'slick-disabled' : ''} !bg-black/40 md:!bg-white/40`}
                                        onClick={(e) => { e.stopPropagation(); if (!isFirstSlide) setCurIndex(prev => prev - 1); }}
                                        aria-label="Previous"
                                        type="button"
                                    >
                                        Previous
                                    </button>
                                </>
                            )}

                            <div className="slick-slider slick-initialized">
                                <div className="slick-list">
                                    <div className="slick-track" style={{ opacity: 1 }}>
                                        <div className="slide slick-slide slick-current slick-active" style={{ width: '100%', position: 'relative', left: 0, top: 0, zIndex: 999, opacity: 1 }}>
                                            <div>
                                                {curItemContentType === 'IMAGE' ? (
                                                    <img
                                                        src={curItem.fileOriginalPath}
                                                        alt=""
                                                        onClick={(e) => e.stopPropagation()}
                                                        style={{ maxHeight: '900px', margin: '0 auto', display: 'block' }}
                                                    />
                                                ) : (
                                                    <HcVideoReact file={curItem} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
