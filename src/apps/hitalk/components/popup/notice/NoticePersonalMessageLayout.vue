<template>
  <div class="modal normal-modal note-notice-modal note-notice-edit-modal" style="display: block;">
    <div class="modal-cont-wrap" style="margin-top:-177px; margin-left: -40px;">
      <div class="modal-cont report-box">
        <div class="modal-cont-inner">
          <div class="modal-title-wrap">
            <div class="title">메시지 작성</div>
            <p>선택된 구성원 : {{ className }} <span class="ft-orange">{{ noticePersonalRoomList.length }}</span>명</p> <!-- 2021-01-05 피그마 코멘트 87 -->
          </div>
          <div class="check-list-wrap">
            <ul>
              <li class="agree-check-wrap">
                <text-area
                  ref="textArea"
                  :max-length="1001"
                  :disabled="isDimLoading"
                  v-model="messageKeyword"
                ></text-area>
              </li>
            </ul>

            <!-- 2022-06-03 파일 업로드 -->
            <chat-images-upload
              :files.sync="model.files"
              :is-uploading.sync="option.loading.imagePacks"
              :loading-obj="option.loading"
            />

            <chat-doc-upload
              :files.sync="model.files"
              :is-uploading.sync="option.loading.docs"
              :loading-obj="option.loading"
            />
            <!-- // 2022-06-03 파일 업로드 -->

          </div>
          <div class="btn-wrap">
            <div class="btn-group">
              <button class="btn-bg-w2 modal-close-btn" @click="closeNoticePersonalMessageBox">취소</button>
              <button
                class="btn-bg-c"
                :class="{ dis: isDisabledSubmit }"
                :disabled="isDisabledSubmit"
                @click="submitNoticePersonalMessage"
              >
                전송
              </button>
            </div>
          </div>
        </div>
        <div class="modal-close-btn modal-close-icon" @click="closeNoticePersonalMessageBox"></div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapMutations, mapActions, mapState} from "vuex";
import TextArea from "@/apps/hitalk/components/common/TextArea";
import ChatImagesUpload from "@/apps/hitalk/components/upload/ChatImagesUpload";
import ChatDocUpload from "@/apps/hitalk/components/upload/ChatDocUpload";

export default {
  components: {ChatDocUpload, ChatImagesUpload, TextArea},
  props: {},
  data() {
    return {
      option: {
        loading: {
          imagePacks: false,
          docs: false,
          submit: false,
        },
      },
      messageKeyword: "",
      model: {
        files: [],
      }
    }
  },
  computed: {
    ...mapState([
      'isDimLoading'
    ]),
    ...mapState("storeHitalk",[
      "currentClassItem",
      "noticeCategory",
      "noticePersonalRoomList",
      "stompClient",
    ]),
    className: function () {
      return this.currentClassItem.class.className;
    },
    isEmptyMessageKeyword() {
      return this.messageKeyword.length === 0
        || (this.messageKeyword.length > 0 && this.messageKeyword.trim().length === 0)
    },
    isDisabledSubmit() {
      return this.messageKeyword.length > 1000
        || (this.isEmptyMessageKeyword && this.model.files.length === 0)
        || this.option.loading.imagePacks === true
        || this.option.loading.docs === true
        || this.option.loading.submit === true
    },
    isReadySubmit() {
      return !this.isDisabledSubmit
    },
    imagePackFiles() {
      return this.model.files.filter(f => { return f.fileContentType.startsWith('image') && f.fileFlag === 'IMAGE_PACK' }) || []
    },
    docFiles() {
      return this.model.files.filter(f => {
        return f.fileContentType && (!f.fileContentType.startsWith('image') && !f.fileContentType.startsWith('video'))
      }) || []
    },
  },
  watch: {
    messageKeyword() {
      if (this.messageKeyword.length > 1000) {
        this.$hiClass.alert(this.$t('chat.input.keyword.limit'))
        this.messageKeyword = this.messageKeyword.substring(0, 999)
      }
    }
  },
  methods: {
    ...mapMutations("storeHitalk",[
      'showNoticePersonalMessageLayout',
      'hideNoticePersonalMessageLayout',
      'setTabRoom',
    ]),
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    ...mapActions("storeHitalk",[
      "callRoomInformation",
      "sendStompPersonalMessageChat",
      "sendStompPersonalMessageFiles",
    ]),
    closeNoticePersonalMessageBox: function () {
      this.hideNoticePersonalMessageLayout();
      this.memberType = "";
      this.showListFlag = false;
    },
    submitNoticePersonalMessage: function () {
      if (!this.option.loading.submit) {
        this.option.loading.submit = true

        const payload = {}
        let existsContent = false
        const message = this.messageKeyword.trim()

        if (message) {
          payload.message = message
          existsContent = true
        }

        if (this.model.files.length > 0) {
          payload.files = this.model.files
          existsContent = true
        }

        if (!existsContent) {
          this.$hiClass.alert("입력된 메시지 또는 첨부파일이 없습니다")
          this.option.loading.submit = false
          return false
        }

        if (this.imagePackFiles.length > 0 && this.docFiles.length > 0) {
          this.$hiClass.alert('첨부파일은 1개만 추가 가능합니다.')
          this.option.loading.submit = false
          return false
        }

        for (let noticePersonalRoomItem of this.noticePersonalRoomList) {
          payload.roomId = noticePersonalRoomItem.roomId
          this.sendStompPersonalMessageChat(payload);
        }

        // 메시지가 있을 경우 메시지만 먼저 전송하기 위해 파일 전송 딜레이 추가
        const FILE_SEND_TIMEOUT = payload.message ? 500 : 0

        if (this.model.files.length > 0) {
          setTimeout(() => {
            for (let noticePersonalRoomItem of this.noticePersonalRoomList) {
              payload.roomId = noticePersonalRoomItem.roomId
              this.sendStompPersonalMessageFiles(payload);
            }
          }, FILE_SEND_TIMEOUT)
        }

        setTimeout(() => {
          this.triggerAnalyticsLogEvent({ code: 'analytics.chat.click.button.noticePersonalMessage' })

          if (!this.stompClient.connected) {
            this.option.loading.submit = false
            return false
          }

          this.$hiClass.alert("일괄메시지 전송이 완료되었습니다.")
            .then(() => {
              this.setTabRoom();
              this.closeNoticePersonalMessageBox();
            })
            .finally(() => this.option.loading.submit = false)
        }, 500 + FILE_SEND_TIMEOUT)

      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.$jqueryUtil.scrollbar();

      // textarea add event
      // 2022-06-03 textarea 리사이징
      $.each($('textarea'), function() {
        let offset = this.offsetHeight - this.clientHeight;

        let resizeTextarea = function(el) {
          $(el).css('height', 'auto').css('height', el.scrollHeight + offset);
        };
        $(this).on('keyup input', function() { resizeTextarea(this); }).removeAttr('data-autoresize');
      });
    });

  },
  beforeDestroy() {
    this.closeNoticePersonalMessageBox();
  }
}
</script>

<style scoped></style>
