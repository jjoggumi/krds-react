// 데이터 매니저를 별도로 만들자.
//  - 기초 데이터를 조작하여 필요한 형태로 변환하는 역할.
//  - 데이터 자체를 변경하지는 않도록 한다.
//  - 생성된 리스트/맵 등은 static으로 하여, 메모리가 불필요하게 증가되지 않도록 관리한다.

import { v4 as uuid4 } from 'uuid';
import {
  Class,
  ClassPeriodOverview,
  ConcurrentConf,
  Course,
  FixedConf,
  Lesson,
  LessonConf,
  LessonConfItem,
  PeriodTuple,
  SpecialtyRoom,
  SpecialtyRoomConf,
  SpecialtyRoomFreeStatus,
  Teacher,
  TeacherCourse,
  TeacherPeriodOverview,
  TimetableConfig,
  TimetableGrade,
} from '../types';
import TimetableUtils, { CommonUtils, LocalStorage } from './utils';

export class TimetableDataContext {
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
  private _specialtyRoomConfs: SpecialtyRoomConf[] = [];
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
  private _specialtyRoomConfMap: Record<string, SpecialtyRoomConf[]> = {};
  private _specialtyRoomMap: Record<string, SpecialtyRoom> = {};

  // 수업 배정
  private _classPeriodOverviews: ClassPeriodOverview[] = [];
  private _classPeriodOverviewMap: Record<string, ClassPeriodOverview> = {};
  private _teacherPeriodOverviews: TeacherPeriodOverview[] = [];
  private _teacherPeriodOverviewMap: Record<string, TeacherPeriodOverview> = {};

  // 특별실 상태
  private _specialtyRoomFreeStatus: Record<string, SpecialtyRoomFreeStatus> = {};

  // 기타
  // private _isDebug = true;
  private _isSilent = false;
  private _isDebug = false;

  static instance: TimetableDataContext;

  constructor() {
    if (TimetableDataContext.instance) {
      return TimetableDataContext.instance;
    }

    TimetableDataContext.instance = this;
  }

