<template>
  <fragment>
    <button
      class="btn-bg-c"
      @click="upload(null)"
    >
      서명 이미지 등록
    </button>
    <input
      type="file"
      ref="attach"
      @change="upload"
      accept="image/jpeg,image/png"
      style="display: none"
    >
  </fragment>
</template>

<script>
import {mapFields} from 'vuex-map-fields'

export default {
  name: "signature-popup-image-upload",
  computed: {
    ...mapFields({
      signaturePopupImageUpload: 'signaturePopupImageUpload'
    }),
    compatibleExtensions() {
      return ['png', 'jpg', 'jpeg']
    },
  },
  created() {
    this.signaturePopupImageUpload.file = null
    this.signaturePopupImageUpload.dataUrl = null
  },
  beforeDestroy() {
    this.signaturePopupImageUpload.file = null
    this.signaturePopupImageUpload.dataUrl = null
  },
  methods: {
    async upload(e) {
      if (e === null) {
        this.$refs.attach.click()
      } else {
        let isChk = true

        try {
          const files = e.target.files || e.dataTransfer.files

          for (let i = 0; i < files.length; i++) {
            this.$log.warn(`files:[i]`, files[i])

            // 미지원 파일확장자 체크
            if (files[i] && files[i].name) {
              const extension = this.$comn.split(files[i].name, '.')
              if (!this.isCompatibleExtensions(extension))
                return false
            } else {
              return false
            }
            // -- 미지원 파일확장자 체크

            if (isChk) {
              // 이미지일 경우 업로드 전 리사이즈 처리 추가
              const convertedFile = await this.$hiClass.getConvertedFile(files[i])
              this.signaturePopupImageUpload.file = convertedFile
              await this.readUrl(convertedFile)
              this.$emit('hide-tips')
            }
          }

        } catch (e) {
          this.$log.warn(e)
        } finally {
          // 첨부파일 분석 완료되었으므로 input value 삭제
          this.$refs.attach.value = null
        }

      }
    },

    isCompatibleExtensions(extension) {
      const extensionLowerCase = extension ? extension.toLowerCase() : extension
      if (this.compatibleExtensions.includes(extensionLowerCase)) {
        return true
      } else {
        this.$hiClass.alert(`미지원하는 파일의 형식 : ${extensionLowerCase}`)
        this.$refs.attach.value = null
        // this.$emit('setLoading', false)
        return false
      }
    },

    readUrl(file) {
      if (file) {
        let reader = new FileReader()
        reader.onload = e => {
          this.signaturePopupImageUpload.dataUrl = e.target.result
        }
        reader.readAsDataURL(file)
      }

    }

  }
}
</script>

<style scoped>

</style>