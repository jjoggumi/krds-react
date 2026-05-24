<template>
<!--  <div v-if="clazzes.currentId && isManager" >-->
<!--    <div class="class-setting-wrap">-->
<!--      &lt;!&ndash; 게시판 설정 &ndash;&gt;-->
<!--      <main-body-clazzes-body-permission-board-setting-->
<!--        :clazzes="clazzes"-->
<!--        :isManager="isManager"-->
<!--        :isClassActivated="isClassActivated"-->
<!--      />-->
<!--      &lt;!&ndash; // 게시판 설정 &ndash;&gt;-->
<!--    </div>-->
<!--  </div>-->
  <main-body-clazzes-body-permission-board-management
    v-if="clazzes.currentId && isManager"
    :clazzes="clazzes"
  />
</template>

<script>
import MainBodyClazzesBodyPermissionBoardManagement
  from "@/apps/main/clazzes/permission/MainBodyClazzesBodyPermissionBoardManagement";
import {mapActions} from "vuex";

export default {
  name: 'main-body-clazzes-body-permission',
  components: {
    MainBodyClazzesBodyPermissionBoardManagement,
  },
  props: {
    isManager: Boolean,
    isClassActivated: Boolean,

    clazzes: Object,
    clazzMemberRole: String,
    clazzSubscribesUri: String,
    userUri: Object,
  },
  data: () => ({
    classManager: [],
    classManagerCheckedTimestamp: null,
    isAddTeacherShow: false,
    isShowChangeMemberRole: false
  }),
  async created() {
    /**
     * 클래스 세팅이 외부 요인으로 변경되었을 경우 갱신함
     * @type {*}
     */
    const clazz = await (
      this.$hiClass.clazzes.read(`${this.$apiUrl}/clazzes/${this.clazzes.currentId}`)
        .then(res => res.data || {})
    )
    
    for(const [key, value] of Object.entries(clazz))
      this.clazzes[key] = value
  },
  beforeMount() {
    this.checkClassMenuEntryPermission({
      isManager: this.isManager
    })
  },
  methods: {
    ...mapActions('storeBoard', {
      checkClassMenuEntryPermission: 'checkClassMenuEntryPermission',
    }),
    initClassManager() {
      this.classManager = []
      this.classManagerCheckedTimestamp = this.$moment().valueOf()
    }
  }
}
</script>

<style scoped></style>
