import { FixedConfRepository } from '@/apps/timetable/repositories/fixed-conf-repository';
import { TimetableCourseRepository } from '@/apps/timetable/repositories/timetable-course-repository';
import { FixedConf } from '@/apps/timetable/core/types';
import { FixedConfContext, TimetableCourseContext } from '../contexts';

const FixedConfService = {
  /*
  getFixedConfs: async () => {
    return FixedConfRepository.getFixedConfs();
  },
  */

  deleteByIds: async (courseIds: string[]) => {
    return FixedConfRepository.deleteWithCourseIds(courseIds);
  },

  delete: async (fixedConf: FixedConf) => {
    if (fixedConf.consecutiveGroupId) {
      await FixedConfRepository.deleteWithConsecutiveGroupId(
        fixedConf.consecutiveGroupId
      );
      return;
    }

    await FixedConfRepository.delete(fixedConf);
  },

  deleteItems: async (fixedConfs: FixedConf[]) => {
    return FixedConfRepository.deleteWithArray(fixedConfs);
  },

  createItems: async (fixedConfs: FixedConf[]) => {
    // 연속된 시수가 있으면 연속된 그룹 아이디를 할당한다.
    const fixedConfsWithConsecutiveGroupId =
      await FixedConfService.assignConseutiveGroupIds(fixedConfs);

    return FixedConfRepository.createWithArray(
      fixedConfsWithConsecutiveGroupId
    );
  },

  assignConseutiveGroupIds: async (fixedConfs: FixedConf[]) => {
    const result = [...fixedConfs];

    const groupedByDay = result.reduce((acc, fixedConf) => {
      if (!acc[fixedConf.dayOfWeek]) {
        acc[fixedConf.dayOfWeek] = [];
      }

      acc[fixedConf.dayOfWeek].push(fixedConf);
      return acc;
    }, {} as { [key: number]: FixedConf[] });

    Object.values(groupedByDay).forEach((group) => {
      group.sort((a, b) => a.period - b.period);

      let currentGroupId: string | undefined = undefined;
      let hasConsecutive = false;

      for (let i = 0; i < group.length; i++) {
        if (i > 0 && group[i].period === group[i - 1].period + 1) {
          // 연속된 경우 같은 그룹 ID 유지
          if (!hasConsecutive) {
            hasConsecutive = true;
            currentGroupId = FixedConfRepository.generateConsecutiveGroupId();
            group[i - 1].consecutiveGroupId = currentGroupId; // 이전 요소에도 할당
          }
          group[i].consecutiveGroupId = currentGroupId;
        } else {
          // 연속되지 않은 경우 새로운 그룹이 시작될지 확인
          hasConsecutive = false;
          group[i].consecutiveGroupId = undefined; // 기본값으로 설정
        }
      }
    });

    return result;
  },

  getFixedUnifiedCourseGroupByGrade: () => {
    // 고정된 공통과목을 학년별로 가져온다.
    // const fixedConfs = (await FixedConfRepository.getFixedConfs()) as FixedConf[];
    // const courseMap = await TimetableCourseRepository.getCourseMap();

    const fixedConfs = FixedConfContext.getInstance().fixedConfs;
    const courseMap = TimetableCourseContext.getInstance().courseMap;

    return fixedConfs
      .filter(
        (conf) => courseMap[conf.courseId] && courseMap[conf.courseId].isUnified
      )
      .reduce((acc, conf) => {
        if (!acc[conf.grade]) {
          acc[conf.grade] = [];
        }

        acc[conf.grade].push(conf);
        return acc;
      }, {} as { [key: number]: FixedConf[] });
  },
};

export { FixedConfService };
