<template>
  <div>
    <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      :pagination="pagination"
      :sort-by="['title']"
      flat
      virtual-scroll
      bordered
      @row-click="handleClickRow"
    >
      <template v-slot:bottom="">
        <!-- 기본 페이징 UI를 제거 -->
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import QTable from '@/apps/timetable/q-temp/QTable.vue';

import { computed, onMounted, ref } from 'vue';
import { TeacherRow } from '../common/types';

// defineOptions({  name: 'TimetableLessonItem',});

type ColumnAlign = 'left' | 'center' | 'right' | undefined;

const props = defineProps<{
  teachers: TeacherRow[] | undefined;
  onClick: (teacher: TeacherRow) => void;
}>();

const rows = computed(() => {
  return props.teachers || [];
});

onMounted(() => {
  // console.log('TeacherTable mounted', props.onClick);

});

const columns = ref([
  {
    name: 'title',
    required: true,
    label: '교사명',
    align: 'center' as ColumnAlign,
    field: (row: TeacherRow) => row.title,
    // format: (val) => `${val}`,
    sortable: true,
    style: 'font-size: 14px; font-weight: bold;',
    headerStyle: 'font-size: 14px; font-weight: bold;',
  },
  {
    name: 'subtitle',
    align: 'center' as ColumnAlign,
    label: '과목명',
    field: (row: TeacherRow) => row.subtitle,
    sortable: true,
    style: 'font-size: 14px;',
    headerStyle: 'font-size: 14px; font-weight: bold;',
  },
]);

const pagination = ref({
  sortBy: 'title',
  descending: false,
  rowsPerPage: 0,
});

const handleClickRow = (row: object, idx: number) => {
    if (props.onClick && row) {
    props.onClick(row as TeacherRow);
  }
};
</script>

<style scoped>
.bold-column {
  font-size: 16px;
  font-weight: bold;
}
</style>
