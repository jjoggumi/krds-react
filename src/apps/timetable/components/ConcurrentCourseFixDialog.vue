<template>
  <TimeTableModal size="xxl" @close="handleCloseDialog" class="concurrent-fixed-modal">
    <template v-slot:heading>
      동시수업 배정
      <p class="smr">
        동시수업을 시간표 자동 배정시 우선 배치하여 고정합니다.
      </p>
    </template>
    <template v-slot:content>
      <div class="gray-box mb-20">
        <div class="btn-wrap form-group-inline">
          <label>학년 선택</label>
          <span v-for="gradeIdx in grades.length" :key="`${gradeIdx}-grd`" class="ml-15">
            <input type="radio" name="학년선택" :value="gradeIdx" :id="`grade-${gradeIdx}`" v-model="selectedGradeIdx">
            <label :for="`grade-${gradeIdx}`">
              <span>{{ gradeIdx }}학년</span>
            </label>
          </span>
        </div>
        <div class="btn-wrap txt-right">
          <button type="button" class="btn btn-tertiary txt-warning mr-10" @click="handleClickReset">배정 초기화</button>
          <button type="button" class="btn btn-tertiary " @click="">동시수업 자동배정</button>
        </div>
      </div>
      <div class="tb-row">
        <div class="tb-col type-timetable">
          <div class="table-content time-table">
            <div>
              <table>
                <caption>시간표</caption>
                <colgroup>
                  <col :style="{width: calRatio(0)}" />
                  <col v-for="(day, dayIdx) in timetableConfig.classDays" v-if="day" :key="`${dayIdx}-classday-col`" :style="{width: calRatio(dayIdx+1)}">
                </colgroup>
                <thead>
                  <tr>
                    <th></th>
                    <th v-for="(day, dayIdx) in timetableConfig.classDays" v-if="day" :key="`${dayIdx}-classday-head`">{{ displayWeekday(dayIdx) }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="periodIdx in timetableConfig.maxPeriod" :key="`${periodIdx}-period-row`">
                    <td class="th">{{ (timetableConfig.startPeriod || 1) + periodIdx - 1 }}</td>
                    <td v-if="day" :key="`${dayOfWeek}-period-td`" v-for="(day, dayOfWeek) in timetableConfig.classDays">
                      <!--
                      상태별 class
                      assign-resolved >> 배정 불가
                      fixed-course >> 수업없음, 고정수업
                      assigned-complete >> 수업배정 완료
                      -->
                      <button
                        v-if="
                          editableAssignedConcurrentsByGrade[selectedGradeIdx]?.[`${dayOfWeek}-${periodIdx}`] ||
                          isUnifiedOrFreePeriod(selectedGrade.grade, dayOfWeek, periodIdx) ||
                          !isAssignable(selectedCourseId, dayOfWeek, periodIdx) ||
                          !!selectedCourseId
                        "
                        type="button"
                        class="btn-table-cell"
                        :class="{
                          'assigned-complete': !!editableAssignedConcurrentsByGrade[selectedGradeIdx]?.[`${dayOfWeek}-${periodIdx}`],
                          'course-select': !!selectedCourseId,
                          'fixed-course': isUnifiedOrFreePeriod(selectedGrade.grade, dayOfWeek, periodIdx),
                          'assign-resolved': !isAssignable(selectedCourseId, dayOfWeek, periodIdx),
                          'consecutive-course fst': hasConsecutiveHead(selectedGrade.grade, dayOfWeek, periodIdx),
                          'consecutive-course': hasConsecutive(selectedGrade.grade, dayOfWeek, periodIdx),
                        }"
                        @click.prevent="selectedCourseId ? handleClickAssignCourse(dayOfWeek, periodIdx) : null"
                      >
                        <div v-if="!!editableAssignedConcurrentsByGrade[selectedGradeIdx]?.[`${dayOfWeek}-${periodIdx}`]">
                          <span v-for="(assignedCourse, cIdx) in editableAssignedConcurrentsByGrade[selectedGradeIdx][`${dayOfWeek}-${periodIdx}`]"
                            :key="`${dayOfWeek}-${periodIdx}-${cIdx}-${assignedCourse.concurrentCourseId}`" class="group-box">
                            {{ (assignedInfoBySelectedGradeAndConcurrentId[assignedCourse.concurrentCourseId] || {}).displayedTitle }} 
                            <i class="ico ico-close ico-size-14" :class="{ 'hidden-icon': !!selectedCourseId }" @click.stop="selectedCourseId ? null : handleClickRemoveCourse(assignedCourse.concurrentCourseId, dayOfWeek, periodIdx)"></i>
                          </span>
                        </div>
                        <div v-else-if="!isAssignable(selectedCourseId, dayOfWeek, periodIdx)" class="course-name">교사/학반 겹침</div>
                        <div v-else-if="isUnifiedCourse(selectedGrade.grade, dayOfWeek, periodIdx)" class="course-name">{{ getUnifiedCourseName(selectedGrade.grade, dayOfWeek, periodIdx) }}</div>
                        <div v-else-if="isFreePeriod(selectedGrade.grade, dayOfWeek, periodIdx)" class="course-name">수업없음</div>
                        <div v-else-if="!!selectedCourseId" class="course-name">수업선택</div>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="tb-col type-concurrent">
          <div class="table-content basic-table sticky-wrap">
             <table :style="!(concurrentCourseGradeMap[selectedGradeIdx] || []).length ? 'height:100%;' : ''">
              <colgroup>
                <col style="width: 10%" />
                <col style="width: 10%" />
                <col style="width: 10%" />
                <col style="width: 55%" />
                <col style="width: 15%" />
              </colgroup>
              <thead>
                <tr>
                  <th class="sticky-top">그룹명</th>
                  <th class="sticky-top">시수 / 미배정</th>
                  <th class="sticky-top">연속</th>
                  <th class="sticky-top">과목</th>
                  <th class="sticky-top">배정</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="(concurrentCourseGradeMap[selectedGradeIdx] || []).length">
                <tr v-for="([conf, concurrentCourse], index) in concurrentCourseGradeMap[selectedGradeIdx]" :key="`period-${conf.courseId}-${index}`">
                  <td>{{ concurrentCourse.displayedTitle }}</td>
                  <td>{{ `${(assignedInfoBySelectedGradeAndConcurrentId[conf.courseId] || {}).totalPeriod}/${(assignedInfoBySelectedGradeAndConcurrentId[conf.courseId] || {}).remainedPeriod}` }}</td>
                  <td>{{ conf.consecutivePeriod || '없음' }}</td>
                  <td>
                    <p class="course-list">
                      <span v-for="(course, idx) in concurrentCoursesByConcurrentConfId[conf.courseId]" :key="`sub-course-${idx}-${course.courseId}-${conf.courseId}`" class="grade-class-course">
                        <span>{{ course.isVirtual ? `가상${ course.gradeClassNum.split('-')[1] }반` : course.gradeClassNum }}</span>
                        <span>{{ course.displayedTitle }}</span>
                      </span>
                      <HiTooltip
                        v-if="concurrentCoursesByConcurrentConfId[conf.courseId].length !== 0"
                        ico="none"
                        isActive
                        :position="index === concurrentCourseGradeMap[selectedGradeIdx].length - 1 ? 'top' : 'bottom'"
                        class="hi-tooltip-wrap"
                        :title-html="getTooltipContent(concurrentCoursesByConcurrentConfId[conf.courseId])"
                      />
                    </p>
                  </td>
                  <td>
                    <button type="button" v-if="selectedCourseId === conf.courseId" class="btn btn-success btn-xs" @click="() => selectedCourseId = ''">배정</button> 
                    <button type="button" v-else class="btn btn-primary btn-xs" @click="handleClickSelectCourse(conf.courseId)" :disabled="!(assignedInfoBySelectedGradeAndConcurrentId[conf.courseId] || {}).remainedPeriod">배정</button>
                    <!-- 배정완료 후 class ani 추가-->
                  </td>
                </tr>
                </template>
                <tr v-else>
                  <td colspan="5">
                    <div class="hi-nodata">
                      <p>
                        목록이 없습니다.
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div> 
    </template>
    <template v-slot:footer>
      <button type="button" class="btn btn-tertiary btn-lg ml-10" @click="handleCloseDialog">취소</button>
      <button type="button" class="btn btn-primary btn-lg" @click="handleClickSubmit">저장</button>
    </template>
  </TimeTableModal>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, computed, watch } from 'vue';
