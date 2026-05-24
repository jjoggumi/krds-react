// 데이터 매니저를 별도로 만들자.
//  - 기초 데이터를 조작하여 필요한 형태로 변환하는 역할.
//  - 데이터 자체를 변경하지는 않도록 한다.
//  - 생성된 리스트/맵 등은 static으로 하여, 메모리가 불필요하게 증가되지 않도록 관리한다.

import { TimeUtils } from '@/apps/timetable/common/utils';
import {
  Class,
  ClassDailyPeriodOverview,
  ConcurrentConf,
  Course,
  DailyLesson,
  DailyPeriodTuple,
  DatePeriod,
  FixedConf,
  Lesson,
  LessonConf,
  LessonDay,
  PeriodTuple,
  SpecialtyRoom,
  Teacher,
  TeacherCourse,
  TeacherDailyPeriodOverview,
  TimetableConfig,
} from '../../types';
import TimetableUtils, { CommonUtils, LocalStorage } from '../utils';

export class DailyTimetableDataContext {
  // 기초 데이터
  private _classes: Class[] = [];
  private _courses: Course[] = [];
  private _teachers: Teacher[] = [];
  private _specialtyRooms: SpecialtyRoom[] = [];
  // 설정 데이터
  private _teacherCourses: TeacherCourse[] = [];
  private _lessonConfs: LessonConf[] = [];
  private _fixedConfs: FixedConf[] = [];
  private _concurrentCourseConfs: ConcurrentConf[] = [];
  // 시간표 설정
  private _timetableConfig: TimetableConfig = {} as TimetableConfig;
  private _classDayCount: number = 5;

  // 기본 맵
  private _classesByGrade: Record<number, Class[]> = {};
  private _classMap: Record<string, Class> = {};
  private _courseMap: Record<string, Course> = {};
  private _teachersMap: Record<string, Teacher> = {};
  private _teacherCoursesMap: Record<string, TeacherCourse[]> = {};
  private _lessonConfsByConcurrentCourse: Record<string, LessonConf[]> = {};
  private _lessonConfsByClass: Record<string, LessonConf[]> = {};
  private _lessonConfsByTeacher: Record<string, LessonConf[]> = {};
  private _freePeriodTuplesByGrade: Record<number, PeriodTuple[]> = {};
  private _concurrentCourseConfMap: Record<string, ConcurrentConf> = {};

  // 수업 배정
  private _classPeriodOverviews: ClassDailyPeriodOverview[] = [];
  private _classPeriodOverviewMap: Record<string, ClassDailyPeriodOverview> = {};
  private _teacherPeriodOverviews: TeacherDailyPeriodOverview[] = [];
  private _teacherPeriodOverviewMap: Record<string, TeacherDailyPeriodOverview> = {};

  // 기타
  // private _isDebug = true;
  private _isDebug = false;

  static instance: DailyTimetableDataContext;

  constructor() {
    if (DailyTimetableDataContext.instance) {
      return DailyTimetableDataContext.instance;
    }

    DailyTimetableDataContext.instance = this;
  }

  static getInstance() {
    if (DailyTimetableDataContext.instance) {
      return DailyTimetableDataContext.instance;
    }

    return new DailyTimetableDataContext();
  }

  teachersWithClassAndCourse(classId: string, courseId: string): Teacher[] {
    return this.lessonConfs
      .filter((conf) => {conf.classId === classId && conf.courseId === courseId})
      .map((conf) => this._teachersMap[conf.teacherId]);
  }
  
  lessonConfWithClassAndCourse(classId: string, courseId: string): {
    lessonConf: LessonConf;
    teacherName: string;
  }[] {
    return this.lessonConfs
      .filter((conf) => conf.classId === classId && conf.courseId === courseId)
      .map((conf) => {
        return {
          lessonConf: conf,
          teacherName: this._teachersMap[conf.teacherId]?.teacherName || '',
        }
      });
  }

  initPeriodOverviews(lessonDays: LessonDay[]): void {
    this.initTeacherPeriodOverviews(lessonDays);
    this.initClassPeriodOverviews(lessonDays);
  }

  initClassPeriodOverviews(lessonDays: LessonDay[]): void {
    this._classPeriodOverviews = this.createClassPeriodOverviews(lessonDays) || [];
    this.initMapFromClassPeriodOverViews(lessonDays);
  }

  initMapFromClassPeriodOverViews(lessonDays: LessonDay[]): void {
    this._classPeriodOverviewMap = this._classPeriodOverviews.reduce(
      (acc, cur) => {
        acc[cur.cls.classId] = cur;
        return acc;
      },
      {} as Record<string, ClassDailyPeriodOverview>
    );
  }

  initTeacherPeriodOverviews(lessonDays: LessonDay[]): void {
    this._teacherPeriodOverviews = this.createTeacherPeriodOverviews(lessonDays) || [];
    this.initMapFromTeacherPeriodOverviews();
  }

  initMapFromTeacherPeriodOverviews(): void {
    this._teacherPeriodOverviewMap = this._teacherPeriodOverviews.reduce(
      (acc, cur) => {
        acc[cur.teacher.teacherId] = cur;
        return acc;
      },
      {} as Record<string, TeacherDailyPeriodOverview>
    );
  }

