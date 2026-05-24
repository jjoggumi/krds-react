import {ConsecutiveConfRepository} from '@/apps/timetable/repositories/consecutive-conf-repository';
import {LessonConfRepository} from '@/apps/timetable/repositories/lesson-conf-repository';
// import { TimetableClassRepository } from '@/apps/timetable/repositories/timetable-class-repository';
// import { TimetableCourseRepository } from '@/apps/timetable/repositories/timetable-course-repository';
// import { TimetableTeacherRepository } from '@/apps/timetable/repositories/timetable-teacher-repository';
import {
  ConsecutiveConfContext,
  LessonConfContext,
  TeacherCourseContext,
  TimetableClassContext,
  TimetableCourseContext,
  TimetableTeacherContext,
  SpecialtyRoomConfContext,
  TimetableCourseBaseContext
} from '../contexts';

import {ConsecutiveConf, LessonConf, SpecialtyRoomConf} from '@/apps/timetable/core/types';

import {ConsecutiveConfEntity} from '@/apps/timetable/common/types';

export const createConsecutiveConfService = (
  consecutiveConfContext: ConsecutiveConfContext,
  lessonConfContext: LessonConfContext,
  teacherCourseContext: TeacherCourseContext,
  timetableClassContext: TimetableClassContext,
  timetableCourseContext: TimetableCourseContext,
  timetableCourseBaseContext: TimetableCourseBaseContext,
  timetableTeacherContext: TimetableTeacherContext,
  specialtyRoomConfContext: SpecialtyRoomConfContext
) => {

  const ConsecutiveConfService = {

    keyFromLessonConf: (lessonConf: LessonConf) => {
      return `${lessonConf.courseId}-${lessonConf.classId}`;
    },

    getConsecutiveConfs: () => {
      // return ConsecutiveConfRepository.getConsecutiveConfs();
      return consecutiveConfContext.consecutiveConfs;
    },

    getSpecialtyRoomConfs: () => {
      return specialtyRoomConfContext.specialtyRoomConfs;
    },

    getCourseBaseMap: () => {
      return timetableCourseBaseContext.courseBaseMap;
    },

    getCourseMap: () => {
      return timetableCourseContext.courseMap;
    },

    getListForSelect: async () => {
      // 과목 - 교사(들) - 학년 - 시수 - (연속, 동시 여부)
      // (과목 - 교사 - 학년)으로 그룹핑
      const courseGradeTeacherMap =
        await ConsecutiveConfService.getCourseGradeTeacherMap();

      const classMap = timetableClassContext.classMap;
      const courseMap = timetableCourseContext.courseMap;
      const teacherMap = timetableTeacherContext.teacherMap;
      const consecutiveConfEntities: ConsecutiveConfEntity[] = [];

      // 이미 존재하는 항목 조회
      const currentConsecutiveConfs =
        ConsecutiveConfService.getConsecutiveConfs() as ConsecutiveConf[];

      const specialtyRoomConfs = 
        ConsecutiveConfService.getSpecialtyRoomConfs() as SpecialtyRoomConf[];

      Object.keys(courseGradeTeacherMap).forEach((key) => {
        const lessonConfs = courseGradeTeacherMap[key];
        if (!lessonConfs || lessonConfs.length === 0) {
          console.log('lessonConfs is empty');
          return;
        }

        const lessonConf = lessonConfs[0];
        const course = courseMap[lessonConf.courseId];
        if (
          !course ||
          !course.periodCount ||
          course.periodCount < 2 ||
          course.isUnified
        ) {
          // 시수 2미만 과목은 제외, 공통과목 제외
          // - 일반적으로 공통과목은 교사가 지정되지 않지만 예외가 있을 수 있음
          return;
        }

        const cls = classMap[lessonConf.classId];
        if (!cls) {
          return;
        }

        const teacherIdSet = new Set<string>();
        lessonConfs.forEach((lessonConf) => {
          teacherIdSet.add(lessonConf.teacherId);
        });

        const teacherIds = Array.from(teacherIdSet);
        const teachers = teacherIds
          .map((teacherId) => {
            return teacherMap[teacherId];
          })
          .filter((teacher) => teacher != undefined);

        const isConsecutive = currentConsecutiveConfs.some(
          (currentConsecutiveConf) =>
            currentConsecutiveConf.courseId === course.courseId &&
            currentConsecutiveConf.grade === cls.grade &&
            teacherIds.includes(currentConsecutiveConf.teacherId)
        );

        const isConcurrent = lessonConfs.some(l => l.concurrentCourseId !== null);

        const lcKeys = lessonConfs
          .map(c => {
            const course = courseMap[c.courseId];
            if (!course) return;
            return `${c.courseId}-${c.teacherId}-${c.grade}-${course.periodCount}`
          })
          .filter(k => !!k);

        const roomId = specialtyRoomConfs
          .find(sc => lcKeys.includes(`${sc.courseId}-${sc.teacherId}-${sc.grade}-${sc.periodCount}`))
          ?.specialtyRoomId;

        consecutiveConfEntities.push({
          courseId: course.courseId,
          courseTitle: course.isDoubleTeacher ? `(복) ${course.displayedTitle} (${course.standardCourseTitle})` : `${course.displayedTitle} (${course.standardCourseTitle})`,
          coursePeriod: course.periodCount,
          grade: cls.grade,
          isConsecutive,
          isConcurrent,
          roomId: roomId ? roomId : null,
          teachers,
          isCheck: isConsecutive,
        });
      });

      return consecutiveConfEntities;
    },

    /* 복수 교사의 LessonConf도 포함된 LessonConf목록의 맵을 (과목-학년-대표교사)를 key로 만든다. */
    getCourseGradeTeacherMap: () => {
      const courseBaseMap = ConsecutiveConfService.getCourseBaseMap();
      const courseMap = ConsecutiveConfService.getCourseMap();

      const lessonConfs = lessonConfContext.lessonConfs as LessonConf[];
      const courseClassMap = {} as Record<string, LessonConf[]>;

      lessonConfs.forEach((lessonConf: LessonConf) => {
        const key = ConsecutiveConfService.keyFromLessonConf(lessonConf);
        (courseClassMap[key] = courseClassMap[key] || []).push(lessonConf);
      });

      // 복수교사과목을 감안하여, 과목-학년-대표교사 키로 맵을 만든다.
      const classMap = timetableClassContext.classMap;
      const teacherMap = timetableTeacherContext.teacherMap;
      const courseGradeTeacherMap = {} as Record<string, LessonConf[]>;
      Object.values(courseClassMap).forEach((lessonConfs) => {
        if (!lessonConfs || lessonConfs.length === 0) {
          return;
        }

        const representativeLessonConf = [...lessonConfs]
          .sort((a, b) => {
            const nameA = teacherMap[a.teacherId]?.teacherName || '';
            const nameB = teacherMap[b.teacherId]?.teacherName || '';
            return nameA.localeCompare(nameB);
          })[0];

        const clazz = classMap[representativeLessonConf.classId];
        if (!clazz) {
          return;
        }

        const course = courseMap[representativeLessonConf.courseId];
        const courseBase = courseBaseMap[course.courseBaseId];
        if (!courseBase) return;

        const teacherIds = courseBase.isDoubleTeacher
          ? [representativeLessonConf.teacherId]
          : Array.from(new Set(lessonConfs.map(lc => lc.teacherId)));

        for (const teacherId of teacherIds) {
          const key = `${representativeLessonConf.courseId}-${clazz.grade}-${teacherId}`;
          const confs = courseBase.isDoubleTeacher
            ? lessonConfs
            : lessonConfs.filter(lc => lc.teacherId === teacherId);

          (courseGradeTeacherMap[key] = courseGradeTeacherMap[key] || []).push(...confs);
        }
      });

      return courseGradeTeacherMap;
    },

    deleteConsecutiveConfs: async (consecutiveConfs: ConsecutiveConf[]) => {
      // 삭제 시 해당 설정의 '과목-학년-(교사 - 복수교사)'의 lessonConf에 적용된 연속 시수도 제거한다.
      const courseGradeTeacherMap =
        await ConsecutiveConfService.getCourseGradeTeacherMap();

      // 삭제 대상 설정의 lessonConf를 조회
      const lessonConfs = consecutiveConfs.flatMap((consecutiveConf) => {
        // @important: Key 포멧 -> 과목-학년-대표교사
        const key = `${consecutiveConf.courseId}-${consecutiveConf.grade}-${consecutiveConf.teacherId}`;
        return courseGradeTeacherMap[key];
      });

      // 연속 시수 제거
      lessonConfs.forEach((lessonConf) => {
        lessonConf.consecutivePeriod = '';
      });

      // 수업 설정 (LessonConf) 업데이트
      await LessonConfRepository.updateLessonConfs(lessonConfs);

      // 연속 설정 삭제
      await ConsecutiveConfRepository.deleteItems(consecutiveConfs);
    },

    // createConsecutiveConfs: async (consecutiveConfs: ConsecutiveConf[]) => {
    //   const currentConsecutiveConfs =
    //     (await ConsecutiveConfRepository.getConsecutiveConfs()) as ConsecutiveConf[];

    //   // 이미 존재하는 항목인지 확인
    //   const added = consecutiveConfs.filter((consecutiveConf) => {
    //     return !currentConsecutiveConfs.some(
    //       (currentConsecutiveConf) =>
    //         currentConsecutiveConf.courseId === consecutiveConf.courseId &&
    //         currentConsecutiveConf.teacherId === consecutiveConf.teacherId &&
    //         currentConsecutiveConf.grade === consecutiveConf.grade
    //     );
    //   });

    //   await ConsecutiveConfRepository.createItems(added);
    // },

    /*
    * 연속 수업 설정의 연속 시수를 수정
    * - 설정의 '과목-학년-(교사 - 복수교사)'의 lessonConf에 적용된 연속 시수도 수정한다.
    */
    updateConsecutivePeriodToConf: async (consecutiveConf: ConsecutiveConf) => {
      const consecutivePeriod = consecutiveConf.consecutivePeriod;

      // 확인을 위해 기존 설정을 가져온다.
      const currentConsecutiveConf =
        await ConsecutiveConfRepository.getById(
          consecutiveConf.consecutiveConfId
        );

      if (
        !currentConsecutiveConf ||
        currentConsecutiveConf.consecutivePeriod === consecutivePeriod
      ) {
        // 연속 시수 설정이 같으면 업데이트하지 않는다.
        return;
      }

      // lessonConf 맵을 가져온다
      const courseGradeTeacherMap =
        await ConsecutiveConfService.getCourseGradeTeacherMap();

      // 수정 대상의 lessonConf를 조회
      const key = `${consecutiveConf.courseId}-${consecutiveConf.grade}-${consecutiveConf.teacherId}`;
      const lessonConfs = courseGradeTeacherMap[key];

      // 연속 시수 수정
      lessonConfs.forEach((lessonConf) => {
        lessonConf.consecutivePeriod = consecutivePeriod;
      });

      // 수업 설정 (LessonConf) 업데이트
      await LessonConfRepository.updateLessonConfs(lessonConfs);

      // 연속 설정 업데이트
      await ConsecutiveConfRepository.update(consecutiveConf);
    },

    getConsecutiveConfOfLessonConf: async (lessonConf: LessonConf) => {
      // 모든 연속 수업 설정의 모든 lessonConf를 가져온다.
      const consecutiveConfs =
        (await ConsecutiveConfService.getConsecutiveConfs()) as ConsecutiveConf[];

      const courseGradeTeacherMap =
        (await ConsecutiveConfService.getCourseGradeTeacherMap()) as Record<
          string,
          LessonConf[]
        >;

      const result = consecutiveConfs.find((consecutiveConf) => {
        const key = `${consecutiveConf.courseId}-${consecutiveConf.grade}-${consecutiveConf.teacherId}`;
        const lessonConfs = courseGradeTeacherMap[key];
        if (!lessonConfs) {
          return false;
        }

        if (
          lessonConfs.some((lc) => lc.lessonConfId === lessonConf.lessonConfId)
        ) {
          return true;
        }
      });

      return result;
    },

  }

  return ConsecutiveConfService;

};
