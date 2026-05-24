<!--
@File(Method): ConfirmDialog.vue
@Author: -
@Date Created: -
@Description: 재 로그인 안내 모달
@Modified: #70365 로그인 만료로 인한 재 로그인 안내 모달이 모바일 디바이스에서 안보이는 현상 대응
-->

<template>
  <div
      class="modal normal-modal hitalk-alert-modal"
      style="display: block;"
  >
    <div class="modal-cont-wrap" :class="{'modal-position': isOtherUse, neis: isNeis}" style="margin-top: -115px;margin-left: -50%px;">
      <div class="modal-cont boundary-box-386" style="overflow-x: hidden;">
        <div class="modal-cont-inner">
          <div class="icon-title-wrap">
            <div class="text-wrap">
              <span v-html="getTitle"></span><br v-if="isDescription">
              <p v-if="!isOtherUse" v-html="getDescription"></p>
              <p v-else><span class="other" v-html="getDescription"></span></p>

              <span v-if="imageFile">
                <button class="edit-btn-type01" @click="editImages"><i></i>편집</button>
                <img
                    :src="getImage"
                    alt="미리보기"
                    style="object-fit:contain;width:auto;max-width:100%;height:auto;max-height:320px;border: 1px solid #f8f9fc;"
                />
              </span>
            </div>
          </div>
          
          <div v-if="!isOtherUse" class="btn-wrap">
            <button v-if="!isAlert" class="modal-close-btn btn-bg-w2" @click="cancelConfirm">
              {{ $t("chat.cancel") }}
            </button>
            <button class="btn-bg-c" @click="submitConfirm">{{ submitConfirmName }}</button>
          </div>
          <div v-else class="btn-other-wrap">
            <div class="btn-group">
              <button v-if="!isAlert" class="btn-attendance-cancel" @click="cancelConfirm">
              {{ $t("chat.cancel") }}
              </button>
              <button class="btn-attendance-submit" @click="submitConfirm">{{ submitConfirmName }}</button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapActions} from "vuex";

export default {
  name: "ConfirmDialog",
  props: {
    title: String,
    description: String,
    imageFile: Object,
    isOtherUse: {
      type: Boolean,
      default() {
        return false
      }
    },
    isNeis: {
      type: Boolean,
      default: false
    },
    isAlert: {
      type: Boolean,
      default() {
        return false
      }
    },
    confirmButtonName: String
  },
  computed: {
    getTitle: function () {
      return this.title.split('\n').join('<br />')
    },
    getDescription: function () {
      return this.description.split('\n').join('<br />')
    },
    isDescription: function () {
      return this.description.trim() !== '' || this.description !== null
    },
    submitConfirmName: function () {
      return this.confirmButtonName || this.$t("chat.confirm")
    },
    getImage: function () {
      return this.imageFile.fileOriginalPath
    }
  },
  methods: {
    ...mapActions('storeImageEditor', {
      openImageEditor: 'openImageEditor'
    }),
    submitConfirm: function () {
      this.$emit("closeConfirmDialog", true)
    },
    cancelConfirm: function () {
      this.$emit("closeConfirmDialog", false)
    },
    editImages: async function () {
      await this.openImageEditor({
        uploadedFiles: [this.imageFile],
        inputFiles: null,
        imageLimitCount: 1,
        componentKey: 'hitalk-chat-layout',
        targetIdx: 0,
        parentComponent: 'hitalkConfirmDialog'
      })

      this.$emit("closeConfirmDialogNoAction")
    }
  }
}
</script>

<style scoped>
.modal-position {
    transform: translateX(-50%);
}
.text-wrap p .other {
  color: #888;
  text-align: center;
  font-family: var(--font-body);
  font-size: 15px;
  font-style: normal;
  font-weight: 400;
  line-height: 150%; /* 22.5px */
  letter-spacing: -0.2px;
}
.btn-other-wrap {
  padding: 27px 0 30px 0;
}
.btn-attendance-cancel {
    width: 140px !important;
    height: 44px !important;
    border-radius: 24px !important;
    border: 1px solid rgba(66, 103, 178, 0.40);
    color: var(--primary);
    margin: 0px 4px;
}
.btn-attendance-submit {
    width: 140px !important;
    height: 44px !important;
    border-radius: 24px !important;
    border: 1px solid var(--primary);
    background: var(--primary);
    color:#fff;
    margin: 0px 4px;
}
.neis {
    position: absolute !important;
    overflow: hidden !important;
    height: auto !important;
}
.hitalk-alert-modal.modal .modal-cont .icon-title-wrap .text-wrap {
    color: #000;
    font-size: 20px;
    font-weight: 700;
    line-height: 1.5;
    margin: 0;
}
.edit-btn-type01 {
  position: absolute;
  margin-right: 10px;
  margin-top: 10px;
  right: 30px;
}
@media screen and (max-width: 640px) {
  .modal .modal-cont-wrap{
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
  }
  
}
</style>
