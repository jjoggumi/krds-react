<template>
  <div class="hi-modal-common" style="display: block;">
    <div class="modal__dim"></div>
    <div class="modal__layer attendance-alert-modal">
      <div class="modal__header">
        <h2 class="heading">학생 명단이 등록되었습니다.</h2>
      </div>
      <div class="modal__content body">
        <p>학생의 반 번호가 맞는지<br>명단을 확인 후 수정해주세요.</p>
      </div>
      <div class="modal__footer">
        <div class="btn-wrap">
          <button
              class="hi-btn btn-mb"
              @click="setIsShowAttendanceStudentRegisterCompleteModal(false)"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapMutations} from "vuex";

export default {
  name: "attendance-student-register-complete-modal",
  methods: {
    ...mapMutations('storeClazzes', {
      setIsShowAttendanceStudentRegisterCompleteModal: 'setIsShowAttendanceStudentRegisterCompleteModal'
    }),
  },
  created() {
    this.$hiClass.toggleBodyClass('add', 'hidden')
  },
  beforeDestroy() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  },
}
</script>

<style lang="scss" scoped>
.attendance-alert-modal {
  .modal__header {
    .heading {
      line-height: 150%;
      .name{
        color: var(--primary);
        font-size: 20px;
        font-weight: 700;
      }
    }
  }
  .modal__content {
    padding: 10px 30px 30px;
     p{
      font-size: 15px;
      line-height: 150%;
      color: #888;
    }
  }
  .modal__footer {
    .btn-wrap{
      margin-bottom: 30px;
      .hi-btn{
        width: 140px;
        height: 44px;
        font-size: 15px;
        border-radius: 30px;
        margin-left: 2px;
        margin-right: 2px;
        font-weight: 700;
      }
    }
  }
}
</style>