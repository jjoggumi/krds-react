
import { inject, ref } from "vue"
import { ContextKeys, FixedConfContext, ConcurrentConfContext, TimetableCourseContext, LessonConfContext } from "../contexts"
import { ConcurrentConf, ConcurrentConfCourse, Course } from "../core/types";

const useConcurrentConfService = () => {
  const concurrentConfContext = inject(ContextKeys.ConcurrentConf) as ConcurrentConfContext;
  concurrentConfContext.load();

  const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;
  courseContext.load();

  const fixedConfContext = inject(ContextKeys.FixedConf) as FixedConfContext;
  fixedConfContext.load();

  const lessonConfContext = inject(ContextKeys.LessonConf) as LessonConfContext;
  lessonConfContext.load();
  
  const addWithConcurrentConfCourse = async (
    concurrentConfCourse: ConcurrentConfCourse
  ) => {
    const courseToAdd = concurrentConfCourseToCourse(concurrentConfCourse);

    const course = await courseContext.addConcurrentCourse(courseToAdd);

    const concurrentConfToAdd =
      concurrentConfCourseToConcurrentConf(concurrentConfCourse);

    concurrentConfToAdd.courseId = course.courseId;

    const courseConf = await concurrentConfContext.addItem(concurrentConfToAdd);
    // const courseConf = await ConcurrentConfRespository.add(concurrentConfToAdd);

    const result = {
      // ...course,
      // ...courseConf,
    } as ConcurrentConfCourse;

    return result;
  }

  
  const updateWithConcurrentConfCourse = async (
    concurrentConfCourse: ConcurrentConfCourse
  ) => {
    // update ConcurrentConf
    const concurrentConfToUpdate =
      concurrentConfCourseToConcurrentConf(
        concurrentConfCourse
      );

    // const courseConf = await ConcurrentConfRespository.update(concurrentConfToUpdate);
    const courseConf = await concurrentConfContext.update(concurrentConfToUpdate);

    // update Course
    // const courseToUpdate = ConcurrentConfService.concurrentConfCourseToCourse(concurrentConfCourse);
    const courseToUpdate = concurrentConfCourseToCourse(concurrentConfCourse);

    // const course = await TimetableCourseRepository.update(courseToUpdate);
    const course = await courseContext.update(courseToUpdate);

    return {
      ...course,
      ...courseConf,
    } as ConcurrentConfCourse;
  }


  const deleteWithConcurrentCourseIds = async (courseIds: string[]) => {
    // 배정된 수업 제거
    await lessonConfContext.deleteConcurrentCourseByConcurrentCourseIds(
      courseIds
    );

    // 수업 고정 제거
    await fixedConfContext.deleteByCourseIds(courseIds);

    // ConcurrentConf 제거
    await concurrentConfContext.deleteWithIds(courseIds);

    // Course 제거
    await courseContext.deleteWithIds(courseIds);
  }


  const concurrentConfCourseToCourse = (
    concurrentConfCourse: ConcurrentConfCourse
  ) => {
    const {
      courseId,
      displayedTitle,
      periodCount,
      isDoubleTeacher,
      countTeacher,
      isUnified,
      isConcurrent,
      similarCourseConfId,
    } = concurrentConfCourse;

    const course = {
      courseId,
      displayedTitle,
      periodCount,
      isDoubleTeacher,
      countTeacher,
      isUnified,
      isConcurrent,
      similarCourseConfId,
    } as Course;

    return course;
  }

  const concurrentConfCourseToConcurrentConf = (
    concurrentConfCourse: ConcurrentConfCourse
  ) => {
    const { courseId, grade, consecutivePeriod, isCombinedClass, sortNo } =
      concurrentConfCourse;

    const concurrentConf = {
      courseId,
      grade,
      consecutivePeriod,
      isCombinedClass,
      sortNo,
    } as ConcurrentConf;

    return concurrentConf;
  }
    
  return {
    addWithConcurrentConfCourse,
    updateWithConcurrentConfCourse,
    deleteWithConcurrentCourseIds,
  }
}

export default useConcurrentConfService