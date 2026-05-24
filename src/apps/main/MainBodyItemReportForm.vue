<template>
  <div
    class="modal normal-modal note-notice-modal note-notice-edit-modal"
    :class="{ on: isOn, off: !isOn }"
    @click.self="close()"
  >
    <div class="modal-cont-wrap" ref="modal" :style="styleMarginObj">
      <div class="modal-cont report-box">
        <div class="modal-cont-inner">
          <div class="modal-title-wrap">
            <div class="title">신고하기</div>
          </div>
          <div class="check-list-wrap">
            <ul>
              <li class="agree-check-wrap">
                <textarea
                  placeholder="신고사유를 입력해주세요."
                  v-model="reason"
                  maxlength="200"
                ></textarea>
              </li>
            </ul>
            <!-- prettier-ignore -->
            <p class="txt-gray mt-10">*신고해주신 내용을 검토하여 댓글 공개 여부를 결정합니다. (처리기간 1~3일)</p>
          </div>
          <div class="btn-wrap">
            <div class="btn-group">
              <button class="btn-bg-w2 modal-close-btn" @click="close()">
                취소
              </button>
              <button class="btn-bg-c" @click="doPostCommentReports()">
                확인
              </button>
            </div>
          </div>
        </div>
        <div class="modal-close-btn modal-close-icon" @click="close()"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MainBodyItemReportForm',
  data: () => ({
    isOn: false,
    styleMarginObj: {},
    reason: ''
  }),
  props: ['isReportForm', 'comment', 'isDetailPostLayerPop'],
  created() {
    this.isOn = this.isReportForm
    this.getPostCommentReports()
  },
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')

    let modal = this.$refs.modal
    let getModalSize = this.$comn.getModalPosition(modal)
    let integer = -1
    if (
      this.$route.path.includes('/clazzes') ||
      this.$route.path.includes('/mypage/scrap')
    ) integer = 1
    else integer = -0.77
    this.styleMarginObj = {
      'margin-top': -getModalSize.m_height * integer + 'px',
      'margin-left': -getModalSize.m_width * integer + 'px'
    }
  },
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  },
  methods: {
    close() {
      this.isOn = false
      this.$emit('CloseEvent', false)
    },
    // 신고하기
    doPostCommentReports() {
      const commentUri = this.comment._links.self.href

      if (commentUri === undefined) return false
      if (this.reason.trim() === '') {
        alert('신고 사유를 입력해주세요.')
        return false
      }
      const params = {
        reason: this.reason,
        postComment: commentUri
      }
      this.$axios({
        method: 'post',
        url: '/postCommentReports',
        data: params
      })
        .then(result => {
          this.$log.debug(
            this.$options.name + ' postCommentReports() result : ',
            result
          )
          const popupDialogObj = {
            title: '신고하기',
            contentHtml:
              '신고 내용이 접수되었습니다.<br />운영자가 확인하는데로 신속히 처리하도록 하겠습니다.'
          }
          if (this.isDetailPostLayerPop) {
            alert(
              '신고 내용이 접수되었습니다.\n운영자가 확인하는데로 신속히 처리하도록 하겠습니다.'
            )
          } else {
            this.$emit('openPopupDialog', popupDialogObj)
          }
          this.close()
        })
        .catch(error => {
          this.$log.debug(
            this.$options.name + ' postCommentReports() error : ',
            error
          )
        })
    },
    // 신고 확인하기
    getPostCommentReports() {
      const commentUri = this.comment._links.self.href

      if (commentUri === undefined) return false
      const params = {
        _postComment: commentUri
      }
      this.$axios({
        method: 'post',
        url: '/postCommentReports/!q',
        params: params
      })
        .then(result => {
          this.$log.debug(
            this.$options.name + ' getCommentReports() result : ',
            result
          )
          // let reasonAll = "";
          // for (const postCommentReport of result.data._embedded
          //   .postCommentReports) {
          //   reasonAll += postCommentReport.reason + "\n";
          // }
          // if (reasonAll !== "") {
          //   reasonAll =
          //     "<< 해당 댓글이 신고된 사유는 다음과 같습니다 >>\n\n" + reasonAll;
          // }
          // alert(reasonAll);
        })
        .catch(error => {
          this.$log.debug(
            this.$options.name + ' getCommentReports() error : ',
            error
          )
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.on {
  display: block;
}
.off {
  display: none;
}
// 신고하기 modal 위치가 comment 안에 있으면 밀림. padding 초기화.
li.agree-check-wrap {
  padding: 0 !important;
}
</style>
