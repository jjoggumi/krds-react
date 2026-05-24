import { ChainExchangeable, ConcurrentCourseExchangeInfo, Lesson, PeriodTuple } from '../types';
import { TimetableDataContext } from './timetable-data-context';
import TimetableUtils from './utils';
import { TreeNode, Terminable } from './tree-node';
import { Path } from 'html2canvas/dist/types/render/path';

class LessonNodeEntity implements Terminable {
  lesson: Lesson;
  leafPeriods: PeriodTuple[] = [];
  excludedPeriodTuples: PeriodTuple[];
  excludedTeacherIdSet: Set<string>;

  constructor(
    lesson: Lesson,
    leafPeriods: PeriodTuple[],
    excludedPeriodTuples: PeriodTuple[],
    excludedTeacherIdSet: Set<string> = new Set()
  ) {
    this.lesson = lesson;
    this.leafPeriods = leafPeriods;
    this.excludedPeriodTuples = excludedPeriodTuples;
    this.excludedTeacherIdSet = excludedTeacherIdSet;
  }

  isTerminated(): boolean {
    if (this.leafPeriods.length === 0) {
      return false;
    }

    return this.leafPeriods.some((lsn) => {
      return lsn[0] === this.lesson.dayOfWeek && lsn[1] === this.lesson.period;
    });
  }
}

class PathNodeEntity implements Terminable {
  path: Lesson[];
  accumulatedTeacherSet: Set<string> = new Set();
  exchangeableMap: Record<string, Lesson[][]> = {};
  lessonIdSeq: string[] = [];  

  constructor(
    path: Lesson[],
    accumulatedTeacherSet: Set<string> = new Set(),
    exchangeableMap: Record<string, Lesson[][]> = {},
    lessonIdSeq: string[] = []
    // sequence: number = 0,    
  ) {
    this.path = path;
    this.accumulatedTeacherSet = accumulatedTeacherSet;
    this.lessonIdSeq = lessonIdSeq;
    this.exchangeableMap = exchangeableMap;
  }

  isTerminated(): boolean {
    return false;
  }
}

export default class TimetableDataFinder {
  private _context: TimetableDataContext;

  constructor(context: TimetableDataContext) {
    this._context = context;
  }

