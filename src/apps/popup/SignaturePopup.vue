<template>
  <div id="wrap">
    <div class="window-popup esign-register-modal">
      <div class="modal-cont-wrap">
        <div class="modal-cont">
          <div class="modal-cont-inner">
            <div class="modal-title-wrap">
              <div class="title">{{ title }}</div>
            </div>
            <div class="esign-cont-wrap">
              <div class="esign-box-wrap">
                <div class="btn-wrap">

                  <signature-popup-image-upload
                    v-if="isApprovalSign"
                    @hide-tips="hideTips"
                  />

                  <button class="btn-bg-w" @click="clearSignature">초기화</button>
                </div>
                <div
                  :class="{
                    hide: !option.isTips
                  }"
                  class="esign-box"
                >
                  <div class="esign-box-inner">
                    <!-- 서명 영역 -->
                    <Signature
                      :key="componentKey"
                      :option="option"
                      @hide-tips="hideTips"
                    ></Signature>
                    <!-- // 서명 영역 -->
                  </div>
<!--                  <span class="line"></span> -->
                  <button type="button" class="cursor"></button>
                </div>
              </div>

              <p v-if="isApprovalSign" class="title">하이클래스 결재서명에 대한 동의</p>
              <p v-else class="title">하이클래스 전자 서명에 대한 동의</p>

              <ul>
                <li>- 학교에서 전자서명을 포함한 게시물을 발행한 경우, 최초 1회 전자서명을 등록해야 합니다.</li>
                <li>- 본인의 서명을 등록해야 하며, 등록된 전자서명은 실제 서명과 동일한 효력을 갖게 됩니다.</li>

                <li v-if="isApprovalSign">- 결재서명은 관리자 확인용으로만 사용하며 이외의 용도로는 활용되지 않습니다.</li>
                <li v-else>- 서명은 제출자 확인용으로만 사용하며 이외의 용도로는 활용되지 않습니다.</li>

                <li>- 기타 자세한 내용은 이용약관 및 개인정보처리방침에 따라 동의합니다</li>
              </ul>
            </div>
            <div class="btn-wrap">
              <div class="btn-group">
                <button
                  :class="{
                    dis: option.isTips
                  }"
                  class="btn-bg-c"
                  :disabled="option.isTips"
                  @click="saveSignature"
                >동의하고 서명 저장하기</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>

</template>

<script>

import Signature from '@/components/Signature/Signature.vue'

import { eventBus } from '@/main'
import {mapGetters} from 'vuex'
import SignaturePopupImageUpload from '@/apps/popup/SignaturePopupImageUpload'
import {mapFields} from 'vuex-map-fields'

export default {
  name: 'SignaturePopup',
  components: {
    SignaturePopupImageUpload,
    Signature
  },
  data() {
    return {
      option: {
        width: 352,
        height: 150,
        isTips: true
      },
      componentKey: 0
    }
  },
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    }),
    ...mapFields({
      signaturePopupImageUpload: 'signaturePopupImageUpload'
    }),
    signType() {
      return this.$route.params.signType
    },
    title() {
      let title = '전자서명 등록'

      switch (this.signType) {
        case this.CONSTANTS.USER_SIGN.APPROVAL_SIGN:
          title = '결재서명 등록'
          break

        default:
          title = '전자서명 등록'
      }

      return title
    },
    isApprovalSign() {
      return this.signType === this.CONSTANTS.USER_SIGN.APPROVAL_SIGN
    }
  },
  created() {
    this.$log.debug(`this.$route.params.signType: `, this.$route.params.signType)
  },
  mounted() {
    document.body.style = 'overflow: hidden;'
  },
  methods: {
    hideTips() {
      this.option.isTips = false
    },
    showTips() {
      this.option.isTips = true
    },
    clearSignature() {
      this.showTips()

      if (this.isApprovalSign) {
        this.signaturePopupImageUpload.file = null
        this.signaturePopupImageUpload.dataUrl = null
      }

      this.componentKey++
    },
    saveSignature() {
      eventBus.$emit('save-signature')
    }
  }
}
</script>

<style scoped></style>
