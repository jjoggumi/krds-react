const CDN_BASE_URL = 'https://download.hiclass.net';

export const EXTERNAL_LINKS = {
  DOCS: {},
  IMAGES: {
    DEFAULT_CLASS: `${CDN_BASE_URL}/static/images/class_image_default.png`,
  }
} as const;

const getAllValues = (obj: any): string[] => {
  if (typeof obj !== 'object' || obj === null) return [];
  return Object.values(obj).flatMap((v) =>
    typeof v === 'object' ? getAllValues(v) : String(v)
  );
};

export const PROTECTED_URL_SET = new Set(getAllValues(EXTERNAL_LINKS));