  /*
   * 연쇄 이동 가능한 수업을 찾는다.
   */
  findChainExchangeableLessons(
    sourceLesson: Lesson,
    maxChainExchangeCount: number    
  ): ChainExchangeable[] {
    if(maxChainExchangeCount !== 0 && !maxChainExchangeCount) {
      maxChainExchangeCount = 3;
    }

    if (!this.checkExchangeableSourceLessons(sourceLesson)) {
      return [];
    }

    /* sourceLesson의 학급 수업중 해당 시수에 에 배정 가능한 수업을 찾는다. */
    // - tree를 이용하여 이동 가능한 경로를 생성하되, tree의 깊이는 maxChainExchangeCount를 넘지 않는다.
    // - 추출된 리프노드에 sourceLesson의 교사가 배정 가능한지 확인한다. 가능하면 확장을 멈춘다.
    const teachereAssignablePeriods =
      this.getAssignablePeriodsOfLessonTeachers(sourceLesson);

    const specialtyRoomId = sourceLesson.specialtyRoomId;
    const sourceAssignablePeriods = specialtyRoomId ?
      teachereAssignablePeriods.filter((period) => {
        // 특별실 수업인 경우, 옮기려는 시수의 특별실이 여유가 있는지 확인
        return !this.isFullSpecialtyRoomPeriod(specialtyRoomId, period[0], period[1]);
      }) :
      teachereAssignablePeriods;

    const rootLessonNodeEntity = new LessonNodeEntity(
      sourceLesson,
      sourceAssignablePeriods,
      []
    );

    const rootNode = new TreeNode<LessonNodeEntity>(rootLessonNodeEntity);
    rootNode.expand(
      this.findMovableLessonNodes.bind(this),
      maxChainExchangeCount
    );

    // maxChainExchangeCount보다 작은 경로는 제거한다 -> 1:1 맞교환은 제외
    const minChainExchangeCount = 2
    rootNode.pruneShallowPaths(minChainExchangeCount);
    const resultPaths = rootNode.getAllPaths();

    // 결과에서 맞교환 가능한 시수는 제거
    const oneToOneExchangeableLessons =
      this.findOneToOneExchangeableLessons(sourceLesson);

    const assignablePaths = resultPaths.filter((path) => {
      const leafNode = path[path.length - 1];
      const { dayOfWeek, period, specialtyRoomId } = leafNode.value.lesson;

      if(specialtyRoomId && this.isFullSpecialtyRoomPeriod(specialtyRoomId, dayOfWeek, period)) {
        // console.log(`=== 제외(특별실 만석): ${specialtyRoomId} - ${dayOfWeek}-${period} ===`);
        return false;
      }

      const assignable = sourceAssignablePeriods.some((p) => {
        if (p[0] === dayOfWeek && p[1] === period) {
          return true;
        }
        return false;
      });

      const oneToOneAssignable = oneToOneExchangeableLessons.some((lsn) => {
        return lsn.dayOfWeek === dayOfWeek && lsn.period === period;
      });

      return assignable && !oneToOneAssignable;
    });

    // 목표 시수로 매핑: key => dayOfWeek-period
    const assignablePathMap = assignablePaths.reduce((acc, path) => {
      const leafNode = path[path.length - 1];
      const { dayOfWeek, period } = leafNode.value.lesson;

      const key = `${dayOfWeek}-${period}`;
      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(path.map((node) => node.value.lesson));

      return acc;
    }, {} as Record<string, Lesson[][]>);

    // 결과 데이터 생성
    const pathKeys = Object.keys(assignablePathMap);
    const result = pathKeys.map((key) => {
      const paths = assignablePathMap[key];

      const tempPath = paths[0];
      const targetLesson = tempPath[tempPath.length - 1];

      return {
        targetLesson,
        paths,
      } as ChainExchangeable;
    });

    // debug
    this.printChainExchangeableResult(
      assignablePathMap,
      assignablePaths.length
    );

    return result;
  }

