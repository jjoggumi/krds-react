<template>
  <!-- 파일 모아보기 첨부파일 -->
  <div>
    <ModalProgressBar v-if="isMultiFileLoading" :total="downloadContext.groups" :current="downloadContext.downloaded">
      <template v-slot:title>
        <h2 class="heading">압축파일 생성 중입니다.</h2>
      </template>
    </ModalProgressBar>
    <div
      v-for="(file, idx) of computedFiles"
      :key="`${file.seq}-${idx}-file__item`"
      class="board-file__item"
    >
      <input
        type="checkbox"
        :id="`${file.seq}_${idx}`"
        :value="file.seq"
        v-model="checkBoxes"
        @change="onChangeValue(file.seq, idx)"
      >
      <label :for="`${file.seq}_${idx}`"></label>
      <div
        class="file"
        role="button"
        @click="openAttachFilesViewer({
              item: file,
              contentType: file.fileContentType
            })"
      >
        <i :class="[ getIconFileCode(file.fileName) ]"></i>
        <span class="name">{{ getFileNameNoExtension(file.fileName) }}</span>
        <span class="extension">{{ '.' + getFileExtension(file.fileName) }}</span>
      </div>
      <button
        v-if="file.postId"
        class="btn-view"
        @click="openPostDetailByPostId({ postId: file.postId })"
      >
        <div class="tooltip"><span>게시글 보기</span></div>
      </button>
    </div>
  </div>
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
  name: "main-body-clazzes-body-class-board-clazz-post-files-mode-file",
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
  components: {
    ModalProgressBar
  },
  data() {
    return {
      iconFileCodes: [
        // 그 외 확장자
        {
          extensions: [],
          contentTypes: [],
          code: 'etc',
        },
        // 압축파일
        {
          extensions: ['zip', 'rar', '7z', 'alz'],
          contentTypes: [],
          code: 'zip',
        },
        // 한글
        {
          extensions: ['hwp', 'hwpx'],
          contentTypes: [],
          code: 'hancom',
        },
        // txt
        {
          extensions: ['txt'],
          contentTypes: [],
          code: 'txt',
        },
        // pdf
        {
          extensions: ['pdf'],
          contentTypes: [],
          code: 'pdf',
        },
        // excel
        {
          extensions: ['xls', 'xlsx'],
          contentTypes: [],
          code: 'excel',
        },
        // word
        {
          extensions: ['doc', 'docx'],
          contentTypes: [],
          code: 'word',
        },
        // ppt
        {
          extensions: ['ppt', 'pptx'],
          contentTypes: [],
          code: 'ppt',
        },
      ],
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
      curClassPostFileSearchQuery: 'curClassPostFileSearchQuery',
      curClazzesPostFiles: 'curClazzesPostFiles',
      isMultiFileLoading: 'isMultiFileLoading'
    }),
    ...mapState('storeBoard', {
      boardCheckBoxes: 'boardCheckBoxes'
    }),
    mode() {
      return this.curClassPostFileTabCode
    },
    computedFiles() {
      return this.files.map(f => {
        f.dateTime = this.$moment(f.insertedTimestamp).format('YYYYMMDD')
        return f
      })
    },
  },
  watch: {
    'checkBoxes.length'(val) {
      eventBus.$emit('set-checked-count', val)
    },
    boardCheckBoxes(v) {
      this.checkBoxes = v
    },
    checkBoxes(v) {
      this.$store.state.storeBoard.boardCheckBoxes = v
      let count = 0
      let filesCount = this.files.length
      this.files.map(file => {
        this.checkBoxes.map(check => {
          if (file.seq === check) {
            count = count + 1
          }
        })
      })
      if (count === filesCount) {
        this.$emit('dateCheck', {date: this.dateCheck, check: true, files: this.files})
      } else {
        this.$emit('dateCheck', {date: this.dateCheck, check: false, files: this.files})
      }
    },
    files(v) {
      if (this.checkFlag || this.$store.state.storeBoard.boardAllCheck) {
        let checkedList = []
        v.map(file => {
          checkedList.push(file.seq)
        })
        this.checkBoxes = [...new Set([...this.checkBoxes, ...checkedList])]
      }
    }
  },
  mounted() {
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
      setInfiniteScroll: 'setInfiniteScroll',
      setCurClassPostFileSearchQueryAttr: 'setCurClassPostFileSearchQueryAttr',
      setIsMultiFileLoading: 'setIsMultiFileLoading',
    }),
    ...mapActions({
      download: 'download',
      openPostDetailByPostId: 'openPostDetailByPostId',
      openAttachFilesViewer: 'openAttachFilesViewer',
    }),
    onChangeValue(v, idx) {
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
    isFirstFileDateTime(fileSeq, fileDateTime) {
      const dateTimeFiles = this.computedFiles.filter(f => f.dateTime === fileDateTime)
      if (dateTimeFiles.length === 0) return false

      const foundIndex = dateTimeFiles.findIndex(f => f.seq === fileSeq)
      return foundIndex === 0
    },
    getFileDateStr(timestamp) {
      return this.$moment(timestamp).format('YYYY년 MM월 DD일')
    },
    getFileNameNoExtension(fileName) {
      return this.removeExtension(fileName)
    },
    getFileExtension(fileName) {
      return fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length) || fileName
    },
    getIconFileCode(fileName) {
      const extension = this.getFileExtension(fileName)
      const foundCode = this.iconFileCodes.find(o => {
        // TODO: 2022-09-26 확장자 or contentType 검색
        return o.extensions.includes(extension)
      })
      const iconFileCode = foundCode ? foundCode.code : 'etc'
      return `icon-file-${iconFileCode}`
    },
    removeExtension(fileName) {
      return fileName.substring(0, fileName.lastIndexOf('.')) || fileName
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
            const responses = await Promise.all(groups[i].map(file => 
                axios({
                method: 'get',
                url: file.fileTranscodePath || file.fileOriginalPath,
                responseType: 'blob',
                headers: '',
                fileName: file.fileName
              })))

            const zip = new jszip()
            responses.forEach((res, index) => {
              zip.file(
                this.getFileName(res.config.fileName || groups[i][index].fileName),
                new Blob([res.data], { type: 'application/octet-stream' }))
            })

            this.downloadContext.downloaded++
            saveAs(await zip.generateAsync({ type: 'blob' }),
                  `파일일괄다운로드_${this.$moment().format('YYYYMMDD_HHmmss')}${groups.length === 1 ? '' : `(${i + 1})`}`)
          }
          this.$hiClass.alert('파일 일괄 다운로드가 완료되었습니다.', 'success')
          this.setIsMultiFileLoading(false)
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
.board-file__item {
  position: relative;
  min-height: 60px;
  border-bottom: 1px solid #ececec;
  padding: 18px 70px 18px 8px;
  &:first-child { border-top: 1px solid #ececec; }
  input[type=checkbox]:checked + label { position: static; }
  input[type=checkbox]:checked + label::after {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    display: block;
    width: 100%;
    height: 100%;
    background-color: rgba(71, 120, 222, 0.08);
  }
  .file { 
    position: relative;
    display: inline-block;
    width: calc(100% - 30px);
    &:hover span { color: var(--primary); }
    span {
      color: #222;
      font-size: 15px;
      font-weight: 400;
      margin: 0;
      vertical-align: middle;
    }
    .name {
      overflow: hidden;
      text-overflow: ellipsis;
      display: inline-block;
      max-width: 85%;
      white-space: nowrap;
      vertical-align: middle;
      line-height: 1.5;
    }
    i { margin: 0 4px; }
  }
  .btn-view {
    overflow: visible;
    position: absolute;
    top: 50%;
    right: 8px;
    width: 50px;
    height: 32px;
    background-color: #fff;
    border: 1px solid #d6d6d6;
    border-radius: 32px;
    margin-top: -16px;
    &::after {
      content: "";
      position: absolute;
      left: 50%;
      top: 50%;
      display: block;
      width: 18px;
      height: 18px;
      background: url("~@/assets/img/icon/icons_board.png") -60px -60px/200px auto no-repeat;
      transform: translate(-50%, -50%);
      -webkit-transform: translate(-50%, -50%);
    }
    .tooltip {
      z-index: 1000;
      left: 50%;
      bottom: calc(100% + 8px);
      transform: translateX(-50%);
      -webkit-transform: translateX(-50%);
      &::before {
        left: 50%;
        transform: translateX(-50%);
        -webkit-transform: translateX(-50%);
      }
      span { font-size: 12px; }
    }
    &:hover .tooltip { display: block; }
  }
  &.loading { 
    position: relative;
    padding: 20px 8px;
    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 18px;
      width: 100%;
      height: 20px;
      background-color: #f5f5f5;
    } 
  }
}

</style>