  static getInstance() {
    if (TimetableDataContext.instance) {
      return TimetableDataContext.instance;
    }

    return new TimetableDataContext();
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

  initPeriodOverviews(): void {
    this.initTeacherPeriodOverviews();
    this.initClassPeriodOverviews();
  }

  initClassPeriodOverviews(): void {
    this._classPeriodOverviews = this.createClassPeriodOverviews() || [];
    this.initMapFromClassPeriodOverViews();
  }

  initMapFromClassPeriodOverViews(): void {
    this._classPeriodOverviewMap = this._classPeriodOverviews.reduce(
      (acc, cur) => {
        acc[cur.cls.classId] = cur;
        return acc;
      },
      {} as Record<string, ClassPeriodOverview>
    );
  }

  initTeacherPeriodOverviews(): void {
    this._teacherPeriodOverviews = this.createTeacherPeriodOverviews() || [];
    this.initMapFromTeacherPeriodOverviews();
  }

  initMapFromTeacherPeriodOverviews(): void {
    this._teacherPeriodOverviewMap = this._teacherPeriodOverviews.reduce(
      (acc, cur) => {
        acc[cur.teacher.teacherId] = cur;
        return acc;
      },
      {} as Record<string, TeacherPeriodOverview>
    );
  }

  getPeriodTupleKey(tuple: PeriodTuple): string {
    return `${tuple[0]}_${tuple[1]}`;
  }

  initSpecialtyRoomFreeStatus(): void {
    const { classDays, maxPeriod } = this._timetableConfig;
    
    if (!classDays || !this._specialtyRooms || !this._specialtyRoomConfs || 
        classDays.length === 0 || this._specialtyRooms.length === 0 || this._specialtyRoomConfs.length === 0) {
      return;
    }

    this._specialtyRooms.forEach((room) => {
      const { specialtyRoomId } = room;
      const counterMap: Record<string, number> = {};

      const freePeriods: PeriodTuple[] = classDays.flatMap((hasClass, dayIndex) => {
        if (!hasClass) {
          return [];
        }

        return Array.from({ length: maxPeriod }, (_, periodIndex) => {
          return [dayIndex, periodIndex + 1] as PeriodTuple;
        });
      });

      const maxClass = room?.maxClass || 1;

      freePeriods.forEach((tuple) => {
        const key = this.getPeriodTupleKey(tuple);
        counterMap[key] = maxClass;
      });

      this._specialtyRoomFreeStatus[specialtyRoomId] = {
        specialtyRoomId,
        maxClass,
        freePeriods,
        counterMap,
      } as SpecialtyRoomFreeStatus;
    });
  }

  createClassPeriodOverviews(): ClassPeriodOverview[] {
    // 1. 배치할 수업의 시수 목록을 생성한다.

    const { freePeriodTuplesByGrade, lessonConfsByClass, courseMap } = this;
    const { maxPeriod, classDays } = this.timetableConfig;

    const dayOfWeeks = TimetableUtils.classDaysTodDayIndexArray(classDays);

    return this.classes.map((cls) => {
      let remainingLessonPeriods = [] as PeriodTuple[];

      const freePeriods = freePeriodTuplesByGrade[cls.grade] || [];
      remainingLessonPeriods = TimetableUtils.createPeriodTuplesWithDayOfWeeks(
        dayOfWeeks,
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
      } as ClassPeriodOverview;
    });
  }

  createTeacherPeriodOverviews(): TeacherPeriodOverview[] {
    const { maxPeriod, classDays } = this.timetableConfig;
    const { lessonConfsByTeacher, courseMap } = this;
    const dayOfWeeks = TimetableUtils.classDaysTodDayIndexArray(classDays);

    return this.teachers.map((teacher) => {
      const teacherFreePeriods = TimetableUtils.timetablePeriodsToPeriodTuples(
        teacher.freePeriods || []
      );

      const gradeFreePeriods = TimetableUtils.timetablePeriodsToPeriodTuples(
        teacher.gradeFreePeriods || []
      );

      const freePeriods = TimetableUtils.unionPeriodTuples(
        teacherFreePeriods,
        gradeFreePeriods
      );

      /*
      const freePeriods = TimetableUtils.timetablePeriodsToPeriodTuples(
        teacher.freePeriods || []
      );
      */

      const remainingLessonPeriods =
        TimetableUtils.createPeriodTuplesWithDayOfWeeks(
          dayOfWeeks,
          maxPeriod,
          freePeriods
        );

      // 수업에 할당된 시수 목록 (시수표: LessonConf): 과목의 시수만큼 반복해서 추가
      const teacherLessonConfs = lessonConfsByTeacher[teacher.teacherId] || [];
      
      // 2025.11.25, notbadlife combineConfId가 없는 상태에서 합반을 처리하기 위한 로직 추가 --->
      // concurrentCourseId-courseId 맵 생성
      const separator = '||';
      const combineCoutner: Record<string, number> = {};
      teacherLessonConfs.forEach((conf) => {
        if (conf.combineConfId) {
          return;
        }

        if (conf.concurrentCourseId) {
          const key = `${conf.concurrentCourseId}${separator}${conf.courseId}`;
          if (!combineCoutner[key]) {
            combineCoutner[key] = 1;
            return;
          }          
          combineCoutner[key] += 1;
        }
      });

      // 합반인 수업이 있는 경우 combineConfId를 생성하여 묶음 처리 (combineConfId가 없는 경우만)
      const combinedConfIdMap = Object.keys(combineCoutner)
        .filter(key => combineCoutner[key] > 1)
        .reduce((acc, key) => {
          const [concurrentCourseId, _] = key.split(separator);
          const newCombineConfId = uuid4();
          acc[concurrentCourseId] = newCombineConfId;
          return acc;
        }, {} as Record<string, string>);      
      // <--- 합반 정식 처리 후 수정 필요

      const remainingLessonConfs = [
        ...teacherLessonConfs.flatMap((conf) => {
          
          const { concurrentCourseId: ccid } = conf;
          if(ccid && !conf.combineConfId && combinedConfIdMap[ccid]) {
            conf.combineConfId = combinedConfIdMap[ccid];
          }

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
      } as TeacherPeriodOverview;
    });
  }

  currentAssignedLessons(): Lesson[] {
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

  // 로컬 스토리지에 저장
  // @TODO:
  //  - Timetable이 아닌 UI 로 옮길것
  //  - Lessons도 저장할 것
  storeCurrentState(): void {
    LocalStorage.set('_classes', this._classes);
    LocalStorage.set('_courses', this._courses);
    LocalStorage.set('_teachers', this._teachers);
    LocalStorage.set('_specialtyRooms', this._specialtyRooms);
    LocalStorage.set('_timetableConfig', this._timetableConfig);

    LocalStorage.set('_teacherCourses', this._teacherCourses);
    LocalStorage.set('_lessonConfs', this._lessonConfs);
    LocalStorage.set('_fixedConfs', this._fixedConfs);
    LocalStorage.set('_concurrentCourseConfs', this._concurrentCourseConfs);

    LocalStorage.set('_classPeriodOverview', this._classPeriodOverviews);
    LocalStorage.set('_teacherPeriodOverviews', this._teacherPeriodOverviews);
  }

  // 로컬 스토리지에서 복원
  // @TODO:
  //  - Timetable이 아닌 UI 로 옮길것
  //  - Lessons도 복원하고, 복원된 데이터를 이용하여 다시 수업을 배정할 것
  restoreState(): void {
    this.classes = LocalStorage.get('_classes', []);
    this.courses = LocalStorage.get('_courses', []);
    this.teachers = LocalStorage.get('_teachers', []);
    this.specialtyRooms = LocalStorage.get('_specialtyRooms', []);
    this.timetableConfig = LocalStorage.get('_timetableConfig', {});

    this.teacherCourses = LocalStorage.get('_teacherCourses', []);
    this.lessonConfs = LocalStorage.get('_lessonConfs', []);
    this.fixedConfs = LocalStorage.get('_fixedConfs', []);
    this.concurrentCourseConfs = LocalStorage.get('_concurrentCourseConfs', []);

    this._classPeriodOverviews = LocalStorage.get('_classPeriodOverview', []);
    this._teacherPeriodOverviews = LocalStorage.get(
      '_teacherPeriodOverviews',
      []
    );

    // overviews의 teacher reference를 맞춘다
    //  이 과정이 없으면 overview.teacher와 _teachers의 teacher가 다른 객체로 인식되어
    //  데이터가 동기화 되지 않는다.
    this._teacherPeriodOverviews.forEach((overview) => {
      const teacherId = overview.teacher.teacherId;
      const teacher = this._teachersMap[teacherId];
      overview.teacher = teacher;
    });

    // overviews의 class reference를 맞춘다!!
    this._classPeriodOverviews.forEach((overview) => {
      const classId = overview.cls.classId;
      const cls = this._classMap[classId];
      overview.cls = cls;
    });

    this.initMapFromClassPeriodOverViews();
    this.initMapFromTeacherPeriodOverviews();
  }

  getGradeByGradeNumber(grade: number): TimetableGrade | undefined {
    return this._timetableConfig.grades.find((g) => g.grade === grade);
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

    this._specialtyRoomMap =
      specialtyRooms?.reduce((acc, cur) => {
        acc[cur.specialtyRoomId] = cur;
        return acc;
      }, {} as Record<string, SpecialtyRoom>) || {};

    this.initSpecialtyRoomFreeStatus();
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

    this.initSpecialtyRoomFreeStatus();
  }

  set specialtyRoomConfs(specialtyRoomConfs: SpecialtyRoomConf[]) {
    this._specialtyRoomConfs = specialtyRoomConfs;

    this._specialtyRoomConfMap =
      specialtyRoomConfs?.reduce((acc, cur) => {
        if (!acc[cur.specialtyRoomId || '']) {
          acc[cur.specialtyRoomId || ''] = [];
        }
        acc[cur.specialtyRoomId || ''].push(cur);
        return acc;
      }, {} as Record<string, SpecialtyRoomConf[]>) || {};

    this.initSpecialtyRoomFreeStatus();
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
  get classPeriodOverviews(): ClassPeriodOverview[] {
    return this._classPeriodOverviews;
  }

  get classPeriodOverviewMap(): Record<string, ClassPeriodOverview> {
    return this._classPeriodOverviewMap;
  }

  get teacherPeriodOverviews(): TeacherPeriodOverview[] {
    return this._teacherPeriodOverviews;
  }

  get teacherPeriodOverviewMap(): Record<string, TeacherPeriodOverview> {
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

  get specialtyRoomMap() {
    return this._specialtyRoomMap;
  }

  get specialtyRoomConfs() {
    return this._specialtyRoomConfs;
  }

  get specialtyRoomConfMap() {
    return this._specialtyRoomConfMap;
  }

  get specialtyRoomFreeStatus() {
    return this._specialtyRoomFreeStatus;
  }
  // <---

  set isSlient(value: boolean) {
    this._isSilent = value;
  }

  // tmp method --------------------------------
  printOverviews(): void {
    this.printLog(
      'class overview ===>',
      this.classPeriodOverviews,
      this.classPeriodOverviewMap
    );
    this.printLog(
      'teacher overview ===>',
      this.teacherPeriodOverviews,
      this.teacherPeriodOverviewMap
    );

    this.printLog(
      'specialtyRoom free status ===>',
      this.specialtyRoomFreeStatus
    );
  }

  printLog(...args: Parameters<typeof console.log>): void {
    if (!this._isDebug || this._isSilent) {
      return;
    }
    console.log(...args);
  }
}
