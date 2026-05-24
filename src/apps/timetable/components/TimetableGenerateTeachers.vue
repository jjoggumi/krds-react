<template>
  <table class="table">
    <caption>교사목록</caption>
    <colgroup>
      <col style="width: 42%;" />
      <col style="width: 58%;" />
    </colgroup>
    <thead>
      <tr>
        <th scope="col" class="sticky-top pr-00" @click="handleClickTeacherNameOrderBy">
          <span>교사명(시수)</span>
          <button type="button"            
            class="btn btn-link btn-sort"
            :class="{
              'asc': orderBy !== ListOrder.teacherNameDesc,
              'desc': orderBy === ListOrder.teacherNameDesc 
            }"><span class="sr-only">정렬</span></button>
        </th>
        <th scope="col" class="sticky-top">
          과목명
          <button type="button"
            @click="handleClickCourseNameOrderBy"
            class="btn btn-link btn-sort"
            :class="{
              'asc': orderBy !== ListOrder.courseNameDesc,
              'desc': orderBy === ListOrder.courseNameDesc 
            }"
          ><span class="sr-only">정렬</span></button>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in filteredItems" 
        @click="() => handleClick(item.entity)"
        :class="{'active' : props.selectedTeacher?.teacherId === item.id}"
        :key="`${item.id}`">
        <td class="txt-left">{{ item.title }}({{ item.periodCount }})</td>
        <td class="txt-left">{{ item.subtitle }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts" setup>
import { reactive, ref, watch } from 'vue';
import { TeacherTableItem } from '../common/types';
import { Teacher } from '@/apps/timetable/core/types';

const props = defineProps<{
  teacherTableItems: TeacherTableItem[],
  selectedTeacher: Teacher | null,
  onSelectTeacher: (teacher: Teacher) => void,
  searchKeyword?: string | null,
}>();

enum ListOrder {
  teacherNameAsc = 'teacherName-asc',
  teacherNameDesc = 'teacherName-desc',
  courseNameAsc = 'courseName-asc',
  courseNameDesc = 'courseName-desc',
}

const orderBy = ref<ListOrder>(ListOrder.teacherNameAsc);
const filteredItems = ref<TeacherTableItem[]>([]);

const compareBySort = (a: string | undefined, b: string | undefined, sortOrder: string) => {
  const strA = a || '';
  const strB = b || '';
  return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
};

const handleClickTeacherNameOrderBy = () => {
  // console.log('handleClickTeacherNameOrderBy', orderBy.value);
  if(orderBy.value !== ListOrder.teacherNameAsc) {
    orderBy.value = ListOrder.teacherNameAsc;
    return;
  }
  orderBy.value = ListOrder.teacherNameDesc;
};

const handleClickCourseNameOrderBy = () => {
  // console.log('handleClickCourseNameOrderBy', orderBy.value);
  if(orderBy.value !== ListOrder.courseNameAsc) {
    orderBy.value = ListOrder.courseNameAsc;
    return;
  }
  orderBy.value = ListOrder.courseNameDesc;
};

watch(
  () => [
    props.teacherTableItems,
    props.searchKeyword,
    orderBy.value
  ],
  ([items, newKeyword]) => {
    filteredItems.value = [ ...props.teacherTableItems ].filter((item: TeacherTableItem) => {
      if (!props.searchKeyword || props.searchKeyword.trim() === '') {
        return true; // 검색어가 없으면 모든 항목을 표시
      }
      const keyword = props.searchKeyword.toLowerCase();
      return item.title.toLowerCase().includes(keyword) || item.subtitle?.toLowerCase().includes(keyword);
    });
    
    // 정렬 로직 추가
    filteredItems.value.sort((a: TeacherTableItem, b: TeacherTableItem) => {
      switch (orderBy.value) {
        case ListOrder.teacherNameAsc:
          return a.title.localeCompare(b.title);
        case ListOrder.teacherNameDesc:
          return b.title.localeCompare(a.title);
        case ListOrder.courseNameAsc:
          return (a.subtitle || '').localeCompare(b.subtitle || '');
        case ListOrder.courseNameDesc:
          return (b.subtitle || '').localeCompare(a.subtitle || '');
        default:
          return 0;
      }
    });
  },
  { immediate: true }
);

const handleClick = (teacher: Teacher) => {
  console.log('Selected Teacher:', teacher);
  props.onSelectTeacher(teacher);
};


</script>

<style lang="scss" scoped>
.table-content.basic-table{
  table{margin-bottom: 10px;}
  table > thead > tr > th {
    height: 32px;
    padding: 5px 10px;
  }
  table > tbody > tr > td{
    height: 32px;
    padding: 5px 18px;
  }
  table > tbody > tr.active td,
  table > tbody > tr:hover td{
    background: #F1F4FC;
    cursor: pointer;
  }
  table > thead > tr:first-child > th{border-top: 0;}
  table > tbody > tr:hover:last-child td:first-child,
  table > tbody > tr:hover:last-child td:last-child,
  table > tbody > tr.active:last-child td:first-child,
  table > tbody > tr.active:last-child td:last-child{
    border-radius: 0;
  }
  table td{border-right:1px solid #EEEEEE;}
  table {
    tr {
      &:last-child {
        td {
          border-bottom-color: #EEEEEE;
        }
      }
    }
  }
}
</style>