  findChainExchangeableLessonsWithConcurrent(
    sourceLesson: Lesson,
    maxChainExchangeCount: number,
    minChainExchangeCount: number = 2
  ): ConcurrentCourseExchangeInfo[] {
    maxChainExchangeCount = 3;

    if(!sourceLesson.concurrentCourseId) {
      return [];
    }

    if (!this.checkExchangeableSourceLessons(sourceLesson)) {
      return [];
    }

    const {
       concurrentCourseId,
       dayOfWeek: sourceDayOfWeek,
       period: sourcePeriod } = sourceLesson;

    // 동시 수업에 속한 모든 수업의 교사에 대한 배정 가능한 시수를 추출한다.
    const lessonsOfConcurrentCourse =
      this._context.currentAssignedLessons().filter((lsn) => {
        return (
          lsn.concurrentCourseId === concurrentCourseId &&
          lsn.dayOfWeek === sourceDayOfWeek &&
          lsn.period === sourcePeriod
        );
      });

    const teacherAssignablePeriods = [] as PeriodTuple[][];
    const teachersOfConcurrentCourse = new Set<string>();
    lessonsOfConcurrentCourse.forEach((lsn) => {
      const periods = this.getAssignablePeriodsOfLessonTeachers(lsn);
      teacherAssignablePeriods.push(periods);

      // 동시 수업에 속한 모든 교사의 ID를 수집한다.
      lsn.lessonTeachers?.forEach(({ teacherId }) => {
        teachersOfConcurrentCourse.add(teacherId);
      });
    });

    // teacherAssignablePeriods - 각 교사가 배정 가능한 시수의 교집합을 구한다.
    const sourceAssignablePeriods =
      TimetableUtils.intersectPeriodTuples(...teacherAssignablePeriods);

    const chainExchangebleResults = {} as Record<string, ChainExchangeable[]>;

    lessonsOfConcurrentCourse.forEach((lsn) => {
      chainExchangebleResults[lsn.lessonId] = this.findPathWithSourceLesson(lsn, sourceAssignablePeriods, 3);
    });


    // 동시 수업들 모두 이동이 가능한 시수를 찾기 위해
    //   targetLesson의 [dayOfWeek, period] 가 동일한 시수를 추출한다.
    const targetPeriods = [] as PeriodTuple[][];
    const srcLessonIds = Object.keys(chainExchangebleResults);
    for (const srcLessonId of srcLessonIds) {
      const results = chainExchangebleResults[srcLessonId]; 

      if (!results || results.length === 0) {
        // console.log(`===  연쇄 이동 가능 없음 (src: ${srcLessonId}) ===`);
        return [];
      }

      targetPeriods.push(
        results.map((result) => {
          const { dayOfWeek: trgDayOfWeek, period: trgPeriod } = result.targetLesson;
          return [trgDayOfWeek, trgPeriod] as PeriodTuple;
        })
      );
    }

    // targetPeriods에서 교집합을 구한다 -> 동시 수업 모두 이동 가능한 시수
    const assignablePeriods = TimetableUtils.intersectPeriodTuples(...targetPeriods);
    if( assignablePeriods.length === 0) {
      // console.log(`===== 연쇄 이동 가능한 시수가 없습니다. (targetPeriods: ${targetPeriods}) =====`);
      return [];
    }
    

    /*  
     * 각 수업별로 targetPeriod로 이동이 가능한 경로를 추출한다
     * - key: periodKey (dayOfWeek-period)
     * - value: { lessonId, ChainExchangeableResult | null }
     */
    const assignableResults = {} as Record<string, Record<string, ChainExchangeable | null>>;
    for (const srcLessonId of srcLessonIds) {
      const chainExchangeables = chainExchangebleResults[srcLessonId];

      assignablePeriods.forEach((assignablePeriod) => {
        const [dayOfWeek, period] = assignablePeriod;
        const peridoKey = `${dayOfWeek}-${period}`;

        if (!assignableResults[peridoKey]) {
          assignableResults[peridoKey] = {};
        }

        assignableResults[peridoKey][srcLessonId] = chainExchangeables.find((result) => {
          const { targetLesson } = result;
          return dayOfWeek === targetLesson.dayOfWeek && period === targetLesson.period;
        }) || null;
      });
    }
    // this.printAssignableReults(assignableResults);

    /*
     * 이동 가능한 시수(targetPeriod) 별로 각 수업의 경로가 충돌하지 않는 조합을 찾는다.
     * - key: periodKey (dayOfWeek-period)
     * - value: { lessonId, Lesson[] } - 이동 경로 Lessons
     */
    // const assignableCombinations = {} as Record<string, Record<string, Lesson[]>>;
    const exchangeableCombination = [] as ConcurrentCourseExchangeInfo[];
    Object.keys(assignableResults).forEach((periodKey) => {
      const combinations = this.resolveAssignableCombinations(assignableResults[periodKey]);
      if(!combinations) {
        return;
      }

      const [dayOfWeek, period] = periodKey.split('-').map(Number);
      exchangeableCombination.push({
        dayOfWeek,
        period,
        pathMap: combinations,
      } as ConcurrentCourseExchangeInfo);
    });

    return exchangeableCombination;
  }

