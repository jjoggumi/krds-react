<template>
  <section>
    <div class="similar-course-conf mt-20">
      <div class="table-head j-right sticky">
        <div class="btn-area">
          <button
            type="button"
            class="btn btn-tertiary"
            @click="handleClickDeleteSelectedConfs"
            :disabled="!hasChecked"
          >
            선택 삭제하기
          </button>
          <button type="button" class="btn btn-primary"
            :disabled="isExistEmptyConf"
            @click="handleClickAddConf">
            그룹 추가하기
          </button>
        </div>
      </div>

      <div class="table-content table-form">
        <table>
          <caption>유사과목 그룹 설정</caption>
          <colgroup>
            <col style="width: 10%" />
            <col style="width: 30%" />
            <col style="width: 60%" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">
                <div class="form-check">
                  <input
                    type="checkbox"
                    id="similarCourseAllChecked"
                    v-model="isCheckedAll"
                    :disabled="similarCourseConfItems.length === 0"
                  />
                  <label for="similarCourseAllChecked"></label>
                </div>
              </th>
              <th scope="col">유사과목 그룹명</th>
              <th scope="col">과목</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in similarCourseConfItems"
              :key="item.similarCourseConfId || index"
            >
              <td>
                <input
                  type="checkbox"
                  v-model="item.isChecked"
                  :id="`filteredSimilarCourses-${index}`"
                  @change="handleCheckedChange(item, $event)"
                />
                <label :for="`filteredSimilarCourses-${index}`"></label>
              </td>
              <td :class="{ error: false }">
                <div class="input-wrap">
                  <input
                    :ref="el => similarCourseNameRefs[index] = el"
                    type="text"
                    v-model="item.similarCourseName"
                    maxlength="5"
                    placeholder="그룹명"
                    :class="{ error: false }"
                    @input="e => restrictName(e, item)"
                    @keyup.enter="handleKeydownSimilarCourseName(item, index, $event)"
                    @focus="handleFocusSimilarCourseName(item)"
                    @blur="() => handleBlurSimilarCourseName(item, index)"
                    spellcheck="false"
                  />
                </div>
              </td>
              <td>
                <CourseSelectForSimilarCourse
                  :index="index"
                  :tags="filteredCourses"
                  :selectedTags="confCourseMap[item.similarCourseConfId] || []"
                  :placeholder="(confCourseMap[item.similarCourseConfId] || []).length === 0 ? '과목 선택' : ''"
                  :is-error="false" 
                  @add:tags="(course) => handleClickAddCourse(course, item, index)"
                  @remove:tags="(course) => handleClickRemoveCourse(course, item, index)"
                  @click.stop
                /> 
              </td>
            </tr>
            <tr>
              <td colspan="3" class="tfoot">ENTER 키로 다음 칸으로 이동하세요.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  ContextKeys,
  // TimetableCourseContext,
  TimetableCourseBaseContext,
  SimilarCourseConfContext,
  SimilarCourseContext
} from '../contexts';
import CourseSelectForSimilarCourse from '@/apps/timetable/components/CourseSelectForSimilarCourse.vue';
import { useDialog } from '../composables/dialog';
import type { CourseBase, SimilarCourseConf } from '@/apps/timetable/core/types';
import { computed, inject, onMounted, ref, nextTick, reactive, ComponentPublicInstance } from 'vue';

interface SimilarCourseConfItem extends SimilarCourseConf {
  isChecked: boolean;
}

const similarCourseConfContext = inject(ContextKeys.SimilarCourseConf) as SimilarCourseConfContext;
const similarCourseContext = inject(ContextKeys.SimilarCourse) as SimilarCourseContext;
const courseBaseContext = inject(ContextKeys.CourseBase) as TimetableCourseBaseContext;
const dialog = useDialog();

// const isCheckedAll = ref(false);
const similarCourseNameRefs = ref<(Element | ComponentPublicInstance | null)[]>([]);
const originSimilarCourseName = ref('');
//const confCourseMap = ref<Record<string, CourseBase[]>>({});
const similarCourseConfItems = ref<SimilarCourseConfItem[]>([]);

