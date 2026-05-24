<!--
@File(Method): Comment.vue
@Description: 게시글 상세 댓글  > 첨부파일 영역
@Modified: 2025-03-07 - #72798 목록 내 스크롤바 영역 개선 요청 - 스크롤바 공통화
-->
<template>
  <div>
  <!-- 업로드한 첨부파일 -->
    <div class="attachment custom-scr" v-if="files.length > 0">
      <div class="btn-file" v-if="docFiles.length > 0">
        <template v-for="(file, index) of docFiles">
          <span v-if="file.fileOriginalPath" 
            class="file" 
            :key="`${file.fileOriginalPath}-${index}`">
              <span>{{ file.fileName }}</span>
              <button class="btn-delete" @click.stop="removeA(file)"></button>
          </span>

          <div v-else 
            class="attaching-img" 
            :key="`progress-${index}`"
          >
            <div class="img-wrap-loading">
              <div class="icon"></div>
            </div>
            <div class="img-loading-txt" style="text-align: center">
              <p>{{ file.progress }}%</p>
            </div>
          </div>
        </template>
      </div>

      <div class="photo" v-if="imageFiles.length > 0">
        <template v-for="(file, index) of imageFiles">
          <span v-if="file.fileOriginalPath && (!Object.keys(file).includes('progress') || file.progress === 100)"
                class="img"
                :key="`${file.fileOriginalPath}-${index}`"
                @click="editImages(index)"
          >
            <img :src="getThumbnail(file)" alt="">
            <button class="btn-delete-2" @click.stop="removeA(file)"></button>
          </span>

          <div v-else
               class="attaching-img"
               :key="`progress-${index}`"
          >
            <div class="img-wrap-loading">
              <div class="icon"></div>
            </div>
            <div class="img-loading-txt" style="text-align: center">
              <p>{{ file.progress }}%</p>
            </div>
          </div>
        </template>
      </div>

      <div class="video" v-if="videoFiles.length > 0">
        <template v-for="(file, index) of videoFiles">
          <span v-if="file.fileOriginalPath"
            class="thumb"
            :key="`${file.fileOriginalPath}-${index}`">
              <button></button>
              <button class="btn-delete-2" @click.stop="removeA(file)"></button>
          </span>

          <div v-else
              class="attaching-img"
              :key="`progress-${index}`"
          >
            <div class="img-wrap-loading">
              <div class="icon"></div>
            </div>
            <div class="img-loading-txt" style="text-align: center">
              <p>{{ file.progress }}%</p>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import {eventBus} from "@/main";
import {mapActions, mapState} from "vuex";

export default {
  name: "comment-write-file-wrap",
  props: {
    files: {
      type: Array
    },
    imageEditorKey: {
      type: String
    },
    unusedFiles: {
      type: Array
    }
  },
  computed: {
    ...mapState({
      imagePackResize: 'imagePackResize'
    }),
    fileData: {
      get() {
        return this.files
      },
      set(val) {
        this.$emit('update:files', val)
      }
    },
    imageFiles() {
      return this.fileData.filter(v => v.fileContentType.startsWith('image'))
    },
    videoFiles() {
      return this.fileData.filter(v => v.fileContentType.startsWith('video'))
    },
    docFiles() {
      return this.fileData.filter(v => v.fileContentType.startsWith('image') === false && v.fileContentType.startsWith('video') === false)
    }
  },
  methods: {
    ...mapActions('storeImageEditor', {
      openImageEditor: 'openImageEditor'
    }),
    async editImages(targetIdx) {
      await this.openImageEditor({
        uploadedFiles: this.imageFiles,
        inputFiles: null,
        imageLimitCount: 10,
        componentKey: this.imageEditorKey,
        targetIdx: targetIdx,
        parentComponent: 'commentFileWrap'
      })
    },
    removeA(file) {
      this.unusedFiles.push(file)
      this.fileData = this.fileData.filter(item => {
        return item.fileOriginalPath !== file.fileOriginalPath
      })
    },
    getThumbnail(file) {
      if (file.fileThumbnailPath){
        return file.fileThumbnailPath
      } else {
        return file.fileOriginalPath.replace('//download', '//image')
            .concat(`?width=${this.imagePackResize.THUMBNAIL_MAX_WIDTH}`)
            .concat(`&height=${this.imagePackResize.THUMBNAIL_MAX_HEIGHT}`)
      }
    }
  }
}
</script>

<style scoped>

</style>