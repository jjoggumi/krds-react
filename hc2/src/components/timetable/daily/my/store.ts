// timetableId만 공유하는 가장 간단한 형태의 store를 만들기 위해 사용

import { create } from 'zustand';

type DailyTimetableStore = {
  storedTimetableId: string;
  setStoredTimetableId: (id: string) => void;
}

export const useDailyTimetableStore = create<DailyTimetableStore>((set) => ({
  storedTimetableId: '',
  setStoredTimetableId: (id: string) => set({ storedTimetableId: id }),
}));