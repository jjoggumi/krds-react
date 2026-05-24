import { Lesson, PeriodTuple, ValidStatusCountTypeMap as ValidStatusCountTypeMap, ValidStatusMap, ValidStatusType, ValidStatusTypeLessonSet } from '../types';
import { TimetableDataContext } from './timetable-data-context';
import TimetableUtils from './utils';

/*
 * 2025.06.13
 * - 같은교사 같은 과목 중복
 * - 같은교사 다른 과목 중복
 * - 다른교사 같은 과목 중복
 * - 1일 5시간 이상 배정 교사
 * - 같은요일 3개 과목 배정 교사
 * - 교과별 순배 확인 필요
 * - 연속 3시간 이상 배정
 * - 점심시간 전후 연속 배정
 * - 1교시만 3회 이상 교사
 * - 1교시 연속 2회 이상 교사
 * - 학급별 오전 오후 균형 확인
 */

export default class TimetableValidator {
  private _context: TimetableDataContext;


  private _timetableStatus: ValidStatusCountTypeMap = {} as ValidStatusCountTypeMap;
  private _timetableTeacherStatus: ValidStatusCountTypeMap = {} as ValidStatusCountTypeMap;
  private _timetableStatusLessonIds: ValidStatusTypeLessonSet = {} as ValidStatusTypeLessonSet;
  private _teacherStatusMap: ValidStatusMap = {} as ValidStatusMap;

  _overloadedHourLimit = 5;
  _consecutiveHourLimit = 3;
  _beforeLunchPeriod = 4;
  _firstPeriodLimit = 3;
  _firstPeriodConsecutiveLimit = 2;
  _overlapLunchPeriods = [4, 5];

  constructor(context: TimetableDataContext) {
    this._context = context;
    this.initTimetableStatus();
  }

  initTimetableStatus(): void {
    this._timetableStatus = Object.fromEntries(
      Object.values(ValidStatusType).map((type) => [type, 0])
    ) as ValidStatusCountTypeMap;

    this._timetableTeacherStatus = Object.fromEntries(
      Object.values(ValidStatusType).map((type) => [type, 0])
    ) as ValidStatusCountTypeMap;

    this._timetableStatusLessonIds = Object.fromEntries(
      Object.values(ValidStatusType).map((type) => [type, new Set<string>()])
    ) as ValidStatusTypeLessonSet;

    // console.log('TimetableValidator: Initialized timetable status', this._timetableStatusLessonIds);
  }

  set beforeLunchPeriod(value: number) {
    this._beforeLunchPeriod = value;
    this._overlapLunchPeriods = [value, value + 1];
  }

  get timetableStatus(): ValidStatusCountTypeMap {
    return this._timetableStatus;
  }

  get timetableTeacherStatus(): ValidStatusCountTypeMap {
    return this._timetableTeacherStatus;
  }

  get teacherStatusMap(): ValidStatusMap {
    return this._teacherStatusMap;
  }

  get timetableStatusLessonIds(): ValidStatusTypeLessonSet {
    return this._timetableStatusLessonIds;
  }

  validate(lessons: Lesson[]): ValidStatusCountTypeMap {
    this.initTimetableStatus();

    this.validateAllTeachersWithLessons(lessons);
    this.validateAllClassesWithLessons(lessons);

    this.recountTimetableStatusForTeachers(lessons);

    this.printStatus();

    return this._timetableStatus;
  }

  getTeacherToStatusMap(teacherId: string): ValidStatusCountTypeMap {
    if(!this._teacherStatusMap[teacherId]) {
      this._teacherStatusMap[teacherId] = {} as ValidStatusCountTypeMap;
      this._teacherStatusMap[teacherId] = Object.fromEntries(
        Object.values(ValidStatusType).map((type) => [type, 0])
      ) as ValidStatusCountTypeMap;      
    }

    return this._teacherStatusMap[teacherId]; // 이미 존재하는 교사 ID는 무시
  }


