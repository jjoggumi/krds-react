<template>
  <div class="modal common-modal class-editor-modal">
    <div class="modal-cont-wrap">
      <div class="modal-cont boundary-box">
        <div class="modal-cont-inner">
          <div class="modal-title-wrap">
            <div class="title">묶음 사진 관리 <span>(<span class="ft-orange">{{ imagePackFiles.length }}장</span>)</span></div>
            <p>묶음 사진 목록은 임시저장 또는 발송완료하셔야 저장됩니다.</p>
            <div
              class="modal-close-btn modal-close-icon"
              @click="handleNoteboardImagePack(false)"
            ></div>
          </div>
          <div class="contents-wrap"> <!-- 20211025 pt-00 삭제 -->
            <div class="input-box-wrap input-cont">
              <!-- 묶음 사진 올리기 -->
              <clazzes-images-upload
                :files.sync="model.files"
                :isUploading.sync="option.isUploading"
                :addedFiles="addedFiles"
                :parentComponent="'noteBoard'"
              />
            </div>
          </div>
          <div class="btn-wrap">
            <!-- 20211025 btn-group 삭제-->
            <button
              class="btn-bg-c"
              @click="handleNoteboardImagePack(false)"
            >닫기</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import {mapFields} from "vuex-map-fields";
import ClazzesImagesUpload from "@/components/Upload/Clazzes/ClazzesImagesUpload";

export default {
  name: 'note-board-image-pack',
  components: {ClazzesImagesUpload},
  props: {
    model: {
      type: Object,
      required: true
    },
    option: {
      type: Object,
      required: true
    },
    addedFiles: {
      type: Array
    }
  },
  data() {
    return {

    }
  },
  computed: {
    ...mapFields([
      'noteBoardImagePack'
    ]),
    imagePackFiles() {
      return this.model.files.filter(f => {
        return f.fileContentType && f.fileContentType.startsWith('image') && f.fileFlag === 'IMAGE_PACK'
      }) || []
    },
  },
  mounted() {
  },
  beforeDestroy() {
  },
  methods: {
    handleNoteboardImagePack(toggleValue) {
      this.noteBoardImagePack.isOpen = toggleValue || false
    },
  }
}
</script>

<style scoped>
  .modal.common-modal.class-editor-modal {
    display: block
  }
</style>
