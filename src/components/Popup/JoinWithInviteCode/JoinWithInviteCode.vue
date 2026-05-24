<template>
  <!-- 초대코드로 가입하기 -->
  <div
    class="modal normal-modal join-code-modal input-invite"
    style="display:block"
  >
    <div
      class="modal-cont-wrap"
      ref="modal"
      :style="modalStyleObj"
      v-click-outside="close"
    >
      <div class="modal-cont">
        <div class="modal-cont-inner">
          <div class="modal-title-wrap">
            <div class="title">초대코드로 가입하기</div>
            <p>선생님께 전달받은 초대코드를 입력하세요.</p>
          </div>
          <div class="input-error-wrap">
              <span v-if="isWrongCode" class="warning">초대 코드를 다시 확인해주세요.</span>
              <span v-if="isJoinedClass" class="warning">이미 가입된 클래스입니다.</span>
          </div>
          <div class="input-code-wrap error">
            <!-- warning텍스트 나오게 하려면 error클래스 추가 -->
            <!-- <p v-if="isWrongCode" class="warning">
              초대 코드를 다시 확인해주세요.
            </p>
            <p v-if="isJoinedClass" class="warning">
              이미 가입된 클래스입니다.
            </p> -->
            <div class="input-code">
              <input
                v-for="idx in 8"
                :key="idx"
                class="item"
                type="tel"
                maxlength="1"
                ref="inputCode"
                v-model.trim="inputCode[idx - 1]"
                @keyup.enter="btnClick"
                @keydown="nextTick(idx - 1, $event, 'keydown')"
                @keyup="nextTick(idx - 1, $event, 'keyup')"
                @focus="clearChar(idx - 1, $event)"
                style="text-transform: uppercase"
              />
            </div>
            <div class="confirm-btn-wrap">
              <button
                type="button"
                class="btn-bg-c"
                v-on:click="btnClick()"
                :class="{
                  dis: !isReadySubmit
                }"
                :disabled="!isReadySubmit"
              >
                완료
              </button>
            </div>
          </div>
        </div>
        <div
          class="modal-close-btn modal-close-icon"
          v-on:click="close()"
        ></div>
      </div>
    </div>

    <global-events
      @paste="onPaste"
    />
  </div>
</template>
<script>
import {mapActions} from "vuex";

