import { useMemo, useSyncExternalStore } from 'react';
import { TimetableLessonChangeStatus } from '../../core/types';

const LOCATION_CHANGE_EVENT = 'hc2:daily-locationchange';
const PATCH_FLAG = '__hc2DailyLocationPatched';

type DailyExternalQuery = {
  initTab: string | null;
  timetableId: string | null;
  initStatus: TimetableLessonChangeStatus | null;
};

type PatchedWindow = Window & {
  [PATCH_FLAG]?: boolean;
};

const dispatchLocationChange = () => {
  window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
};

const ensureLocationPatched = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const patchedWindow = window as PatchedWindow;
  if (patchedWindow[PATCH_FLAG]) {
    return;
  }

  const historyMethods = ['pushState', 'replaceState'] as const;

  historyMethods.forEach((methodName) => {
    const originalMethod = window.history[methodName] as (...args: any[]) => any;

    window.history[methodName] = function (...args: any[]) {
      const result = originalMethod.apply(this, args);
      dispatchLocationChange();
      return result;
    } as History[typeof methodName];
  });

  window.addEventListener('popstate', dispatchLocationChange);
  patchedWindow[PATCH_FLAG] = true;
};

const subscribeLocationChange = (callback: () => void) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  ensureLocationPatched();
  window.addEventListener(LOCATION_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener(LOCATION_CHANGE_EVENT, callback);
  };
};

const getLocationSearch = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.location.search;
};

export const useDailyExternalQuery = (): DailyExternalQuery => {
  const search = useSyncExternalStore(subscribeLocationChange, getLocationSearch, () => '');

  return useMemo(() => {
    const searchParams = new URLSearchParams(search);

    return {
      initTab: searchParams.get('initTab'),
      timetableId: searchParams.get('timetableId'),
      initStatus: searchParams.get('initStatus') as TimetableLessonChangeStatus | null,
    };
  }, [search]);
};
