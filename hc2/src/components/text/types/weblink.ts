import { FileBase, FileCategory } from '@/types/multipart';

export interface WeblinkCreateResponse extends WeblinkCode {
  schoolId: string;
  weblinkId: string;
  code: string;
}

export interface WeblinkDetail {
  schoolId: string;
  title: string;
  content: string;
  schoolName: string;
  createTimestamp: number;
  expireTimestamp: number;
  files: WeblinkFile[];
}

export interface WeblinkFile extends FileBase {
  sortNo: number;
  fileCategory: FileCategory;
  fileWidth: number | null;
  fileHeight: number | null;
}

export interface WeblinkCode {
  code: string;
  targetCode?: string;
}