  resolveAssignableCombinations(
    exchangeableMap: Record<string, ChainExchangeable | null>
  ): Record<string, Lesson[]> | null {
    
    const lessonIds = Object.keys(exchangeableMap);

    // 이동 가능한 시수를 검증
    const rootNodeExchangeableMap = {} as Record<string, Lesson[][]>; // key: lessonId, value: path[]
    lessonIds.forEach((lessonId) => {
      const exchangeableResult = exchangeableMap[lessonId];
      rootNodeExchangeableMap[lessonId] = exchangeableResult?.paths || [];
    });

    const rootNodeEntity = new PathNodeEntity(
      [],
      new Set(),
      rootNodeExchangeableMap,
      lessonIds
    );

    const pathLen = lessonIds.length;
    const rootNode = new TreeNode<PathNodeEntity>(rootNodeEntity);
    rootNode.expand(
      this.findExchangeablePathNode.bind(this),
      pathLen + 1 // 최대 깊이는 lessonIds의 개수 + 1 (최대 이동 경로)
    );

    rootNode.pruneShallowPaths(pathLen);
    const resultPaths = rootNode.getAllPaths();

    if(resultPaths.length === 0 || resultPaths[0].length < pathLen) {
      console.log(`이동 가능 시수 없음 === resolveAssignableCombinations(${pathLen}) - no resultPaths ===`);
      return null;
    }

    // console.log(`* resolveAssignableCombinations(${pathLen}) - resultPaths`, resultPaths);

    // 맞교환 수가 가장 많은 경로를 선택한다. (영향이 가장 적은 경로)
    const directExchangeLength = 2; // 직접 교환 가능한 시수는 2개
    let maxDirectExchangeCount = 0;
    let maxDirectExchangePathIndex = 0;
    resultPaths.forEach((nodes, index) => {
      // 첫번째 노드는 빈노드(시작 노드)이므로 제외
      nodes.shift();

      let currentDirectExchangeCount = 0;

      nodes.forEach((node) => {
        const { path  } = node.value;
        // this.printTargetLessons({ targetLesson: {}, paths: [path], } as ChainExchangeableResult);

        if(path.length > directExchangeLength) {
          return;
        }

        currentDirectExchangeCount += 1;
      });

      if(currentDirectExchangeCount > maxDirectExchangeCount) {
        maxDirectExchangeCount = currentDirectExchangeCount;
        maxDirectExchangePathIndex = index;
      }
    });
    
    const results: Record<string, Lesson[]> = {};  // key: lessonId, value: path
    resultPaths[maxDirectExchangePathIndex].forEach((node, index) => {
      const { path, lessonIdSeq } = node.value;
      const lessonId = lessonIdSeq[index];
      
      results[lessonId] = [...path];
    });

    return results;
  }


