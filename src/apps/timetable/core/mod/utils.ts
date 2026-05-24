import { TimeUtils } from '../../common/utils';
import {
  Class,
  ConsecutivePeriodOption,
  Course,
  CourseBase,
  DailyPeriodTuple,
  DatePeriod,
  Lesson,
  LessonDay,
  PeriodTuple,
  TimetablePeriod,
} from '../types';

const TimetableUtils = {
  // idset을 비교하기 위함
  hasIntersectionWithStringSets: (setA: Set<string>, setB: Set<string>) => {
    return [...setA].some((item) => setB.has(item));
  },

  /*
   * 수업요일 목록을 요일 인덱스 목록으로 변환한다.
   *
   * @param classDays 수업요일 목록 (ex: [0, 1, 1, 1, 1, 1, 0])
   *
   * @returns 요일 인덱스 목록 (ex: [1, 2, 3, 4, 5])
   */
  classDaysTodDayIndexArray(classDays: number[]): number[] {
    const dayIndexArray = [] as number[];
    for (let i = 0; i < classDays.length; i++) {
      if (classDays[i] !== 1) {
        continue;
      }

      dayIndexArray.push(i);
    }

    return dayIndexArray;
  },

  /*
   * 수업요일과 최대 교시수, 수업없음시간을 이용하여 채워야할 교시 목록[요일, 교시]을 생성한다.
   *
   * @param dayOfWeeks 수업요일 목록
   * @param maxPeriod 최대 교시수
   * @param freePeriods 수업없음시간 목록
   *
   * @returns 채워야할 교시 목록 (ex: [[1, 1], [1, 2], ... ])
   */
  createPeriodTuplesWithDayOfWeeks(
    dayOfWeeks: number[],
    maxPeriod: number,
    freePeriods: PeriodTuple[]
  ): PeriodTuple[] {
    const periodTuples = [] as PeriodTuple[];
    dayOfWeeks.forEach((dayOfWeek) => {
      for (let period = 1; period <= maxPeriod; period++) {
        if (freePeriods.some((p) => p[0] === dayOfWeek && p[1] === period)) {
          continue;
        }

        periodTuples.push([dayOfWeek, period]);
      }
    });

    return periodTuples;
  },

  createDailyPeriodTuplesWithLessonDays(
    lessonDays: LessonDay[],
    maxPeriod: number,
    freePeriods: PeriodTuple[]
  ): DailyPeriodTuple[] {
    
    const periodTuples = [] as DailyPeriodTuple[];
    
    lessonDays.forEach(({lessonDate, dayOfWeek}) => {
      for (let period = 1; period <= maxPeriod; period++) {
        if (freePeriods.some((p) => p[0] === lessonDate && p[1] === period)) {
          continue;
        }

        // const dayOfWeek = TimeUtils.getNumberAsDate(lessonDate).getDay();
        periodTuples.push([lessonDate, period, dayOfWeek]);
      }
    });

    return periodTuples;
  },


  /**
   * PeriodTuple 배열들의 교집합을 생성하는 함수
   * @param arrays 여러 개의 PeriodTuple 배열
   * @returns 모든 배열에 공통으로 존재하는 튜플들로 구성된 교집합 배열
   */
  intersectPeriodTuples(...arrays: PeriodTuple[][]): PeriodTuple[] {
    if (arrays.length === 0) return []; // 빈 배열 처리

    // 첫 번째 배열을 기준으로 필터링
    return arrays[0].filter((tuple) =>
      arrays
        .slice(1)
        .every((array) =>
          array.some((other) => other[0] === tuple[0] && other[1] === tuple[1])
        )
    );
  },

  /**
   * PeriodTuple 배열들의 합집합을 생성하는 함수
   * @param arrays 여러 개의 PeriodTuple 배열
   * @returns 모든 배열에 존재하는 튜플들로 구성된 합집합 배열
   */
  unionPeriodTuples(...arrays: PeriodTuple[][]): PeriodTuple[] {
    const tupleSet = new Set<string>();

    arrays.forEach((array) => {
      array.forEach((tuple) => {
        const key = `${tuple[0]}-${tuple[1]}`;
        tupleSet.add(key);
      });
    });

    // Set을 다시 PeriodTuple 배열로 변환
    const result: PeriodTuple[] = Array.from(tupleSet).map((key) => {
      const [day, period] = key.split('-').map(Number);
      return [day, period] as PeriodTuple;
    });

    return result;
  },

  /**
   * 두 개의 PeriodTuple 배열들이 동일한지 비교하는 함수
   * @param arrays 여러 개의 PeriodTuple 배열
   * @returns 동일하면 true, 아니면 false
   */

  arePeriodTuplesEqual(
    arrayA: PeriodTuple[],
    arrayB: PeriodTuple[]
  ): boolean {
    if (arrayA.length !== arrayB.length) {
      return false;
    }

    const sortedA = arrayA
      .map((tuple) => `${tuple[0]}-${tuple[1]}`)
      .sort();
    const sortedB = arrayB
      .map((tuple) => `${tuple[0]}-${tuple[1]}`)
      .sort();

    for (let i = 0; i < sortedA.length; i++) {
      if (sortedA[i] !== sortedB[i]) {
        return false;
      }
    }

    return true;
  },

  /**
   * TimetablePeriod 배열을 deep copy 하는 함수
   * @param periods TimetablePeriod 배열
   * @returns 복사된 TimetablePeriod 배열
   */
  deepCopyTimetablePeriods(
    periods: TimetablePeriod[]
  ): TimetablePeriod[] {
    return periods.map((p) => ({ dayOfWeek: p.dayOfWeek, period: p.period }));
  },

  /**
   * PeriodTuple 배열들의 교집합을 생성하는 함수
   * @param arrays 여러 개의 DailyPeriodTuple 배열
   * @returns 모든 배열에 공통으로 존재하는 튜플들로 구성된 교집합 배열
   */
  intersectDailyPeriodTuples(...arrays: DailyPeriodTuple[][]): DailyPeriodTuple[] {
    if (arrays.length === 0) return []; // 빈 배열 처리

    // 첫 번째 배열을 기준으로 필터링: lessonDate, period 만 비교
    return arrays[0].filter((tuple) =>
      arrays
        .slice(1)
        .every((array) =>
          array.some((other) => other[0] === tuple[0] && other[1] === tuple[1])
        )
    );
  },


  /**
   * A 배열에서 B 배열의 첫 번째 값과 동일한 튜플을 제외
   * - 동일한 요일의 튜플을 제외하여 배정하기 위함.
   * @param A PeriodTuple 배열
   * @param B PeriodTuple 배열
   * @returns B의 첫 번째 값과 중복되지 않는 A의 튜플들
   */
  periodTuplesExcludeByFirstValue(
    A: PeriodTuple[],
    B: PeriodTuple[]
  ): PeriodTuple[] {
    // B 배열의 첫 번째 값들을 Set으로 저장
    const firstValuesInB = new Set(B.map((tuple) => tuple[0]));

    // A 배열에서 B의 첫 번째 값과 동일한 것을 제외
    return A.filter((tuple) => !firstValuesInB.has(tuple[0]));
  },

  /*
   * 연속된 교시들의 길이를 계산한다.
   * 이미 배정된 연속 시수를 계산할 때 사용한다.
   * 연속된 배열 길이의 목록을 반환한다.
   * - 예) [1, 1], [1, 2], [1, 3], [1, 5], [2, 1], [2, 2], [3, 4] => [3, 1, 2, 1]
   */
  getContinuousPeriods(periods: PeriodTuple[]): number[] {
    if (periods.length === 0) return [];

    // 튜플을 요일, 교시 순서로 정렬
    const sortedPeriods = periods.sort(
      ([dayA, periodA], [dayB, periodB]) => dayA - dayB || periodA - periodB
    );

    const result: number[] = [];
    let count = 1;

    for (let i = 1; i < sortedPeriods.length; i++) {
      const [currentDay, currentPeriod] = sortedPeriods[i];
      const [previousDay, previousPeriod] = sortedPeriods[i - 1];

      if (
        currentDay === previousDay && // 같은 요일
        currentPeriod === previousPeriod + 1 // 연속된 교시
      ) {
        count++;
      } else {
        result.push(count); // 연속이 끊기면 결과 배열에 추가
        count = 1; // 카운트 초기화
      }
    }

    result.push(count); // 마지막 그룹 추가
    return result;
  },

  /*
   * 배열 A에서 배열 B를 제외하는 함수
   * - 중복된 값이 있을 경우 모두 제외하는 것이 아닌, B에 남은 값만큼 제외
   */
  subtractArraysAllowDuplicates(A: number[], B: number[]): number[] {
    // B를 복사하여 사용 (mutable하게 처리)
    const copyB = [...B];

    return A.filter((item) => {
      const index = copyB.indexOf(item); // B에서 요소의 위치 확인
      if (index !== -1) {
        copyB.splice(index, 1); // B에서 해당 요소 제거
        return false; // A에서 제외
      }
      return true; // A에 남김
    });
  },

  /**
   * 주어진 배정 수 만큼 연속된 시간을 찾는 함수
   * @param periods PeriodTuple 배열
   * @param assignPeriodCount 연속된 시간의 길이
   * @returns 연속된 시간 구간의 첫 PeriodTuple 배열
   */
  getFirstPeriodsOfContinuousPeriods(
    periods: PeriodTuple[],
    assignPeriodCount: number,
    forbiddenMiddlePeriod: number = 0
  ): PeriodTuple[] {
    const result: PeriodTuple[] = [];

    // 같은 요일의 PeriodTuple을 그룹화
    const groupedByDay = periods.reduce<Record<number, PeriodTuple[]>>(
      (acc, [day, period]) => {
        if (!acc[day]) acc[day] = [];
        acc[day].push([day, period]);
        return acc;
      },
      {}
    );

    // 각 요일별로 연속된 시간 찾기
    for (const day in groupedByDay) {
      const dayPeriods = groupedByDay[Number(day)];

      for (let i = 0; i <= dayPeriods.length - assignPeriodCount; i++) {
        const startPeriod = dayPeriods[i][1]; // 현재 교시
        const endPeriod = dayPeriods[i + assignPeriodCount - 1][1]; // 연속된 마지막 교시

        if (endPeriod - startPeriod === assignPeriodCount - 1) {
          result.push(dayPeriods[i]); // 연속된 구간의 첫 PeriodTuple 추가
        }
      }
    }

    return result;
  },

  selectNewTime(
    assignedPeriods: PeriodTuple[],
    assignablePeriods: PeriodTuple[]
  ): PeriodTuple {
    // 이미 배정된 요일과 시간대 추출
    const assignedDays = new Set(assignedPeriods.map((a) => a[0])); // 배정된 요일
    const assignedTimes = new Set(assignedPeriods.map((a) => a[1])); // 배정된 교시

    // 조건에 따라 필터링
    const filtered = assignablePeriods.filter(([day, time]) => {
      return !assignedDays.has(day); // 요일이 겹치지 않는 경우
    });

    // 우선적으로 요일이 겹치지 않고 시간대도 겹치지 않는 경우
    const bestMatches = filtered.filter(
      ([day, time]) => !assignedTimes.has(time)
    );

    if (bestMatches.length > 0) {
      const rndIdx = Math.floor(Math.random() * bestMatches.length);
      return bestMatches[rndIdx];
    }

    // 요일만 겹치지 않는 경우
    if (filtered.length > 0) {
      const rndIdx = Math.floor(Math.random() * filtered.length);
      return filtered[rndIdx];
    }

    // 모두 겹치는 경우, assignable에서 랜덤하게 선택
    const rndIdx = Math.floor(Math.random() * assignablePeriods.length);
    return assignablePeriods[rndIdx];
  },

  timetablePeriodsToPeriodTuples(periods: TimetablePeriod[]): PeriodTuple[] {
    return periods.map((p) => [p.dayOfWeek, p.period]);
  },

  periodTuplesToTimetablePeriods(tuples: PeriodTuple[]): TimetablePeriod[] {
    return tuples.map((t) => ({ dayOfWeek: t[0], period: t[1] }));
  },

  isSubset(A: number[], B: number[]): boolean {
    const setA = new Set(A);
    return B.every((b) => setA.has(b));
  },

  removeDuplicatesWithPeriodTuples(periods: PeriodTuple[]): PeriodTuple[] {
    const uniqueSet = new Set(periods.map((item) => JSON.stringify(item)));
    return Array.from(uniqueSet).map((item) => JSON.parse(item) as PeriodTuple);
  },

  // 가장 마지막 배정된 요일로 부터 순배를 위한 요일
  generateDaySequence(
    classDayCount: number,
    lastDay: number,
    coursePeriodCount: number
  ): number[] {
    if (coursePeriodCount <= 1) {
      return [];
    }

    // 배정 우선 순위 요일 배열을 생성한다.
    const delta =
      coursePeriodCount > 1 ? Math.round(classDayCount / coursePeriodCount) : 0;

    const result = [];
    const visited = new Set();

    // 1. lastDay부터 delta 간격으로 classDayCount를 넘지 않도록 반복
    for (let i = lastDay; i <= classDayCount; i += delta) {
      result.push(i);
      visited.add(i);
    }

    // 2. 빠진 숫자 리스트 생성
    const missingNumbers = [];
    for (let i = 1; i <= classDayCount; i++) {
      if (!visited.has(i)) {
        missingNumbers.push(i);
      }
    }

    // 3. 빠진 숫자들도 delta 간격으로 추가 (기존 배열과 순서를 유지하면서)
    let insertIndex = 0;
    for (const num of missingNumbers) {
      insertIndex = (insertIndex + delta) % result.length; // 기존 리스트에서 `delta` 간격 유지
      result.splice(insertIndex, 0, num);
    }

    return result;
  },
};