export default {
  name: 'join-with-invite-code',
  data() {
    return {
      isLoading: false,
      inputCode: [],
      isWrongCode: false,
      isJoinedClass: false,
      isBusy: false,
      m_height: 0,
      m_width: 0
    }
  },
  computed: {
    isReadySubmit() {
      return this.checkInputCodeLength >= 6
    },
    checkInputCodeLength() {
      let sum = ''
      for (let code of this.inputCode) {
        if (code === undefined) code = ''
        sum += code.trim()
      }
      return sum.length
    },
    modalStyleObj() {
      return {
        'margin-top': -this.m_height + 'px',
        'margin-left': -this.m_width + 'px'
      }
    }
  },
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    ...mapActions('storeHome', {
      toggleJoinWithInviteCode: 'toggleJoinWithInviteCode',
      callJoinWithInviteCodeNextStep: 'callJoinWithInviteCodeNextStep'
    }),
    clearChar(idx) {
      this.$refs.inputCode[idx].value = ''
      // this.inputCode[idx] = "";
      this.inputCode.splice(idx)
    },
    btnClick() {
      let retCode = ''
      for (let i in this.inputCode)
        retCode += this.inputCode[i].toUpperCase()

      if (retCode === '' || !this.isReadySubmit)
        return false

      const params = {
        _classInviteCode: retCode,
        _classStatus: 'ACTIVATE',
        size: 1
      }
      this.$hiClass.clazzes.search(params)
        .then(res => {
          this.isJoinedClass = false

          if (res.data.page.totalElements > 0) {
            // 클래스 구독여부 확인
            this.checkSubscribeClazz(res.data)

          } else {
            // 해당 초대코드로 검색된 클래스 없음
            this.isWrongCode = true
            this.isJoinedClass = false
            this.$refs.inputCode[0].focus()

          }
        })
        .catch(error => {
          this.$log.debug(error)
        })
    },
    checkSubscribeClazz(clazzResData) {
      const invitedClassObj = clazzResData._embedded.clazzes[0]
      const params = {
        userId: this.$store.state.user.currentId || localStorage.uuid,
        classId: invitedClassObj.currentId
      }

      this.$hiClass.clazzSubscribeViews.search(params)
        .then(res => {
          const clazzSubscribeResData = res.data
          let subscribesList = clazzSubscribeResData._embedded.clazzSubscribeViews
          let status = true
          for (let i in subscribesList) {
            const classId = subscribesList[i].classId
            const memberStatus = subscribesList[i].memberStatus

            if (classId === invitedClassObj.currentId && memberStatus === 'ACCEPT') {
              this.isJoinedClass = true
              this.isWrongCode = false
              status = false
              this.$refs.inputCode[0].value = ''
              this.inputCode[0] = ''
              this.$refs.inputCode[0].focus()
              break
            }
          }
          if (status === true) {
            const invitedSchoolUri = invitedClassObj.school._links.self.href === undefined
              ? invitedClassObj.school._links.self[0].href
              : invitedClassObj.school._links.self.href
            const payload = {
              invitedClassObj: invitedClassObj,
              invitedSchoolUri: invitedSchoolUri
            }

            this.callJoinWithInviteCodeNextStep(payload)
          }
        })
    },
    nextTick: function(idx, e, act) {
      // Left Shift, Ctrl, Alt, Win key ignore
      if (e.keyCode === 16 || e.keyCode === 17 || e.keyCode === 18 || e.keyCode === 91) {
       return false
      }

      if (act === 'keydown' && (e.keyCode === 8 || e.keyCode === 46)) {
        this.prevTick(idx)
        return false

      } else if (!this.isBusy) {
        if (idx !== 7) {
          // 숫자 유효성체크. keyCode 로 모두 걸러낼 수 없음. (ex: ie 10)
          const value = this.$refs.inputCode[idx].value
          if (!this.$validation.isRegNumber(value)) {
            this.$refs.inputCode[idx].value = ''
            this.$refs.inputCode[idx].focus()
            this.inputCode[idx] = ''
          }

          this.$refs.inputCode[idx].value = this.$refs.inputCode[
            idx
          ].value.toUpperCase()
          if (this.$refs.inputCode[idx].value !== '')
            this.$refs.inputCode[idx + 1].focus()
          this.isBusy = false
        }
        // } else if (e.keyCode === 13 && this.checkInputCodeLength === 6) {
      } else if (e.keyCode === 13) {
        this.btnClick()

      } else {
        this.$refs.inputCode[idx].value = ''
        this.$refs.inputCode[idx].focus()
        this.inputCode[idx] = ''
      }
    },
    prevTick: function(idx) {
      if (idx !== 0) {
        this.$refs.inputCode[idx - 1].focus()
        this.$refs.inputCode[idx - 1].value = ''
        this.$refs.inputCode[idx].value = ''
        this.inputCode[idx - 1] = ''
        this.inputCode[idx] = ''
      } else {
        this.$refs.inputCode[0].value = ''
        this.inputCode[0] = ''
        this.$refs.inputCode[0].focus()
        this.isJoinedClass = false
      }
    },
    close() {
      this.toggleJoinWithInviteCode({ isOpen: false })
    },
    onPaste(event) {
      if (!this.isLoading) {
        this.isLoading = true

        const paste = (event.clipboardData || window.clipboardData).getData('text')
        const array = Array.from(paste)

        setTimeout(() => {
          this.inputCode.splice(0)
          for (const d of array) {
            const number = parseInt(d)

            if (typeof number === 'number' && number > -1)
              this.inputCode.push(d)

            if (this.inputCode.length > 7)
              break
          }

          this.isLoading = false
        }, 200)
      }
      event.preventDefault()
    }
    /*
    @keyup.left="moveFocus(idx-1, 'left')"
    @keyup.right="moveFocus(idx-1, 'right')"
    */
    // moveFocus(idx, direction) {
    //   if (direction === "left") {
    //     if (idx < 1) {
    //       this.$refs.inputCode[0].value = "";
    //       this.$refs.inputCode[0].focus();
    //     } else {
    //       this.$refs.inputCode[idx - 1].value = "";
    //       this.$refs.inputCode[idx - 1].focus();
    //     }
    //   } else if (direction === "right") {
    //     if (idx >= 5) {
    //       this.$refs.inputCode[5].value = "";
    //       this.$refs.inputCode[5].focus();
    //     } else {
    //       this.$refs.inputCode[idx + 1].value = "";
    //       this.$refs.inputCode[idx + 1].focus();
    //     }
    //   }
    // }
  },
  created() {
  },
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')

    this.$refs.inputCode[0].focus()

    const modal = this.$refs.modal
    const positionObj = this.$comn.getModalPosition(modal)
    this.m_height = positionObj.m_height
    this.m_width = positionObj.m_width

    this.triggerAnalyticsLogEvent({ code: 'analytics.class.click.button.joinInviteCode' })
  },
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  }
}
</script>

<style lang="scss" scoped>
.input-code {
  input:focus {
    border-color: var(--primary);
  }
}
</style>
