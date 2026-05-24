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

const SETTING = () => ({
  component: import('@/apps/main/clazzes/setting/MainBodyClazzesBodySetting.vue'),
  error: ErrorLoadFailAsyncComponent,
})
const PERMISSION = () => ({
  component: import('@/apps/main/clazzes/permission/MainBodyClazzesBodyPermission.vue'),
  error: ErrorLoadFailAsyncComponent,
})
const MEMBER = () => ({
  component: import('@/apps/main/clazzes/member/Main.vue'),
  error: ErrorLoadFailAsyncComponent,
})
const INVITE = () => ({
  component: import('@/apps/main/clazzes/invite/MainBodyClazzesBodyInvite.vue'),
  error: ErrorLoadFailAsyncComponent,
})

export default {
  name: "main-body-clazzes-body-manage-class",
  components: {
    SETTING,
    PERMISSION,
    MEMBER,
    INVITE,
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