  createClassPeriodOverviews(lessonDays: LessonDay[]): ClassDailyPeriodOverview[] {
    // 1. 배치할 수업의 시수 목록을 생성한다.

    const { freePeriodTuplesByGrade, lessonConfsByClass, courseMap } = this;
    const { maxPeriod, classDays } = this.timetableConfig;

    const dayOfWeeks = TimetableUtils.classDaysTodDayIndexArray(classDays);
    
    return this.classes.map((cls) => {
      let remainingLessonPeriods = [] as DailyPeriodTuple[];

      const freePeriods = freePeriodTuplesByGrade[cls.grade] || [];
      remainingLessonPeriods = TimetableUtils.createDailyPeriodTuplesWithLessonDays(
        lessonDays,
        maxPeriod,
        freePeriods
      );

      // 수업에 할당된 시수 목록 (시수표: LessonConf): 과목의 시수만큼 반복해서 추가
      const classLessonConfs = lessonConfsByClass[cls.classId] || [];
      const remainingLessonConfs = [
        ...classLessonConfs.flatMap((conf) => {
          const periodCount = courseMap[conf.courseId]?.periodCount || 0;
          // 시수 만큼 반복해서 추가해야 하기 때문에 deep copy를 사용한다.
          return Array(periodCount)
            .fill(conf)
            .map((conf, idx) => {
              const copied = CommonUtils.deepCopy(conf);
              copied.periodIndex = idx + 1;
              return copied;
            });
        }),
      ];

      return {
        cls,
        remainingLessonConfs,
        remainingLessonPeriods,
        assignedLessonConfs: [],
        assignedLessons: [],
      } as ClassDailyPeriodOverview;
    });
  }

  createTeacherPeriodOverviews(lessonDays: LessonDay[]): TeacherDailyPeriodOverview[] {
    const { maxPeriod, classDays } = this.timetableConfig;
    const { lessonConfsByTeacher, courseMap } = this;
    // const dayOfWeeks = TimetableUtils.classDaysTodDayIndexArray(classDays);

    return this.teachers.map((teacher) => {
      const freePeriods = TimetableUtils.timetablePeriodsToPeriodTuples(
        teacher.freePeriods || []
      );

      const remainingLessonPeriods =
        TimetableUtils.createDailyPeriodTuplesWithLessonDays(
          lessonDays,
          maxPeriod,
          freePeriods
        );

      // 수업에 할당된 시수 목록 (시수표: LessonConf): 과목의 시수만큼 반복해서 추가
      const teacherLessonConfs = lessonConfsByTeacher[teacher.teacherId] || [];
      const remainingLessonConfs = [
        ...teacherLessonConfs.flatMap((conf) => {
          const periodCount = courseMap[conf.courseId]?.periodCount || 0;
          // 시수 만큼 반복해서 추가해야 하기 때문에 deep copy를 사용한다.
          return Array(periodCount)
            .fill(conf)
            .map((conf, idx) => {
              const copied = CommonUtils.deepCopy(conf);
              copied.periodIndex = idx + 1;
              return copied;
            });
          // return Array(periodCount).fill(conf);
        }),
      ];

      return {
        teacher,
        remainingLessonConfs,
        remainingLessonPeriods,
        assignedLessonConfs: [],
        assignedLessons: [],
      } as TeacherDailyPeriodOverview;
    });
  }

  currentAssignedLessons(): DailyLesson[] {
    const { classPeriodOverviews: periodOvervew } = this;
    return periodOvervew.flatMap((overview) => overview.assignedLessons);
  }

  currentUnassignedLessonConfs(): LessonConf[] {
    // 학급 시간표에 배정되지 않은 수업 목록
    const { classPeriodOverviews } = this;
    return classPeriodOverviews.flatMap(
      (overview) => overview.remainingLessonConfs
    );
  }
  
  // Setter
  set classes(classes: Class[]) {
    this._classes = classes;

    this._classesByGrade =
      this.classes?.reduce((acc, cur) => {
        (acc[cur.grade] ||= []).push(cur);
        return acc;
      }, {} as Record<number, Class[]>) || {};

    this._classMap =
      classes?.reduce((acc, cur) => {
        acc[cur.classId] = cur;
        return acc;
      }, {} as Record<string, Class>) || {};
  }

  set courses(courses: Course[]) {
    this._courses = courses;

    this._courseMap =
      courses?.reduce((acc, cur) => {
        acc[cur.courseId] = cur;
        return acc;
      }, {} as Record<string, Course>) || {};
  }

  set teachers(teachers: Teacher[]) {
    this._teachers = teachers;

    this._teachersMap =
      teachers?.reduce((acc, cur) => {
        acc[cur.teacherId] = cur;
        return acc;
      }, {} as Record<string, Teacher>) || {};
  }

  set specialtyRooms(specialtyRooms: SpecialtyRoom[]) {
    this._specialtyRooms = specialtyRooms;
  }