  findExchangeablePathNode(
    node: TreeNode<PathNodeEntity>,
    depth: number
  ): PathNodeEntity[] {
    const nodeEntity = node.value;

    const compareNodeIndex = 1; //  두번째 수업만 비교!!

    const seq = depth - 1; // depth는 1부터 시작하므로, seq는 0부터 시작
    const { path, accumulatedTeacherSet, exchangeableMap, lessonIdSeq } = nodeEntity;

    // console.log(`* findExchangeablePathNode - seq: ${seq}, accumulatedTeacherSet:, `, accumulatedTeacherSet);

    const targetLessonId = lessonIdSeq[seq];
    const targeatPaths = exchangeableMap[targetLessonId]; // 비교할 경로

    const sourceLesson = path.length > 1 ? path[compareNodeIndex] : null;

    const exchangeableTargetPaths = targeatPaths.filter((trgPath) => {
      if(!sourceLesson) {
        return true; // 첫번째 노드인 경우는 무조건 true
      }
      
      const trgLesson = trgPath[compareNodeIndex];
      const { lessonTeachers: trgLessonTeachers } = trgLesson;

      if (!trgLessonTeachers) {
        return false;
      }

      // accumulatedTeacherSet에 trgLesson의 교사가 포함되어 있으면 교환 불가능
      
      return !trgLessonTeachers.some(({ teacherId }) => {
        return accumulatedTeacherSet.has(teacherId);
      });
    });

    return exchangeableTargetPaths.map((trgPath) => {
      const newAccumulatedTeacherSet = new Set(accumulatedTeacherSet);

      // trgPath의 교사를 누적한다.
      const { lessonTeachers: trgLessonTeachers } = trgPath[compareNodeIndex];
      if (trgLessonTeachers) {
        trgLessonTeachers.forEach(({ teacherId }) => {
          newAccumulatedTeacherSet.add(teacherId);
        });
      }
      
      /*
      trgPath.forEach((lesson) => {
        lesson.lessonTeachers?.forEach(({ teacherId }) => {
          newAccumulatedTeacherSet.add(teacherId);
        });
      });
      */

      // 새로운 PathNodeEntity 생성
      return new PathNodeEntity(
        trgPath,
        newAccumulatedTeacherSet,
        exchangeableMap,
        lessonIdSeq
      );
    });


    /*
    const { leafPeriods, lesson: sourceLesson } = nodeEntity;

    // 다른 노드에 영향을 미치지 않기 위해 복사
    const excludedPeriodTuples = [...nodeEntity.excludedPeriodTuples];
    const excludedTeacherIdSet = new Set(nodeEntity.excludedTeacherIdSet);

    const { classId, dayOfWeek, period } = sourceLesson;

    // 현재 노드의 수업 시간을 추가하여, 자식 노드의 검색 대상에서 제외한다.
    excludedPeriodTuples.push([dayOfWeek, period]);

    // 현재 노드의 교사를 추가하여, 자식 노드의 검색 대상에서 제외한다.
    if (sourceLesson.lessonTeachers) {
      sourceLesson.lessonTeachers.forEach(({ teacherId }) => {
        excludedTeacherIdSet.add(teacherId);
      });
    }

    const lessons = this.findMovableLessonsByClassAndPeriod(
      classId,
      dayOfWeek,
      period,
      excludedPeriodTuples,
      excludedTeacherIdSet
    );

    const resultEntities = lessons.map((lesson) => {
      return new LessonNodeEntity(
        lesson,
        leafPeriods,
        excludedPeriodTuples,
        excludedTeacherIdSet
      );
    });

    return resultEntities;
    */
  }


  findPathWithSourceLesson (
    sourceLesson: Lesson,
    sourceAssignablePeriods: PeriodTuple[],
    maxChainExchangeCount: number = 3,
    minChainExchangeCount: number = 1
  ): ChainExchangeable[] {

    const rootLessonNodeEntity = new LessonNodeEntity(
      sourceLesson,
      sourceAssignablePeriods,
      []
    );

    const rootNode = new TreeNode<LessonNodeEntity>(rootLessonNodeEntity);
    rootNode.expand(
      this.findMovableLessonNodes.bind(this),
      maxChainExchangeCount
    );

    // maxChainExchangeCount보다 작은 경로는 제거한다.
    rootNode.pruneShallowPaths(minChainExchangeCount);
    const resultPaths = rootNode.getAllPaths();

    // 결과에서 맞교환 가능한 시수는 제거
    // const oneToOneExchangeableLessons = this.findOneToOneExchangeableLessons(sourceLesson);

    const assignablePaths = resultPaths.filter((path) => {
      const leafNode = path[path.length - 1];
      const { dayOfWeek, period } = leafNode.value.lesson;

      const assignable = sourceAssignablePeriods.some((p) => {
        if (p[0] === dayOfWeek && p[1] === period) {
          return true;
        }
        return false;
      });

      return assignable;
    });

    // 목표 시수로 매핑: key => dayOfWeek-period
    const assignablePathMap = assignablePaths.reduce((acc, path) => {
      const leafNode = path[path.length - 1];
      const { dayOfWeek, period } = leafNode.value.lesson;

      const key = `${dayOfWeek}-${period}`;
      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(path.map((node) => node.value.lesson));

      return acc;
    }, {} as Record<string, Lesson[][]>);

    // 결과 데이터 생성
    const pathKeys = Object.keys(assignablePathMap);
    const result = pathKeys.map((key) => {
      const paths = assignablePathMap[key];

      const tempPath = paths[0];
      const targetLesson = tempPath[tempPath.length - 1];

      return {
        targetLesson,
        paths,
      } as ChainExchangeable;
    });

    /*
    // debug  
    this.printChainExchangeableResult(
      assignablePathMap,
      assignablePaths.length
    );
    */

    return result;
  }

