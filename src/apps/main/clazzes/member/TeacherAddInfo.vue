<!--
@File(Method): TeacherAddInfo.vue
@Date Created: 2025-01-09
@Description: 클래스 구성원 관리 > 선생님 > 선생님 추가
@Modify: #69560 클래스 구성원 관리 태그 추가 , 구성원관리에 선생님 목록 이동
-->
<template>
  <div class="class-setting-wrap">
    <div class="info-box">
      <div class="smr">
        * 다른 선생님을 추가하여 함께 공동운영하거나, 권한을 위임하실수 있습니다.<br>
        * 추가된 선생님은 클래스 구성원과 기존 게시물의 정보를 확인할 수 있습니다.<br>
        * 휴직 등으로 <strong>권한 위임</strong>이 필요한 경우, 위임 받을 선생님을 추가 후에 클래스를 탈퇴 할 수 있습니다.
      </div>
      <div class="btns">
        <HiButton color="secondary" size="md" bitrounded @click="isAddTeacherShow = true">
          <HiIcon name="ico-plus2" size="18"/> 선생님 추가
        </HiButton>
      </div>
    </div>

    <teacher-add-modal
        v-if="isAddTeacherShow"
        :classId="classId"
        @closeAddTeacherPopup="isAddTeacherShow = false"
        @reloadMembers="reloadMembers"
    />
  </div>
</template>

<script>
import TeacherAddModal from "@/apps/main/clazzes/member/modal/TeacherAdd";

export default {
  name: "teacher-add-info",
  data() {
    return {
      isAddTeacherShow: false
    }
  },
  props: {
    classId: String
  },
  components: {
    TeacherAddModal
  },
  methods: {
    reloadMembers() {
      this.$emit('reloadMembers')
    }
  }
}
</script>

<style scoped>

</style>