import _, { get } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import TimeTableModal from '@/apps/timetable/components/TimeTableModal.vue';
import { useDialog } from '@/apps/timetable/composables/dialog';
import {
  Course,
  Class,
  FixedConf,
  ConcurrentConf,
  LessonConf,
  TimetableConfig,
  Lesson,
  TimetablePeriod
} from '@/apps/timetable/core/types';
import {
  ContextKeys,
  TimetableCourseContext,
  FixedConfContext,
  ConcurrentConfContext,
  TimetableClassContext,
  LessonConfContext,
  LessonContext
} from '../contexts';
import Timetable from '../core';

interface AssignedCellInfo {
  concurrentCourseId: string;
  consecutiveGroupId?: string;
  consecutiveBlockIndex?: number;
}
interface LessonConfWithDetails extends LessonConf { displayedTitle: string, gradeClassNum: string, isVirtual: boolean }
interface ClassTeacherSet { teacherIds: Set<string>, classIds: Set<string> }
interface AssignedConcurrentsByGrade { [key: number]: { [key: string]: Array<AssignedCellInfo>; } }
interface DiffFromOrigin {
  confIdsToDelete: { grade: number, dayOfWeek: number, period: number, courseId: string, consecutivePeriod?: number }[];
  confIdsToAdd: { grade: number, dayOfWeek: number, period: number, courseId: string, consecutivePeriod?: number }[];
}
interface AssignedCourseInfo extends ClassTeacherSet {
  displayedTitle: string;
  totalPeriod: number;
  remainedPeriod: number;
  consecutivePeriod: number[];
  grade: number;
}

const props = defineProps<{ timetableConfig: TimetableConfig }>();
const emit = defineEmits(['close']);

const dialog = useDialog();

const selectedGradeIdx = ref<number>(2);
const selectedCourseId = ref<string>('');
const editableAssignedConcurrentsByGrade = ref<AssignedConcurrentsByGrade>({});