  validateClass(lessons: Lesson[]): void {
    lessons.sort((a, b) => {
      if (a.dayOfWeek === b.dayOfWeek) {
        return a.period - b.period;
      }
      return a.dayOfWeek - b.dayOfWeek;
    });

    const lessonsByDay = lessons.reduce<Record<number, Lesson[]>>(
      (acc, lesson) => {
        if (!acc[lesson.dayOfWeek]) {
          acc[lesson.dayOfWeek] = [];
        }
        acc[lesson.dayOfWeek].push(lesson);
        return acc;
      }, {});

    const keySeperator = '|';
    for (const dayOfWeek in lessonsByDay) {
      const dayLessons = lessonsByDay[dayOfWeek];

      // 같은 교사 같은 과목 중복: {teacherId-courseId-concurrentCourseId}로 그룹화: 연속수업은 제외
      const idMap = new Map<string, number>();
      const idLessons = new Map<string, Lesson[]>();
      dayLessons.forEach((lesson) => {
        lesson.lessonTeachers?.forEach((teacher) => {
          if (lesson.consecutiveGroupId) {
            return; // 연속 수업은 제외
          }

          const key = `${teacher.teacherId}${keySeperator}${lesson.courseId}${keySeperator}${lesson.concurrentCourseId}`;
          if (idMap.has(key)) {
            idMap.set(key, idMap.get(key)! + 1);
            idLessons.get(key)?.push(lesson);
          } else {
            idMap.set(key, 1);
            idLessons.set(key, [lesson]);
          }
        });
      });
      
      idMap.forEach((count, key) => {
        if (count > 1) {
          const [teacherId, _] = key.split(keySeperator);
          
          this._timetableStatus[ValidStatusType.SameTeacherSameCourse]++;
          this.getTeacherToStatusMap(teacherId)[ValidStatusType.SameTeacherSameCourse]++;

          // 하이라이트를 위한 수업 ID 기록
          const lessons = idLessons.get(key) || [];
          lessons.forEach(lesson => {
            this._timetableStatusLessonIds[ValidStatusType.SameTeacherSameCourse].add(lesson.lessonId);
          });
        }
      });

      // 같은 교사 다른 과목 중복: {teacherId}로 그룹화
      const teacherMap = new Map<string, Set<string>>();
      dayLessons.forEach((lesson) => {
        lesson.lessonTeachers?.forEach((teacher) => {
          if (!teacherMap.has(teacher.teacherId)) {
            teacherMap.set(teacher.teacherId, new Set());
          }
          // 동시 수업은 제외
          if(lesson?.concurrentCourseId) {
            return;
          }          
          teacherMap.get(teacher.teacherId)?.add(lesson.courseId);          
        });
      });

      teacherMap.forEach((courseSet, teacherId) => {
        if (courseSet.size > 1) {
          this._timetableStatus[ValidStatusType.SameTeacherDifferentCourse]++;
          this.getTeacherToStatusMap(teacherId)[ValidStatusType.SameTeacherDifferentCourse]++;

          // 하이라이트를 위한 수업 ID 기록
          dayLessons.forEach((lesson) => {
            lesson.lessonTeachers?.forEach((teacher) => {
              if (teacher.teacherId === teacherId) {
                this._timetableStatusLessonIds[ValidStatusType.SameTeacherDifferentCourse].add(lesson.lessonId);
              }
            });
          });
        }
      });

      // 다른 교사 같은 과목 중복: {courseId}로 그룹화
      const courseMap = new Map<string, Set<string>>();
      dayLessons.forEach((lesson) => {
        if (!courseMap.has(lesson.courseId)) {
          courseMap.set(lesson.courseId, new Set());
        }
        lesson.lessonTeachers?.forEach((teacher) => {
          courseMap.get(lesson.courseId)?.add(teacher.teacherId);
        });
      });

      const duplicateTeacherCourse = [] as [string, string][];
      courseMap.forEach((teacherSet, courseId) => {
        if (teacherSet.size <= 1) {
          return;
        }

        const crs = this._context.courseMap[courseId];
        if(crs?.isDoubleTeacher) {
          return; // 복수 교사 과목은 제외
        }
        
        teacherSet.forEach((teacherId) => {
          this._timetableStatus[ValidStatusType.DifferentTeacherSameCourse]++;
          this.getTeacherToStatusMap(teacherId)[ValidStatusType.DifferentTeacherSameCourse]++;
        });

        // // 하이라이트를 위한 수업 ID 기록, 중복 교사-과목
        duplicateTeacherCourse.push(...Array.from(teacherSet).map(teacherId => [teacherId, courseId] as [string, string]));
      });

      duplicateTeacherCourse.forEach(([teacherId, courseId]) => {
        // 하이라이트를 위한 수업 ID 기록
        dayLessons.forEach((lesson) => {
          lesson.lessonTeachers?.forEach((teacher) => {
            if (teacher.teacherId === teacherId && lesson.courseId === courseId) {
              this._timetableStatusLessonIds[ValidStatusType.DifferentTeacherSameCourse].add(lesson.lessonId);
            }
          });
        });
      });      
    }
  }

