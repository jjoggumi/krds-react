<template>
  <div class="tt-additional-work">
    <div class="tab-nav type01">
      <button
        v-for="(item, menuIdx) in menuItems"
        :key="`menu-${menuIdx}`"
        :class="{ active: subMenu === item.name }"
        @click="clickSubMenu(item)"
      >
        {{ item.label }}
      </button>
    </div>

    <div class="tab-con">
      <concurrent-course-conf v-if="subMenu === SubMenu.ConcurrentCourses" />
      <consecutive-lesson-conf v-else-if="subMenu === SubMenu.ConsecutiveLessons" />
      <specialty-room-conf v-else-if="subMenu === SubMenu.SpecialtyRoom" />
      <similar-course-conf v-else-if="subMenu === SubMenu.SimilarCourses" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import ConcurrentCourseConf from '@/apps/timetable/components/ConcurrentCourseConf_pub.vue'; // 퍼블 확인
import ConsecutiveLessonConf from '@/apps/timetable/components/ConsecutiveLessonConf.vue';
import SpecialtyRoomConf from '@/apps/timetable/components/SpecialtyRoomConf.vue';
import SimilarCourseConf from '@/apps/timetable/components/SimilarCourseConf.vue';

enum SubMenu {
  ConcurrentCourses = 'ConcurrentCourses',
  ConsecutiveLessons = 'ConsecutiveLessons',
  SpecialtyRoom = 'SpecialtyRoom',
  SimilarCourses = 'SimilarCourses',
}

type Menu = {
  name: SubMenu;
  label: string;
};

const menuItems = ref<Menu[]>([
  { name: SubMenu.ConcurrentCourses, label: '동시수업' },
  { name: SubMenu.ConsecutiveLessons, label: '연속수업' },
  { name: SubMenu.SpecialtyRoom, label: '특별실' },
  { name: SubMenu.SimilarCourses, label: '유사과목 지정' },
]);

const subMenu = ref(SubMenu.ConcurrentCourses);

const clickSubMenu = (item: Menu) => {
  subMenu.value = item.name;
};
</script>

<style scoped></style>