const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const fixedConfContext = inject(ContextKeys.FixedConf) as FixedConfContext;
const concurrentConfContext = inject(ContextKeys.ConcurrentConf) as ConcurrentConfContext;
const lessonConfContext = inject(ContextKeys.LessonConf) as LessonConfContext;
const classContext = inject(ContextKeys.Class) as TimetableClassContext;
const lessonContext = inject(ContextKeys.Lesson) as LessonContext;

const classMap = computed(() => classContext.classMap as Record<string, Class>);
const courseMap = computed(() => courseContext.courseMap as Record<string, Course>);
const fixedConfs = computed(() => fixedConfContext.fixedConfs as FixedConf[]);
const concurrentConfs = computed(() => concurrentConfContext.concurrentConfs as ConcurrentConf[]);
const lessonConfs = computed(() => lessonConfContext.lessonConfs as LessonConf[]);
const lessons = computed({
  get: () => { return lessonContext.lessons; },
  set: (value) => { lessonContext.lessons = value; }
});

const lessonConfsMapByConcurrentCourse = computed(() => lessonConfContext.lessonConfsMapByConcurrentCourse);
const grades = computed(() => props.timetableConfig.grades.sort((a, b) => a.grade - b.grade));
const selectedGrade = computed(() => grades.value[selectedGradeIdx.value - 1]);

const currentAssignedConcurrentsByGrade = computed(() => {
  const enrolled = new Set<string>();
  const result: AssignedConcurrentsByGrade = {};

  for (const lesson of lessons.value) {
    const { concurrentCourseId, dayOfWeek, period, consecutiveGroupId } = lesson;
    if (!concurrentCourseId || enrolled.has(lesson.lessonId)) continue;

    const grade = classMap.value[lesson.classId].grade;
    const key = `${dayOfWeek}-${period}`;
    result[grade] ||= {};

    // 연속 수업 그룹 처리
    if (consecutiveGroupId) {
      const groupLessons = lessons.value.filter(l => l.consecutiveGroupId === consecutiveGroupId);
      groupLessons.forEach((l, idx) => {
        const groupKey = `${l.dayOfWeek}-${l.period}`;
        result[grade][groupKey] ||= [];
        result[grade][groupKey].push({
          concurrentCourseId: l.concurrentCourseId!,
          consecutiveGroupId: l.consecutiveGroupId,
          consecutiveBlockIndex: idx + 1
        });
        enrolled.add(l.lessonId);
      });
      continue;
    }

    // 단일 셀 처리
    result[grade][key] ||= [];
    result[grade][key].push({
      concurrentCourseId: concurrentCourseId,
      consecutiveGroupId: undefined,
      consecutiveBlockIndex: undefined
    });
    // 이미 처리된 lessonId는 enrolled에 추가
    lessons.value
      .filter(l => l.concurrentCourseId === concurrentCourseId && l.dayOfWeek === dayOfWeek && l.period === period)
      .forEach(l => enrolled.add(l.lessonId));
  }

  return result;
});

