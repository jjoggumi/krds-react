<!--
@File(Method): MainBodyClazzesBodyHomeworkStatusMemberModify.vue
@Author: -
@Date Created: -
@Description: 과제 제출 (등록/수정)
@Modified: 2024-10-11 - #69395 과제 제출시 중복 인코딩 요청 수정
-->
<template>
  <!-- 과제 제출하기(CREATE) -->
  <div
    v-if="isCreate || isUpdate"
    class="modal create-contents-modal class-editor-modal"
    style="display: block;"
    @click.self="cancel2()"
    @dragover.prevent
    @dragenter.prevent
    @drop.prevent
  >
    <div class="modal-cont-wrap">
      <div class="modal-cont boundary-box">
        <div class="modal-cont-inner">
          <div class="title-wrap">
            <div class="title type-homework">
              <span>과제 {{ modeTitle }}하기</span>
            </div>
            <div class="btn-wrap">
              <button
                class="btn-bg-w modal-close-btn"
                :class="{ dis: isUploading }"
                :disabled="isUploading"
                @click="cancel()"
              >
                취소
              </button>
              <!--<button class="btn-bg-w2">임시저장</button>-->
              <button
                class="btn-bg-c"
                :class="{ dis: saveCondition || isUploading || isWait }"
                :disabled="saveCondition || isUploading || isWait"
                @click="write('COMPLETE', true)"
              >
                올리기
              </button>
            </div>
          </div>

          <div class="contents-wrap homework-wrap">
            <div class="box-notice">
              <p><span class="heading">업로드 가능 파일 형식: </span>{{ allowedExtensionTitles.join(', ') }}</p>
            </div>

            <div class="input-box-wrap input-cont">
              <div class="textarea-wrap">
                <!-- textarea 하단에 파일 추가 리스트 있으면 type2 추가 -->
                <textarea
                  ref="workContent"
                  placeholder="내용을 입력해주세요."
                  v-model="model.workContent"
                ></textarea>
              </div>

              <hc-clazzes-homework-user-upload
                 key="homework-user-upload"
                :files.sync="model.files"
                :isUploading.sync="isUploading"
                :param="param" 
                :unusedFiles="unusedFiles"
                uploadType="board"
                @is-fail="failUpload"
              />

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import {mapState} from "vuex";
import HcClazzesHomeworkUserUpload from "@/components/Upload/Clazzes/ClazzesHomeworkUserUpload";
import axios from "@/plugins/axios"

