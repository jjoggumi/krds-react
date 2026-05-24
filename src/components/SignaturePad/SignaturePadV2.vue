<template>
  <div>
    <canvas
      ref="canvas"
      :id="`canvas-${question.questionId}`"
      :width="width"
      :height="height"
      :style="customStyle"
    ></canvas>
    <p v-if="signingMessage" class="status">서명 하는 중</p>
    <p v-if="signatureDataUrl === '유효하지 않은 서명'" class="status error">유효하지 않은 서명</p>
    <p v-if="signatureDataUrl === '정상'" class="status success">정상</p>
  </div>
</template>

<script>
import * as blobUtil from 'blob-util'

import {mapGetters, mapMutations} from 'vuex'

export default {
  name: "signature-pad-v2",
  components: {},
  props: {
    // files.sync
    files: {
      type: Array
    },
    isRequired: {
      type: Boolean,
      default() {
        return true
      }
    },
    question: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      isTips: true,
      isSigning: false,
      isChanged: false,
      signaturePad: null,
      signaturePadOptions: {},
      signatureDataUrl: null,
      width: 0,
      height: 0,
      validateMessage: '',
    }
  },
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    }),
    isSimulation() {
      return this.$store.state.storeSurvey.isSimulation
    },
    tipsImagePath() {
      return this.isTips ? '/files/img/icon/esign.png' : ''
    },
    signatureImagePath() {
      const validSignature = this.files.find(file => !file.isDel)
      return validSignature && validSignature.fileOriginalPath
        ? validSignature.fileOriginalPath
        : ''
    },
    background() {
      const url = `url('${this.signatureImagePath || this.tipsImagePath}')`
      const backgroundSize = `${this.width}px ${this.height}px`
      return `${url} ${backgroundSize} / ${backgroundSize}`
    },
    customStyle() {
      return {
        background: this.background
      }
    },
    signingMessage() {
      return this.isSigning ? '서명 하는 중' : ''
    },
    fileData: {
      get() {
        return this.files
      },
      set(val) {
        this.$emit('update:files', val)
      }
    }
  },
  watch: {
    signatureDataUrl(val) {
      if (!val) {
        this.validateMessage = ''
        return false
      }

      this.validateMessage = val.length > 5000
        ? '정상'
        : '유효하지 않은 서명'
    },
  },
  mounted() {
    this.signaturePadOptions.onBegin = this.onBegin
    this.signaturePadOptions.onEnd = this.onEnd

    this.init()
    window.addEventListener('resize', this.resizeSignatureCanvas)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeSignatureCanvas)
  },
  methods: {
    ...mapMutations({
      setIsLoading: 'setIsLoading'
    }),
    onBegin() {
      this.$log.debug('=== Begin ===');
      this.isSigning = true
      this.isTips = false
      this.isChanged = true
      this.validateMessage = ''
      // 기존 파일 삭제 flag 처리
      if (this.signatureImagePath) {
        this.fileDelete()
      }
    },
    onEnd() {
      this.$log.debug('=== End ===');
      this.isSigning = false
      this.signatureDataUrl = this.signaturePad.toDataURL()
      this.$emit('set-is-retry-sign', true)
    },
    async init() {
      this.isChanged = false
      const refCanvas = this.$refs.canvas
      this.signaturePad = await new SignaturePad(refCanvas, this.signaturePadOptions)
      this.resizeSignatureCanvas()
      setTimeout(()=>{
        this.clearSignature()
      })
    },

    base64MimeType(encoded) {
      let result = null
      if (typeof encoded !== 'string') {
        return result
      }
      const mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)
      if (mime && mime.length) {
        result = mime[1]
      }
      return result
    },

    clearSignature() {
      this.resizeSignatureCanvas()
      this.signatureDataUrl = null
      this.isTips = true
    },
    saveSignature(id) {
      return new Promise(async (resolve, reject) => {
        /**
         * 현재 정보 그대로 저장
         */
        // 1. 변경사항이 없는 경우
        if (!this.isChanged) {
          return resolve(true)
        }
        // 2. 서명을 삭제하였지만 필수 응답 항목이 아닌 경우
        if (this.isChanged && !this.signatureDataUrl && !this.isRequired) {
          return resolve(true)
        }

        const messageObj = {
          signature: '잘못된 서명입니다. 다시 한번 확인해주세요.',
          signature2: '서명이미지 크기가 너무 작습니다.<br>다시 한번 확인해주세요.',
          saveComplete: '저장되었습니다.',
          saveError: '저장되지 않았습니다. 다시 시도해 주세요.',
        }
        const dataUrl = this.signaturePad.toDataURL()
        let errMessage = messageObj.signature
        let mimeType = ''
        let extension = 'png'

        this.$log.debug(`dataUrl = > `, dataUrl)
          try {

            if (dataUrl) {
              this.$log.debug(`dataUrl.length => `, dataUrl.length)
              mimeType = this.base64MimeType(dataUrl)
              extension = mimeType.split('/')[1]

              this.$log.debug(`mimeType => `, mimeType)
              this.$log.debug(`extension => `, extension)
            }

            // 사용자가 그린 canvas 의 서명만 유효성 체크함
            if (!dataUrl || dataUrl.length < 5000) {
              this.$hiClass.alert(errMessage)
              return reject(false)
            }
            const fileName = `signature-${this.$moment().format('YYYYMMDDHHmmss')}-${id}.${extension}`

            this.setIsLoading(true)

            // create blob
            const blobData = blobUtil.dataURLToBlob(dataUrl)

            const formData = new FormData()
            formData.append('file', blobData, fileName)
            // file upload
            let fileDataSet
            if(this.isSimulation){
              fileDataSet = {
                fileTargetType: "ANSWER",
                fileAlign: "LEFT",
                fileCategory: "SIGN",
                fileContentType: "image/png",
                fileOriginalPath: dataUrl
              }
            }else{
              fileDataSet = await this.fileUpload(formData)
            }
            this.$log.debug(`signature fileDataSet => `, fileDataSet)

            this.fileData.push(fileDataSet)

            this.setIsLoading(false)
            // this.$hiClass.alert(messageObj.saveComplete)
            resolve(true)

          } catch (e) {
            this.$log.error(e)
            this.setIsLoading(false)
            this.$hiClass.alert(messageObj.saveError)
            reject(false)
          }
      })
    },

    fileUpload(formData) {
      return new Promise((resolve, reject) => {
        this.$axios({
          method: 'post',
          url: this.$apiFileUrl,
          data: formData,
          headers: { 'Content-Type': 'multipart/form-data'}
        })
          .then(async res => {
            this.$log.debug(this.$options.name, 'upload', res)
            this.$log.debug(`signature fileOriginalPath => `, res.data._links.original.href)
            const data = res.data
            const fileName = data.filename
            const fileContentType = data.contentType
            const fileSize = data.size
            const fileOriginalPath = data._links.original.href

            const uploadedFile = {
              fileName,
              fileContentType,
              fileSize,
              fileOriginalPath,
            }
            resolve(uploadedFile)
          })
          .catch(error => {
            this.$log.debug(this.$options.name, 'upload', error)
            reject(false)
          })
      })
    },

    fileDelete() {
      this.fileData.forEach(file => {
        if(this.isSimulation){
          file.fileOriginalPath = null
        }
        file.isDel = true
      })
    },

    // 서명 영역 리사이즈
    resizeSignatureCanvas() {
      const ratio =  Math.max(window.devicePixelRatio || 1, 1)

      // const canvas = document.querySelector("canvas")
      const canvas = document.getElementById(`canvas-${this.question.questionId}`)
      canvas.width = canvas.offsetWidth * ratio
      canvas.height = canvas.offsetHeight * ratio
      canvas.getContext("2d").scale(ratio, ratio)

      this.width = canvas.width
      this.height = canvas.height
      this.signaturePad.clear() // otherwise isEmpty() might return incorrect value
    },

  }
}
</script>

<style scoped></style>