export default TimetableUtils;

export const TimetableDataUtils = {
  className(cls: Class): string {
    return `${cls.grade}학년 ${cls.className}`;
  },

  courseNames(courses: Course[]): string[] {
    const courseNameSet = new Set(
      courses.map((course) => course.displayedTitle)
    );

    const courseNames = Array.from(courseNameSet).sort((a, b) =>
      a.localeCompare(b)
    );

    return courseNames;
  },

  courseBaseNames(courseBases: CourseBase[]): string[] {
    const courseBaseNameSet = new Set(
      courseBases.map((courseBase) => courseBase.displayedTitle)
    );

    const courseBaseNames = Array.from(courseBaseNameSet).sort((a, b) =>
      a.localeCompare(b)
    );

    return courseBaseNames;
  },

  checkSameLessons(
    a: Lesson | undefined | null,
    b: Lesson | undefined | null
  ): boolean {
    if (!a || !b) {
      return false;
    }

    return (
      a.courseId === b.courseId &&
      a.classId === b.classId &&
      a.dayOfWeek === b.dayOfWeek &&
      a.period === b.period
    );
  },

  getConsecutivePeriodsWithMaxPeriod(maxPeriod: number): ConsecutivePeriodOption[] {
    const allPartitions = this.generatePartitions(maxPeriod, maxPeriod);

    const validPartitions = allPartitions
      .filter((parts) => {
        return parts[0] >= 2;
      })
      .sort((a, b) => {
        if (a[0] !== b[0]) {
          return a[0] - b[0];
        }
        for (let i = 1; i < Math.max(a.length, b.length); i++) {
          const valA = a[i] || 0;
          const valB = b[i] || 0;
          if (valA !== valB) {
            return valB - valA;
          }
        }
        return 0;
      });

    return validPartitions.map((numbers) => {
      const label = numbers.join(',');
      return {
        label: label,
        value: label,
        numbers: numbers,
      };
    })
  },

  generatePartitions(target: number, maxVal: number): number[][] {
    if (target === 0) return [[]];

    const result: number[][] = [];

    for (let i = Math.min(target, maxVal); i >= 1; i--) {
      const remainder = target - i;
      const subPartitions = this.generatePartitions(remainder, i);
      
      for (const sub of subPartitions) {
        result.push([i, ...sub]);
      }
    }

    return result;
  },
};

export const CommonUtils = {
  isEmptyString(value?: string): boolean {
    return value === null || value === undefined || value === '';
  },

  isNotEmptyString(value?: string): boolean {
    return value !== null && value !== undefined && value !== '';
  },

  deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  },
};

export const LocalStorage = {
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
