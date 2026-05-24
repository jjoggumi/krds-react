<template>
  <div class="hi-modal-common" style="display: block;">
    <div class="modal__dim"></div>
    <div class="modal__layer attendance-alert-modal">
      <div class="modal__header">
        <h2 v-if="confirmModal.student.isUsed" class="heading">
          <span class="name">{{ confirmModal.student.studentName }}</span> 학생을<br>미사용으로 변경하시겠습니까?
        </h2>
        <h2 v-else class="heading">
          <span class="name">{{ confirmModal.student.studentName }}</span> 학생을<br>삭제하시겠습니까?
        </h2>

      </div>
      <div class="modal__content body">
        <p v-if="confirmModal.student.isUsed">미사용으로 변경하시면 더 이상 신청서 제출이 <br>불가하며, 다시 사용상태로 변경이 불가합니다.</p>
        <p v-else>해당 학생을 삭제하시면, 모든 제출내역이 <br>삭제되며 복원이 불가합니다.</p>
      </div>
      <div class="modal__footer">
        <div class="btn-wrap">
          <button class="hi-btn btn-mb btn-line" @click="setModal">취소</button>
          <button class="hi-btn btn-mb" @click="changeStatus">확인</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "attendance-student-list-confirm-modal",
  props: {
    confirmModal: {
      type: Object
    }
  },
  methods: {
    setModal() {
      this.$emit('setModal', {student: {}, isOpen: false})
    },
    setIsUsed() {
      this.$emit('setIsUsed', {studentId: this.confirmModal.student.studentId, isUsed: false})
    },

    /**
     * 사용여부 변경
     */
    changeStatus() {
      if (this.confirmModal.student.isUsed) {
        this.setStudentNoUsed()
      } else {
        this.deleteStudent()
      }
    },

    /**
     * 미사용으로 변경
     * @returns {Promise<void>}
     */
    async setStudentNoUsed() {
      try {
        const res = await this.$axios({
          method: 'PATCH',
          url: `/clazzStudents/${this.confirmModal.student.studentId}/not-used`
        })

        this.setIsUsed()
        this.setModal()
      } catch (e) {
        this.$log.error(e)
      }
    },

    /**
     * 삭제
     */
    deleteStudent() {
      try {
        this.$axios({
          method: 'DELETE',
          url: `/clazzStudents/${this.confirmModal.student.studentId}`
        })

        this.$emit('deleteStudent', this.confirmModal.student.studentId)
        this.setModal()
      } catch (e) {
        this.$log.error(e)
      }
    }
  }
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
    .btn-line{
      border: 1px solid rgba(66,103,178,0.4);
    }
  }
}
</style>