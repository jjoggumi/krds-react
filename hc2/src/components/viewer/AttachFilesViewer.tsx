import React from 'react';
import { ImageViewer } from './ImageViewer';
import { DocViewer } from './DocViewer';
import { FileCategory } from '@/types/multipart';

export interface AttachFile {
    fileContentType: string;
    fileCategory: FileCategory;
    fileOriginalPath: string;
    fileTranscodePath?: string;
    fileConvertPath?: string;
    fileThumbnailPath?: string;
    fileName: string;
    fileFlag?: string;
}

export interface AttachFilesViewerProps {
    isOpen: boolean;
    onClose: (e?: React.MouseEvent) => void;
    items?: AttachFile[];
    index?: number;
    contentType?: string;
    item?: AttachFile;
}

export const AttachFilesViewer: React.FC<AttachFilesViewerProps> = ({
    isOpen,
    onClose,
    items,
    index = 0,
    contentType,
    item,
}) => {
    if (!isOpen) return null;

    const isImageOrVideo = contentType
        ? contentType.startsWith('image') || contentType.startsWith('video')
        : items && items.length > 0 && items[0].fileContentType
            ? items[0].fileContentType.startsWith('image') || items[0].fileContentType.startsWith('video')
            : false;

    if (isImageOrVideo && items) {
        return <ImageViewer items={items} initialIndex={index} onClose={onClose} />;
    }

    const docItem = item || (items && items.length > 0 ? items[0] : null);

    if (docItem) {
        return <DocViewer file={docItem} onClose={onClose} />;
    }

    return null;
};