  findMovableLessonNodes(
    node: TreeNode<LessonNodeEntity>,
    depth: number
  ): LessonNodeEntity[] {
    const nodeEntity = node.value;
    const { leafPeriods, lesson: sourceLesson } = nodeEntity;

    // 다른 노드에 영향을 미치지 않기 위해 복사
    const excludedPeriodTuples = [...nodeEntity.excludedPeriodTuples];
    const excludedTeacherIdSet = new Set(nodeEntity.excludedTeacherIdSet);

    const { classId, dayOfWeek, period, specialtyRoomId } = sourceLesson;

    // 현재 노드의 수업 시간을 추가하여, 자식 노드의 검색 대상에서 제외한다.
    excludedPeriodTuples.push([dayOfWeek, period]);

    // 현재 노드의 교사를 추가하여, 자식 노드의 검색 대상에서 제외한다.
    if (sourceLesson.lessonTeachers) {
      sourceLesson.lessonTeachers.forEach(({ teacherId }) => {
        excludedTeacherIdSet.add(teacherId);
      });
    }

    const lessons = this.findMovableLessonsByClassAndPeriod(
      classId,
      dayOfWeek,
      period,
      excludedPeriodTuples,
      excludedTeacherIdSet
    );

    const resultEntities = lessons.map((lesson) => {
      return new LessonNodeEntity(
        lesson,
        leafPeriods,
        excludedPeriodTuples,
        excludedTeacherIdSet
      );
    });

    return resultEntities;
  }

  findMovableLessonsByClassAndPeriod(
    classId: string,
    dayOfWeek: number,
    period: number,
    excludedPeriodTuples: PeriodTuple[] = [],
    excludedTeacherIdSet: Set<string> = new Set()
  ) {
    const classPeriodOverview = this._context.classPeriodOverviewMap[classId];
    const sourcePeriodTuple = [dayOfWeek, period] as PeriodTuple;

    // 동일 학급의 수업 중, sourceAssignablePeriods의 수업을 추출
    const movableLessons = classPeriodOverview.assignedLessons.filter((lsn) => {
      // 동시, 연속 수업 제외
      if (lsn.concurrentCourseId || lsn.consecutiveGroupId) {
        return false;
      }

      // excludedPeriodTuples에 포함된 시간은 제외
      if (excludedPeriodTuples.some((p) => p[0] === lsn.dayOfWeek && p[1] === lsn.period)) {
        return false;
      }

      // excludedTeacherIdSet에 포함된 교사의 수업은 제외
      if (lsn.lessonTeachers) {
        const teacherIds = lsn.lessonTeachers.map(({ teacherId }) => teacherId);
        if (teacherIds.some((teacherId) => excludedTeacherIdSet.has(teacherId))) {
          return false;
        }
      }

      // 해당 수업이 현재 시간으로 옮길 수 있는지 확인
      return this.isMovableLessonToPeriod(lsn, sourcePeriodTuple);
    });

    return movableLessons;
  }

