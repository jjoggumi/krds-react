<!--
@File(Method): AttendanceFileListModal.vue
@Author: -
@Date Created: -
@Description: 
@Modified: 2025-02-07 - #71768 출결 알리기 > 제출내역 > 첨부파일 목록, 등록 팝업 UI 수정   :  Himodal로 변경
-->
<template>
  <HiModal type="type01" size="sm" @close="close">
    <template v-slot:heading>첨부파일 목록</template>
    <template v-slot:content> 
      <confirm-dialog 
        v-if="confirmDialog.isShow"
        :isOtherUse="true"
        :isNeis="true"
        :isAlert="confirmDialog.isAlert" 
        :title="confirmDialog.title" 
        :description="confirmDialog.description"
        @closeConfirmDialog="closeConfirmDialog"
      />
      <div class="attendance-model-file">
        <div class="list-wrap attached">
          <div class="grouping-date" v-for="(item, index) in list" :key="`${index}-group`">
            <span class="date">{{ item.date }}</span>
            <div class="attaching-file-atd cursor-pointer" v-for="(arr, index2) in item.list" :key="`${index2}-list`" @click="openAttachFile(arr)">
              <span class="file-icon"></span>
              <span class="file-text">
                {{ arr.fileName }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <template v-if="isTeacher">
        <HiButton color="line-default" size="lg" @click="downloadAll">전체 다운로드</HiButton>
        <HiButton color="primary" size="lg" @click="fileUpdate">첨부파일 관리</HiButton>
      </template>
      <template v-else>
        <HiButton color="line-default" size="lg" @click="downloadAll">전체 다운로드</HiButton>
        <HiButton color="primary" size="lg" @click="close">확인</HiButton>
      </template>
    </template>
  </HiModal>
</template>

<script>
import {mapActions} from 'vuex'
import jszip from 'jszip'
import { saveAs } from 'file-saver'
import axios from 'axios'
import ConfirmDialog from '@/apps/hitalk/components/popup/ConfirmDialog'

export default {
  name: "attendance-file-list-modal",
  components: {ConfirmDialog},
  props: {
    attendanceId: String,
    clazzMemberRole: String,
  },
  data() {
    return {
      list: [],
      totalList: [],
      confirmDialog : {
        isShow: false,
        isAlert: false,
        title: '',
        description: '',
        changeValiable: ''
      },
    }
  },
  computed: {
    isTeacher: function() {
        return ['OWNER', 'MANAGER'].includes(this.clazzMemberRole)
    },
  },
  methods: {
    ...mapActions('storeClazzes',[
      'callAttendanceById',
    ]),
    async getList() {
      try {
        const res = await this.$axios({
          method: 'GET',
          url: `/attendances/files/${this.attendanceId}`
        })
        
        this.totalList = res.data._embedded.attendanceFiles
        const list = res.data._embedded.attendanceFiles
        const result = list
          .sort((a, b) => b.insertedTimestamp - a.insertedTimestamp)
          .reduce((acc, curr) => {
            const { insertedTimestamp } = curr

            if (acc[insertedTimestamp]) acc[insertedTimestamp].push(curr)
            else acc[insertedTimestamp] = [curr]

            return acc; 
        }, {})
        
        this.list = Object.entries(result).map(item => {
          return {
            date : this.$moment(parseInt(item[0])).format('YYYY.MM.DD HH:mm:ss'),
            list : item[1]
          }
        })
      } catch (err) {
          this.$log.debug('attendanceFileListModal getList error => ', err)
      }
    },
    openAttachFile(file, i) {
      if (file.fileContentType.startsWith('image')) {
        this.$store.commit('setImageView', {
            isOpen: true,
            items: [file],
            index: i || 0
        })
      } else {
        this.$store.commit('setDocView', {
            isOpen: true,
            item: file
        })
      }
    },
    fileUpdate() {
      this.$emit("openFileList")
      this.$emit("openFileRegister", this.attendanceId, "update")
    },
    close() {
      this.$emit("openFileList")
    },
    openConfirmDialolg: function (changeValiable) {
      let title = ''
      let description = ''
      let isAlert = false
      switch(changeValiable) {
          case 'deleted': {
              title = '삭제된 내역입니다.'
              isAlert = true
              break;
          }
          case 'attendanceOff': {
              title = '출결알리기 사용이 OFF 되었습니다.'
              isAlert = true
              break;
          }
      }
      const modal = {
          changeValiable,
          title,
          description,
          isShow: true,
          isAlert
      }
      this.confirmDialog = {...modal}
    },
    closeConfirmDialog(isConfirm) {
      if(isConfirm) {
        this.$emit('fileAddRegister', this.attendanceId)
        this.close()
      }

      this.confirmDialog = {
        isShow: false,
        isAlert: false,
        title: '',
        description: '',
        changeValiable: ''
      }
    },
    async checkAttendance() {
      const chkRes = await this.callAttendanceById(this.attendanceId)
      if(chkRes.status === 428) {
        this.openConfirmDialolg('deleted')
        return false;
      } else if(chkRes.status === 417) {
        this.openConfirmDialolg('attendanceOff')
        return false;
      }

      return true
    },
    async downloadAll() {
      const chk = await this.checkAttendance()
      if(chk === false) return

      const files = this.totalList

      try {
        this.$store.commit('setIsDimLoading', true)
        // this.closeDownloadPopup()

        let zip = new jszip()
        let fileCount = 0
        let archiveFileName = '묶음사진_전체저장_'
          + this.$moment().format('YYYY-MM-DD_HHmmss')
          + '.zip'

        const result = new Promise(async (resolve, reject) => {
          // zip 파일 압축
          for (const file of files) {
            await axios({
              method: 'get',
              url: file.fileTranscodePath || file.fileOriginalPath,
              responseType: 'blob',
              headers: ''
            })
              .then(async res => {
                let blob = new Blob([res.data], {
                  type: 'application/octet-stream'
                })
                // 파일 이름
                await zip.file(`${fileCount + 1}_${file.fileName}`, blob)
                fileCount++

                if (files.length === fileCount) {
                  await zip
                    .generateAsync({ type: 'blob' })
                    .then(function(blob) {
                      // 모음 zip 파일 이름
                      saveAs(blob, archiveFileName)
                    })
                    .catch(() => reject(false))
                    .finally(() => {})
                }
              })
              .catch(() => reject(false))
              .finally(() => {})
          }

          resolve(true)
        })

        result
          .then(() => {
            this.$hiClass.alert('묶음사진 전체저장이 완료되었습니다.', 'success')
          })
          .catch(() => {
            this.$hiClass.alert('묶음사진 전체저장이 실패하였습니다.', 'error')
          })
          .finally(() => {
            this.$store.commit('setIsDimLoading', false)
          })

      } catch (err) {
        this.$log.debug(`fileDownload() err => `, err)
        this.$store.commit('setIsDimLoading', false)
      }
    }
  },
  async mounted() {
    const chk = await this.checkAttendance()
    if(chk === false) return

    this.getList()
  }
}
</script>
<style lang="scss" scoped>
.attendance-model-file{  
  margin: 0 -30px;
}
.hi-modal-common {
  ::v-deep .modal__layer {
    max-width: 440px;
  }
}
#attendanceFileListModal {
  background: rgba(0,0,0,0.7);
  .modal-cont-wrap {
    overflow-y: auto;
  }
  .modal-cont {
    height: auto;
    min-height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>