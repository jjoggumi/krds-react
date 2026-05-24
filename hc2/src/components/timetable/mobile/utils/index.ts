import { TimetableDailyLessonChangeType } from '../../core/types';

export * from '../../common/utils';

export const goBackWithNative: () => boolean = () => {
  const win = window as any;

  if (win.AOSHandler?.goBack) {
    win.AOSHandler.goBack();
    return true;
  }

  if (win.webkit?.messageHandlers?.iOSHandler) {
    win.webkit.messageHandlers.iOSHandler.postMessage({ command: 'goBack' });
    return true;
  }
  
  return false;
};

export const dispatchLessonChangeRequestSuccess = (changeType: TimetableDailyLessonChangeType) => {
  const win = window as any;

  if (win.AOSHandler?.lessonChangeRequestSuccess) {
    win.AOSHandler.lessonChangeRequestSuccess(changeType);
    return true;
  }
  
  if (win.webkit?.messageHandlers?.iOSHandler) {
    win.webkit.messageHandlers.iOSHandler.postMessage({ command: 'lessonChangeRequestSuccess', changeType: changeType });
    return true;
  }
  
  return false;
};

export const dispatchLessonChangeRequestFailed = (changeType: TimetableDailyLessonChangeType, errorMessage: string) => {
  const win = window as any;

  if (win.AOSHandler?.lessonChangeRequestFailed) {
    win.AOSHandler.lessonChangeRequestFailed(changeType, errorMessage);
    return true;
  }
  
  if (win.webkit?.messageHandlers?.iOSHandler) {
    win.webkit.messageHandlers.iOSHandler.postMessage({ command: 'lessonChangeRequestFailed', changeType: changeType, errorMessage: errorMessage  }); 
    return true;
  }
  
  return false;
};

export const dispatchLessonChangeHistoryClicked = (timetableId: string, lessonChangeId: string) => {
  const win = window as any;

  if (win.AOSHandler?.lessonChangeHistoryClicked) {
    win.AOSHandler.lessonChangeHistoryClicked(timetableId, lessonChangeId);
    return true;
  }
  
  if (win.webkit?.messageHandlers?.iOSHandler) {
    win.webkit.messageHandlers.iOSHandler.postMessage({ command: 'lessonChangeHistoryClicked', timetableId: timetableId, lessonChangeId: lessonChangeId });
    return true;
  }
  
  return false;
};

export const dispatchLessonChangeHistoryUpdated = (timetableId: string, lessonChangeId: string) => {
  const win = window as any;

  if (win.AOSHandler?.lessonChangeHistoryUpdated) {
    win.AOSHandler.lessonChangeHistoryUpdated(timetableId, lessonChangeId);
    return true;
  }
  
  if (win.webkit?.messageHandlers?.iOSHandler) {
    win.webkit.messageHandlers.iOSHandler.postMessage({ command: 'lessonChangeHistoryUpdated', timetableId: timetableId, lessonChangeId: lessonChangeId });
    return true;
  }
  
  return false;
};