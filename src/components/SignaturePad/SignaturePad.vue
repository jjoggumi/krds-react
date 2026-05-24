<template>
  <img
    v-if="signaturePopupImageUpload.dataUrl"
    :src="signaturePopupImageUpload.dataUrl"
    :width="width"
    :height="height"
    alt=""
  >
  <canvas
    v-else
    :width="width"
    :height="height"
    :style="customStyle"
  ></canvas>
</template>

<script>

// vue-signature-pad : 20201126 ie 11 호환되지 않음. vanilla library 로 대체

import * as blobUtil from 'blob-util'

import {eventBus} from "@/main";
import {mapFields} from 'vuex-map-fields'
import {mapGetters} from 'vuex'

export default {
  name: "signature-pad",
  components: {},
  props: {
    width: {
      type: String,
      default() {
        return `300px`
      }
    },
    height: {
      type: String,
      default() {
        return `200px`
      }
    },
    options: {
      type: Object,
      default() {
        return {}
      }
    },
    customStyle: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      signaturePad: null,
      userId: null,
      userSign: {}
    }
  },
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    }),
    ...mapFields(['signaturePopupImageUpload', 'isDimLoading']),
    isApprovalSign() {
      return this.$route.params.signType === this.CONSTANTS.USER_SIGN.APPROVAL_SIGN
    }
  },
  created() {
    this.userId = localStorage.uuid

    if (!this.userId) {
      window.close()
    }
  },
  mounted() {
    eventBus.$on('save-signature', () => {
      this.save()
    })

    this.init()
  },
  destroyed() {
    eventBus.$off('save-signature')
  },
  methods: {
    async init() {
      let canvas = document.querySelector("canvas");
      // eslint-disable-next-line no-undef
      this.signaturePad = await new SignaturePad(canvas, this.options)
    },

    base64MimeType(encoded) {
      let result = null

      if (typeof encoded !== 'string') return result
      let mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)
      if (mime && mime.length) result = mime[1]

      return result
    },

    clear() {
      this.signaturePad.clear()
    },

    async save() {
      this.isDimLoading = true
      const messageObj = {
        userSign: '잘못된 서명입니다. 다시 한번 확인해주세요.',
        approvalSign: '잘못된 서명입니다. 다시 한번 확인해주세요.',
        approvalSignImage: '서명이미지 크기가 너무 작습니다.<br>다시 한번 확인해주세요.',
        saveComplete: '저장되었습니다.',
        saveError: '저장되지 않았습니다. 다시 시도해 주세요.',
      }
      let dataUrl = this.signaturePad.toDataURL()
      let isDrawingSign = true
      let errMessage = this.isApprovalSign ? messageObj.approvalSign : messageObj.userSign
      let mimeType = ''
      let extension = 'png'

      if (this.isApprovalSign && this.signaturePopupImageUpload.dataUrl) {
        dataUrl = this.signaturePopupImageUpload.dataUrl
        errMessage = messageObj.approvalSignImage
        isDrawingSign = false
      }

      this.$log.debug(`dataUrl = > `, dataUrl)

      try {

        if (dataUrl) {
          this.$log.debug(`dataUrl.length => `, dataUrl.length)

          // mimeType = base64Data.split(';')[0].split(':')[1]
          mimeType = await this.base64MimeType(dataUrl)
          extension = mimeType.split('/')[1]

          this.$log.debug(`mimeType => `, mimeType)
          this.$log.debug(`extension => `, extension)
        }

        // 사용자가 그린 canvas 의 서명만 유효성 체크함
        if (!dataUrl || (isDrawingSign && dataUrl.length < 3000)) {
          this.$hiClass.alert(errMessage)
          return false
        }
        //this.$store.commit('setIsLoading', true)

        const fileName = `${this.userId}-signature-${this.$moment().format('YYYYMMDDHHmmss')}.${extension}`

        // create blob
        const blobData = blobUtil.dataURLToBlob(dataUrl)

        let formData = new FormData()
        formData.append('file', blobData, fileName)

        // file upload
        await this.upload(formData)

        // this.$store.commit('setIsLoading', false)

        await this.$hiClass.alert(messageObj.saveComplete)
        this.clear()
        window.close()

      } catch (e) {
        // this.$store.commit('setIsLoading', false)
        this.$hiClass.alert(messageObj.saveError)
      } finally {
        this.isDimLoading = false
      }
    },

    async upload(formData) {
      const multipartUrl = `${process.env.VUE_APP_BASE_FILE_URI}/multipart`
      const userSignType = this.isApprovalSign ? 'userApprovalSign' : 'userSign'
      const userSignUpdateUrl = `/${userSignType}/${this.userId}`

      try {
        const response = await this.$axios.post(multipartUrl, formData, { headers: { 'Content-Type': 'multipart/form-data' } })

        this.userSign = {}
        this.userSign[`${userSignType}ImagePath`] = response.data._links.original.href

        // 변경된 서명 저장
        await this.$hiClass.userSign.update(this.userSign, userSignUpdateUrl)

        // 부모창 있을 경우 갱신
        try {
          if (window.opener) {
            if (this.isApprovalSign) {
              window.opener.doReloadSign('doReloadSign', 'approvalsign')
              window.opener.postMessage(`changeUserApprovalSign|${this.userSign.userApprovalSignImagePath}`, '*')

            } else {
              window.opener.doReloadSign('doReloadSign', 'esign')
              window.opener.postMessage(`changeUserSign|${this.userSign.userSignImagePath}`, '*')
            }
          }
        } catch (e) {
          this.$log.warn(e)
        }
      } catch (e) {
        this.$log.debug(this.$options.name, 'upload', error)
      }
    },

  }
}
</script>

<style scoped></style>