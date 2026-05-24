import {
  ConcurrentConfContext,
  ConsecutiveConfContext,
  LessonConfContext,
  SpecialtyRoomConfContext,
  TeacherCourseContext,
  TimetableClassContext,
  TimetableCourseContext,
  TimetableTeacherContext,
  SpecialtyRoomContext,
  TimetableCourseBaseContext
} from '../contexts';

import { SpecialtyRoomConf, LessonConf, ConsecutiveConf } from '@/apps/timetable/core/types';

import { SpecialtyRoomConfEntity, SpecialtyRoomDeleteResponse } from '@/apps/timetable/common/types';

export const createSpecialtyRoomConfService = (
  consecutiveConfContext: ConsecutiveConfContext,
  concurrentConfContext: ConcurrentConfContext,
  lessonConfContext: LessonConfContext,
  specialtyRoomContext: SpecialtyRoomContext,
  specialtyRoomConfContext: SpecialtyRoomConfContext,
  teacherCourseContext: TeacherCourseContext,
  timetableClassContext: TimetableClassContext,
  timetableCourseContext: TimetableCourseContext,
  timetableCourseBaseContext: TimetableCourseBaseContext,
  timetableTeacherContext: TimetableTeacherContext
) => {
  const SpecialtyRoomConfService = {

    keyFromLessonConf: (lessonConf: LessonConf) => {
      return `${lessonConf.courseId}-${lessonConf.classId}`;
    },

    getSpecialtyRoomConfs: () => {
      return specialtyRoomConfContext.specialtyRoomConfs;
    },

    getConsecutiveConfs: () => {
      return consecutiveConfContext.consecutiveConfs;
    },

    getCourseBaseMap: () => {
      return timetableCourseBaseContext.courseBaseMap;
    },

    getCourseMap: () => {
      return timetableCourseContext.courseMap;
    },

    getTimetableId: () => {
      return specialtyRoomConfContext.timetableId;
    },

    // getConcurrentConfs: () => {
    //   return concurrentConfContext.concurrentConfs;
    // },

    getListForSelect: () => {
      const courseGradeTeacherMap =
        SpecialtyRoomConfService.getCourseGradeTeacherMap();

      const classMap = timetableClassContext.classMap;
      const courseMap = timetableCourseContext.courseMap;
      const teacherMap = timetableTeacherContext.teacherMap;

      const specialtyRoomConfEntities: Array<SpecialtyRoomConfEntity> = [];

      const currentSpecialtyRoomConfs = 
        SpecialtyRoomConfService.getSpecialtyRoomConfs() as Array<SpecialtyRoomConf>;

      const consecutiveConfs = 
        SpecialtyRoomConfService.getConsecutiveConfs() as Array<ConsecutiveConf>;

      Object.keys(courseGradeTeacherMap).forEach((key) => {
        const lessonConfs = courseGradeTeacherMap[key];
        if (!lessonConfs || lessonConfs.length === 0) {
          return;
        }

        const representativeLessonConf = [...lessonConfs]
          .sort((a, b) => {
            const nameA = teacherMap[a.teacherId]?.teacherName || '';
            const nameB = teacherMap[b.teacherId]?.teacherName || '';
            return nameA.localeCompare(nameB);
          })[0];
        const course = courseMap[representativeLessonConf.courseId];
        
        if (
          !course ||
          !course.periodCount ||
          course.isUnified
        ) {
          // 시수 2미만 과목은 제외, 공통과목 제외
          return;
        }

        const clazz = classMap[representativeLessonConf.classId];
        if (!clazz) {
          return;
        }

        const teacherIdSet = new Set<string>();
        lessonConfs.forEach((lessonConf) => {
          teacherIdSet.add(lessonConf.teacherId);
        });
        const teacherIds = Array.from(teacherIdSet);
        const teachers = teacherIds.map((teacherId) => {
          return teacherMap[teacherId];
        }).filter((teacher) => !!teacher);

        const assignedRoom = currentSpecialtyRoomConfs.find((conf) => {
          return conf.courseId === course.courseId &&
            conf.grade === clazz.grade &&
            teacherIds.includes(conf.teacherId);
        });

        // 25.11.19 동시 수업 정보 수정 ( 한 학급이라도 동시 수업이면 동시 수업으로 간주 )
        const concurrent = lessonConfs.find((lessonConf) => lessonConf.concurrentCourseId);

        const lcKeys = lessonConfs
          .map(c => {
            const course = courseMap[c.courseId];
            if (!course) return;
            return `${c.courseId}-${c.teacherId}-${c.grade}-${course.periodCount}`
          })
          .filter(k => !!k);

        const isConsecutive = consecutiveConfs.some(cc => {
          const course = courseMap[cc.courseId];
          if (!course) return false;
          return lcKeys.includes(`${cc.courseId}-${cc.teacherId}-${cc.grade}-${course.periodCount}`)
        });

        specialtyRoomConfEntities.push({
          courseId: course.courseId,
          courseTitle: course.isDoubleTeacher ? `(복) ${course.displayedTitle} (${course.standardCourseTitle})` : `${course.displayedTitle} (${course.standardCourseTitle})`,
          coursePeriod: course.periodCount,
          grade: clazz.grade,
          isConsecutive,
          isConcurrent: !!concurrent,
          concurrentCourseId: concurrent?.concurrentCourseId,
          lessonConfs: lessonConfs,
          isVirtual: clazz.isVirtual,
          representative: representativeLessonConf.teacherId,
          teachers: teachers,
          assignedRoom: assignedRoom || null,
          isCheck: !!assignedRoom
        });
      });
      
      return specialtyRoomConfEntities;
    },

    getCourseGradeTeacherMap: () => {
      const courseBaseMap = SpecialtyRoomConfService.getCourseBaseMap();
      const courseMap = SpecialtyRoomConfService.getCourseMap();

      const lessonConfs = lessonConfContext.lessonConfs as Array<LessonConf>;
      const courseClassMap = {} as Record<string, LessonConf[]>;

      lessonConfs.forEach((lessonConf: LessonConf) => {
        const key = SpecialtyRoomConfService.keyFromLessonConf(lessonConf);
        (courseClassMap[key] = courseClassMap[key] || []).push(lessonConf);
      });

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

    deleteSpecialtyRoom: async (specialtyRoomId: string): Promise<void> => {
      try {
        const timetableId = specialtyRoomConfContext.timetableId;
        const res = await specialtyRoomContext.deleteSpecialtyRoom(timetableId, specialtyRoomId);

        if (res.status !== 200) {
          throw new Error('Failed to delete specialty room');
        }

        const { specialtyRoom, lessonConfs, specialtyRoomConfIds } = res.data as SpecialtyRoomDeleteResponse;

        if (Array.isArray(lessonConfs) && lessonConfs.length !== 0) { lessonConfContext.replace(lessonConfs); }
        if (Array.isArray(specialtyRoomConfIds) && specialtyRoomConfIds.length !== 0) { specialtyRoomConfContext.deleteByIdsIn(specialtyRoomConfIds); }
        specialtyRoomContext.deleteById(specialtyRoom.specialtyRoomId);
      } catch (error) {
        console.error('Error deleting specialty room:', error);
        throw new Error('Failed to delete specialty room');
      }
    }
  };
  
  return SpecialtyRoomConfService;
};
