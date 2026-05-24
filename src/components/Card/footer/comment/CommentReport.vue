<template>
  <div>
    <div class="modal normal-modal note-notice-modal" style="display: block"
      v-if="option.isWrite"
      @click.self="closeReport('')">
      <div class="modal-cont-wrap" ref="report">
        <div class="modal-cont report-box">
          <div class="modal-cont-inner">
            <div class="modal-title-wrap">
              <div class="title">신고하기</div>
            </div>
            <div class="check-list-wrap">
              <ul>
                <li class="agree-check-wrap">
                  <textarea placeholder="신고사유를 입력해주세요." maxlength="200"
                    v-model="model.reason"
                    v-on:input="model.reason = $event.target.value"></textarea>
                </li>
              </ul>
              <p class="txt-gray mt-10">*신고해주신 내용을 검토하여 댓글 공개 여부를 결정합니다. (처리기간 1~3일)</p>
            </div>
            <div class="btn-wrap">
              <div class="btn-group">
                <button class="btn-bg-w2 modal-close-btn" @click="closeReport('')">
                  취소
                </button>
                <button class="btn-bg-c"
                  :class="{ 'dis': !isSave }"
                  :disabled="!isSave"
                  @click="setReport">확인</button>
              </div>
            </div>
          </div>
          <div class="modal-close-btn modal-close-icon" @click="closeReport('')"></div>
        </div>
      </div>
    </div>
    <div class="modal join-code-modal normal-modal" style="display: block"
      v-if="!option.isWrite && !reportError"
      @click.self="closeReport('')">
      <div class="modal-cont-wrap" ref="report">
        <div class="modal-cont boundary-box">
          <div class="modal-cont-inner">
            <div class="icon-title-wrap">
              <div class="text-wrap">신고하기</div>
              <p>신고 내용이 접수되었습니다.<br />운영자가 확인하는데로 신속히 처리하도록 하겠습니다.</p>
            </div>
            <div class="confirm-btn-wrap">
              <button class="btn-bg-c" @click="closeReport('finish')">완료</button>
            </div>
          </div>
          <div class="modal-close-btn modal-close-icon" @click="closeReport('finish')"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: "CommentReport",
  components: { },
  props: {
    comment: {
      type: Object,
      required: true
    },
    contentTypes: {
      type: Object,
    },
    postItemType: {
      type: String
    },
    postType : String
  },
  data() {
    return {
      option: {
        isWrite: true
      },
      model: {
        reason: '',
        postComment: `${this.$apiUrl}/${this.contentTypes.methodName}/${this.comment.currentId}`
      },
      reportError: false
    }
  },
  computed: {
    isSave() {
      return this.model.reason !== ''
    }
  },
  mounted() {
    this.setPopReportStyle()
  },
  methods: {
    async setReport() {
        this.reportError = false
      // this.$hiClass.postCommentReports
      //   .create(this.model)
      //   .then(res => {
      //     if (res) {
      //       this.option.isWrite = false
      //       this.$refs.report.style.overflow = "hidden"
      //       this.$refs.report.style.height = "266px"
      //     }
      //   }).catch(err => {
      //     this.$log.debug(
      //       this.$options.name,
      //       " setReport() error => ",
      //       err
      //     )
      //   })
      
      try {
        const res = await this.$hiClass.postCommentReports.create(this.model)
        if(res) {
          this.option.isWrite = false
          this.$refs.report.style.overflow = "hidden"
          this.$refs.report.style.height = "266px"
        }
      } catch (err) {
        this.$log.debug("setReport error => ", err)

        if(this.postType === "EVENT") {
          if(err.response.status === 412) {
            this.$hiClass.alert('댓글 신고는 게시물 당 최대 3번 가능합니다.', 'warning')
          }
        }

        if(err.response.status == 404) {
          this.$hiClass.alert('삭제된 댓글입니다.', 'warning')
        }
        this.option.isWrite = false
        this.reportError = true
        this.$refs.report.style.overflow = "hidden"
        this.$refs.report.style.height = "266px"
        // this.closeReport()
      }
    },
    closeReport(data) {
      this.$emit("is-result", data)
    },
    setPopReportStyle() {
      const modalPosition = this.$comn.getModalPosition(this.$refs.report)
      let integer = 1

      if (this.$route.path.indexOf("clazzes") == -1 || this.postItemType === 'POST') {
        this.$refs.report.style.overflow = "hidden"
        this.$refs.report.style.position = "absolute"
        this.$refs.report.style.height = "353px"
        integer = -0.30
        this.$refs.report.style.marginTop = `${modalPosition.m_height * integer - 80}px`
        this.$refs.report.style.marginLeft = `${modalPosition.m_width * integer}px`
      } else {
        this.$refs.report.style.marginTop = `-${modalPosition.m_height * integer}px`
        this.$refs.report.style.marginLeft = `-${modalPosition.m_width * integer}px`
      }
    }
  }
};
</script>

<style scoped></style>
