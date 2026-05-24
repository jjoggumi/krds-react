<template>
  <fragment>
    <button
      v-if="!isReadonly && emptyFiles"
      :class="[
        btnClass,
        { dis: isUploading }
      ]"
      :disabled="isUploading || isReadonly"
      @click="$refs.uploadFile.clickAttach()"
    ></button>

    <upload-file
      :key="`survey-upload-file-${$vnode.key}`"
      ref="uploadFile"
      :accept="compatibleAccept"
      :allowed-types="compatibleTypes"
      :disabled="isReadonly"
      :error-message="message.inCompatible"
      :multiple="false"
      @set-uploaded-files="setUploadedFiles"
    />

  </fragment>
</template>

<script>
import {mapActions, mapGetters} from "vuex";
import UploadFile from "@/components/Upload/UploadFile";

export default {
  name: "survey-upload",
  components: {UploadFile},
  props: {
    files: {
      type: Array
    },
    isUpload: {
      type: Boolean
    },
    isReadonly: {
      type: Boolean,
      default() {
        return false
      }
    },
    btnClass: {
      type: String,
      default() {
        return 'btn-upload'
      }
    },
    fileCategory: {
      type: String,
      default() {
        // IMAGE: 이미지, VIDEO: 동영상, URL:주소, SIGN: 사인
        return 'IMAGE'
      }
    },
    fileTargetType: {
      type: String,
      default() {
        // SURVEY: 설문, QUESTION:질문, ITEM:선택지, ANSWER:응답
        return null
      }
    },
    fileAlign: {
      type: String,
      default() {
        // LEFT, RIGHT, CENTER
        return null
      }
    }
  },
  data() {
    return {
      option: {
        fileMb: 1024 * 1024,
      },
      message: {
        inCompatible: `이미지만 첨부하실 수 있습니다.`
      },
      compatibleAccept: 'image/gif, image/jpeg, image/png',
      isReplaceFile: false,
    }
  },
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    }),
    fileData: {
      get() {
        return this.files
      },
      set(val) {
        this.$emit('update:files', val)
      }
    },
    isUploading: {
      get() {
        return this.isUpload
      },
      set(val) {
        this.$emit('update:isUpload', val)
      }
    },
    inCompatibleExtensions() {
      return this.$store.state.inCompatibleExtensions || []
    },
    compatibleTypes() {
      return ['image']
    },
    emptyFiles() {
      return this.fileData.length === 0
    }
  },
  mounted() {
  },
  methods: {
    ...mapActions({
      // increaseFileUploadCount: 'increaseFileUploadCount'
    }),
    // // 완료 후 파일업로드 위치 GA 호출
    // this.increaseFileUploadCount({ uploadLocation: this.CONSTANTS.UPLOAD_LOCATION.CLASS })

    setUploadedFiles(uploadedFiles) {
      if (this.isReplaceFile) {
        this.fileData.splice(0)
        this.isReplaceFile = false
      }

      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i]
        const findFileIdx = this.fileData.findIndex(uploadedFile => uploadedFile.fileName === file.fileName)

        let newFile = {}
        if (this.fileTargetType) {
          newFile = {
            ...file,
            fileCategory: this.fileCategory,
            fileTargetType: this.fileTargetType,
            fileAlign: this.fileAlign,
            // TODO: sortNo 체크
            originalFileId: null,
            sortNo: i + 1
          }
        } else {
          newFile = file
        }

        if (findFileIdx > -1) {
          this.files.splice(findFileIdx, 1, newFile)
        } else {
          this.files.push(newFile)
        }
      }
    },

    changeFile() {
      this.$refs.uploadFile.clickAttach()
      this.isReplaceFile = true
    },

  }
}
</script>

<style scoped>

</style>