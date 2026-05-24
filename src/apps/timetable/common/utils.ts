import { Class, Course, CourseBase, TimetableDailyLessonChangeType, TimetableGrade } from "../core/types";
import { LessonDay } from "./types";


const ArrayUtils = {
  // A배열에서 B배열을 뺀 결과를 반환한다.
  substractNumberArrays: (A: number[], B: number[]) => {
    const countMap = new Map();
    B.forEach((num) => countMap.set(num, (countMap.get(num) || 0) + 1));

    const result: number[] = [];
    A.forEach((num) => {
      if (countMap.has(num) && countMap.get(num) > 0) {
        countMap.set(num, countMap.get(num) - 1); // B에서 하나 제거된 것으로 처리
      } else {
        result.push(num); // A에서 남은 값 추가
      }
    });

    return result;
  },

  safeArray: <T>(arr: T[] | undefined | null): T[] => {
    if (Array.isArray(arr)) {
      return arr;
    }
    return [];
  },

  stringToDigitArray: (str: string): number[] => {
     if (!/^[0-9]+$/.test(str)) {
      return [];
    }
    return str.split('').map(char => Number(char));
  },
};

const StringUtils = {
  // 문자열이 비어있는지 확인한다.
  isEmpty: (str: string | undefined | null) => {
    return !str || str.length === 0;
  },

  // 문자열이 비어있지 않은지 확인한다.
  isNotEmpty: (str: string | undefined | null) => {
    return !StringUtils.isEmpty(str);
  },

  safeString: (str: string | undefined | null) => {
    if (StringUtils.isNotEmpty(str)) {
      return str;
    }
    return '';
  }
};

const SetUtils = {
  hasIntersectionWithString: (setA: Set<string>, setB: Set<string>) => {
    return [...setA].some((item) => setB.has(item));
  },
};

const TimeUtils = {
  formatTimeFromDigits: (digits: string): string => {
    if (!/^\d{4}$/.test(digits)) {
      throw new Error('Invalid time format. Expected format is HHMM.');
    }
    const hours = digits.slice(0, 2);
    const minutes = digits.slice(2, 4);
    return `${hours}:${minutes}`;
  },

  addMinutesToTime: (time: string, minutesToAdd: number): string => {
    const [hourStr, minuteStr] = time.split(':');
    const hours = parseInt(hourStr, 10);
    const minutes = parseInt(minuteStr, 10);

    const totalMinutes = hours * 60 + minutes + minutesToAdd;

    const newHours = Math.floor((totalMinutes % 1440) / 60); // 1440 = 24*60
    const newMinutes = totalMinutes % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(newHours)}:${pad(newMinutes)}`;
  },


  formatTimestamp(ms: number, withoutSeconds: boolean = false): string {
    const date = new Date(ms);

    const pad = (n: number) => n.toString().padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);      // 0-based
    const day = pad(date.getDate());
    const hour = pad(date.getHours());
    const minute = pad(date.getMinutes());

    if(withoutSeconds) {
      return `${year}-${month}-${day} ${hour}:${minute}`;
    }

    const second = pad(date.getSeconds());

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  },

  getTodayAsNumber(): number {
    const today = new Date();
    return this.getDateAsNumber(today);
  },

  getDateAsNumber(date: Date): number {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작
    const dd = String(date.getDate()).padStart(2, '0');
    return Number(`${yyyy}${mm}${dd}`);
  },

  getNumberAsDate(yyyymmdd: number): Date {
    const str = yyyymmdd.toString();
    const year = parseInt(str.slice(0, 4), 10);
    const month = parseInt(str.slice(4, 6), 10) - 1; // JS의 month는 0-based
    const day = parseInt(str.slice(6, 8), 10);
    return new Date(year, month, day);
  },

  getDayOfWeek(yyyymmdd: number): number {
    const str = yyyymmdd.toString();
    const year = parseInt(str.slice(0, 4), 10);
    const month = parseInt(str.slice(4, 6), 10) - 1; // JS의 month는 0-based
    const day = parseInt(str.slice(6, 8), 10);

    const date = new Date(year, month, day);
    return date.getDay();
  },

  getWeekRange(yyyymmdd: number): [number, number] {
    const str = yyyymmdd.toString();
    const year = parseInt(str.slice(0, 4), 10);
    const month = parseInt(str.slice(4, 6), 10) - 1; // JS의 month는 0-based
    const day = parseInt(str.slice(6, 8), 10);

    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

    const sunday = new Date(date);
    sunday.setDate(date.getDate() - dayOfWeek);

    const saturday = new Date(date);
    saturday.setDate(date.getDate() + (6 - dayOfWeek));

    return [this.getDateAsNumber(sunday), this.getDateAsNumber(saturday)];
  },

  // 조회일을 포함해서 앞으로 3주간의 날짜 범위를 반환한다.
  get3WeekRange(yyyymmdd: number | undefined = undefined): [number, number][] {
    if (!yyyymmdd) {
      // yyyymmdd가 null인 경우 오늘 날짜로 계산
      yyyymmdd = this.getTodayAsNumber();
    }

    const str = yyyymmdd.toString();
    const year = parseInt(str.slice(0, 4), 10);
    const month = parseInt(str.slice(4, 6), 10) - 1; // JS의 month는 0-based
    const day = parseInt(str.slice(6, 8), 10);

    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

    const ranges: [number, number][] = [];
    for (let i = 0; i < 3; i++) {
      const startDate = new Date(date);
      startDate.setDate(date.getDate() - dayOfWeek + (i * 7));

      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);

      ranges.push([this.getDateAsNumber(startDate), this.getDateAsNumber(endDate)]);
    }

    return ranges;
  },

  getNumberToTimestamp(yyyymmdd: number): number {
    const date = this.getNumberAsDate(yyyymmdd);
    return date.getTime();
  },

  getTimestampToNumber(timestamp: number): number {
    const date = new Date(timestamp);
    return this.getDateAsNumber(date);
  },

  generateLessonDays(startDateYMD: number, weeks: number): LessonDay[] {
    const result: LessonDay[] = [];

    const startDate = this.getNumberAsDate(startDateYMD);

    const totalDays = weeks * 7;
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      result.push({
        lessonDate: this.getDateAsNumber(date),
        dayOfWeek: date.getDay(),
      });
    }

    return result;
  },

  generateLessonDaysWithRange(startDateYMD: number, endDateYMD: number): LessonDay[] {
    const result: LessonDay[] = [];

    const startDate = this.getNumberAsDate(startDateYMD);
    const endDate = this.getNumberAsDate(endDateYMD);

    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      result.push({
        lessonDate: this.getDateAsNumber(date),
        dayOfWeek: date.getDay(),
      });
    }

    return result;
  },

  getDateAsString(yyyymmdd: number): string {
    const date = this.getNumberAsDate(yyyymmdd);
    return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, '0')}월 ${String(date.getDate()).padStart(2, '0')}일`;
  },

}