onMounted(async () => {
  await initData();
});

const initData = async () => {
  await similarCourseConfContext.load();
  await similarCourseContext.load();
  await courseBaseContext.load();

  if (similarCourseConfContext.similarCourseConfs.length) {
    similarCourseConfItems.value = buildRows();
  } else {
    await addEmptySimilarCourseConf();
  }
};

const buildRows = () => {
  return similarCourseConfContext.similarCourseConfs.map((conf: SimilarCourseConf) => {
    return {...conf, isChecked: false} as SimilarCourseConfItem
  });
};

const similarCourses = computed(() => similarCourseContext.similarCourses);
const courseIdSetOnSimilarCourses = computed(() => {
  return new Set(similarCourses.value.map((sc) => sc.courseBaseId));
});
const courseBaseMap = computed(() => courseBaseContext.courseBaseMap);
const confCourseMap = computed(() => {
  return (similarCourseContext.similarCourses || []).reduce((acc: Record<string, CourseBase[]>, sc) => {
    if (!acc[sc.similarCourseConfId]) {
      acc[sc.similarCourseConfId] = [] as CourseBase[];
    }
    acc[sc.similarCourseConfId].push(courseBaseMap.value[sc.courseBaseId] as CourseBase);
    return acc;
  }, {} as Record<string, CourseBase[]>);
})

const hasChecked = computed(() => similarCourseConfItems.value.some((item) => item.isChecked));
const isCheckedAll = computed({
  get: () => {
    return similarCourseConfItems.value.length > 0 && similarCourseConfItems.value.every(i => i.isChecked)
  },
  set: (val: boolean) => {
    similarCourseConfItems.value.forEach(i => i.isChecked = val)
  }
});

const isExistEmptyConf = computed(() => {
  return similarCourseConfItems.value.some((conf) => !conf.similarCourseConfId); 
});

const filteredCourses = computed(() => {
  return courseBaseContext.courseBases.filter(
    (course: CourseBase) => !courseIdSetOnSimilarCourses.value.has(course.courseBaseId)
  ) as Array<CourseBase>;

  /*
  confCourseMap.value = courseBaseContext.courseBases.reduce((acc, course) => {
    if (course.similarCourseConfId) {
      (acc[course.similarCourseConfId] = acc[course.similarCourseConfId] || []).push(course);
    }
    return acc;
  }, {} as Record<string, CourseBase[]>);

  return courseBaseContext.courseBases.filter(
    (course: CourseBase) => !course.similarCourseConfId
  ) as Array<CourseBase>;
  */
});

// const toggleAllChecked = () => {
//   similarCourseConfItems.value.forEach((item) => item.isChecked = isCheckedAll.value);
// };

const handleCheckedChange = (item: SimilarCourseConfItem, event: Event) => {
  const checked = (event.target as HTMLInputElement).checked;
  item.isChecked = checked;
  // isCheckedAll.value = similarCourseConfItems.value.every((i) => i.isChecked);
};