const assignedInfoByConcurrentId = computed(() => {
  const result: Record<string, AssignedCourseInfo> = {};

  for (const conf of concurrentConfs.value) {
    const course = courseMap.value[conf.courseId];
    if (!course || !course.periodCount) continue;

    // 전체 배정된 횟수
    let assignedCount = 0;
    Object.values(editableAssignedConcurrentsByGrade.value).forEach(gradeAssignments =>
      Object.values(gradeAssignments).forEach(assignedCourses =>
        assignedCount += (assignedCourses as AssignedCellInfo[]).filter(ac => ac.concurrentCourseId === conf.courseId).length
      )
    );

    // 연속 시수 처리
    let leftConsecutivePeriod: number[] = [];
    if (conf.consecutivePeriod) {
      const required = conf.consecutivePeriod.split(',').map(Number).filter(n => n > 1);
      const assignedGroups: Record<string, number> = {};

      Object.values(editableAssignedConcurrentsByGrade.value).forEach(gradeAssignments =>
        Object.values(gradeAssignments).forEach(assignedCourses =>
          (assignedCourses as AssignedCellInfo[]).forEach(ac => {
            if (ac.concurrentCourseId === conf.courseId && ac.consecutiveGroupId) {
              assignedGroups[ac.consecutiveGroupId] = Math.max(
                assignedGroups[ac.consecutiveGroupId] || 0,
                ac.consecutiveBlockIndex || 1
              );
            }
          })
        )
      );

      const assignedLengths = Object.values(assignedGroups);
      leftConsecutivePeriod = required.filter(period => {
        const idx = assignedLengths.indexOf(period);
        if (idx !== -1) assignedLengths.splice(idx, 1);
        return idx === -1;
      }).sort((a, b) => b - a);
    }

    // 교사/학급 id set
    const lessonConfsForCourse = lessonConfs.value.filter(lc => lc.concurrentCourseId === conf.courseId);
    result[conf.courseId] = {
      displayedTitle: course.displayedTitle,
      totalPeriod: course.periodCount,
      remainedPeriod: course.periodCount - assignedCount,
      consecutivePeriod: leftConsecutivePeriod,
      teacherIds: new Set(lessonConfsForCourse.map(lc => lc.teacherId)),
      classIds: new Set(lessonConfsForCourse.map(lc => lc.classId)),
      grade: conf.grade
    };
  }

  return result;

  // return concurrentConfs.value.reduce((acc, conf) => {

  //   const course = courseMap.value[conf.courseId];
  //   if (!course || !course.periodCount) return acc;

  //   // 모든 학년의 모든 요일-교시에서 conf.courseId가 할당된 횟수 카운트
  //   let totalAssignedCount = 0;
  //   Object.values(editableAssignedConcurrentsByGrade.value).forEach(gradeAssignments => {
  //     Object.values(gradeAssignments).forEach(assignedCourses => {
  //       totalAssignedCount += (assignedCourses as Array<AssignedCellInfo>).filter(ac => ac.concurrentCourseId === conf.courseId).length;
  //     });
  //   });

  //   // 연속 그룹에 속한 lesson 개수 계산
  //   let leftConsecutivePeriod: number[] = [];
  //   if (conf.consecutivePeriod) {
  //     const requiredPeriods = conf.consecutivePeriod.split(',')
  //       .map(Number)
  //       .filter(period => period > 1);

  //     // 각 연속 그룹별로 실제 배정된 연속 길이 카운트
  //     const assignedGroupCounts: Record<string, number> = {};
  //     Object.values(editableAssignedConcurrentsByGrade.value).forEach(gradeAssignments => {
  //       Object.values(gradeAssignments).forEach(assignedCourses => {
  //         (assignedCourses as AssignedCellInfo[]).forEach(ac => {
  //           if (ac.concurrentCourseId === conf.courseId && ac.consecutiveGroupId) {
  //             assignedGroupCounts[ac.consecutiveGroupId] = Math.max(
  //               assignedGroupCounts[ac.consecutiveGroupId] || 0,
  //               ac.consecutiveBlockIndex || 1
  //             );
  //           }
  //         });
  //       });
  //     });

  //     // 실제 배정된 연속 길이 목록
  //     const assignedLengths = Object.values(assignedGroupCounts);

  //     // requiredPeriods에서 아직 배정되지 않은 연속 시수만 남김
  //     leftConsecutivePeriod = requiredPeriods.filter(period => {
  //       const idx = assignedLengths.indexOf(period);
  //       if (idx !== -1) assignedLengths.splice(idx, 1);
  //       return idx === -1;
  //     }).sort((a, b) => b - a);
  //   }

  //   acc[conf.courseId] = {
  //     displayedTitle: course.displayedTitle,
  //     totalPeriod: course.periodCount,
  //     remainedPeriod: course.periodCount - totalAssignedCount,
  //     consecutivePeriod: leftConsecutivePeriod,
  //     teacherIds: new Set(lessonConfs.value.filter(lc => lc.concurrentCourseId === conf.courseId).map(lc => lc.teacherId)),
  //     classIds: new Set(lessonConfs.value.filter(lc => lc.concurrentCourseId === conf.courseId).map(lc => lc.classId)),
  //     grade: conf.grade
  //   };
  //   return acc;
  // }, {} as Record<string, AssignedCourseInfo>);
});

const assignedInfoBySelectedGradeAndConcurrentId = computed(() => {
  return Object.entries(assignedInfoByConcurrentId.value)
    .filter(([_, info]) => info.grade === selectedGrade.value.grade)
    .reduce((acc, [courseId, info]) => {
      acc[courseId] = { ...info };
      return acc;
    }, {} as Record<string, AssignedCourseInfo>);
});

const assignedNormalCourses = computed(() =>
  lessons.value.reduce((acc, lesson) => {
    const { concurrentCourseId, classId, lessonTeachers, dayOfWeek, period, courseId } = lesson;
    if (concurrentCourseId) return acc;
    if (!lessonTeachers || lessonTeachers.length === 0) return acc;

    const teachers = lessonTeachers.map(t => t.teacherId);
    const key = `${dayOfWeek}-${period}`;
    if (!acc[key]) {
      acc[key] = { teacherIds: new Set(teachers), classIds: new Set([classId]) };
      return acc;
    };

    acc[key].teacherIds = new Set([...acc[key].teacherIds, ...teachers]);
    acc[key].classIds.add(classId);
    return acc;
  }, {} as Record<string, ClassTeacherSet>)
);

const isAssignable = computed(() => {
  return (selectedCourseId: string, dayOfWeek: number, period: number) => {
    if (!selectedCourseId) return true;

    const key = `${dayOfWeek}-${period}`;
    const assignedIds: string[] = Object.values(editableAssignedConcurrentsByGrade.value)
      .flatMap(currentAssigned => (currentAssigned[key] ? currentAssigned[key].map((info: AssignedCellInfo) => info.concurrentCourseId) : []));
    const infoList = assignedIds
      .map(id => assignedInfoByConcurrentId.value[id])
      .filter(Boolean);

    const assignedTeacherIds = new Set(infoList.flatMap(info => Array.from(info.teacherIds || [])));
    const assignedClassIds = new Set(infoList.flatMap(info => Array.from(info.classIds || [])));

    const normal = assignedNormalCourses.value[key];
    if (normal) {
      normal.teacherIds?.forEach(id => assignedTeacherIds.add(id));
      normal.classIds?.forEach(id => assignedClassIds.add(id));
    }

    const selected = assignedInfoByConcurrentId.value[selectedCourseId];
    if (!selected) return false;

    const teacherConflict = Array.from(selected.teacherIds || []).some(id => assignedTeacherIds.has(id));
    const classConflict = Array.from(selected.classIds || []).some(id => assignedClassIds.has(id));
    return !teacherConflict && !classConflict;
  }
})