  /*
   * 1:1 맞교환
   * - 교환을 위해 선택된 수업 (sourceLesson)과 동일한 학급의 수업 중,
   * - 동일 과목/유사 과목의 수업이 동일 학급에 배정된 요일 제외 && sourceLesson의 교사가 수업이 없는 시간 추출
   *
   * - sourceLesson의 교사와 다른 교사의 수업 중
   *  - 동일 과목/유사 과목의 수업이 동일 학급에 배정된 요일 제외 && destinationLesson의 교사가 수업이 없는 시간 추출
   */
  findOneToOneExchangeableLessons(sourceLesson: Lesson): Lesson[] {
    if (!this.checkExchangeableSourceLessons(sourceLesson)) {
      return [];
    }

    // 맞교환을 위해 sourceLesson의 교사가 배정가능한 시간을 추출
    const teacherAssignablePeriods =
      this.getAssignablePeriodsOfLessonTeachers(sourceLesson);

    const { specialtyRoomId } = sourceLesson;
    
    const sourceAssignablePeriods = specialtyRoomId ?
      teacherAssignablePeriods.filter((period) => {
        // 특별실 수업인 경우, 옮기려는 시수의 특별실이 여유가 있는지 확인
        return !this.isFullSpecialtyRoomPeriod(specialtyRoomId, period[0], period[1]);
      }) :
      teacherAssignablePeriods;

    const assinablePeriodKeySet = new Set(
      sourceAssignablePeriods.map((period) => period.join('_'))
    );

    const classPeriodOverview =
      this._context.classPeriodOverviewMap[sourceLesson.classId];

    const sourcePeriodTuple = [
      sourceLesson.dayOfWeek,
      sourceLesson.period,
    ] as PeriodTuple;

    // 동일 학급의 수업 중, sourceAssignablePeriods의 수업을 추출
    const targetAssignableLessons = classPeriodOverview.assignedLessons.filter(
      (lsn) => {
        // 동시, 연속 수업 제외
        if (lsn.concurrentCourseId || lsn.consecutiveGroupId) {
          return false;
        }

        const periodKey = `${lsn.dayOfWeek}_${lsn.period}`;
        if (!assinablePeriodKeySet.has(periodKey)) {
          return false;
        }

        // 해당 수업이 현재 시간으로 옮길 수 있는지 확인
        return this.isMovableLessonToPeriod(lsn, sourcePeriodTuple);
      }
    );

    return targetAssignableLessons;
  }

  getAssignablePeriodsOfLessonTeachers(lesson: Lesson): PeriodTuple[] {
    const { classId, lessonTeachers } = lesson;

    if (!lessonTeachers || lessonTeachers.length === 0) {
      return [];
    }

    const teacherIds = lessonTeachers.map(({ teacherId }) => teacherId);
    const classPeriodOverview = this._context.classPeriodOverviewMap[classId];

    // 해당 학급에 동일 교사가 배정된 수업 요일 추출
    const dayOfWeekList = classPeriodOverview.assignedLessons
      .filter((lsn) => {
        // 동시 수업인 경우는 배정이 가능한 날로 본다
        if (lsn.concurrentCourseId || lesson.concurrentCourseId) {
          return false;
        }

        const trgTeacherIds = lsn.lessonTeachers?.map(
          ({ teacherId }) => teacherId
        );

        // 교사가 없는 경우 제외
        if (!trgTeacherIds || trgTeacherIds.length === 0) {
          return false;
        }

        const isSameTeacher = trgTeacherIds.some((teacherId) =>
          teacherIds.includes(teacherId)
        );

        return isSameTeacher && lsn.dayOfWeek !== lesson.dayOfWeek;
      })
      .map((lsn) => {
        return lsn.dayOfWeek;
      });

    const srcDisabledDayOfWeeks: Set<number> = new Set(dayOfWeekList);

    // 해당 요일을 제외하고 교사의 수업 가능 시간 추출
    const sourceAssignablePeriodsList = teacherIds.map((teacherId) => {
      return this._context.teacherPeriodOverviewMap[
        teacherId
      ].remainingLessonPeriods.filter((period) => {
        return !srcDisabledDayOfWeeks.has(period[0]);
      }) as PeriodTuple[];
    });

    return TimetableUtils.intersectPeriodTuples(...sourceAssignablePeriodsList);
  }

