import { inject } from "vue";
import { TeacherCourseClassForSwap } from "../common/types";
import { ContextKeys, LessonConfContext, TeacherCourseContext } from "../contexts";
import { LessonConf } from "../core/types";


const userLessonConfService = () => {
  const teacherCourseContext = inject(ContextKeys.TeacherCourse) as TeacherCourseContext;
  const lessonConfContext = inject(ContextKeys.LessonConf) as LessonConfContext;

  teacherCourseContext.load();
  lessonConfContext.load();

  const swapTeacherCourseClass = async (
    sourceForSwap: TeacherCourseClassForSwap,
    targetForSwap: TeacherCourseClassForSwap
  ) => {
    // 교사에 과목이 없는 경우 추가
    await teacherCourseContext.addCourseToTeacher(
      targetForSwap.teacherId,
      sourceForSwap.courseId
    );

    await teacherCourseContext.addCourseToTeacher(
      sourceForSwap.teacherId,
      targetForSwap.courseId
    );

    // 교사 과목을 swap한다.
    // sourceTeacherCourse의 courseId/classId와 targetTeacherCourse의 courseId/classId가 같은 lessonConf를 찾아서
    // teacherId를 swap한다.
    const { lessonConfs } = lessonConfContext;
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

    // await LessonConfRepository.set(updatedLessonConfs);
    await lessonConfContext.updateLessonConfs(updatedLessonConfs);
    return updatedLessonConfs;
  }


  const moveTeacherCourseClass = async (
    sourceForSwap: TeacherCourseClassForSwap,
    targetTeacherId: string
  ) => {
    // 교사에 과목이 없는 경우 추가
    await teacherCourseContext.addCourseToTeacher(
      targetTeacherId,
      sourceForSwap.courseId
    );

    // 교사 과목을 swap한다.
    // sourceTeacherCourse의 courseId/classId와 targetTeacherCourse의 courseId/classId가 같은 lessonConf를 찾아서
    // teacherId를 swap한다.
    const { lessonConfs } = lessonConfContext;
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

    await lessonConfContext.updateLessonConfs(updatedLessonConfs);
    // await LessonConfRepository.set(updatedLessonConfs);
    return updatedLessonConfs;
  }
  

  return {
    swapTeacherCourseClass,
    moveTeacherCourseClass
  }
}


export default userLessonConfService;