const concurrentCourseGradeMap = computed(() => {
  return concurrentConfs.value.reduce((acc, conf) => {
    if (!acc[conf.grade]) acc[conf.grade] = [];
    const crs = courseMap.value[conf.courseId];
    if (crs) acc[conf.grade].push([conf, crs]);
    return acc;
  }, {} as Record<number, [ConcurrentConf, Course][]>);
});

const concurrentCoursesByConcurrentConfId = computed(() => {
  const concurrentCourses = concurrentCourseGradeMap.value[selectedGradeIdx.value];
  if (!concurrentCourses || concurrentCourses.length === 0) return {};

  return concurrentCourses
    .reduce((acc, [conf, _]) => {
      const lessonConfsByCourseId = lessonConfs.value
        .filter(lc => lc.concurrentCourseId === conf.courseId)
        .map(lc => {
          const course = courseMap.value[lc.courseId];
          const clazz = classMap.value[lc.classId];
          return {
            ...lc,
            gradeClassNum: `${clazz.grade}-${clazz.classNumber}`,
            displayedTitle: course.displayedTitle,
            isVirtual: clazz.isVirtual
          } as LessonConfWithDetails;
        })
        .sort((a, b) => {
          const [gradeA, classA] = a.gradeClassNum.split('-').map(Number);
          const [gradeB, classB] = b.gradeClassNum.split('-').map(Number);

          if (a.isVirtual != b.isVirtual) { return a.isVirtual ? 1 : -1; }
          return classA - classB;
        });
      acc[conf.courseId] = lessonConfsByCourseId;
      return acc;
    }, {} as Record<string, LessonConfWithDetails[]>);
});

onMounted(async () => {
  await initData();
});

const initData = async () => {
  // console.log('initData called', currentAssignedConcurrentsByGrade.value);
  editableAssignedConcurrentsByGrade.value = _.cloneDeep(currentAssignedConcurrentsByGrade.value);
};

watch(
  () => selectedGradeIdx.value,
  () => { selectedCourseId.value = ''; }
);

const handleClickSelectCourse = (courseId: string) => {
  selectedCourseId.value = courseId;
};

const generateConsecutiveGroupId = () => { return uuidv4(); };

const handleClickAssignCourse = (dayOfWeek: number, periodIdx: number) => {
  if (!selectedCourseId.value) {
    // console.log('선택된 수업이 없습니다. 먼저 우측 목록에서 수업을 선택해주세요.');
    return;
  }

  if ((editableAssignedConcurrentsByGrade.value[selectedGradeIdx.value][`${dayOfWeek}-${periodIdx}`] || []).length >= 4) {
    dialog.alertSimple('동시수업은 최대 4개까지 배정할 수 있습니다.');
    return;
  }

  const grade = selectedGradeIdx.value;
  const key = `${dayOfWeek}-${periodIdx}`;
  const assignedInfo = assignedInfoByConcurrentId.value[selectedCourseId.value];
  const consecutivePeriods = assignedInfo.consecutivePeriod;

  editableAssignedConcurrentsByGrade.value[grade] ||= {};

  if (consecutivePeriods.length) {
    const consecutivePeriod = consecutivePeriods[0];
    if (checkAssignable(dayOfWeek, periodIdx, consecutivePeriod)) {
      dialog.alertSimple('연속 수업을 배정할 수 없는 시간입니다. 다른 시간대를 선택해주세요.');
      return;
    }
    const groupId = generateConsecutiveGroupId();
    for (let i = 0; i < consecutivePeriod; i++) {
      const cKey = `${dayOfWeek}-${periodIdx + i}`;
      editableAssignedConcurrentsByGrade.value[grade][cKey] ||= [];
      editableAssignedConcurrentsByGrade.value[grade][cKey].push({
        concurrentCourseId: selectedCourseId.value,
        consecutiveGroupId: groupId,
        consecutiveBlockIndex: i + 1
      });
    }
  } else {
    editableAssignedConcurrentsByGrade.value[grade][key] ||= [];
    editableAssignedConcurrentsByGrade.value[grade][key].push({
      concurrentCourseId: selectedCourseId.value
    });
  }

  editableAssignedConcurrentsByGrade.value = { ...editableAssignedConcurrentsByGrade.value };
  selectedCourseId.value = '';
};

const checkAssignable = (dayOfWeek: number, periodIdx: number, consecutivePeriod: number) => {
  const grade = selectedGradeIdx.value;

  const isOutOfAreaToAssign = Array.from(
      { length: consecutivePeriod }, 
      (_, i) => isUnifiedOrFreePeriodOrOutOfRange(grade, dayOfWeek, periodIdx + i)
    ).some(Boolean);

  const isConflictToAssign = Array.from(
      { length: consecutivePeriod }, 
      (_, i) => !isAssignable.value(selectedCourseId.value, dayOfWeek, periodIdx + i)
    ).some(Boolean);

  return isOutOfAreaToAssign || isConflictToAssign;
};