export default {
  name: 'main-body-clazzes-body-homework-status-member-modify',
  components: {HcClazzesHomeworkUserUpload},
  props: {
    mode: {
      type: String,
    },
    post: {
      type: Object,
      required: true
    },
    workId: {
      type: String
    }
  },
  data() {
    return {
      isUploading: false,
      // upload
      model: {
        workContent: '',
        files: []
      },
      param: {
        compatibleExtensions: [
          'doc',
          'docx',
          'hwp',
          'hwpx',
          'txt',
          'pdf',
          'ppt',
          'pptx',
          'xls',
          'xlsx',
          'zip',
          // 한글 확장자 추가
          'hpt',
          'show',
        ],
        compatibleContentType: ['video', 'image']
      },

      // 금칙어가 포함되었을 경우 이전 상태로 되돌림
      oldResource: {},

      allowedExtensionTitles: [
        '이미지',
        '비디오',
        // 한글
        'hwp',
        // MS 파워포인트
        'ppt',
        // 한글 ppt
        'hpt',
        'show',
        // Adobe PDF
        'pdf',
        // MS 엑셀
        'xlsx',
        'xls',
        // 텍스트
        'txt',
        // 압축
        'zip',
      ],
      api: process.env.VUE_APP_BASE_API_URI,
      isWait: false,
      unusedFiles: []
    }
  },
  computed: {
    ...mapState({
      user: 'user'
    }),
    isCreate() {
      return this.mode === undefined || this.mode === 'create'
    },
    isUpdate() {
      return this.mode === 'update'
    },
    modeTitle() {
      return this.mode === 'update' ? '수정' : '제출'
    },
    saveCondition() {
      let bool = true

      const workContent = this.model.workContent ? this.model.workContent.trim() : ''

      if (this.isUploading) bool = true
      if (this.model.files.length > 0) bool = false
      else if (workContent.length > 0) bool = false

      return bool
    },
    paramFileList() {
      return this.model.files.filter(file => !file.fileOriginalPath === false)
    }
  },
  created() {
    if (this.isUpdate)
      this.getPostHomeworkUsers()
  },
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')
  },
  beforeDestroy() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  },
  methods: {
    failUpload() {
      this.$emit('is-fail')
    },
    cancel() {
      if (!this.saveCondition) {
        this.$hiClass.confirm('작성 중인 내용이 있습니다.<br>취소하시겠습니까?')
          .then(() => {
            this.$emit('handleModify', false)
          })
        return false
      }

      this.$emit('handleModify', false)
    },
    cancel2() {
      if (this.isUpdate) {
        let totalChkFlag = true
        let contentTitleChkFlag = false
        let fileChkFlag = false

        const oldObj = this.$store.state.cloneLocalData
        const oldFiles = this.$store.state.cloneLocalFiles
        const newObj = this.model.postTitle + this.model.workContent
        const newFiles = this.model.files.map(function(d) {
          return d.fileOriginalPath
        })

        contentTitleChkFlag = oldObj !== newObj;

        fileChkFlag = !this.$comn.arrCompare(oldFiles, newFiles);

        if (!contentTitleChkFlag && !fileChkFlag) totalChkFlag = false

        if (!totalChkFlag) this.$emit('handleModify', totalChkFlag)
      } else {
        // 작성이 없을 경우 BackDrop 닫힘 활성화
        try {
          if (
            this.model.files.length === 0 &&
            (
              this.model.workContent === '' ||
              (this.model.workContent && this.model.workContent.trim() === '')
            )
          )
            this.$emit('handleModify', false)
        } catch (error) {
          this.$log.debug(error)
        }
      }
    },
    async write(postStatus, isEncoding) {
      this.backupResource('model', this.model)

      if (this.saveCondition || this.isUploading) {
        this.$hiClass.alert('본문 또는 첨부파일을 확인 후 제출해주세요.')
        return false
      }

      if (this.isWait) {
        return false
      }

      this.isWait = true

      // 동영상 인코딩
      if (isEncoding) {
        try {
          await this.encodingFiles(this.paramFileList)
        } catch (e) {
          this.$log.error(e)
        }
      }

      let params = {
        files: this.paramFileList,
        del: false,
        post: this.post._links.self.href,
        user: this.user._links.self.href,
        workContent: this.model.workContent
      }

      // 게시물 등록
      if (this.isCreate) {
        try {
          const res = await axios({
            method: 'POST',
            url: `${this.api}/postHomeworkUsers`,
            data: params
          })

          this.$log.debug(this.$options.name, `write ${postStatus} res => `, res)
          this.$emit('is-complete')
          this.$emit('handleModify', false)
          this.deleteUnusedFiles()
        } catch (err) {
          this.$log.debug(this.$options.name + ` write ${postStatus} err => `, err)

          if (err.response.data.error === '411') {
            const opts = {
              cancelButtonText: '취소',
              reverseButtons: true
            }

            this.$hiClass.confirm('이미 제출한 과제 입니다.<br/>해당 내용으로 수정하여 제출하시겠습니까?', null, opts)
                .then(async() => {
                  this.workId = err.response.data.cause
                  this.mode = 'update'
                  await this.write('', false)
                })
                .catch(() => {
                  this.restoreResource('model')
                })

          } else {
            this.restoreResource('model')
          }

        } finally {
          this.isWait = false
        }
        // 게시물 수정
      } else if (this.isUpdate) {
        this.backupResource('parentModel', this.model)
        const fixedRequestBody = Object.assign({}, params)

        if (fixedRequestBody.userMobile && fixedRequestBody.userMobile.includes('***') || !fixedRequestBody.userMobile)
          delete fixedRequestBody.userMobile

        const url = `/postHomeworkUsers/${this.workId}`
        try {
          const res = await axios({
            method: 'PATCH',
            url: url,
            data: fixedRequestBody
          })

          this.$emit('is-complete')
          this.$emit('handleModify', false)
          this.deleteUnusedFiles()
        } catch (err) {
          this.$log.debug(this.$options.name + ` update ${postStatus} err => `, err)
          this.restoreResource('model', 'parentModel')
        } finally {
          this.isWait = false
        }
      }
    },
    fileDelete(file) {
      this.model.files = this.model.files.filter(item => {
        return item.fileOriginalPath !== file.fileOriginalPath
      })
    },
    deleteUnusedFiles() {
      let deleteApi = []
      this.unusedFiles.forEach(file => {
        deleteApi.push(this.$hiClass.multipart.delete(file))
      })
      Promise.allSettled(deleteApi)
    },
    async encodingFiles(files) {
      // 동영상 인코딩: 수정 시 기존에 등록되었던 동영상은 인코딩 요청 안함 (currentId로 판단)
      const newVideoFiles = files.filter(file => file.fileContentType.startsWith('video') && !file.currentId)
      if (newVideoFiles.length > 0) {
        for (let i = 0; i < newVideoFiles.length; i++) {
          try {
            const encodeRes = await this.$hiClass.multipart.encode({
              fileOriginalPath: newVideoFiles[i].fileOriginalPath
            })
            const requestId = encodeRes.data.requestId
            if (requestId) {
              newVideoFiles[i].requestId = requestId
            }
          } catch (e) {
            // 인코딩 실패해도 무시하고 등록
          }
        }
      }
    },
    backupResource(key, resource) {
      this.oldResource[key] = Object.assign({}, resource)
    },
    restoreResource(...keys) {
      keys.forEach(key => {
        for (const [k, v] of Object.entries(this.oldResource[key])) {
          this[key][k] = v
        }
      })
    },
    async getPostHomeworkUsers() {
      const url = `/postHomeworkUsers/${this.workId}`

      await this.$hiClass.postHomeworkUsers
        .read(url)
        .then(res => {
          this.$log.debug(this.$options.name,'getHomeworkUser() res:', res)
          this.$set(this, 'model', res.data)
          this.model.workContent = this.$hiClass.getHtmlParsedContent(this.model.workContent)
        })
        .catch(err => {
          this.$log.debug(this.$options.name,'getHomeworkUser() err:', err)
        })
        .finally(() => {})

    },

  },
  watch: {
    'model.workContent'(newVal, oldVal) {
      if ([...newVal].length > 1500) {
        this.$toasted.clear()
        this.$toasted.show('1500자까지 가능합니다.')
        this.model.workContent = oldVal
      }
    }
  }
}
</script>

<style scoped></style>