  isMovableLessonToPeriod(lesson: Lesson, period: PeriodTuple): boolean {
    if(lesson.specialtyRoomId && this.isFullSpecialtyRoomPeriod(lesson.specialtyRoomId, period[0], period[1])) {
      // 특별실 수업인 경우, 옮기려는 시수의 특별실이 여유가 있는지 확인
      return false;
    }
    
    const movableLessons = this.getAssignablePeriodsOfLessonTeachers(lesson);
    return movableLessons.some((p) => p[0] === period[0] && p[1] === period[1]);
  }

  isFullSpecialtyRoomPeriod(
    specialtyRoomId: string,
    dayOfWeek: number,
    period: number
  ): boolean {
    const specialtyRoomFreeStatus = this._context.specialtyRoomFreeStatus;
    const roomStatus = specialtyRoomFreeStatus[specialtyRoomId];

    if (!roomStatus) {
      return false;
    }

    const periodKey = this._context.getPeriodTupleKey([dayOfWeek, period] as PeriodTuple);

    if(roomStatus.counterMap[periodKey] === undefined || roomStatus.counterMap[periodKey] === null) {
      return false;
    }

    return roomStatus.counterMap[periodKey] === 0;
  }

  checkExchangeableSourceLessons(sourceLesson: Lesson): boolean {
    if (
      // sourceLesson.concurrentCourseId ||
      sourceLesson.isFixedCourse
      // || sourceLesson.consecutiveGroupId
    ) {
      return false;
    }

    const { lessonTeachers } = sourceLesson;
    if (!lessonTeachers || lessonTeachers.length === 0) {
      return false;
    }

    return true;
  }

  //  연쇄 이동 결과 확인을 위한 콘솔 출력
  printChainExchangeableResult(
    assignablePathMap: Record<string, Lesson[][]>,
    countPath: number
  ): void {
    const pathKeys = Object.keys(assignablePathMap);

    this._context.printLog('# 이동 가능 경로 수', countPath);
    this._context.printLog('# 이동 가능 경로 맵', pathKeys.join(' '));

    pathKeys.forEach((key) => {
      this._context.printLog(`* 연쇄 이동 가능 (${key})`);

      assignablePathMap[key].map((path) => {
        this._context.printLog(
          '  * [경로] ',
          `${key} <-`,
          path
            .map((lesson) => `${lesson.dayOfWeek}-${lesson.period}`)
            .join(' <- ')
        );
      });
    });
  }

  printAssignableReults(
    assignableResults: Record<string, Record<string, ChainExchangeable | null>>
  ): void {
    // 데이터를 출력하기 위한 코드 ---->
    console.log('* assignableResults', assignableResults);
    
    Object.keys(assignableResults).map((periodKey) => {
      console.log(`\n* 이동 가능한 시수 [${periodKey}]`);
      
      const results = assignableResults[periodKey];
      Object.keys(results).forEach((periodKey) => {
        this.printTargetLessons(results[periodKey]);
      });
      
    });
  }

  printTargetLessons(
    exchangeableResult: ChainExchangeable | null
  ): void {
    if (!exchangeableResult) {
      console.log(`\t\t* 이동 가능한 시수가 없습니다.`);
      return;
    }

    const { paths } = exchangeableResult;

    // console.log(`\n`);

    paths.forEach((path) => {
      const pathStr = path.map((pathLesson) => {
        const pathCourse = this._context.courseMap[pathLesson.courseId];
        const pathTeacherNames = pathLesson.lessonTeachers
        ? pathLesson.lessonTeachers.map(({ teacherId }) => this._context.teacherMap[teacherId].teacherName).join(', ')
        : '교사 없음';

        return `[${pathLesson.dayOfWeek}-${pathLesson.period}] ${pathCourse?.displayedTitle}(${pathTeacherNames})`;
      });

      console.log(`\t\t* 경로: ${pathStr.join(' <- ')}`);
    });

  }
}
