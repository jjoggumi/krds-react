<template>
  <div class="hitalk-messagebox">
    <textarea
        placeholder="메시지를 입력해주세요."
        maxlength="3000"
        v-html="sendMessageItem.textContent"
        @input="setTextContent($event)"
    />

    <upload-image
        v-if="sendMessageItem.fileContentType === 'PHOTO' || sendMessageItem.fileContentType === 'PHOTOMULTI'"
        :files.sync="sendMessageItem.fileContent"
        :is-uploading.sync="option.loading.imagePacks"
        :loading-obj="option.loading"
        :unusedFiles="unusedFiles"
    />

    <upload-file
        v-if="sendMessageItem.fileContentType === 'FILE'"
        :files.sync="sendMessageItem.fileContent"
        :is-uploading.sync="option.loading.docs"
        :loading-obj="option.loading"
        :unusedFiles="unusedFiles"
    />

    <upload-video
        v-if="sendMessageItem.fileContentType === 'VIDEO'"
        :files.sync="sendMessageItem.fileContent"
        :is-uploading.sync="option.loading.video"
        :loading-obj="option.loading"
        :unusedFiles="unusedFiles"
    />

    <div class="upload-tab">
      <button class="btn-image" @click="setUploadFileType('PHOTO')">사진</button>
      <button class="btn-video" @click="setUploadFileType('VIDEO')">동영상</button>
      <button class="btn-file" @click="setUploadFileType('FILE')">파일</button>
    </div>

  </div>
</template>

<script>
import UploadImage from "@/apps/hitalk/components/popup/components/common/upload/Image";
import UploadFile from "@/apps/hitalk/components/popup/components/common/upload/File";
import UploadVideo from "@/apps/hitalk/components/popup/components/common/upload/Video";
import {mapMutations, mapState} from "vuex";

export default {
  name: "person-group-popup-content",
  components: {
    UploadImage,
    UploadFile,
    UploadVideo
  },
  props: {
    option: Object,
    unusedFiles: {
      type: Array
    }
  },
  computed: {
    ...mapState('storeHitalk', ['sendMessageItem']),
  },
  methods: {
    ...mapMutations('storeHitalk', ['setSendMessageItem']),

    /**
     * 업로드할 첨부파일 타입 set
     * @param fileType
     * @returns {boolean}
     */
    setUploadFileType(fileType) {
      if (
          !this.sendMessageItem.fileContentType.includes(fileType) &&
          this.sendMessageItem.fileContent.length > 0
      ) {
        this.$hiClass.alert('첨부파일은 1개만 추가 가능합니다.')
        return false
      }

      switch (fileType) {
        case 'PHOTO': {
          if (this.option.loading.docs || this.option.loading.video) {
            this.$hiClass.alert('첨부파일은 1개만 추가 가능합니다.')
            return false
          }
          break
        }
        case 'FILE': {
          if (this.option.loading.imagePacks || this.option.loading.video) {
            this.$hiClass.alert('첨부파일은 1개만 추가 가능합니다.')
            return false
          }
          break
        }
        case 'VIDEO': {
          if (this.option.loading.imagePacks || this.option.loading.docs) {
            this.$hiClass.alert('첨부파일은 1개만 추가 가능합니다.')
            return false
          }
          break
        }
        default: {
          return false
        }
      }

      this.setSendMessageItem({fileContentType: fileType})
    },

    /**
     * 키보드 이벤트: 입력된 값 set
     * @param e
     */
    setTextContent(e) {
      this.setSendMessageItem({textContent: e.target.value})
    }
  }
}
</script>

<style lang="scss" scoped>
  .hitalk-messagebox {
    display: flex;
    flex-direction: column;
    height: 450px;
    background-color: #F8F9FC;
    text-align: left;
    border-radius: 8px;
    border: 0 !important;
    textarea {
      flex-grow: 1;
      width: 100%;
      background-color: transparent;
      color: #333;
      font-size: 16px;
      line-height: 1.5;
      padding: 20px;
      border: 0;
    }
    .messagebox__top {
      padding: 15px 5px;
      border-bottom: 1px solid #eaeaea;
      margin: 0 15px;
      input[type=radio] {
        + label {
          line-height: 36px;
        }
      }
      label {
        &:not(:first-of-type) {
          margin-left: 28px;
        }
      }
      .set-date-wrap {
        margin-left: 14px;
      }
    }
    .upload-file-wrap {
      overflow-y: auto;
      height: 80px;
      background-color: #F4F5F9;
      padding: 12px 12px 0;
      border: 0;
      border-top: 1px solid #eaeaea;
      border-bottom: 1px solid #eaeaea;
      max-width: 470px;
      ::v-deep .after-upload {
        .file-drag-area-wrap {
          margin: 0 0 12px;
        }
        .attaching-img-wrap {
          ul {
            li {
              width: 54px;
              height: 54px;
              margin: 0 8px 24px;
              + li {
                width: 54px;
                height: 54px;
                margin: 0 8px 24px;
              }
            }
          }
          li {
            width: 54px;
            height: 54px;
            margin: 0 8px 24px;
          }
          .loading-infinite-scroll-wrap {
            width: 54px;
            height: 54px;
          }
        }
        .attaching-img {
          width: 54px;
          height: 54px;
        }
        .file-drag-area-wrap {
          .file-drag-area {
            background-color: #fff;
          }
        }
        .attaching-file {
          background-color: #DDE4F2;
        }
      }  
    }
    .upload-tab {
      margin-top: auto;
      padding: 17px 19px;
      button {
        color: #888;
        font-size: 14px;
        font-weight: 500;
        line-height: 20px;
        margin-right: 18px;
        &::before {
          content: "";
          display: inline-block;
          width: 20px;
          height: 20px;
          background: url("~@/assets/img/icon/icons_hitalk.png") 0 0/200px auto no-repeat;
          margin-right: 4px;
          margin-top: -2px;
          vertical-align: middle;
        }
        &.is-active {
          color: #333;
        }
      }
      .btn-image {
        &::before {
          background-position: 0 -395px;
        }
        &.is-active {
          &::before {
            background-position: 0 -415px;
          }
        }
      }
      .btn-video {
        &::before {
          background-position: -20px -395px;
        }
        &.is-active {
          &::before {
            background-position: -20px -415px;
          }
        }
      }
      .btn-file {
        &::before {
          background-position: -40px -395px;
        }
        &.is-active {
          &::before {
            background-position: -40px -415px;
          }
        }
      }
    }
  }
</style>