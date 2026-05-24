<!--
@File(Method): NoteBoardConfirmModal.vue
@Description: 클래스 > 알림장 > 판서로 쓰기 > 알림장 보내기 모달
@Modified: 2025-03-28 - #73157 : webfront 개선 - #73181  알럿 버튼 공통화 추가 적용 요청 -  himodal 사용
-->

<template>
  <HiModal v-if="isShowTemplate" type="type01" size="sm" @close="onClickCancel">
    <template v-slot:heading>
      <div v-html="modalTitle"></div>
    </template>
    <template v-slot:content >
      <p class="desc" v-html="modalContent"></p>          
      <template v-if="isSendComplete && radioKind === '1'" >
          <div class="input-radio-wrap mt-20">
            <input
              type="radio"
              name="select-send"
              id="send-push"
              :value="true"
              v-model="model.pushUsed"
            />
            <label for="send-push" class="mr-40"><span>{{ sendPushLabel }}</span></label>
            <input
              type="radio"
              name="select-send"
              id="send-not"
              :value="false"
              v-model="model.pushUsed"
            />
            <label for="send-not"><span>{{ sendNotLabel }}</span></label>
          </div>     
      </template>
      <template v-else-if="isSendComplete && radioKind === '2'">    
          <div  class="input-radio-wrap n  mt-20">
            <ul class="input-list">
              <li>
                <input
                  type="radio"
                  name="select-send"
                  id="send-not"
                  value="not"
                  v-model="addPush"
                />
                <label for="send-not" class="mr-40"><span>보내지 않기</span></label>
              </li>
              <li>
                <input
                  type="radio"
                  name="select-send"
                  id="send-add"
                  value="add"
                  v-model="addPush"
                />
                <label for="send-add" class="mr-40"><span>추가된 구성원에게만 푸시 보내기</span></label>
              </li>
              <li>
                <input
                  type="radio"
                  name="select-send"
                  id="send-all"
                  value="all"
                  v-model="addPush"
                />
                <label for="send-all"><span>전체에게 푸시 보내기</span></label>
              </li>
            </ul>
          </div>
      </template>
    </template>
    <template v-slot:footer>         
      <HiButton color="line-light-primary" size="lg" @click="onClickCancel" >{{ cancelButtonLabel }}</HiButton>
      <HiButton color="primary" size="lg" @click="onClickConfirm"> {{ confirmButtonLabel }}</HiButton>
    </template>       
  </HiModal>

    <!-- <div
      v-if="isShowTemplate"
      class="confirmModal modal normal-modal note-notice-modal note-notice-comfirm-modal"
      style="display: block"
    >
      <div class="modal-cont-wrap" ref="confirmModal" :style="modalStyle">
        <div class="modal-cont boundary-box">
          <div class="modal-cont-inner">
            <div class="modal-title-wrap">
              <div class="title" v-html="modalTitle"></div>
              <p>{{ modalContent }} </p>
            </div>

            <div v-if="isSendComplete && radioKind === '1'" class="input-radio-wrap">
              <input
                type="radio"
                name="select-send"
                id="send-push"
                :value="true"
                v-model="model.pushUsed"
              />
              <label for="send-push"><span>{{ sendPushLabel }}</span></label>
              <input
                type="radio"
                name="select-send"
                id="send-not"
                :value="false"
                v-model="model.pushUsed"
              />
              <label for="send-not"><span>{{ sendNotLabel }}</span></label>
            </div>

            
            <div v-else-if="isSendComplete && radioKind === '2'" class="input-radio-wrap n">
              <ul class="input-list">
                <li>
                  <input
                    type="radio"
                    name="select-send"
                    id="send-not"
                    value="not"
                    v-model="addPush"
                  />
                  <label for="send-not"><span>보내지 않기</span></label>
                </li>
                <li>
                  <input
                    type="radio"
                    name="select-send"
                    id="send-add"
                    value="add"
                    v-model="addPush"
                  />
                  <label for="send-add"><span>추가된 구성원에게만 푸시 보내기</span></label>
                </li>
                <li>
                  <input
                    type="radio"
                    name="select-send"
                    id="send-all"
                    value="all"
                    v-model="addPush"
                  />
                  <label for="send-all"><span>전체에게 푸시 보내기</span></label>
                </li>
              </ul>
            </div>

            <div class="btn-wrap">
              <div class="btn-group">
                <button
                  class="btn-bg-w2 modal-close-btn"
                  @click="onClickCancel"
                >
                  {{ cancelButtonLabel }}
                </button>
                <button class="btn-bg-c" @click="onClickConfirm">
                  {{ confirmButtonLabel }}
                </button>
              </div>
            </div>
          </div>
          <div
            class="modal-close-btn modal-close-icon"
            @click="onClickCancel"
          ></div>
        </div>
      </div>
    </div> -->
