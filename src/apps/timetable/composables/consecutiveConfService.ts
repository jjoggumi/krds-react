import { inject } from "vue";
import { ConsecutiveConf, LessonConf } from "../core/types";
import { ConsecutiveConfContext, ContextKeys, LessonConfContext, TimetableClassContext } from "../contexts";


const useConsecutiveConfService = () => {
  const consecutiveConfContext = inject(ContextKeys.ConsecutiveConf) as ConsecutiveConfContext;
  consecutiveConfContext.load();

  const lessonConfContext = inject(ContextKeys.LessonConf) as LessonConfContext;
  lessonConfContext.load();

  const classContext = inject(ContextKeys.Class) as TimetableClassContext;
  classContext.load();


  const keyWithLessonConf = (lessonConf: LessonConf) => {
    return `${lessonConf.courseId}-${lessonConf.classId}`;
  }

  /* 복수 교사의 LessonConf도 포함된 LessonConf목록의 맵을 (과목-학년-대표교사)를 key로 만든다. */
  const getCourseGradeTeacherMap = () => {
    const { lessonConfs } = lessonConfContext;
    const courseClassMap = {} as Record<string, LessonConf[]>;

    lessonConfs.forEach((lessonConf: LessonConf) => {
      // const key = ConsecutiveConfService.keyFromLessonConf(lessonConf);
      const key = keyWithLessonConf(lessonConf);
      if (!courseClassMap[key]) {
        courseClassMap[key] = [];
      }

      courseClassMap[key].push(lessonConf);
    });

    // 복수교사과목을 감안하여, 과목-학년-대표교사 키로 맵을 만든다.
    const { classMap } = classContext;
    const courseGradeTeacherMap = {} as Record<string, LessonConf[]>;
    Object.values(courseClassMap).forEach((lessonConfs) => {
      if (!lessonConfs || lessonConfs.length === 0) {
        return;
      }

      const lessonConf = lessonConfs[0];
      const cls = classMap[lessonConf.classId];

      if (!cls) {
        return;
      }

      // @important: Key 포멧 -> 과목-학년-대표교사
      const key = `${lessonConf.courseId}-${cls.grade}-${lessonConf.teacherId}`;      
      if (!courseGradeTeacherMap[key]) {
        courseGradeTeacherMap[key] = [];
      }

      courseGradeTeacherMap[key].push(lessonConf);
    });

    return courseGradeTeacherMap;
  }

  const getByLessonConf = (lessonConf: LessonConf) => {
    // 모든 연속 수업 설정의 모든 lessonConf를 가져온다.
    const { consecutiveConfs } = consecutiveConfContext;
    const courseGradeTeacherMap = getCourseGradeTeacherMap();

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
  }


  // const deleteConsecutiveConfs = async (consecutiveConfs: ConsecutiveConf[]) => {
  //   // 삭제 시 해당 설정의 '과목-학년-(교사 - 복수교사)'의 lessonConf에 적용된 연속 시수도 제거한다.
  //   const courseGradeTeacherMap = getCourseGradeTeacherMap();

  //   // 삭제 대상 설정의 lessonConf를 조회
  //   const lessonConfs = consecutiveConfs.flatMap((consecutiveConf) => {
  //     // @important: Key 포멧 -> 과목-학년-대표교사
  //     const key = `${consecutiveConf.courseId}-${consecutiveConf.grade}-${consecutiveConf.teacherId}`;
  //     return courseGradeTeacherMap[key];
  //   });

  //   // 연속 시수 제거
  //   lessonConfs.forEach((lessonConf) => {
  //     lessonConf.consecutivePeriod = '';
  //   });

  //   // 수업 설정 (LessonConf) 업데이트
  //   await lessonConfContext.updateLessonConfs(lessonConfs);
  //   // await LessonConfRepository.updateLessonConfs(lessonConfs);

  //   // 연속 설정 삭제
  //   await consecutiveConfContext.deleteItems(consecutiveConfs);
  // }
  

  // const createConsecutiveConfs = async (consecutiveConfs: ConsecutiveConf[]) => {
  //   // const currentConsecutiveConfs = (await ConsecutiveConfRepository.getConsecutiveConfs()) as ConsecutiveConf[];
  //   const currentConsecutiveConfs = consecutiveConfContext.consecutiveConfs;

  //   // 이미 존재하는 항목인지 확인
  //   const added = consecutiveConfs.filter((consecutiveConf) => {
  //     return !currentConsecutiveConfs.some(
  //       (currentConsecutiveConf) =>
  //         currentConsecutiveConf.courseId === consecutiveConf.courseId &&
  //         currentConsecutiveConf.teacherId === consecutiveConf.teacherId &&
  //         currentConsecutiveConf.grade === consecutiveConf.grade
  //     );
  //   });

  //   await consecutiveConfContext.createItems(added);
  // }

  return {
    getCourseGradeTeacherMap,
    getByLessonConf,
    // deleteConsecutiveConfs,
    // createConsecutiveConfs,
  };
}

export default useConsecutiveConfService;