  validateTeacher(lessons: Lesson[]): ValidStatusCountTypeMap {    
    const validStatus = Object.fromEntries(
      Object.values(ValidStatusType).map((type) => [type, 0])
    ) as ValidStatusCountTypeMap;

    // 수업 목록을 요일별로 정렬
    lessons.sort((a, b) => {
      if (a.dayOfWeek === b.dayOfWeek) {
        return a.period - b.period;
      }
      return a.dayOfWeek - b.dayOfWeek;
    });

    // 교사별 수업 시간 목록
    const teacherPeriods = lessons.map((lesson) => [
      lesson.dayOfWeek,
      lesson.period,
    ]) as PeriodTuple[];

    // 교사의 요일별 교시 목록
    const periodsByDay = teacherPeriods.reduce<Record<number, number[]>>(
      (acc, [day, period]) => {
        if (!acc[day]) acc[day] = [];
        acc[day].push(period);
        return acc;
      },
      {}
    );

    if(this._context.classDayCount > Object.keys(periodsByDay).length) {
      // 1일 0시간 배정 교사
      validStatus[ValidStatusType.MissingDayAssigned]++;
      this._timetableStatus[ValidStatusType.MissingDayAssigned]++;
    }

    // 요일별로 교시 순회
    for (const dayOfWeek in periodsByDay) {
      const periods = periodsByDay[dayOfWeek];
      let streak = 1;

      // 점심 시간 전후 연속 배정 카운트
      if (TimetableUtils.isSubset(periods, this._overlapLunchPeriods)) {
        validStatus[ValidStatusType.LunchBreakOverlap]++;
        this._timetableStatus[ValidStatusType.LunchBreakOverlap]++;

        // 하이라이트를 위한 수업 ID 기록
        lessons
          .filter((lesson) => lesson.dayOfWeek === Number(dayOfWeek) && this._overlapLunchPeriods.includes(lesson.period))
          .forEach((lesson) => {
            this._timetableStatusLessonIds[ValidStatusType.LunchBreakOverlap].add(lesson.lessonId);
          });
      }
      
      if (periods.length >= this._overloadedHourLimit) {
        // 교사별 수업 시간 목록이 5시간 이상인 경우
        validStatus[ValidStatusType.OverloadedTeacher]++;
        this._timetableStatus[ValidStatusType.OverloadedTeacher]++;

        // 하이라이트를 위한 수업 ID 기록
        lessons
          .filter((lesson) => lesson.dayOfWeek === Number(dayOfWeek))
          .forEach((lesson) => {
            this._timetableStatusLessonIds[ValidStatusType.OverloadedTeacher].add(lesson.lessonId);
          });
      }

      let startPeriod = periods[0];
      for (let i = 1; i < periods.length; i++) {
        // 연속 시간인지 확인
        if (periods[i] !== periods[i - 1] + 1) {
          streak = 1; // 연속 시간 끊김
          startPeriod = periods[i];
          continue;
        }
        
        streak++; // 연속 시간 증가
        
        if (streak >= this._consecutiveHourLimit) {
          // 연속시간이 기준 시간을 초과한 경우 상태에 기록
          validStatus[ValidStatusType.ConsecutiveHourLimitExceed]++;
          this._timetableStatus[ValidStatusType.ConsecutiveHourLimitExceed]++;

          // 하이라이트를 위한 수업 ID 기록
          const endPeriod = periods[i];
          lessons
            .filter((lesson) => lesson.dayOfWeek === Number(dayOfWeek) && lesson.period >= startPeriod && lesson.period <= endPeriod)
            .forEach((lesson) => {
              this._timetableStatusLessonIds[ValidStatusType.ConsecutiveHourLimitExceed].add(lesson.lessonId);
            });
        }
      }

      // 같은 요일에 3개 과목 배정 교사
      if (periods.length >= 3) {
        const courseCount = new Set(
          lessons
            .filter((lesson) => lesson.dayOfWeek === Number(dayOfWeek))
            .map((lesson) => lesson.courseId)
        ).size;

        if (courseCount >= 3) {
          validStatus[ValidStatusType.SameDayThreeCourse]++;
          this._timetableStatus[ValidStatusType.SameDayThreeCourse]++;

          // 하이라이트를 위한 수업 ID 기록
          lessons
            .filter((lesson) => lesson.dayOfWeek === Number(dayOfWeek))
            .forEach((lesson) => {
              this._timetableStatusLessonIds[ValidStatusType.SameDayThreeCourse].add(lesson.lessonId);
            });
        }
      }
    }

    // 교사의 교시별 시수별 요일 목록
    const dayByPeriods = teacherPeriods.reduce<Record<number, number[]>>(
      (acc, [day, period]) => {
        if (!acc[period]) acc[period] = [];
        acc[period].push(day);
        return acc;
      },
      {}
    );

    // 1교시 수업
    const firstPeriods = dayByPeriods[1] || [];
    // 1교시만 3회 이상 배정
    if(firstPeriods.length >= this._firstPeriodLimit) {
      validStatus[ValidStatusType.FirstPeriodExceed]++;
      this._timetableStatus[ValidStatusType.FirstPeriodExceed]++;

      // 하이라이트를 위한 수업 ID 기록
      lessons
        .filter((lesson) => lesson.period === 1)
        .forEach((lesson) => {
          this._timetableStatusLessonIds[ValidStatusType.FirstPeriodExceed].add(lesson.lessonId);
        });
    }

    let streak = 1;
    let startPeriod = firstPeriods[0];
    for (let i = 1; i < firstPeriods.length; i++) {
      if (firstPeriods[i] === firstPeriods[i - 1] + 1) {
        streak++; // 연속 시간 증가

        if (streak >= this._firstPeriodConsecutiveLimit) {
          // 1교시 연속 2회 이상 배정
          const added = streak === this._firstPeriodConsecutiveLimit ? 1 : 0; // 처음 초과할 때만 카운트 증가
          validStatus[ValidStatusType.RepeatedFirstPeriod] += added;
          this._timetableStatus[ValidStatusType.RepeatedFirstPeriod] += added;

          // 하이라이트를 위한 수업 ID 기록
          const endPeriod = firstPeriods[i];
          lessons
            .filter((lesson) => lesson.period === 1 && lesson.dayOfWeek >= startPeriod && lesson.dayOfWeek <= endPeriod)
            .forEach((lesson) => {
              this._timetableStatusLessonIds[ValidStatusType.RepeatedFirstPeriod].add(lesson.lessonId);
            });
        }
      } else {
        streak = 1; // 연속 시간 끊김
        startPeriod = firstPeriods[i];
      }
    }
  
    // return status;
    return validStatus;
  }

