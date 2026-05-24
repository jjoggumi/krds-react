<!--
@File(Method): AttendanceConfirmUseModal2.vue
@Author: -
@Date Created: -
@Description: 출결 알리기 : 명단이 없는 경우, 명단 등록 안내 팝업
@Modified: 2025-03-10 - #72873 출결 알리기 시작하기 > 학생명단 등록하기 팝업 노출 시 딤드 뒷화면 스크롤 되지 않도록 수정 - 
-->
<template>
    <HiModal type="type01" size="sm" closeSkip dimClose  @close="closeModal" class="attendance-use-alert-modal">
      <template v-slot:heading>출결 알리기</template>
      <template v-slot:content> 
        <div class="school-image"></div>
        <p>
          <span class="gray">출결 알리기</span>는 결석, 지각, 조퇴를 <br> 선생님에게 알릴 수 있는 기능<span class="gray">입니다.</span>
        </p>
      </template>
      <template v-slot:footer>
          <HiButton color="primary" size="lg"  @click="startAttendance">출결 알리기 시작하기</HiButton>           
      </template>
    </HiModal>
</template>

<script>
import {mapMutations} from "vuex";
import {eventBus} from "@/main";

export default {
  name: "attendance-confirm-use-modal2",
  methods: {
    ...mapMutations('storeClazzes', {
      setIsShowAttendanceConfirmUseModal2: 'setIsShowAttendanceConfirmUseModal2',
      setIsShowAttendanceStudentRegisterModal: 'setIsShowAttendanceStudentRegisterModal'
    }),
    startAttendance() {
      this.setIsShowAttendanceConfirmUseModal2(false)
      this.setIsShowAttendanceStudentRegisterModal(true)
    },
    closeModal() {
      eventBus.$emit('set-temp-attendance-used', false)
      this.setIsShowAttendanceConfirmUseModal2(false)
    }
  },
  // #72873 HiModal 적용으로 해당 컴포넌트가 생길때 사라질 때 body에 hidden 클래스 제거 하는 코드 삭제 
  // created() {
  //   this.$hiClass.toggleBodyClass('add', 'hidden')
  // },
  // beforeDestroy() {
  //   this.$hiClass.toggleBodyClass('remove', 'hidden')
  // }
}
</script>

<style lang="scss" scoped>
.attendance-use-alert-modal ::v-deep {
  .modal__content {
      padding: 10px 30px 30px;
    p{
      font-size: 15px;
      line-height: 150%;
      .gray{
          color: #888;
      }
    }
    .school-image{
        display: inline-block;
        width: 330px;
        height: 187px;
        background: url(~@/assets/img/class_attendance_school_img.svg) no-repeat center;
    }
  }
  .modal__footer .hi-btn{
      width: 220px;
      font-size: 15px;
  }  
}
</style>