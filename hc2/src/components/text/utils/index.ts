import { CurrentRoute, SendTargetWithValidation } from '@/components/text/types';
import { ShowConfirm, CONFIRM_OPTIONS} from '@/components/uiux';
import { CONTENT_FIELDS, SEND_GRAPHIC_CHARS } from '@/components/text/constants';

export * from './contact';
export * from './sendResult';
export * from './weblink';

export const dispatchRouteChange = (route: CurrentRoute) => {
  const event = new CustomEvent('react-route-change', { detail: route });
  window.dispatchEvent(event);
}

interface Hc2TextEvent {
  command: string;
  eventData?: any;
}

export const handleHc2TextEvent = (hc2TextEvent: Hc2TextEvent) => {
  const event = new CustomEvent('handle-hc2-text-event', { detail: hc2TextEvent });
  window.dispatchEvent(event);
}

// TODO: 시수표 업로드 배포되면 utils 로 교체 후 제거
export const downloadFromUrl = async (fileName: string, url: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('url download error:', error);
  }
}

export const showUploadFileInvalidAlert = async (confirmClass: string) => {
  await ShowConfirm('업로드 된 파일에 오류가 있습니다.\n다시 확인해주세요.', {
    ...CONFIRM_OPTIONS.TEXT,
    confirmLabel: '확인',
    hideCancel: false,
  });
};

export const showUploadFileResetAlert = async () => {
  return await ShowConfirm('엑셀 파일을 새로 업로드 하시면\n기존 생성한 데이터는 삭제됩니다.\n파일 업로드를 진행하시겠습니까?',{
    ...CONFIRM_OPTIONS.TEXT,
  })
};

export const extractEmojisFromString = (text: string) => {
  if (!text) return [];

  const arr = Array.from(text);
  const invalid = [];

  for (const ch of arr) {
    if (Array.from(SEND_GRAPHIC_CHARS).includes(ch)) continue;
    if (/\p{Extended_Pictographic}/u.test(ch)) {
      invalid.push(ch);
    }
  }
  return invalid;
};

export const removeEmojisFromString = (text: string) => {
  if (!text) return "";

  const arr = Array.from(text);
  const cleanChars = arr.filter((ch) => {
    if (Array.from(SEND_GRAPHIC_CHARS).includes(ch)) return true;
    return !/\p{Extended_Pictographic}/u.test(ch);
  });

  return cleanChars.join('');
};


export const replaceMessage = (message: string, row: SendTargetWithValidation) => {
  const replacements: Record<string, string> = {
    '[*대분류*]': row.depth1,
    '[*소분류*]': row.depth2,
    '[*이름*]': row.contactName,
    '[*1*]': row.field1,
    '[*2*]': row.field2,
    '[*3*]': row.field3,
    '[*4*]': row.field4,
    '[*5*]': row.field5,
    '[*6*]': row.field6,
    '[*7*]': row.field7,
    '[*8*]': row.field8
  };

  return Object.entries(replacements).reduce(
    (acc, [key, value]) => acc.split(key).join(value ?? ''),
    message
  );
};

export const applyHighlightMessage = (message: string) => {
  const fieldNames = CONTENT_FIELDS.map(CONTENT_FIELD => CONTENT_FIELD.value);
  let highlightedMessage = message;
  fieldNames.forEach((field) => {
    highlightedMessage = highlightedMessage.replaceAll(field, `<span class="text-text-primary-base">${field}</span>`);
  });

  return highlightedMessage;
};

export const hasVariable = (message: string) => {
  if (!message) return false;
  const fieldNames = CONTENT_FIELDS.map((field) => field.value);
  return fieldNames.some((field) => message.includes(field));
};