  set teacherCourses(teacherCourses: TeacherCourse[]) {
    this._teacherCourses = teacherCourses;

    this._teacherCoursesMap =
      teacherCourses?.reduce((acc, cur) => {
        if (!acc[cur.teacherId]) {
          acc[cur.teacherId] = [];
        }

        acc[cur.teacherId].push(cur);
        acc[cur.teacherId].sort((a, b) => a.sortNo - b.sortNo);

        return acc;
      }, {} as Record<string, TeacherCourse[]>) || {};
  }

  set lessonConfs(lessonConfs: LessonConf[]) {
    this._lessonConfs = lessonConfs;

    this._lessonConfsByConcurrentCourse =
      this.lessonConfs?.reduce((acc, cur) => {
        if (!cur.concurrentCourseId) {
          return acc;
        }

        (acc[cur.concurrentCourseId] ||= [] as LessonConf[]).push(cur);

        return acc;
      }, {} as Record<string, LessonConf[]>) || {};

    this._lessonConfsByClass = this.lessonConfs?.reduce((acc, cur) => {
      (acc[cur.classId] ||= []).push(cur);
      return acc;
    }, {} as Record<string, LessonConf[]>);

    this._lessonConfsByTeacher = this.lessonConfs?.reduce((acc, cur) => {
      (acc[cur.teacherId] ||= []).push(cur);
      return acc;
    }, {} as Record<string, LessonConf[]>);
  }

  set fixedConfs(fixedConfs: FixedConf[]) {
    this._fixedConfs = fixedConfs;
  }

  set concurrentCourseConfs(concurrentCourseConfs: ConcurrentConf[]) {
    this._concurrentCourseConfs = concurrentCourseConfs;

    this._concurrentCourseConfMap =
      concurrentCourseConfs?.reduce((acc, cur) => {
        acc[cur.courseId] = cur;
        return acc;
      }, {} as Record<string, ConcurrentConf>) || {};
  }

  set timetableConfig(timetableConfig: TimetableConfig) {
    this._timetableConfig = timetableConfig;

    this._freePeriodTuplesByGrade = this._timetableConfig.grades.reduce(
      (acc, cur) => {
        acc[cur.grade] = (cur.timetableStructure?.freePeriods || []).map(
          (p) => {
            return [p.dayOfWeek, p.period] as PeriodTuple;
          }
        ) as PeriodTuple[];
        return acc;
      },
      {} as Record<number, PeriodTuple[]>
    );

    this._classDayCount = timetableConfig.classDays.reduce(
      (acc, day) => acc + day,
      0
    );
  }

  // Getter
  get teacherMap() {
    return this._teachersMap;
  }

  get courseMap() {
    return this._courseMap;
  }

  get classesByGrade() {
    return this._classesByGrade;
  }

  get classMap() {
    return this._classMap;
  }

  get lessonConfsByConcurrentCourse() {
    return this._lessonConfsByConcurrentCourse;
  }

  get lessonConfsByClass() {
    return this._lessonConfsByClass;
  }

  get lessonConfsByTeacher() {
    return this._lessonConfsByTeacher;
  }

  get freePeriodTuplesByGrade() {
    return this._freePeriodTuplesByGrade;
  }

  get timetableConfig() {
    return this._timetableConfig;
  }

  get concurrentCourseConfMap() {
    return this._concurrentCourseConfMap;
  }

  get classes() {
    return this._classes;
  }
  get classPeriodOverviews(): ClassDailyPeriodOverview[] {
    return this._classPeriodOverviews;
  }

  get classPeriodOverviewMap(): Record<string, ClassDailyPeriodOverview> {
    return this._classPeriodOverviewMap;
  }

  get teacherPeriodOverviews(): TeacherDailyPeriodOverview[] {
    return this._teacherPeriodOverviews;
  }

  get teacherPeriodOverviewMap(): Record<string, TeacherDailyPeriodOverview> {
    return this._teacherPeriodOverviewMap;
  }

  // 목록으로 반환해야할 항목만 남겨 놓고 추후 제거 -->
  get courses() {
    return this._courses;
  }

  get teachers() {
    return this._teachers;
  }

  get specialtyRooms() {
    return this._specialtyRooms;
  }

  get teacherCoursesMap() {
    return this._teacherCoursesMap;
  }

  get lessonConfs() {
    return this._lessonConfs;
  }

  get fixedConfs() {
    return this._fixedConfs;
  }

  get concurrentCourseConfs() {
    return this._concurrentCourseConfs;
  }

  get classDayCount() {
    return this._classDayCount || 5;
  }
  // <---

  // tmp method --------------------------------
  get isDebug(): boolean {
    return this._isDebug;
  }
  
  printOverviews(): void {
    if (!this._isDebug) {
      return;
    }

    console.log(
      'class overview ===>',
      this.classPeriodOverviews,
      this.classPeriodOverviewMap
    );
    console.log(
      'teacher overview ===>',
      this.teacherPeriodOverviews,
      this.teacherPeriodOverviewMap
    );
  }

  printLog(...args: Parameters<typeof console.log>): void {
    if (!this._isDebug) {
      return;
    }
    console.log(...args);
  }
}
