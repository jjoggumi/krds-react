<template>
  <tbody>
    <view-item 
      v-for="(student, idx) of filteredStudents"
      :key="`attendance-student-${idx}`"
      :student="student"
    />
  </tbody>
</template>

<script>
import ViewItem from '@/apps/main/clazzes/attendance/MainBodyClaszzesBodyAttendanceStudentListViewItem'
export default {
  name: "main-body-clazzes-body-attendance-student-list-view",
  components: { ViewItem },
  props: {
    filteredStudents: {
      type: Array
    }
  }
}
</script>

<style scoped>

</style>
