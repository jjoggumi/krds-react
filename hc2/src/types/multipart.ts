export interface FileBase {
  fileName: string;
  fileContentType: string;
  fileOriginalPath: string;
  fileThumbnailPath?: string | null;
  fileConvertPath?: string | null;
}

export enum FileCategory {
  IMAGE = 'IMAGE',
  PDF = 'PDF'
}

export interface UploadMultipartsResponse {
  _embedded: {
    multiparts: Multipart[];
  }
}

export interface Multipart {
  contentType: string;
  filename: string;
  lastModified: number;
  requestId: string | null;
  size: number;
  _links: {
    original: {
      href: string;
    },
    thumbnail?: {
      href: string;
    },
    convert?: {
      href: string;
    }
  }
}