  validateAllTeachersWithLessons(lessons: Lesson[]) {
    // 수업 목록을 교사별로 그룹화, 시간 별로 정렬
    const teacherLessonsMap = this.getTeacherLessonMap(lessons);
    Object.keys(teacherLessonsMap).forEach((teacherId) => {
      this._teacherStatusMap[teacherId] = { ...this.validateTeacher(
        teacherLessonsMap[teacherId]
      )};
    });
  }

  validateAllClassesWithLessons(lessons: Lesson[]) {
    const classLessonsMap: Record<string, Lesson[]> = this.getClassesLessonMap(lessons);
    Object.keys(classLessonsMap).forEach((classId) => {
      this.validateClass(classLessonsMap[classId]);
    });
  }

  recountTimetableStatusForTeachers(lessons: Lesson[]): void {
    // 카운트를 교사 기준으로 다시 계산
    this._timetableTeacherStatus = Object.fromEntries(
      Object.values(ValidStatusType).map((type) => [type, this.countTeachersWithLessonIds(this._timetableStatusLessonIds[type], lessons)])
    ) as ValidStatusCountTypeMap;
  }

  countTeachersWithLessonIds(lessonIds: Set<string>, lessons: Lesson[]): number {
    const teacherIds = new Set<string>();
    lessonIds.forEach((lessonId) => {
      const lesson = lessons.find(l => l.lessonId === lessonId);
      lesson?.lessonTeachers?.forEach(teacher => teacherIds.add(teacher.teacherId));
    });
    return teacherIds.size;
  }
    

