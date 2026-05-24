import React, { useState, useEffect, useRef, useCallback } from 'react';
import downloadjs from 'downloadjs';
import './DocViewer.css';

interface AttachDocFile {
    fileContentType: string;
    fileOriginalPath: string;
    fileTranscodePath?: string;
    fileConvertPath?: string;
    fileName: string;
}

interface DocViewerProps {
    file: AttachDocFile;
    onClose: (e?: React.MouseEvent) => void;
}

declare global {
    interface Window {
        pdfjsLib: any;
    }
}

export const DocViewer: React.FC<DocViewerProps> = ({ file, onClose }) => {
    const [isFileLoading, setIsFileLoading] = useState(true);
    const [numPages, setNumPages] = useState(0);
    const [viewPage, setViewPage] = useState(1);
    const [zoomScale, setZoomScale] = useState(1);
    const [objectURL, setObjectURL] = useState<string | null>(null);

    const pdfSideContainerRef = useRef<HTMLDivElement>(null);
    const pdfContainerRef = useRef<HTMLDivElement>(null);
    const pdfIframeRef = useRef<HTMLIFrameElement>(null);
    const scrollTimeoutRef = useRef<any>(null);

    const filePath = file.fileConvertPath || file.fileOriginalPath;
    const iframeUrl = objectURL || filePath;

    const isAvailablePreview = useCallback(() => {
        const enabledFileExt = ['pdf', 'hwp', 'hwpx', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt'];
        const parts = file.fileOriginalPath.split('.');
        const extension = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';

        if (extension === 'pdf') return true;
        return enabledFileExt.includes(extension) && !!file.fileConvertPath;
    }, [file]);

    const fileDownload = useCallback(async (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        try {
            const response = await fetch(file.fileOriginalPath);
            if (!response.ok) throw new Error('Network response was not ok');
            const blob = await response.blob();
            downloadjs(blob, file.fileName, "application/octet-stream");
        } catch (error) {
            alert('파일 다운로드에 실패했습니다. 잠시 후 다시 시도해주세요.');
            console.error('Download error:', error);
        }
    }, [file]);

    useEffect(() => {
        document.body.classList.add('hidden');
        return () => {
            document.body.classList.remove('hidden');
            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
            if (objectURL) URL.revokeObjectURL(objectURL);
        };
    }, [objectURL]);

    useEffect(() => {
        const loadPdf = async () => {
            if (!isAvailablePreview()) {
                alert('미리보기를 지원하지 않는 파일입니다.\n첨부파일을 다운로드 합니다.');
                fileDownload();
                onClose();
                return;
            }

            setIsFileLoading(true);
            try {
                const response = await fetch(filePath);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setObjectURL(url);

                if (!window.pdfjsLib) {
                    throw new Error("Cannot read property 'getDocument' of undefined");
                }

                const pdf = await window.pdfjsLib.getDocument({
                    url: url,
                    cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/`,
                    cMapPacked: true,
                }).promise;

                setNumPages(pdf.numPages);

                const container = pdfContainerRef.current;
                const sideBar = pdfSideContainerRef.current;
                if (!container || !sideBar) return;

                container.innerHTML = '';
                const sideBarContent = sideBar.querySelector('.pdf-side-content') || sideBar;
                sideBarContent.innerHTML = '';

                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const scale = 1.2;
                    const viewport = page.getViewport({ scale });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');

                    if (context) {
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        canvas.className = 'pdf-page';
                        canvas.style.display = 'block';
                        canvas.style.margin = '0 auto 10px auto';
                        canvas.dataset.baseWidth = String(viewport.width);
                        canvas.dataset.baseHeight = String(viewport.height);
                        container.appendChild(canvas);

                        await page.render({ canvasContext: context, viewport }).promise;
                    }
                }

                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const scale = 0.5;
                    const viewport = page.getViewport({ scale });

                    const thumbWrapper = document.createElement('div');
                    thumbWrapper.className = 'thumbnail-wrapper';

                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');

                    if (context) {
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        canvas.dataset.pageNum = String(pageNum);
                        if (pageNum === 1) canvas.classList.add('active');

                        const pageLabel = document.createElement('div');
                        pageLabel.className = 'page-label';
                        pageLabel.textContent = String(pageNum);

                        canvas.addEventListener('click', () => {
                            setViewPage(pageNum);
                            updateSidebarActive(pageNum);
                            const targetPage = container.querySelector(`canvas:nth-child(${pageNum})`);
                            if (targetPage) targetPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        });

                        canvas.classList.add('pdf-thumb-canvas');
                        thumbWrapper.appendChild(canvas);
                        thumbWrapper.appendChild(pageLabel);
                        sideBarContent.appendChild(thumbWrapper);

                        await page.render({ canvasContext: context, viewport }).promise;
                    }
                }
            } catch (err: any) {
                if (err.message === 'Failed to fetch') {
                    alert('PDF 다운로드를 실패하였습니다.');
                } else if (err.message === "Cannot read property 'getDocument' of undefined" || !window.pdfjsLib) {
                    alert('PDF 뷰어를 정상적으로 사용하기 위해서 브라우저 업데이트가 필요합니다.');
                } else if (err.message === "Invalid PDF structure.") {
                    alert('파일이 손상되어 PDF 뷰어를 실행할 수 없습니다.');
                } else if (err.message === "No password given") {
                    alert('미리보기를 지원하지 않는 파일입니다.\n첨부파일을 다운로드 합니다.');
                    fileDownload();
                } else {
                    alert('PDF 로드중 오류가 발생하였습니다. 브라우저 업데이트가 필요합니다.');
                }
                onClose();
            } finally {
                setIsFileLoading(false);
            }
        };

        loadPdf();
    }, [filePath, isAvailablePreview, fileDownload, onClose]);

    const updateSidebarActive = (pageNum: number) => {
        const sideBar = pdfSideContainerRef.current;
        if (!sideBar) return;

        const sideBarContent = sideBar.querySelector('.pdf-side-content') || sideBar;
        const currentActive = sideBarContent.querySelector('.pdf-thumb-canvas.active');
        const newActive = sideBarContent.querySelector(`canvas[data-page-num="${pageNum}"]`);

        if (currentActive) currentActive.classList.remove('active');
        if (newActive) {
            newActive.classList.add('active');
            const thumbnailWrapper = newActive.closest('.thumbnail-wrapper') as HTMLElement;

            if (thumbnailWrapper) {
                const sideBarTop = sideBarContent.scrollTop;
                const sideBarBottom = sideBarTop + sideBarContent.clientHeight;
                const thumbnailTop = thumbnailWrapper.offsetTop;
                const thumbnailBottom = thumbnailTop + thumbnailWrapper.offsetHeight;

                if (thumbnailTop < sideBarTop) {
                    sideBarContent.scrollTo({ top: thumbnailTop - 20, behavior: 'smooth' });
                } else if (thumbnailBottom > sideBarBottom) {
                    sideBarContent.scrollTo({ top: thumbnailBottom - sideBarContent.clientHeight + 20, behavior: 'smooth' });
                }
            }
        }
    };

    const handleScroll = useCallback(() => {
        const container = pdfContainerRef.current;
        if (!container) return;

        const canvases = container.querySelectorAll('canvas.pdf-page');
        if (canvases.length === 0) return;

        const containerTop = container.scrollTop;
        const containerBottom = containerTop + container.clientHeight;

        let newViewPage = viewPage;
        let maxVisibleArea = 0;
        let maxVisibleRatio = 0;

        canvases.forEach((canvas, index) => {
            const el = canvas as HTMLElement;
            const pageNum = index + 1;
            const canvasTop = el.offsetTop;
            const canvasBottom = canvasTop + el.offsetHeight;

            const visibleTop = Math.max(containerTop, canvasTop);
            const visibleBottom = Math.min(containerBottom, canvasBottom);
            const visibleHeight = Math.max(0, visibleBottom - visibleTop);
            const visibleRatio = visibleHeight / el.offsetHeight;

            if (visibleHeight > 0) {
                if (visibleRatio >= 0.5 && visibleHeight > maxVisibleArea) {
                    maxVisibleArea = visibleHeight;
                    maxVisibleRatio = visibleRatio;
                    newViewPage = pageNum;
                } else if (maxVisibleArea === 0 && visibleRatio > maxVisibleRatio) {
                    maxVisibleRatio = visibleRatio;
                    newViewPage = pageNum;
                }
            }
        });

        if (newViewPage !== viewPage) {
            setViewPage(newViewPage);
            updateSidebarActive(newViewPage);
        }
    }, [viewPage]);

    const throttledHandleScroll = useCallback(() => {
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => handleScroll(), 100);
    }, [handleScroll]);

    useEffect(() => {
        const container = pdfContainerRef.current;
        if (container) {
            container.addEventListener('scroll', throttledHandleScroll, { passive: true });
        }
        return () => {
            if (container) {
                container.removeEventListener('scroll', throttledHandleScroll);
            }
        };
    }, [throttledHandleScroll]);

    const applyZoom = useCallback((newZoom: number) => {
        const container = pdfContainerRef.current;
        if (!container) return;

        const canvases = container.querySelectorAll('canvas.pdf-page');
        let maxWidth = 0;

        canvases.forEach(canvas => {
            const el = canvas as HTMLCanvasElement;
            const baseWidth = parseFloat(el.dataset.baseWidth || '0');
            const baseHeight = parseFloat(el.dataset.baseHeight || '0');

            let newWidth = baseWidth * newZoom;
            let newHeight = baseHeight * newZoom;

            el.style.width = `${newWidth}px`;
            el.style.height = `${newHeight}px`;

            if (newWidth > maxWidth) maxWidth = newWidth;
        });

        container.style.width = `${maxWidth}px`;
    }, []);

    const handleWheelZoom = useCallback((e: WheelEvent) => {
        if (!e.ctrlKey) return;
        e.preventDefault();

        const delta = e.deltaY < 0 ? 1 : -1;
        let newZoom = zoomScale + delta * 0.1;
        newZoom = Math.min(2, Math.max(0.5, newZoom));

        if (newZoom !== zoomScale) {
            setZoomScale(newZoom);
            applyZoom(newZoom);
        }
    }, [zoomScale, applyZoom]);

    useEffect(() => {
        const container = pdfContainerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheelZoom, { passive: false });
        }
        return () => {
            if (container) {
                container.removeEventListener('wheel', handleWheelZoom);
            }
        };
    }, [handleWheelZoom]);

    const handleModalClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if ((target.matches('div.modal-cont-inner') || target.matches('div.modal-cont-wrap')) && numPages > 0) {
            onClose(e);
        }
    };

    const pdfPrint = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (pdfIframeRef.current && pdfIframeRef.current.contentWindow) {
            pdfIframeRef.current.contentWindow.print();
        }
    };

    return (
        <div className="modal print-note-modal has-top-btn-wrap" style={{ display: 'block' }}>
            <div className="modal-cont-wrap" onClick={handleModalClick}>
                <div className="h-full">
                    <div className="h-full p-0" >
                        <div className="modal-top-btn-wrap">
                            <div className="right-wrap">
                                <button className="print-btn" onClick={pdfPrint}>
                                    <span>인쇄</span>
                                </button>
                                <button className="download-btn" onClick={fileDownload}>
                                    <span>다운로드</span>
                                </button>
                                <div className="modal-close-btn modal-close-icon" onClick={onClose}></div>
                            </div>
                        </div>

                        {isFileLoading && (
                            <div style={{ display: 'flex', width: '100%', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ color: '#fff', fontSize: '18px' }}>PDF 문서를 불러오는 중입니다...</div>
                            </div>
                        )}

                        <div style={{ display: isFileLoading ? 'none' : 'flex' }} className="pdf-viewer-layout">
                            <div ref={pdfSideContainerRef} className="pdf-side-bar">
                                <div className="side-bar-title">
                                    <span className="current-page">{viewPage}</span>
                                    <span className="unit">/</span>
                                    <span>{numPages}</span>
                                </div>
                                <div className="pdf-side-content custom-scr"></div>
                            </div>
                            <div ref={pdfContainerRef} className="pdf-main-content custom-scr"></div>
                        </div>
                    </div>
                    <div style={{ display: 'none' }}>
                        <iframe ref={pdfIframeRef} src={iframeUrl}></iframe>
                    </div>
                </div>
            </div>
        </div>
    );
};
