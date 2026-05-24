<template>
  <component
    :is="curForm"
    :key="`${clazzes.currentId}-${curForm}`"
    :isManager="isManager"
    :isClassActivated="isClassActivated"

    :clazzes="clazzes"
    :clazzMemberRole="clazzMemberRole"
    :clazzSubscribesUri="clazzSubscribesUri"
    :userUri="userUri"

    :isInitComp="isInitComp"
  ></component>

</template>

<script>
import ErrorLoadFailAsyncComponent from "@/apps/error/ErrorLoadFailAsyncComponent";

const SURVEY = () => ({
  component: import('@/apps/main/clazzes/survey/MainBodyClazzesBodySurvey.vue'),
  error: ErrorLoadFailAsyncComponent,
})
const FORM = () => ({
  component: import('@/apps/main/clazzes/form/MainBodyClazzesBodyForm.vue'),
  error: ErrorLoadFailAsyncComponent,
})
const CLASS = () => ({
  component: import('@/apps/main/clazzes/class/MainBodyClazzesBodyClass.vue'),
  error: ErrorLoadFailAsyncComponent,
})
const ATTENDANCE = () => ({
  component: import('@/apps/main/clazzes/attendance/MainBodyClazzesBodyAttendance.vue'),
  error: ErrorLoadFailAsyncComponent,
})

export default {
  name: "main-body-clazzes-body-class-management",
  components: {
    SURVEY,
    FORM,
    CLASS,
    ATTENDANCE
  },
  props: [
    'curForm',
    'isManager',
    'isClassActivated',

    'clazzes',
    'clazzMemberRole',
    'clazzSubscribesUri',
    'userUri',

    'isInitComp',
    'isBusy',
    'searchKeyword'
  ],
}
</script>

<style scoped>

</style>