  getTeacherLessonMap(lessons: Lesson[]): Record<string, Lesson[]> {
    return lessons.reduce(
      (acc, lesson) => {
        lesson.lessonTeachers?.forEach((teacher) => {
          if (!acc[teacher.teacherId]) {
            acc[teacher.teacherId] = [];
          }
          acc[teacher.teacherId].push(lesson);
        });
        return acc;
      },
      {} as Record<string, Lesson[]>
    );
  }

  getClassesLessonMap(lessons: Lesson[]): Record<string, Lesson[]> {
    return lessons.reduce(
      (acc, lesson) => {
        if (!acc[lesson.classId]) {
          acc[lesson.classId] = [];
        }
        acc[lesson.classId].push(lesson);
        return acc;
      },
      {} as Record<string, Lesson[]>
    );
  }

  printStatus(): void {
    this._context.printLog(
      '=============================================================='
    );

    this._context.printLog('[배정 상태]');

    this._context.printLog(
      '같은 교사 같은 과목 중복',
      `(${this._timetableStatus[ValidStatusType.SameTeacherSameCourse]})`
    );

    this._context.printLog(
      '같은 교사 다른 과목 중복',
      `(${this._timetableStatus[ValidStatusType.SameTeacherDifferentCourse]})`
    );

    this._context.printLog(
      '다른 교사 같은 과목 중복',
      `(${this._timetableStatus[ValidStatusType.DifferentTeacherSameCourse]})`
    );

    this._context.printLog(
      '교사가 하루에 5시간 이상 수업 배정',
      `(${this._timetableStatus[ValidStatusType.OverloadedTeacher]})`
    );

    this._context.printLog(
      '1일 0시간 배정 교사',
      `(${this._timetableStatus[ValidStatusType.MissingDayAssigned]})`
    );

    this._context.printLog(
      '같은 요일에 3개 과목 배정 교사',
      `(${this._timetableStatus[ValidStatusType.SameDayThreeCourse]})`
    );

    this._context.printLog(
      '교과별 순배 확인 필요',
      `(${this._timetableStatus[ValidStatusType.BalancedCourseAssignment]})`
    );

    this._context.printLog(
      '연속 3시간 이상 배정',
      `(${this._timetableStatus[ValidStatusType.ConsecutiveHourLimitExceed]})`
    );

    this._context.printLog(
      '점심시간 전후 연속 수업 배정',
      `(${this._timetableStatus[ValidStatusType.LunchBreakOverlap]})`
    );

    this._context.printLog(
      '1교시만 3회 이상 배정',
      `(${this._timetableStatus[ValidStatusType.FirstPeriodExceed]})`
    );

    this._context.printLog(
      '1교시 연속 2회 이상 배정',
      `(${this._timetableStatus[ValidStatusType.RepeatedFirstPeriod]})`
    );

    this._context.printLog(
      '=============================================================='
    );

    
    /*
    this._context.printLog('[교사별 상태]');
    Object.keys(this._teacherStatusMap).forEach((teacherId) => {
      this._context.printLog(teacherId, this._teacherStatusMap[teacherId]);
    });
    */
  }

}