const handleClickRemoveCourse = (courseId: string, dayOfWeek: number, periodIdx: number) => {
  const grade = selectedGradeIdx.value;
  const key = `${dayOfWeek}-${periodIdx}`;
  const assigned = editableAssignedConcurrentsByGrade.value[grade]?.[key]?.find(
    (info: AssignedCellInfo) => info.concurrentCourseId === courseId
  );

  if (!assigned) return;

  // 연속 그룹 전체 삭제
  if (assigned.consecutiveGroupId) {
    for (const [period, courses] of Object.entries(editableAssignedConcurrentsByGrade.value[grade])) {
      editableAssignedConcurrentsByGrade.value[grade][period] = courses.filter(
        info => info.consecutiveGroupId !== assigned.consecutiveGroupId
      );
      if (!editableAssignedConcurrentsByGrade.value[grade][period].length) {
        delete editableAssignedConcurrentsByGrade.value[grade][period];
      }
    }
  } else {
    // 단일 셀 삭제
    editableAssignedConcurrentsByGrade.value[grade][key] = editableAssignedConcurrentsByGrade.value[grade][key].filter(
      info => info.concurrentCourseId !== courseId
    );
    if (!editableAssignedConcurrentsByGrade.value[grade][key].length) {
      delete editableAssignedConcurrentsByGrade.value[grade][key];
    }
  }

  editableAssignedConcurrentsByGrade.value = { ...editableAssignedConcurrentsByGrade.value };
};

const handleClickSubmit = async () => {
  const request = getDiffFromOrigins();
  if (request.confIdsToDelete.length !== 0 || request.confIdsToAdd.length !== 0) {
    const reply = await dialog.confirm('배정한 동시수업을 저장하시겠습니까?');
    if (reply) await processToUpdate(request);
  }

  await refreshLessonsWithContext();
  emit('close');
};

const refreshLessonsWithContext = async () => {
  Timetable.initWithPresetedLessons(lessons.value);
}

const processToUpdate = async (request: DiffFromOrigin) => {
  const { confIdsToAdd, confIdsToDelete } = request;

  if (confIdsToAdd.length === 0 && confIdsToDelete.length === 0) { return; }

  // 삭제할 동시수업이 있는 경우
  let lessonsToDelete: Lesson[] = [];
  if (confIdsToDelete.length) {
    for (const { courseId, dayOfWeek, period } of confIdsToDelete) {
      const lessonToDelete = await getAssignedConcurrentCourseToDelete(courseId, dayOfWeek, period);
      if (lessonToDelete?.length) lessonsToDelete.push(...lessonToDelete);
    }

    lessonsToDelete.forEach(lesson => Timetable.resetAssignedLesson(lesson));
  }

  const lessonIdsToDelete = lessonsToDelete.map(l => l.lessonId);
  lessons.value = lessons.value.filter(l => !lessonIdsToDelete.includes(l.lessonId));

  // // 추가할 동시수업이 있는 경우
  let lessonsToAdd: Lesson[] = [];
  for (const { courseId, dayOfWeek, period, consecutivePeriod } of confIdsToAdd) {
    const added = await assignConcurrentCourse(courseId, dayOfWeek, period, consecutivePeriod);
    if (added?.length) lessonsToAdd.push(...added);
  }
  try {
    await lessonContext.updateTimetableBasicTemplateLessons(lessonsToAdd, lessonIdsToDelete);
  } catch (error) {
    dialog.alertSimple('동시 수업 배정에 실패했습니다. 다시 시도해주세요.');
    await lessonContext.reload();
    return;
  }
}

const getAssignedConcurrentCourseToDelete = async (concurrentCourseId: string, dayOfWeek: number, period: number) => {
  // 해당 조건의 lesson만 추출
  let lessonsToDelete = lessons.value.filter(
    l =>
      l.concurrentCourseId === concurrentCourseId &&
      l.dayOfWeek === dayOfWeek &&
      l.period === period
  );

  // 연속 시수 그룹이 있으면 그룹 전체로 확장
  lessonsToDelete = lessonsToDelete.flatMap(l =>
    l.consecutiveGroupId
      ? lessons.value.filter(lesson => lesson.consecutiveGroupId === l.consecutiveGroupId)
      : [l]
  );

  return lessonsToDelete;
};

const assignConcurrentCourse = async (concurrentCourseId: string, dayOfWeek: number, period: number, consecutivePeriod: number | undefined) => {
  if (!concurrentCourseId) {
    return;
  }
  
  // 동시 수업에 속한 모든 수업을 가져온다.
  const concurrentLessonConfs = lessonConfsMapByConcurrentCourse.value[concurrentCourseId];
  const timetablePeriod = { dayOfWeek, period } as TimetablePeriod;

  concurrentLessonConfs.forEach((conf) => {
    Timetable.assignLessonConfManually(timetablePeriod, conf, consecutivePeriod);
  });

  const lessonsToSave = Timetable.currentAssignedLessons.filter((lesson) => {
    return (
      lesson.dayOfWeek === dayOfWeek &&
      (consecutivePeriod ? (lesson.period >= period && lesson.period < period + consecutivePeriod) : lesson.period === period) &&
      lesson.concurrentCourseId === concurrentCourseId
    );
  });

  return lessonsToSave;
}

