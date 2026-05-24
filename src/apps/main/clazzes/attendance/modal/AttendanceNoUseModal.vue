<template>
  <div class="hi-modal-common" style="display: block;">
    <div
        class="modal__dim"
        @click="setIsShowAttendanceNoUseModal(false)"
    />
    <div class="modal__layer attendance-alert-modal">
      <div class="modal__header">
        <h2 class="heading">출결 알리기</h2>
      </div>
      <div class="modal__content body">
        <p>해당 클래스에서는 <br>출결 알리기를 사용하지 않습니다,</p>
      </div>
      <div class="modal__footer">
        <div class="btn-wrap">
          <button
              class="hi-btn btn-mb"
              @click="setIsShowAttendanceNoUseModal(false)"
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
  name: "attendance-no-use-modal",
  methods: {
    ...mapMutations('storeClazzes', {
      setIsShowAttendanceNoUseModal: 'setIsShowAttendanceNoUseModal'
    })
  }
}
</script>

<style lang="scss" scoped>
.attendance-alert-modal {
  .modal__header {
    .heading {
      line-height: 150%;
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