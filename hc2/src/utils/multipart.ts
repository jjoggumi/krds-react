import { FileCategory } from '@/types/multipart';

export const isImage = (type: string) => {
  return type.startsWith('image/')
}

export const isVideo = (type: string) => {
  return type.startsWith('video/')
}

export const isPdf = (type: string) => {
  return type === 'application/pdf'
}

export const getFileCategoryByFileType = (type: string) => {
  if (isImage(type)) {
    return FileCategory.IMAGE;
  } else if (isPdf(type)) {
    return FileCategory.PDF;
  }
  return null;
}