const getDiffFromOrigins = () => {
  const flatten = (data: AssignedConcurrentsByGrade) =>
    Object.entries(data).flatMap(([grade, periods]) =>
      Object.entries(periods).flatMap(([dayPeriod, courses]) =>
        (courses as AssignedCellInfo[]).map(course => ({
          grade: Number(grade),
          dayOfWeek: Number(dayPeriod.split('-')[0]),
          period: Number(dayPeriod.split('-')[1]),
          courseId: course.concurrentCourseId,
          group: course.consecutiveGroupId,
          blockIdx: course.consecutiveBlockIndex,
        }))
      )
    );

  const groupBy = (items: ReturnType<typeof flatten>) => {
    const map = new Map<string, any[]>();
    for (const item of items) {
      const key = item.group
        ? `G-${item.grade}-${item.courseId}-${item.group}`
        : `S-${item.grade}-${item.dayOfWeek}-${item.period}-${item.courseId}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }

    return Array.from(map.values()).map(arr => {
      if (arr.length) {
        arr.sort((a: { blockIdx?: number }, b: { blockIdx?: number }) => (a.blockIdx || 0) - (b.blockIdx || 0));
      }
      const rep = { ...arr[0] };
      if (rep.group) rep.consecutivePeriod = arr.length;
      return rep;
    });
  };

  const current = groupBy(flatten(currentAssignedConcurrentsByGrade.value));
  const edited = groupBy(flatten(editableAssignedConcurrentsByGrade.value));

  const makeKey = (t: any) =>
    t.group
      ? `G-${t.grade}-${t.courseId}-${t.group}`
      : `S-${t.grade}-${t.dayOfWeek}-${t.period}-${t.courseId}`;

  const currentMap = new Map(current.map(t => [makeKey(t), t]));
  const editedMap = new Map(edited.map(t => [makeKey(t), t]));

  const confIdsToDelete = Array.from(currentMap.entries())
    .filter(([k]) => !editedMap.has(k))
    .map(([_, t]) => ({
      grade: t.grade,
      dayOfWeek: t.dayOfWeek,
      period: t.period,
      courseId: t.courseId,
      ...(t.consecutivePeriod ? { consecutivePeriod: t.consecutivePeriod } : {})
    }));

  const confIdsToAdd = Array.from(editedMap.entries())
    .filter(([k]) => !currentMap.has(k))
    .map(([_, t]) => ({
      grade: t.grade,
      dayOfWeek: t.dayOfWeek,
      period: t.period,
      courseId: t.courseId,
      ...(t.consecutivePeriod ? { consecutivePeriod: t.consecutivePeriod } : {})
    }));

  return { confIdsToDelete, confIdsToAdd } as DiffFromOrigin;
};

const handleClickReset = async () => {
  const reply = await dialog.confirm('전체 초기화 시, 배정된 동시수업이 <br>모두 해제됩니다.초기화 하시겠습니까?', null, {
    customClass: {
      popup: 'timetable-confirm',
      confirmButton: 'btn-warning',
    }
  });
  if (!reply) { return; }

  editableAssignedConcurrentsByGrade.value = {};
};

const handleCloseDialog = () => {
  emit('close');
};

const calRatio = (dayIdx: number) => {
  const classDays = props.timetableConfig.classDays.reduce((acc, cur) => acc + cur, 0);
  if (classDays === 1) {
    if (dayIdx === 0) { return '10%'; }
    return '90%';
  } else if (classDays === 2) {
    if (dayIdx === 0) { return '10%'; }
    return '45%';
  } else if (classDays === 3) {
    if (dayIdx === 0) { return '10%'; }
    return '30%';
  } else if (classDays === 4) {
    if (dayIdx === 0) { return '12%'; }
    return '22%';
  } else if (classDays === 5) {
    if (dayIdx === 0) { return '10%'; }
    return '18%';
  } else if (classDays === 6) {
    if (dayIdx === 0) { return '10%'; }
    return '15%';
  } else if (classDays === 7) {
    if (dayIdx === 0) { return '9%'; }
    return '13%';
  }
};

const displayWeekday = (dayIdx: number) => {
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  return weekdays[dayIdx];
};

const isUnifiedOrFreePeriodOrOutOfRange = (gradeNum: number, dayOfWeek: number, period: number) => {
  return isOutOfRange(dayOfWeek, period) || isUnifiedOrFreePeriod(gradeNum, dayOfWeek, period);
};

const isOutOfRange = (dayOfWeek: number, period: number) => {
  const { classDays, maxPeriod } = props.timetableConfig;
  return classDays[dayOfWeek] === 0 || period > maxPeriod
};

const isUnifiedOrFreePeriod = (gradeNum: number, dayOfWeek: number, period: number) => {
  return isUnifiedCourse(gradeNum, dayOfWeek, period) || isFreePeriod(gradeNum, dayOfWeek, period)
};

const isUnifiedCourse = (gradeNum: number, dayOfWeek: number, period: number) => {
  const conf = findUnifiedCourse(gradeNum, dayOfWeek, period);
  return !!conf;
};

const getUnifiedCourseName = (gradeNum: number, dayOfWeek: number, period: number) => {
  const conf = findUnifiedCourse(gradeNum, dayOfWeek, period);
  return !!conf ? courseMap.value[conf.courseId].displayedTitle : '';
}

const findUnifiedCourse = (gradeNum: number, dayOfWeek: number, period: number) => {
  return fixedConfs.value
    .find(fixedConf => 
      fixedConf.grade === gradeNum && 
      fixedConf.dayOfWeek === dayOfWeek && 
      fixedConf.period === period && 
      courseMap.value[fixedConf.courseId].isUnified
    );
};

const isFreePeriod = (gradeNum: number, dayOfWeek: number, period: number) => {
  const grade = props.timetableConfig.grades.find((g) => g.grade === gradeNum);
  if (
    !grade || 
    !grade.timetableStructure || 
    !grade.timetableStructure.freePeriods
  ) return false;

  return grade.timetableStructure.freePeriods.some((fp) => fp.dayOfWeek === dayOfWeek && fp.period === period);
};

const hasConsecutiveHead = (gradeNum: number, dayOfWeek: number, period: number) => {
  const key = `${dayOfWeek}-${period}`;
  const assignedCourses = editableAssignedConcurrentsByGrade.value[gradeNum]?.[key] || [];
  return assignedCourses.some((course: AssignedCellInfo) => course.consecutiveGroupId && course.consecutiveBlockIndex === 1);
};

const hasConsecutive = (gradeNum: number, dayOfWeek: number, period: number) => {
  const key = `${dayOfWeek}-${period}`;
  const assignedCourses = editableAssignedConcurrentsByGrade.value[gradeNum]?.[key] || [];
  return assignedCourses.some((course: AssignedCellInfo) => course.consecutiveGroupId && course.consecutiveBlockIndex !== 1);
};

const getTooltipContent = (lessonConfWithDetails: LessonConfWithDetails[]) => {
  if (!lessonConfWithDetails || lessonConfWithDetails.length === 0) return '';
  return lessonConfWithDetails
    .map(
      (conf) =>
        `<span class='grade-class-course'><span>${conf.isVirtual ? conf.gradeClassNum.replace(`${conf.grade}-`, '가상') + '반' : conf.gradeClassNum}</span><span>${conf.displayedTitle}</span></span>`
    )
    .join('');
};

</script>

<style lang="scss" scoped>
// 동시수업 고정 모달
.concurrent-fixed-modal{
  ::v-deep {
    .modal__layer,
    .modal__content{
      overflow: visible;
    }
  }
  .gray-box {
    display: flex;
    margin: 0;
    input + label span{
      font-weight: 400;;
    }
    .btn-wrap {
      flex: 1;
      .txt-warning{
        border-color:var(--warning);
        &:hover{
          background-color: rgba(236, 31, 45, 0.05);
        }
      }

    }
  }
  .tb-row {
    display: flex;
    .tb-col.type-timetable {
      flex: 4;
      margin-right: 5px;    
      .fixed-course{
         .course-name {
          color: #1d1d1d;
        }
      }
    }
    .tb-col.type-concurrent {
      flex: 5;
      padding: 32px;
      border-radius: 12px;
      border: 1px solid var(--gray-07, #BDBDBD);
      height: 411px;
      .table-content{
        height: 100%;
        td{
          border-right: 0;
          position: relative;
        }
        .course-list {
          display: flex;
          flex-direction: row;
          align-items: center;
          flex-wrap: wrap;
          height: 48px;
          overflow: hidden;

          .hi-tooltip-wrap{
            display: none;
            position: absolute;
            max-width: 600px;
            width: 100%;
            left: 0;
            right: 0;
            ::v-deep .hi-tooltip{
              width: max-content;
              max-width: 470px;
              left: 0;
              transform: none;
              &::before{
                left: 26px;
              }
              > span{
                display: flex;
                max-width: 100%;
                flex-wrap: wrap;
                .grade-class-course {
                  width: 36px;
                  display: flex;
                  flex-direction: column;
                  span{
                    font-size: 13px;
                    font-style: normal;
                    font-weight: 400;
                    line-height: 160%;
                  }
                }
              }
            }
            &.tooltip-top{
              ::v-deep .hi-tooltip{                
                bottom: 27px;
              }
            }
            &.tooltip-bottom{
              ::v-deep .hi-tooltip{                
                top: 27px;
              }
            }
          }
          &:hover .hi-tooltip-wrap{
            display: inline-block;
          }
        }
        .grade-class-course {
          width: 40px;
          display: flex;
          flex-direction: column;
          span{
            font-size: 14px;
            font-style: normal;
            font-weight: 400;
            line-height: 160%;
          }
        }
      }
    }
  }
  .option-list-wrap{    
    position: absolute;
    top: calc(100% - 6px);
    left: 50%;
    transform: translateX(-50%);
    width: 260px;   
    position: absolute;
    left: 8px;
    transform: translateX(0);
    z-index: 1;   
    &.opt-right{
      left: auto !important;
      right: 8px;
    }
  }
  .hi-nodata{
    padding: 0 0;
  }

  .ico.ico-close.hidden-icon {
    visibility: hidden;   // 아이콘을 시각적으로 숨김
    pointer-events: none; // 마우스 이벤트도 받지 않도록 함
  }

  .btn-primary{
    transition: 0.5s;
    &.ani{
      transition: 0.5s;
      animation: assignment-ani 1.2s ease-in-out 3;
    }
  }

}
</style>
