import { LessonConfRepository } from '@/apps/timetable/repositories/lesson-conf-repository';
import { TeacherCourseRepository } from '@/apps/timetable/repositories/teacher-course-repository';
import {
  LessonConf,
} from '@/apps/timetable/core/types';

export interface TeacherCourseClassForSwap {
  teacherId: string;
  courseId: string;
  classId: string;
}

const LessonConfService = {
  getByClassId: async (classId: string) => {
    return LessonConfRepository.getByClassId(classId);
  },

  getByClassIdWithUniqueCourse: async (classId: string) => {
    // 반별 수업 설정(lessonConf)목록을 가져오되, 복수 교사 과목인 경우
    // 대표교사(첫번째 교사)를 남기고 나머지는 제거한다.
    const lessonConfs = (await LessonConfRepository.getByClassId(
      classId
    )) as LessonConf[];
    const courseIdSet = new Set<string>();
    return lessonConfs.filter((lessonConf) => {
      const { courseId } = lessonConf;
      if (courseIdSet.has(courseId)) {
        return false;
      }

      courseIdSet.add(courseId);
      return true;
    });
  },

  updateConcurrentCourseIdByLessonConf: async (
    lessonConf: LessonConf,
    concurrentCourseId: string
  ) => {
    // courseId와 classId가 같은 lessonConf를 찾아서 concurrentCourseId를 업데이트한다.
    return await LessonConfRepository.updateConcurrentCourseIdWithCourseAndClass(
      lessonConf.courseId,
      lessonConf.classId,
      concurrentCourseId
    );
  },

  /*
  createLessonConf: async (
    teacherId: string,
    courseId: string,
    classId: string
  ) => {
    // 이미 존재하는 수업 설정인지 확인한다.
    const lessonConfs = await LessonConfRepository.getByClassId(classId);
    const isExist = lessonConfs.some(
      (lessonConf: LessonConf) =>
        lessonConf.teacherId === teacherId &&
        lessonConf.courseId === courseId &&
        lessonConf.classId === classId
    );

    if (isExist) {
      return lessonConfs;
    }

    const lessonConf = {
      lessonConfId: '',
      courseId,
      classId,
      teacherId,
      specialtyRoomId: '',
      concurrentCourseId: '',
      consecutivePeriod: '',
    } as LessonConf;

    return await LessonConfRepository.add(lessonConf);
  },

  deleteLessonConf: async (lessonConf: LessonConf) => {
    return await LessonConfRepository.delete(lessonConf);
  },
  */

  removeConcurrentCourseByLessonConf: async (lessonConf: LessonConf) => {
    // courseId와 classId가 같은 lessonConf를 찾아서 concurrentCourseId를 업데이트한다.
    return await LessonConfRepository.updateConcurrentCourseIdWithCourseAndClass(
      lessonConf.courseId,
      lessonConf.classId,
      ''
    );
  },

  removeConcurrentCourseIdByConcurrentCourseId: async (concurrentCourseId: string) => {
    // 동시 수업에 할당된 수업 설정(lessonConf)들의 동시 수업 정보를 제거한다.
    const lessonConfs = await LessonConfRepository.get();
    const updatedLessonConfs: LessonConf[] = lessonConfs
      .filter(
        (lessonConf: LessonConf) =>
          lessonConf.concurrentCourseId === concurrentCourseId
      )
      .map((lessonConf: LessonConf) => {
        lessonConf.concurrentCourseId = '';
        return lessonConf;
      });

    await LessonConfRepository.set(lessonConfs);
    return updatedLessonConfs;
  },

  deleteConcurrentCourseByConcurrentCourseIds: async (
    concurrentCourseIds: string[]
  ) => {
    // 여러 동시수업의 수업 설정들을 삭제하는 경우, storage를 여러번 저장하는 것을 방지하기 위해 해당 함수를 사용한다.
    // 동시 수업에 할당된 수업 설정(lessonConf)들의 동시 수업 정보를 제거한다.
    const lessonConfs = await LessonConfRepository.get();

    const updatedLessonConfs: LessonConf[] = lessonConfs
      .filter((lessonConf: LessonConf) => {
        if (!lessonConf.concurrentCourseId) {
          return false;
        }
        return concurrentCourseIds.includes(lessonConf.concurrentCourseId);
      })
      .map((lessonConf: LessonConf) => {
        lessonConf.concurrentCourseId = '';
        return lessonConf;
      });

    await LessonConfRepository.set(lessonConfs);
    return updatedLessonConfs;
  },

  moveTeacherCourseClass: async (
    sourceForSwap: TeacherCourseClassForSwap,
    targetTeacherId: string
  ) => {
    // 교사에 과목이 없는 경우 추가
    await TeacherCourseRepository.addCourseToTeacher(
      targetTeacherId,
      sourceForSwap.courseId
    );

    // 교사 과목을 swap한다.
    // sourceTeacherCourse의 courseId/classId와 targetTeacherCourse의 courseId/classId가 같은 lessonConf를 찾아서
    // teacherId를 swap한다.
    const lessonConfs = await LessonConfRepository.get();
    const updatedLessonConfs = lessonConfs.map((conf: LessonConf) => {
      if (
        conf.classId === sourceForSwap.classId &&
        conf.courseId === sourceForSwap.courseId &&
        conf.teacherId === sourceForSwap.teacherId
      ) {
        conf.teacherId = targetTeacherId;
      }
      return conf;
    });

    await LessonConfRepository.set(updatedLessonConfs);
    return updatedLessonConfs;
  },

  swapTeacherCourseClass: async (
    sourceForSwap: TeacherCourseClassForSwap,
    targetForSwap: TeacherCourseClassForSwap
  ) => {
    // 교사에 과목이 없는 경우 추가
    await TeacherCourseRepository.addCourseToTeacher(
      targetForSwap.teacherId,
      sourceForSwap.courseId
    );

    await TeacherCourseRepository.addCourseToTeacher(
      sourceForSwap.teacherId,
      targetForSwap.courseId
    );

    // 교사 과목을 swap한다.
    // sourceTeacherCourse의 courseId/classId와 targetTeacherCourse의 courseId/classId가 같은 lessonConf를 찾아서
    // teacherId를 swap한다.
    const lessonConfs = await LessonConfRepository.get();
    const updatedLessonConfs = lessonConfs.map((conf: LessonConf) => {
      if (
        conf.classId === sourceForSwap.classId &&
        conf.courseId === sourceForSwap.courseId &&
        conf.teacherId === sourceForSwap.teacherId
      ) {
        conf.teacherId = targetForSwap.teacherId;
      } else if (
        conf.classId === targetForSwap.classId &&
        conf.courseId === targetForSwap.courseId &&
        conf.teacherId === targetForSwap.teacherId
      ) {
        conf.teacherId = sourceForSwap.teacherId;
      }
      return conf;
    });

    await LessonConfRepository.set(updatedLessonConfs);
    return updatedLessonConfs;
  },
};

export default LessonConfService;
