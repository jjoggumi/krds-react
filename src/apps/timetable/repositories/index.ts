import { v4 as uuidv4 } from 'uuid';
import { JsonData } from '@/apps/timetable/repositories/sample-json-data';
import { LocalStorage } from '@/apps/timetable/core/mod/utils';

export const TimetableLocalStorage = {
  get: (key: string) => {
    return LocalStorage.get(`_${key}`);
  },
};

export const BaseRespository = {
  generateId: () => {
    return uuidv4();
  },

  get: async (key: string) => {
    const storageResult = TimetableLocalStorage.get(key);
    if (storageResult) {
      return storageResult;
    }

    return JsonData[key];
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set: async (key: string, data: any) => {
    LocalStorage.set(`_${key}`, data);
  },
};