</template>

<script>
import {mapFields} from "vuex-map-fields";
import {mapState} from "vuex";

export default {
  name: 'note-board-confirm-modal',
  props: {
    model: {
      type: Object,
      required: true
    },
    isSendComplete: {
      type: Boolean,
      required: true
    },
    isReserve: {
      type: Boolean,
      required: true
    },
    isSelectedReserve: {
      type: Boolean,
      required: false
    },
    option: {
      type: Object,
    }
  },
  data() {
    return {
      flag: {
        isShowEdit: false,
        isOutOfDated: false,
        isSendComplete: false
      },
      modalPosition: {},
      tempPost: {},
      oriPushTarget: "",
      newPushTarget: "", 
      addPush: "not"
    }
  },
  computed: {
    ...mapState({
      curClazzNote: 'curClazzNote'
    }),
    ...mapFields({
      isDimLoading: 'isDimLoading',
      currentTimestamp: 'currentTimestamp'
    }),
    confirmDate_ko() {
      if (this.isReserve)
        return this.$moment(this.model.posted).format(
          'YYYY년 M월 D일 (ddd) H시 m분'
        )
      else return this.$moment(this.model.posted).format('YYYY년 M월 D일 (ddd)')
    },
    sendPushLabel() {
      return '푸시 알림 보내기'
    },
    sendNotLabel() {
      return '보내지 않기'
    },
    cancelButtonLabel() {
      return '취소'
    },
    confirmButtonLabel() {
      if (this.isOutOfDatedPost)
        return '공지하기'

      return this.isReserve && !this.isExpiredReserve && !this.isExpireSoonReserve
        ? '예약하기'
        : '공지하기'
    },
    isExpiredReserve() {
      const TEN_SECONDS = 10 * 1000  // this.currentTimestamp 10초 단위 갱신이므로
      return !this.isSendComplete && (this.currentTimestamp + TEN_SECONDS >= this.model.posted)
    },
    isExpireSoonReserve() {
      const NINE_MINUTES = 60 * 1000 * 9
      const TEN_SECONDS = 10 * 1000  // this.currentTimestamp 10초 단위 갱신이므로

      return !this.isSendComplete
        && (this.currentTimestamp + TEN_SECONDS < this.model.posted)
        && (this.currentTimestamp + NINE_MINUTES >= this.model.posted)
    },
    isCreate() {
      return !this.model.updatedTimestamp
    },
    isUpdate() {
      return this.model.updatedTimestamp
    },
    isShowTemplate() {
      return this.flag.isShowEdit
    },
    isOutOfDatedPost() {
      return this.flag.isOutOfDated && this.flag.isSendComplete
    },
    // 모달 사이즈 계산 삭제
    // modalStyle() {
    //   if (this.modalPosition.m_height) {
    //     return {
    //       'margin-top': -this.modalPosition.m_height + 'px',
    //       'margin-left': -this.modalPosition.m_width + 'px'
    //     }
    //   } else return {}
    // },
    modalTitle() {
      // confirm modal 요청 시 게시글이 이미 발송된 경우
      if (this.isOutOfDatedPost) {
        return this.modalTitle3
      } else if (this.isSelectedReserve && (this.isExpiredReserve || this.isExpireSoonReserve)) {
        return this.modalTitle2
      } else {
        return this.modalTitle1
      }
    },
    modalTitle1() {
      let modalTitle = this.confirmDate_ko
      let modalTitleHtml = `${this.curClazzNote.name}${this.curClazzNote.suffix1} 공지하시겠습니까?`

      if (this.isReserve) modalTitleHtml = `${this.curClazzNote.name}${this.curClazzNote.suffix1} 예약 공지하시겠습니까?`
      else if (this.isSendComplete)
        modalTitleHtml = `${this.curClazzNote.name}${this.curClazzNote.suffix1} <span class='txt-primary'>수정</span> 하시겠습니까?`

      modalTitle = modalTitle.concat(`<br />`)
      modalTitle = modalTitle.concat(modalTitleHtml)

      return modalTitle
    },
    modalTitle2() {
      let modalTitleHtml = ''

      if (this.isExpireSoonReserve)
        modalTitleHtml = '예약 발송 시간이 10분 미만으로 남았습니다.'
      else if (this.isExpiredReserve)
        modalTitleHtml = '예약한 시간이 지났습니다.'

      modalTitleHtml += `<br />${this.curClazzNote.name}${this.curClazzNote.suffix1} 즉시 공지하시겠습니까?`
      return modalTitleHtml
    },
    modalTitle3() {
      const postTypeStr = `${this.curClazzNote.name}${this.curClazzNote.suffix1}`
      return `이미 발송 완료된 게시글입니다.<br>변경된 내용으로 ${postTypeStr} <span>수정</span> 하시겠습니까?`
    },
    modalContent() {
      let modalContent = `* 선택한 클래스 구성원에게 공지 알림이 전송됩니다.`

      if (this.isSendComplete)
        modalContent = `* ${this.curClazzNote.name}${this.curClazzNote.suffix3} 수정되었다는 푸시 알림 메시지를<br>보내지 않을 수 있습니다.`

      if (!this.option.isPushParents && !this.option.isPushStudent) {
        modalContent = `* 수신대상이 없는 게시글은 클래스 선생님만 확인이 가능합니다.`
      }

      if(this.newPushTarget === "TEACHER") {
        modalContent = `* 수신대상이 없는 게시글은 클래스 선생님만 확인이 가능합니다.`
      }

      return modalContent
    },
    radioKind(){
      if(this.newPushTarget === "TEACHER") return "0"
      if(this.newPushTarget === this.oriPushTarget || this.oriPushTarget === "ALL") return "1"
      return "2"
    },
    post: {
      get() {
        return this.model
      }
    }
  },
  created() {
    // 알림장 판서 수정시 푸시 알림 메시지 '보내지 않기' 디폴트 처리
    this.model.pushUsed = false

    // 여기서 메시지 처리 
    if(this.isUpdate){
      this.setPushTarget()
    }
  },
  watch: {
    addPush(v) {
      if(v === "not") this.model.pushUsed = false
      else this.model.pushUsed = true
    }
  },
  async mounted() {
    if (this.isUpdate) {
      this.flag.isOutOfDated = await this.isOutOfDatePost()
      this.flag.isSendComplete = this.tempPost.postStatus === 'COMPLETE' && this.tempPost.postStatus !== this.post.postStatus

      if (this.isOutOfDatedPost) {
        // 편집 중인 주요 local 데이터
        const modifiedModel =  Object.assign({
          postTitle: this.model.postTitle,
          postContent: this.model.postContent,
          postMustRead: this.model.postMustRead,
          postPin: this.model.postPin,
          pushUsed: this.model.pushUsed,
          files: this.model.files,
          timestampEnd: this.model.timestampEnd,
        }, {})

        // 서버 데이터 -> model 에 복사
        for (const [key, value] of Object.entries(this.tempPost)) {
          this.model[key] = value
        }

        // 편집 중인 주요 local 데이터 -> model 에 복사
        for (const [key, value] of Object.entries(modifiedModel)) {
          this.model[key] = value
        }
      }
    }

    if (this.option.button === 'TEMPORARY' && !this.isOutOfDatedPost) {
      this.$emit('setPost', 'TEMPORARY')
      this.$emit('closeModal')
    }

    this.flag.isShowEdit = true
    this.$nextTick(() => {
      if (this.$refs.confirmModal)
        this.modalPosition = this.$comn.getModalPosition(this.$refs.confirmModal)
    })

  },
  methods: {
    onClickConfirm() {
      if(this.isUpdate){
        if(this.addPush === "add" && this.newPushTarget !== "TEACHER") {
          if(this.oriPushTarget === "TEACHER") {
            if(this.newPushTarget === "STUDENT") {
              this.model.currentPushTarget = "STUDENT"
            } else if(this.newPushTarget === "PARENTS") {
              this.model.currentPushTarget = "PARENTS"
            }
          }

          if(this.oriPushTarget === "PARENTS") {
            if(this.newPushTarget === "ALL") {
              this.model.currentPushTarget = "STUDENT"
            } else if(this.newPushTarget === "STUDENT") {
              this.model.currentPushTarget = "STUDENT"
            }
          }

          if(this.oriPushTarget === "STUDENT") {
            if(this.newPushTarget === "ALL") {
              this.model.currentPushTarget = "PARENTS"
            } else if(this.newPushTarget === "PARENTS") {
              this.model.currentPushTarget = "PARENTS"
            }
          }
        }

        if(this.newPushTarget === "TEACHER") this.model.pushUsed = true
      }

      if (this.isOutOfDatedPost) {
        this.$emit('setPost', 'COMPLETE')
      } else if (this.isExpiredReserve || this.isExpireSoonReserve) {
        this.model.posted = this.$moment().valueOf()
        this.$emit('setPost', 'COMPLETE')
      } else if (this.isReserve) {
        this.$emit('setPost', 'RESERVE')
      } else {
        this.$emit('setPost', 'COMPLETE')
      }
    },
    onClickCancel() {
      if (this.isOutOfDatedPost) {
        this.isDimLoading = true
        this.$router.go(0)
      } else {
        this.$emit('closeModal')
      }
    },
    // 게시글 fresh 데이터 갱신 여부 확인
    async isOutOfDatePost() {
      return new Promise(async resolve => {
        await this.setTempPost()

        if (this.tempPost.updatedTimestamp !== this.post.updatedTimestamp
          || this.tempPost.postStatus !== this.post.postStatus
        ) {
          resolve(true)
        } else {
          resolve(false)
        }
      })
    },
    // 게시글 fresh 데이터를 임시저장
    async setTempPost() {
      const res = await this.$hiClass.posts.read(`/posts/${this.post.currentId}`)
      if (res.data && res.data.currentId) {
        if (res.data.postStatus === 'COMPLETE' && this.post.postStatus === 'RESERVE') {
          // TODO: 예약된 게시글이 스케줄러로 발송된 경우 목록 갱신을 위해 게시글 수정 타임스탬프 값 updatedTimestamp 변경한다.
          res.data.updatedTimestamp += 1000
        }

        this.tempPost = res.data
      }
    },
    setPushTarget() {
      let pushTarget = 'TEACHER'

      if (
        this.option.isPushTeacher &&
        this.option.isPushParents &&
        this.option.isPushStudent
      ) {
        pushTarget = 'ALL'
      } else if (this.option.isPushParents) {
        pushTarget = 'PARENTS'
      } else if (this.option.isPushStudent) {
        pushTarget = 'STUDENT'
      }

      this.newPushTarget = pushTarget
      this.oriPushTarget = this.model.pushTarget
    },
  }
}
</script>

<style scoped lang="scss">
.hi-modal-common::v-deep { 
  .modal__header{
    .heading > div{
      line-height: 1.3;
    }
  }
  .modal__layer{
    max-width:440px;
  }
}
// .modal.normal-modal .modal-title-wrap span {
//   display: inline;
// }
// .input-radio-wrap.n {
//   padding: 0 6%;
// }
.input-radio-wrap.n ul.input-list {
  width: 100%;
  padding: 5%;
  background: #f6f6f6;
  border-radius: 8px;
}
.input-radio-wrap.n ul.input-list li {
  width: 100%;
  text-align: left;
  line-height: 40px;
}
</style>
