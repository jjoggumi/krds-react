<template>
  <div class="worksheet-header">
    <h1 class="title">우리학교 양식 등록하기</h1>
    <div class="left">
    </div>
    <div class="right">
      <template v-if="isShowTemporaryButton">
        <button
          class="btn-bg-w2"
          @click="onClickButton(CONSTANTS.BUTTON.TEMPORARY)"
        >임시저장</button>
      </template>
      <template v-if="isShowCompleteButton">
        <button
          class="btn-bg-c"
          @click="onClickButton(CONSTANTS.BUTTON.COMPLETE)"
        >최종저장</button>
      </template>
      <button
        class="btn-close"
        @click="onClickButton(CONSTANTS.BUTTON.CLOSE)"
      ></button>
    </div>
  </div>
</template>

<script>
import {mapGetters, mapActions} from "vuex";
import {mapFields} from "vuex-map-fields";

export default {
  name: "worksheet-header",
  props: {
    mode: {
      type: String
    },
    sheetStatus: {
      type: String
    }
  },
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
    }),
    ...mapFields('storeWorksheet',{
      currentIframe: 'currentIframe'
    }),
    isCreateMode() {
      return this.mode === 'create'
    },
    isEditMode() {
      return this.mode === 'edit'
    },
    isPreviewMode() {
      return this.mode === 'preview'
    },
    isShowTemporaryButton() {
      return this.sheetStatus === 'TEMP'
    },
    isShowCompleteButton() {
      return this.isEditMode && this.isEditableWorksheet
    },
    isEditableWorksheet() {
      return this.sheetStatus === 'TEMP'
    }
  },
  methods: {
    ...mapActions('storeWorksheet', {
      sendMessageToFrame: "sendMessageToFrame"
    }),
    onClickButton(btnType) {
      const payload = {
        to: this.currentIframe,
        message: {
          name: '',
          dispatchEvent: 'click',
          sheetStatus: this.sheetStatus
        },
      }

      switch (btnType) {
        case this.CONSTANTS.BUTTON.TEMPORARY:
          payload.message.name = 'btnTempSaveWorksheet'
          break
        case this.CONSTANTS.BUTTON.COMPLETE:
          payload.message.name = 'btnSaveWorksheet'
          break
        case this.CONSTANTS.BUTTON.CLOSE:
          payload.message.name = 'btnClose'
          break
        default:
          this.$hiClass.alert('정의되지 않은 버튼입니다.')
      }

      switch (btnType) {
        case this.CONSTANTS.BUTTON.COMPLETE: {
          const confirmObj = {
            message: `최종저장 하시면 신청서 양식 수정이 불가합니다.<br>최종 저장 하시겠습니까?`,
            icon: 'warning'
          }
          this.$hiClass.confirm(confirmObj.message, confirmObj.icon)
            .then(() => this.sendMessageToFrame(payload))
          break
        }
        default:
          this.sendMessageToFrame(payload)
      }

    },
  }
}
</script>

<style scoped>

</style>