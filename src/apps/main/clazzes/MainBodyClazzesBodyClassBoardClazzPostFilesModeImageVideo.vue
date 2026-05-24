<!--
@File(Method): MainBodyClazzesBodyClassBoardClazzPostFilesModeImageVideo.vue
@Description: 파일 모아보기 리스트 (이미지, 동영상)
@Modified: css scoped 적용
-->
<template>
  <!-- 파일 모아보기 이미지, 동영상 -->
  <ul class="group-photo-video">
    <ModalProgressBar v-if='isMultiFileLoading && downloadContext.groups > 0' :total="downloadContext.groups" :current="downloadContext.downloaded">
      <template v-slot:title>
        <h2 class="heading">압축파일 생성 중입니다.</h2>
      </template>
    </ModalProgressBar>
    <li
      v-for="(file, idx) of files"
      :key="`${file.currentId}-${idx}`"
      role="button"
    >
      <input
        type="checkbox"
        ref="chk"
        :id="`${file.seq}_${idx}`"
        data-check-group-item="album-check-group"
        :value="file.seq"
        v-model="checkBoxes"
        @change="onChangeValue(file.seq)"
      >
      <label :for="`${file.seq}_${idx}`"></label>
      <div
        :class="[thumbnailClass]"
        @click="imageVideoView(idx)"
      >
        <img v-if="getImagePath(file)" :src="getImagePath(file)" alt="">
      </div>
      <div class="name">{{ file.fileName }}</div>
    </li>
  </ul>
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import {eventBus} from "@/main";
import jszip from "jszip";
import axios from "axios";
import {isEmpty} from "lodash";
import ModalProgressBar from "@/components/Modal/ModalProgressBar.vue";

const DOWNLOAD_GROUP_SIZE = 1000

