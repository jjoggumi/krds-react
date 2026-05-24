import { env } from '@/supporters/migrations';
import { WeblinkCode } from '../types';
import moment from 'moment';
import { ShowConfirm, CONFIRM_OPTIONS } from '@/components/uiux';


export const getWeblinkUrl = (value: WeblinkCode) => {
  const weblink_uri = env.TEXT_WEBLINK_URI;
  if (value.targetCode == null || value.targetCode === undefined) {
    return `${weblink_uri}/m/${value.code}`;
  }
  return `${weblink_uri}/m/${value.code}/${value.targetCode}`;
}

export const renderPeriodTimestamp = (value: number) => {
  if(value) {
    return moment(value).format('YYYY.MM.DD');
  } else {
    return '';
  }
};

export const replaceWeblinkContent = (message: string) => {
  return message.replace(/(?:\r?\n)*상세보기\r?\nhttps?:\/\/[^\s]+(?:\s*)$/, '');
}

export const weblinkAlert = async (message: string) => {
  const win = window as any;
  if (win.AOSHandler) {
    if (win.AOSHandler.showAlert) {
      win.AOSHandler.showAlert(message);
    }
  } else if (win.webkit?.messageHandlers?.iOSHandler) {
    win.webkit.messageHandlers.iOSHandler.postMessage({ command: 'showAlert', message });
  } else {
    await ShowConfirm(message, {
      ...CONFIRM_OPTIONS.TEXT,
      confirmLabel: '확인',
      hideCancel: true,
    });
  }
}