const restrictName = (e: Event, item: SimilarCourseConfItem) => {
  const allowedRegex = /[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z0-9\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/g;

  const source = (e.target as HTMLInputElement).value;
  const cleanedName = source.replace(allowedRegex, '');

  if (cleanedName.length > 5) return;

  (e.target as HTMLInputElement).value = cleanedName;

  item.similarCourseName = cleanedName;
}

const handleKeydownSimilarCourseName = async (
  item: SimilarCourseConfItem,
  index: number,
  event: KeyboardEvent
) => {
  if (event.key !== 'Enter') { return; }
  if (index !== similarCourseConfItems.value.length - 1) { return; }

  const trimmedName = item.similarCourseName.trim();
  if (trimmedName === '') {
    await dialog.alertSimple('유사과목 그룹명을 입력해주세요.');
    return;
  }

  if (originSimilarCourseName.value !== trimmedName) {
    resetBeforeEditedSimilarCourseName();
  }

  await addEmptySimilarCourseConf();
};

const handleFocusSimilarCourseName = (item: SimilarCourseConfItem) => {
  originSimilarCourseName.value = item.similarCourseName.trim();
};

const handleBlurSimilarCourseName = async (
  item: SimilarCourseConfItem,
  index: number
) => {
  const trimmedName = item.similarCourseName.trim();
  if (trimmedName === '') {
    return;
  }

  if (originSimilarCourseName.value !== trimmedName) {
    if (!item.similarCourseConfId) {
      const created = await similarCourseConfContext.createSimilarCourseConf(trimmedName);
      if (created) {
        item.similarCourseConfId = created.similarCourseConfId;
        item.sortNo = created.sortNo;
      }
    } else {
      const exists = similarCourseConfContext.similarCourseConfs.some(
        (c) => c.similarCourseConfId === item.similarCourseConfId
      );
      if (exists) {
        await similarCourseConfContext.updateSimilarCourseConf(
          item.similarCourseConfId,
          trimmedName
        );
      }
    }
    resetBeforeEditedSimilarCourseName();
  }
};

const resetBeforeEditedSimilarCourseName = () => {
  originSimilarCourseName.value = '';
};

const addEmptySimilarCourseConf = async () => {
  const newConf: SimilarCourseConf = {
    similarCourseConfId: '',
    similarCourseName: '',
    sortNo: similarCourseConfItems.value.length + 1
  };

  similarCourseConfItems.value.push({...newConf, isChecked: false} as SimilarCourseConfItem);

  await nextTick();

  const lastIndex = similarCourseConfItems.value.length - 1;
  if (lastIndex < 0) {
    return;
  }
  const lastRef = similarCourseNameRefs.value[lastIndex] as HTMLInputElement;
  if (lastRef) {
    lastRef.focus();
  }
};

const handleClickAddConf = async () => {
  await addEmptySimilarCourseConf();
  // isCheckedAll.value = false;
}

const handleClickDeleteSelectedConfs = async () => {  
  const selectedIndices = similarCourseConfItems.value
    .map((item, idx) => (item.isChecked ? idx : null))
    .filter(idx => idx !== null);

  if (selectedIndices.length === 0) {
    await dialog.alertSimple('삭제할 유사과목 그룹을 선택해주세요.');
    return;
  }

  const idsToDelete = selectedIndices
    .map(idx => similarCourseConfItems.value[idx]?.similarCourseConfId)
    .filter(id => !!id) as string[];

  // selectedIndices.sort((a, b) => b - a).forEach(idx => {
  //   similarCourseConfContext.similarCourseConfs.splice(idx, 1);
  // });

  if (idsToDelete.length > 0 && await dialog.confirmSimple('선택한 유사과목 그룹을 삭제하시겠습니까?')) {
    await similarCourseConfContext.deleteSimilarCourseConfs(idsToDelete);
  }

  // isCheckedAll.value = false;

  await courseBaseContext.reload();
  // similarCourseConfContext.reload();
  similarCourseConfItems.value = buildRows();
};

const isEmpty = (key: string) => {
  return key === '' || key === null || key === undefined;
}

const handleClickAddCourse = async (course: CourseBase, similarCourseConf: SimilarCourseConf, index: number) => {

  if (isEmpty(similarCourseConf.similarCourseConfId)) {
    await dialog.alertSimple(`유사과목 그룹명을 입력해주세요.`);
    return;
  }

  await courseBaseContext.attachSimilarCourseConfId([course.courseBaseId], similarCourseConf.similarCourseConfId);
  await similarCourseContext.reload();
};

const handleClickRemoveCourse = async (course: CourseBase, similarCourseConf: SimilarCourseConf, index: number) => {
  await courseBaseContext.detachSimilarCourseConfId(similarCourseConf.similarCourseConfId, course.courseBaseId);
  await similarCourseContext.reload();
};
</script>

<style scoped lang="scss">
.similar-course-conf {
  .table-head {
    &.sticky {
      padding: 20px 0 12px 0;
    }
    .btn-area {
      gap: 8px;
    }
  }
}
</style>