export default {
  name: "main-body-clazzes-body-class-board-clazz-post-files-mode-image-video",
  components: {
    ModalProgressBar
  },
  props: {
    files: {
      type: Array,
      required: true
    },
    dateCheck: {
      type: String,
      default: "",
      required: true
    },
    checkFlag: {
      type: Boolean
    }
  },
  data() {
    return {
      checkBoxes: [],
      fileNameObj: {},
      downloadContext: {
        groups: 0,
        downloaded: 0
      }
    }
  },
  computed: {
    ...mapState({
      curClassPostFileTabCode: 'curClassPostFileTabCode',
      imagePackResize: 'imagePackResize',
      curClazzesPostFiles: 'curClazzesPostFiles',
      isMultiFileLoading: 'isMultiFileLoading'
    }),
    ...mapState('storeBoard', {
      boardCheckBoxes: 'boardCheckBoxes'
    }),
    mode() {
      return this.curClassPostFileTabCode
    },
    thumbnailClass() {
      let thumbnailClass
      switch (this.mode) {
        case 'image': {
          thumbnailClass = 'photo'
          break
        }
        case 'video': {
          thumbnailClass = 'video'
          break
        }
        case 'file': {
          thumbnailClass = 'file'
          break
        }
      }
      return thumbnailClass
    },
  },
  watch: {
    'checkBoxes.length'(val) {
      eventBus.$emit('set-checked-count', val)
    },
    boardCheckBoxes(v) {
      this.checkBoxes = v
    },
    checkBoxes() {
      let count = 0
      let filesCount = this.files.length
      this.files.map(file => {
        this.checkBoxes.map(check => {
          if (file.seq === check) {
            count = count + 1
          }
        })
      })
      if(count === filesCount) {
        this.$emit('dateCheck', {date: this.dateCheck, check: true, files: this.files})
      } else {
        this.$emit('dateCheck', {date: this.dateCheck, check: false, files: this.files})
      }
    },
    files(v) {
      if(this.checkFlag || this.$store.state.storeBoard.boardAllCheck) {
        let checkedList = []
        v.map(file => {
          checkedList.push(file.seq)
        })
        this.checkBoxes = [...new Set([...this.checkBoxes, ...checkedList])]
      }
    }
  },
  mounted() {
    this.$store.state.storeBoard.boardFiles = this.files
    eventBus.$on('download-checked-files', () => {
      this.downloadCheckedFiles()
    })
    eventBus.$on('clear-check-boxes', () => {
      this.clearCheckBoxes()
    })
  },
  beforeDestroy() {
    // this.setCurClassPostFileSearchQueryAttr({
    //   keyword: null
    // })
    eventBus.$emit('set-checked-count', 0)
    eventBus.$off('download-checked-files')
    eventBus.$off('clear-check-boxes')
  },
  methods: {
    ...mapMutations({
      setCurClassPostFileSearchQueryAttr: 'setCurClassPostFileSearchQueryAttr',
      setIsMultiFileLoading: 'setIsMultiFileLoading'
    }),
    ...mapActions({
      download: 'download',
      openAttachFilesViewer: 'openAttachFilesViewer',
    }),
    onChangeValue(v) {
      let checkValue = this.checkBoxes.filter(() => {
        return this.checkBoxes.includes(v)
      })
      if (isEmpty(checkValue)) {
        let removeValue = this.$store.state.storeBoard.boardCheckBoxes.filter(check => {
          return check !== v
        })
        this.$store.state.storeBoard.boardCheckBoxes = removeValue
      } else {
        this.$store.state.storeBoard.boardCheckBoxes = this.checkBoxes
      }
    },
    onClickDate() {
      let list = []
      this.files.map(file => {
        list.push(file.seq)
      })
      this.checkBoxes = list
    },
    isVideoFile(file) {
      return file && file.fileContentType && file.fileContentType.includes('video/')
    },
    isAnimatedImage(file) {
      return file && file.fileContentType && file.fileContentType.includes('image/gif')
    },
    imageVideoView(index) {
      this.openAttachFilesViewer({
        items: this.files,
        index: index,
        post: {
          postType: "BOARD"
        },
        contentType: this.files[index].fileContentType
      })
    },
    getImagePath(file) {
      if (this.isVideoFile(file)) return file.fileThumbnailPath || null
      else if (this.isAnimatedImage(file)) return file.fileOriginalPath

      return this.getThumbnail(file)
    },
    getThumbnail(file) {
      const replaceNewResizePolicy = () => {
        // 썸네일 주소 생성
        return file.fileOriginalPath.replace('//download', '//image')
          .concat(`?width=${this.imagePackResize.THUMBNAIL_MAX_WIDTH}`)
          .concat(`&height=${this.imagePackResize.THUMBNAIL_MAX_HEIGHT}`)
      }
      let thumbnailPath = file.fileThumbnailPath
      if (thumbnailPath === null) {
        return replaceNewResizePolicy()
      } else {
        try {
          const query = thumbnailPath.split('?')[1]
          const parsedQuery = this.$qs.parse(query)
          const lessNewResizePolicyWidth = parseInt(parsedQuery.width || '0', 10) <= parseInt(this.imagePackResize.THUMBNAIL_MAX_WIDTH, 10)
          const lessNewResizePolicyHeight = parseInt(parsedQuery.height || '0', 10) <= parseInt(this.imagePackResize.THUMBNAIL_MAX_HEIGHT, 10)
          if (lessNewResizePolicyWidth || lessNewResizePolicyHeight)
            thumbnailPath = replaceNewResizePolicy()
        } catch (e) {
          thumbnailPath = replaceNewResizePolicy()
        }
      }
      return thumbnailPath
    },
    /**
     * 압축파일 내 중복 파일명이 있을 경우 파일명 변경
     * @param fileName
     * @return {string}
     */
    getFileName(fileName) {
      try {
        if (this.fileNameObj[fileName] === undefined)
          this.fileNameObj[fileName] = 0
        else
          this.fileNameObj[fileName] = ++this.fileNameObj[fileName]
      } catch (e) {
        this.$log.warn(e)
      }
      const dupleCount = this.fileNameObj[fileName]

      if (dupleCount > 0) {
        if (fileName.includes('.')) {
          const fileNameNoExtension = fileName.replace(/\.[^/\\.]+$/, "")
          const fileExtension = this.$comn.getFileExtensionName(fileName)
          fileName = `${fileNameNoExtension}_${this.$comn.generateHash()}.${fileExtension}`
        } else {
          fileName = `${fileName}_${this.$comn.generateHash()}`
        }
      }

      return fileName
    },
    clearCheckBoxes() {
      this.checkBoxes.splice(0)
    },
    async downloadCheckedFiles() {
      this.$log.warn(this.$options.name, 'downloadCheckedFiles() this.checkBoxes', this.checkBoxes)

      if (this.isMultiFileLoading) return false
      let filesList = this.curClazzesPostFiles
      const files = filesList
        .map(file => {
          if (this.checkBoxes.includes(file.seq))
            return file
        })
        .filter(file => file !== undefined)
      this.$log.warn(this.$options.name, 'downloadCheckedFiles() files', files)
      this.setIsMultiFileLoading(true)
      try {
        if (files.length === 1) {
          const file = files[0]
          const payload = {
            src: file.fileTranscodePath || file.fileOriginalPath,
            name: file.fileName
          }
          await this.download(payload)
            .then(() => this.$hiClass.alert('파일 다운로드가 완료되었습니다.', 'success'))
            .catch(() => this.$hiClass.alert('파일 다운로드를 실패하였습니다.', 'error'))
            .finally(() => {
              this.setIsMultiFileLoading(false)
              this.clearCheckBoxes()
            })

        } else if (files.length > 1) {
          const groups = [...Array(Math.ceil(files.length / DOWNLOAD_GROUP_SIZE))].map((_, i) => {
            return files.slice(i * DOWNLOAD_GROUP_SIZE, (i + 1) * DOWNLOAD_GROUP_SIZE)
          })
          this.downloadContext.groups = groups.length
          this.downloadContext.downloaded = 0
          for (let i = 0; i < groups.length; i++) {
            this.downloadContext.downloaded = i + 1
            await this.$nextTick();
            let responses = [];
            const CHUNK_SIZE = 50;
            for (let j = 0; j < groups[i].length; j += CHUNK_SIZE) {
              const chunk = groups[i].slice(j, j + CHUNK_SIZE);
              const chunkResponses = await Promise.all(chunk.map(file => 
                axios({
                method: 'get',
                url: file.fileTranscodePath || file.fileOriginalPath,
                responseType: 'blob',
                headers: '',
                fileName: file.fileName
              })))
              chunkResponses.forEach(response => responses.push(response));
            }
            await this.$nextTick();

            const zip = new jszip()
            responses.forEach((res, index) => {
              zip.file(
                this.getFileName(res.config.fileName || groups[i][index].fileName),
                new Blob([res.data], { type: 'application/octet-stream' }))
            })

            saveAs(await zip.generateAsync({ type: 'blob' }),
                  `파일일괄다운로드_${this.$moment().format('YYYYMMDD_HHmmss')}${groups.length === 1 ? '' : `(${i + 1})`}`)
          }
          this.$hiClass.alert('파일 일괄 다운로드가 완료되었습니다.', 'success')
          this.setIsMultiFileLoading(false)
          this.downloadContext.groups = 0
          this.clearCheckBoxes()
        } else {
          this.setIsMultiFileLoading(false)
          this.clearCheckBoxes()
          this.$hiClass.alert('선택된 파일이 없습니다.', 'warning')
        }

      } catch (err) {
        this.$log.debug(this.$options.name, `downloadArchiveFile() err => `, err)
        this.setIsMultiFileLoading(false)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.group-photo-video { 
  font-size: 0;
  margin: -3px -3px 0 !important;

  li {
    position: relative;
    display: inline-block;
    width: calc(25% - 6px);
    margin: 3px;
    .name {
      display: none;
      position: absolute;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      color: #fff;
      font-size: 12px;
      line-height: 30px;
      padding: 0 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
      white-space: nowrap;
    }
    &:hover .name {
      display: block;
    }
  }
  label {
    z-index: 2;
    position: absolute;
    left: 10px;
    top: 10px;
  }
  input[type=checkbox]:checked ~ .video::before,
  input[type=checkbox]:checked ~ .photo::before {
    content: "";
    z-index: 1;
    position: absolute;
    left: 0;
    top: 0;
    display: block;
    width: calc(100% - 8px);
    height: calc(100% - 8px);
    border: 4px solid var(--primary);
  }
  .video,
  .photo {
    overflow: hidden;
    position: relative;
    display: inline-block;
    width: 100%;
    padding-top: 100%;
    background-color: #f5f5f5;
    vertical-align: top;
    img {
      position: absolute;
      left: 50%;
      top: 50%;
      width: auto;
      min-width: 100%;
      max-width: none;
      height: 100%;
      transform: translate(-50%,-50%);
      object-fit: cover;
    }
  }
  &.loading li {
    overflow: hidden;
    position: relative;
    height: 150px;
    background-color: #f5f5f5;
    &::after {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      display: inline-block;
      width: 40%;
      height: 100%;
      background-color: rgba(255,255,255,.3);
      animation: loading 1.5s linear infinite forwards;
    }
  }
  .video{
    &::after {
      content: "";
      position: absolute;
      left: 50%;
      top: 50%;
      width: 38px;
      height: 38px;
      background: url("~@/assets/img/icon/icon_play.svg") no-repeat;
      background-size: cover;
      transform: translate(-50%,-50%);
      -webkit-transform: translate(-50%,-50%);
    }
    &:hover::after { opacity: .7; }
  }
}
</style>