<template>
  <article class="hi-board">
    <div class="board__header">
      <div class="board__info homework">
        <span class="name">
          {{ getUserNameStr(selectedItem.writeUser) }}
        </span>
        <span
          class="status"
          :class="{ complete: existsWorkId }"
        >
          {{ statusTitle }}
        </span>
        <button
          class="btn-download-homework"
          title="과제 첨부파일 다운로드"
          :disabled="!existsFiles"
          @click="downloadArchiveFile"
        ></button>
      </div>
    </div>

    <!-- 제출한 과제가 있는 경우 content -->
    <post-homework-user-detail-content
      v-if="existsWorkId"
      :key="`post-homework-user-detail-content-${existsWorkId}`"
      :post-homework-user="selectedPostHomeworkUser"
    />

    <!-- 제출한 과제가 없음 -->
    <div v-else class="board__content">
      <div class="nodata">
        <p>{{ noDataTitle }}</p>
        <!-- TODO: 알림 보내기 삭제. 푸시 정책 정의 후 개발 예정
        <button class="hi-btn btn-line-lgray btn-md">구성원에게 과제 알림 보내기</button>
        -->
      </div>
    </div>

    <!-- 제출한 과제가 있는 경우 footer -->
    <post-homework-user-detail-footer
      v-if="existsWorkId"
      :key="`post-homework-user-detail-footer-${existsWorkId}`"
      :post-homework-user="selectedPostHomeworkUser"
    />

  </article>

</template>

<script>
import {mapGetters, mapMutations, mapState} from "vuex";
import jszip from "jszip";
import axios from "axios";

import PostHomeworkUserDetailContent from "@/components/FullScreen/postHomeworkStatus/PostHomeworkUserDetailContent";
import PostHomeworkUserDetailFooter from "@/components/FullScreen/postHomeworkStatus/PostHomeworkUserDetailFooter";

export default {
  name: "post-homework-user-detail",
  components: {PostHomeworkUserDetailFooter, PostHomeworkUserDetailContent},
  props: {
    postHomeworkUsers: {
      type: Array
    },
    selectedItem: {
      type: Object
    },
  },
  data() {
    return {
      selectedPostHomeworkUser: {}
    }
  },
  computed: {
    ...mapState({
      isFileLoading: 'isFileLoading',
      curClazzHomework: 'curClazzHomework'
    }),
    ...mapGetters({
      getUserNameByWriteUser: 'getUserNameByWriteUser',
      getUserNameByWriteUserHomeWork: 'getUserNameByWriteUserHomeWork',
      getSubscribeClassNameByClassId: 'getSubscribeClassNameByClassId'
    }),
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
    submittedCount() {
      return this.postHomeworkUsers.filter(u => u.workId).length
    },
    existsWorkId() {
      return this.selectedItem.workId
    },
    existsFiles() {
      return this.selectedPostHomeworkUser && this.selectedPostHomeworkUser.files
        ? this.selectedPostHomeworkUser.files.length > 0
        : false
    },
    notExistsSubmit() {
      return this.submittedCount === 0
    },
    isStudent() {
      return this.writeUser.userType === 'STUDENT'
    },
    statusTitle() {
      if (this.existsWorkId)
        return this.getSendDateToStr(this.selectedItem)
      else
        return '미제출'
    },
    noDataTitle() {
      let noDataTitle = this.notExistsSubmit ? '제출된 과제가 없습니다.' : ''

      if (!this.existsWorkId)
        noDataTitle = '아직 과제를 제출하지 않았습니다.'

      return noDataTitle
    },
    writeUser() {
      return this.selectedPostHomeworkUser.writeUser
    },
  },
  mounted() {
    if (this.selectedItem.workId) this.getPostHomeworkUser()
  },
  methods: {
    ...mapMutations({
      setIsFileLoading: 'setIsFileLoading'
    }),
    getUserNameStr(writeUser) {
      return this.getUserNameByWriteUserHomeWork({ writeUser, isClassPost: true })
    },
    getSendDateToStr(postHomeworkUser) {
      const timestamp = postHomeworkUser.updatedTimestamp || postHomeworkUser.insertedTimestamp
      // 'M월 D일 (ddd) H시 m분' : 24시간으로 표시
      return timestamp ? this.$moment(timestamp).format('MM.DD HH:mm') + ' 제출' : '미제출'
    },
    getPostHomeworkUser() {
      const workId = this.selectedItem.workId
      const requestUrl = `${this.$apiUrl}/postHomeworkUsers/${workId}`
      this.$hiClass.postHomeworkUsers.read(requestUrl)
        .then(res => {
          this.selectedPostHomeworkUser = res.data

          if(!this.selectedItem.writeUser.memberClassNumber === false) {
            this.selectedPostHomeworkUser.writeUser = {
              ...this.selectedPostHomeworkUser.writeUser,
              memberClassNumber: this.selectedItem.writeUser.memberClassNumber
            }
          }
        })
        .catch(() => {
          this.selectedPostHomeworkUser = {}
        })
    },
    // 과제 상세 첨부파일 다운로드
    downloadArchiveFile() {
      if (this.isFileLoading) return false

      const files = this.selectedPostHomeworkUser.files
      if (files.length === 0) {
        this.$hiClass.alert('제출된 과제 파일이 없습니다.')
        return false
      }

      this.setIsFileLoading(true)

      try {
        if (files.length > 0) {
          const zip = new jszip()
          const archiveFileName = this.getArchiveFileName()
          const fileNames = []
          const requests = []
          let fileCount = 0

          files.forEach(file => {
            const url = file.fileTranscodePath || file.fileOriginalPath
            const fileName = file.fileName
            const whatwgFetch = require('whatwg-fetch')
            const request = this.$comn.isIE()
              ? whatwgFetch.fetch(url)
              : fetch(url)

            fileNames.push(fileName)
            requests.push(request)
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

                if (files.length === fileCount) {
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
              this.$hiClass.alert('과제 첨부파일 다운로드를 실패하였습니다.', 'error')
            })
        }

      } catch (err) {
        this.$log.debug(this.$options.name, `downloadArchiveFile() err => `, err)
        this.setIsFileLoading(false)
      }
    },
    /**
     * 과제 개별다운로드 ZIP 파일명
     */
    getArchiveFileName() {
      const className = this.getSubscribeClassNameByClassId(this.classId)
      const posted = this.postItem.posted
      const dateStr = this.$moment(posted).format('M[월] D[일]')
      let fileName = ''
      try {
        fileName += `${className}`
        fileName += `_${dateStr}`
        if (this.isStudent && !this.writeUser.memberClassNumber === false)
          fileName += `_${this.writeUser.memberClassNumber}번`

        // 탈퇴자인 경우
        fileName += `_${this.writeUser.memberChildName || '탈퇴회원'}`

        // 학부모인 경우
        if (this.writeUser.memberChildName && !this.isStudent)
          fileName += `_학부모`

        fileName += `_과제`
      } catch (error) {
        this.$log.debug(error)
        fileName = `과제_다운로드`
      }
      if (this.$comn.isIE()) fileName += `.zip`
      return fileName
    },
  }
}
</script>

<style scoped>

</style>