const TimetableDisplayUtils = {
  formatFullClassName: (cls: Class): string => {
    // 학년/반 이름
    const { grade, gradeName, className, classNumber, isVirtual } = cls;
    const classType = isVirtual ? '가상 ' : '';

    const displayGradeName = gradeName ? `${gradeName}` : `${grade}`;
    const displayClassName = className ? `${className}` : `${classNumber}`;

    return `${displayGradeName}-${classType}${displayClassName}`;
  },

  formatClassName: (cls: Class): string => {
    // 반 이름
    const { className, classNumber, isVirtual } = cls;
    const classType = isVirtual ? '가상 ' : '';
    
    return className ? `${classType}${className}반` : `${classType}${classNumber}반`;
  },

  formatGradeName: (grd: TimetableGrade): string => {
    // 학년 이름
    const { grade, gradeName } = grd;
    return gradeName ? `${gradeName}학년` : `${grade}학년`;
  },

  formatCourseBaseTitle: (courseBase: CourseBase | null): string => {
    if (!courseBase) {
      return '';
    }
    const { displayedTitle, standardCourseTitle } = courseBase;
    return standardCourseTitle ? `${displayedTitle} (${standardCourseTitle})` : displayedTitle;    
  },

  formatCourseTitle: (course: Course | null): string => {
    if (!course) {
      return '';
    }
    const { displayedTitle, standardCourseTitle } = course;
    return standardCourseTitle ? `${displayedTitle} (${standardCourseTitle})` : displayedTitle;    
  },

  formatCourseTitleWithInfos: (course: Course | null, infos: { concurrentCourseTitle: string | null, roomName: string | null }): string => {
    if (!course) return '';

    const { displayedTitle } = course;
    const title = [infos.concurrentCourseTitle, displayedTitle].filter(Boolean).join(' ');
    return infos.roomName ? `${title} (${infos.roomName})` : title;
  },

  formatCourseTitleWithTexts: (courseTitle: string | null | undefined, concurrentCourseTitle: string | null | undefined, roomName: string | null | undefined): string => {
    if (!courseTitle) return '';

    const title = concurrentCourseTitle ? [concurrentCourseTitle, courseTitle].filter(Boolean).join(' ') : courseTitle;
    return roomName ? `${title} (${roomName})` : title;
  }
}

const TypeUtils = {
  isUUID: (uuid: string): boolean => {
    // UUID 형식: 8-4-4-4-12 자리의 16진수
    const uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
    return uuidRegex.test(uuid);
  },
  arraysEqual: (a?: string[], b?: string[]) => {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    const sa = [...a].sort();
    const sb = [...b].sort();
    return sa.every((v, i) => v === sb[i]);
  }
}

const LocalStorageUtils = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(key: string, defaultValue: any | undefined = undefined): any {
    const value = window.localStorage.getItem(key);

    if (value) {
      return JSON.parse(value);
    }
    return defaultValue ? defaultValue : undefined;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getSafeString(key: string): any {
    return this.get(key, '');
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set(key: string, value: any): void {
    if (!key) {
      return;
    }

    if (!value) {
      value = '';
    }

    const json = JSON.stringify(value);
    window.localStorage.setItem(key, json);
  },

  getLocalStorageSize() {
    let total = 0;

    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const item = localStorage.getItem(key);
        total += key.length + (item ? item.length : 0);
      }
    }

    return total; // 바이트 단위
  },

  formatBytes(bytes: number) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
  },

  printStorageSize() {
    console.log(
      `현재 로컬스토리지 용량: ${this.formatBytes(this.getLocalStorageSize())}`
    );
  },
};

export { ArrayUtils, StringUtils, SetUtils, TimeUtils, TimetableDisplayUtils, TypeUtils, LocalStorageUtils };