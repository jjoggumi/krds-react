<!--
@File(Method): MainBodyClaszzesBodyAttendanceStudentListViewItem.vue
@Author: -
@Date Created: -
@Description: 출결알리기 > 학생명단 > 학생명단 리스트 아이템
@Modified: 2025-02-14 - #71970 출결알리기 > 학반(태그) 추가 - 학반(태그 영역 추가)
-->
<template>
    <tr :class="{'use-no': !student.isUsed}">
        <td>{{ student.tagId && student.tagName ? student.tagName : '-' }}</td>
        <td>{{ student.studentNo }}</td>
        <td><p class="std-name">{{ student.studentName }}</p></td>
        <td>{{ student.isUsed ? '사용' : `미사용 (${$moment(student.notUsedTimestamp).format('YYYY.MM.DD')})` }}</td>
    </tr>
</template>

<script>
export default {
  name: "main-body-clazzes-body-attendance-student-list-view-item",
  props: {
    student: {
      type: Object
    }
  }
}
</script>

<style scoped>

</style>
