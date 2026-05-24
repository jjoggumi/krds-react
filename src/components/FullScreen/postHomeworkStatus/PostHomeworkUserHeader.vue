<template>
  <div class="member-status__heading">
    <strong class="heading">과제 제출현황</strong>
    <span class="deadline">제출기한 : {{ timestampEndToStr }}</span>
    <button
      class="hi-btn btn-line btn-md"
      @click="downloadAll"
    >
      과제 전체 다운로드
    </button>
  </div>
</template>

<script>
import jszip from "jszip";
import { saveAs } from "file-saver";
import axios from "axios";
import {mapGetters, mapMutations, mapState} from "vuex";

export default {
  name: "post-homework-user-header",
  props: {
    postHomeworkUsers: {
      type: Array
    },
    timestampEnd: {
      type: Number
    }
  },
  data() {
    return {
    }
  },
  computed: {
    ...mapState({
      isFileLoading: 'isFileLoading',
      curClazzHomework: 'curClazzHomework'
    }),
    ...mapGetters({
      getSubscribeClassNameByClassId: 'getSubscribeClassNameByClassId'
    }),
    timestampEndToStr() {
      const timestampEnd = this.timestampEnd

      if (timestampEnd) {
        let dateFormat = 'M월 D일 (ddd) H시 m분'
        const nowYear = this.$moment().year()
        const paramYear = this.$moment(timestampEnd).year()

        if (nowYear - paramYear > 0)
          dateFormat = `YYYY[년] ${dateFormat}`

        return this.$moment(timestampEnd).format(dateFormat) + ' 까지'
      } else {
        return '마감일 없음'
      }
    },
    postHomeworkUsersSubmitList() {
      return this.postHomeworkUsers.filter(d => d.workId)
    },
    existsFilesSubmitList() {
      return this.postHomeworkUsersSubmitList
        .filter(d => d.files ? d.files.length > 0 : false)
        .map(d => {
          d.filePrefix = this.getFilePrefix(d)
          return d
        })
    },
    totalFileCount() {
      let totalFileCount = 0
      this.existsFilesSubmitList.map(d => {
        totalFileCount = totalFileCount + d.files.length
      })
      return totalFileCount
    },
    totalFileSize() {
      // IE 브라우저가 아닌 경우 다운로드 파일 용량 체크하지 않음
      if (!this.$comn.isIE()) return 0

      let totalFileSize = 0
      this.existsFilesSubmitList.map(d => {
        d.files.map(f => {
          totalFileSize += Number(f.fileSize)
        })
      })
      return totalFileSize
    },
    isOverDownloadFileSize() {
      const maxFileSize = 100 * 1024 * 1024 // 100mb
      return this.$comn.isIE() && this.totalFileSize > maxFileSize
    },
    curClazzHomeworkStatus() {
      return this.curClazzHomework.status
    },
    postItem() {
      return this.curClazzHomeworkStatus.postItem
    },
    classId() {
      return this.postItem.parentId ||
        (
          this.postItem.parent
            ? this.postItem.parent.currentId
            : null
        )
    },
    className() {
      return this.getSubscribeClassNameByClassId(this.classId)
    }
  },
  methods: {
    ...mapMutations({
      setIsFileLoading: 'setIsFileLoading'
    }),

    /**
     * 과제 전체 다운로드 zip
     */
    downloadAll() {
      if (this.isFileLoading) return false

      if (this.totalFileCount === 0) {
        this.$hiClass.alert('제출된 과제 파일이 없습니다.', 'info')
        return false
      }
      if (this.isOverDownloadFileSize) {
        this.$hiClass.alert(
          '해당 브라우저(internet explorer)의 보안 정책에 따라 대용량 파일을 다운로드할 수 없습니다. Chrome 사용 또는 개별 다운로드하시길 바랍니다.',
          'warning'
        )
        return false
      }

      this.setIsFileLoading(true)

      try {
        const zip = new jszip()
        const archiveFileName = this.getArchiveFileName()
        const fileNames = []
        const requests = []
        let fileCount = 0

        this.existsFilesSubmitList.map(d => {
          const filePrefix = d.filePrefix

          d.files.forEach(file => {
            const url = file.fileTranscodePath || file.fileOriginalPath
            const fileName = filePrefix + file.fileName
            const whatwgFetch = require('whatwg-fetch')
            const request = this.$comn.isIE()
              ? whatwgFetch.fetch(url)
              : fetch(url)

            fileNames.push(fileName)
            requests.push(request)
          })
        })

        axios.all(requests)
          .then(responses => {
            // zip 파일 압축
            responses.map((res, index) => {
              const fileName = fileNames[index]
              const blob = res.blob()

              // 과제 파일명
              zip.file(fileName, blob)
              fileCount++

              if (this.totalFileCount === fileCount) {
                zip
                  .generateAsync({ type: 'blob' })
                  .then(function (blob) {
                    // 과제 모음 zip 파일명
                    saveAs(blob, archiveFileName)
                  })
                  .finally(() => {
                    this.setIsFileLoading(false)
                  })
              }
            })
          })
          .catch(() => {
            this.setIsFileLoading(false)
            this.$hiClass.alert('과제 전체 다운로드를 실패하였습니다.', 'error')
          })


      } catch (err) {
        this.$log.warn(`${this.$options.name} downloadAll() err => `, err)
        const message =
          '업로드에 실패한 파일이 포함되어 있어 과제 전체 다운로드가 불가합니다. 개별 파일로 확인해 주시거나 해당 구성원이 다시 제출할 수 있도록 안내 부탁드립니다.'
        this.$hiClass.alert(message, 'warning')
        this.setIsFileLoading(false)
      }
    },
    /**
     * 과제 전체 다운로드 파일 이름
     */
    getArchiveFileName() {
      const className = this.className
      const posted = this.postItem.posted
      const dateStr = this.$moment(posted).format('M[월] D[일]')
      let fileName = ''

      try {
        fileName += `${className}`
        fileName += `_${dateStr}`
        fileName += `_과제`
      } catch (error) {
        this.$log.debug(error)
        fileName = `과제_전체_다운로드`
      }
      if (this.$comn.isIE()) fileName += `.zip`
      return fileName
    },

    /**
     * 제출 과제별 파일이름 prefix
     */
    getFilePrefix(postHomeworkUser) {
      const className = this.className
      const writeUser = postHomeworkUser.writeUser
      const isStudent = writeUser.userType === 'STUDENT'

      let filePrefix = ''
      try {
        // 클래스명
        filePrefix += `${className}`

        if (isStudent)
          filePrefix += `_${writeUser.memberClassNumber}번`

        // 탈퇴자인 경우
        filePrefix += `_${writeUser.memberChildName || '탈퇴회원'}`

        // 학부모인 경우
        if (writeUser.memberChildName && !isStudent)
          filePrefix += `_학부모`
      } catch (error) {
        this.$log.debug(error)
      }

      return filePrefix ? filePrefix + '_' : ''
    },

  }
}
</script>

<style scoped>

</style>