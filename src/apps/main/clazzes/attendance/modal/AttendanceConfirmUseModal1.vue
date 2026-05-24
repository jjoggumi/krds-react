<!--
@File(Method): AttendanceConfirmUseModal1.vue
@Author: -
@Date Created: -
@Description: 출결 알리기 : 등록된 명단이 있으면서 출결알리기 사용 OFF인 경우,  alert 표시
@Modified: 2025-02-12 - #71970 출결알리기 > 학반(태그) 추가 - Himodal로 변경
-->
<template>
  <!-- #71970 Himodal로 변경 -->
  <HiModal type="type01" size="sm" closeSkip>
    <template v-slot:heading>출결 알리기</template>
    <template v-slot:content> 
      <p>출결 알리기 기능을 사용하시겠습니까?</p>
    </template>
    <template v-slot:footer>
        <HiButton color="light-primary" outline size="lg" @click="closeModal">취소</HiButton>           
        <HiButton color="primary" size="lg" @click="activeAttendance">확인</HiButton>           
    </template>
  </HiModal>
</template>
<script>
import {mapGetters, mapMutations, mapState} from "vuex";
import {eventBus} from "@/main";

export default {
  name: "attendance-confirm-use-modal1",
  computed: {
    ...mapState({
      curClassItem: 'curClassItem'
    }),
    ...mapGetters({
      curClassId: 'curClassId'
    })
  },
  methods: {
    ...mapMutations('storeClazzes', {
      setIsShowAttendanceConfirmUseModal1: 'setIsShowAttendanceConfirmUseModal1'
    }),

    /**
     * 출결알리기 사용
     */
    activeAttendance() {
      this.$hiClass.clazzes.update({attendanceUsed: true}, `/clazzes/${this.curClassId}`)
          .then(() => {
            this.setIsShowAttendanceConfirmUseModal1(false)
            this.curClassItem.attendanceUsed = true
          })
          .catch(error => {
            this.$log.debug(error)
          })
          .finally(() => {
            this.$router.push(`/main/clazzes/${this.$route.params.id}/attendance`, () => {})
          })
    },

    closeModal() {
      eventBus.$emit('set-temp-attendance-used', false)
      this.setIsShowAttendanceConfirmUseModal1(false)
    }
  }
}
</script>

<style scoped>
.hi-modal-common .modal__content p {
    font-size: 15px;
    line-height: 150%;
    color: #888;
}
</style>