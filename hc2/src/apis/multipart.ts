import { env } from '@/supporters/migrations'

export const upload = async (files: File[]) => {
  const fileDatas = new FormData();

  for (const file of files) {
    fileDatas.append('file', file, file.name);
  }

  const response = await fetch(env.BASE_FILE_URI + '/multiparts', {
    method: 'POST',
    body: fileDatas
  });

  if (!response.ok) {
    throw new Error('File upload failed');
  }

  return await response.json();
};

export const deleteUploadedFile = async (deleteFile: Record<string, string>) => {
  const queryString = new URLSearchParams(deleteFile).toString();

  const response = await fetch(env.BASE_FILE_URI + `/multipart/delete?${queryString}`, {
    method: 'POST'
  });

  if (!response.ok) {
    throw new Error('File delete failed');
  }

  return await response.json();
};
