<template>
  <div id="loginBodyFindIdBodyItemSearch">
    <p class="sub-start-text">
      휴대폰 번호 인증을 통해 계정을 찾아 드립니다.
    </p>

    <div class="findSnsId-cont-wrap step1">
      <div class="request-wrap">
        <div
          class="input-box-wrap input-id"
          :class="{
            focus: isFocusPhoneNum
          }"
        >
          <input
            type="text"
            id="phoneNum"
            ref="phoneNum"
            maxlength="11"
            :placeholder="$t('main.text.onlynum')"
            :value="phoneNum"
            @input="phoneNum = $event.target.value"
            @focus="isFocusPhoneNum = true"
            @blur="isFocusPhoneNum = false"
            @keydown.enter.prevent.stop
            @keyup="onKeyInput($event)"
          />
        </div>
        <div class="request-btn-wrap">
          <form @submit.prevent="startTimer('MESSAGE')">
            <button
              type="submit"
              class="btn-bg-c"
              :class="{
                dis: isDisabledAuthReqBtn
              }"
              :disabled="isDisabledAuthReqBtn"
            >
              {{ reqBtnName }}
            </button>
          </form>
        </div>
      </div>

      <p class="input-validation-text error-text" v-if="isPhoneNum">
        {{ $t('main.text.reqphonenum') }}
      </p>
      <div
        class="input-box-wrap input-pw"
        :class="{
          focus: isFocusReq6LenNum,
          dis: !isReqPhoneNum
        }"
      >
        <input
          type="text"
          id="req6LenNum"
          ref="req6LenNum"
          maxlength="6"
          :placeholder="$t('main.text.req6lennum')"
          :disabled="!isReqPhoneNum"
          :value="req6LenNum"
          @input="req6LenNum = $event.target.value"
          @focus="isFocusReq6LenNum = true"
          @blur="isFocusReq6LenNum = false"
          @keydown.enter.prevent.stop
          @keyup="onKeyInput($event)"
        />
        <div class="timer-text" v-if="isShowAuthTimer">{{ authTimer }}</div>
      </div>
      <p
        class="input-validation-text"
        :class="{
          'good-text': reqResultObj.result,
          'error-text': !reqResultObj.result
        }"
        v-if="isShowMessage"
      >
        {{ reqResultObj.msg }}
      </p>

      <cert-number-guide v-if="isAuthTimeout" @openKakaotalkSendModal="isShowKaKaoConfirm = true"/>

      <div class="confirm-btn-wrap">
        <button
          class="btn-bg-c"
          type="button"
          :class="{ dis: !isReadySubmit }"
          :disabled="!isReadySubmit"
          @click="onClickAuthConfirm"
        >
          {{ $t('main.text.confirm') }}
        </button>
      </div>

      <kakao-send-confirm
          v-if="isShowKaKaoConfirm"
          :mobile="phoneNum"
          @sendKakaotalk="startTimer('KAKAO')"
          @closeKakaoSendConfirm="closeKakaoConfirm"
      />
    </div>
  </div>
</template>

<script>
import KakaoSendConfirm from "@/components/Modal/KakaoSendConfirm";
import CertNumberGuide from "@/components/Login/CertNumberGuide";

export default {
  name: 'loginBodyFindIdBodyItemSearch',
  components: {CertNumberGuide, KakaoSendConfirm},
  data: () => ({
    isFocusPhoneNum: false,
    isFocusReq6LenNum: false,
    isReqPhoneNum: false,
    isCheckdAuth: false,
    isSuccesAuth: true,
    isAuthTimeout: false,
    isPhoneNum: false,
    phoneNum: '',
    reqBtnName: '',
    req6LenNum: '',
    messageType: '',
    isShowAuthTimer: false,
    timer: null,
    timerValue: process.env.VUE_APP_CERT_NUMBER_TIME,
    isShowKaKaoConfirm: false
  }),
  computed: {
    isReadySubmit() {
      return this.phoneNum.trim() !== '' &&
          this.reqBtnName !== '' &&
          this.isCheckdAuth &&
          this.req6LenNum.length === 6 &&
          this.isAuthTimeout === false;

    },
    authTimer() {
      let rtnValue = ''
      if (this.timerValue > 0) {
        let minute = Math.floor(this.timerValue / 60)
        let second = Math.floor(this.timerValue % 60)
        if (second < 10) second = '0' + second

        rtnValue = minute + ':' + second
      } else {
        rtnValue = '0:00'
      }
      return rtnValue
    },
    isDisabledAuthReqBtn() {
      if (this.timer > 0 && this.timerValue > 0) return true

      const phoneNum = this.phoneNum.trim()
      return !(phoneNum.length > 9 && phoneNum.startsWith('0'));
    },
    isShowMessage() {
      return this.isShowAuthTimer ||
          this.messageType === 'incorrect' ||
          this.messageType === 'timeout';
    },
    reqResultObj() {
      let obj = {}
      if (this.messageType === 'incorrect') {
        obj.msg = this.$t('main.text.authWrongNumber')
        obj.result = false
      } else if (this.messageType === 'timeout') {
        obj.msg = this.$t('main.text.authTimeout')
        obj.result = false
      } else {
        obj.msg = this.$t('main.text.sendauthmsg')
        obj.result = true
      }
      return obj
    }
  },
  watch: {
    phoneNum(val, oldVal) {
      if (!this.$validation.isRegNumber(val)) {
        if (oldVal === undefined) oldVal = ''
        this.phoneNum = oldVal
        this.$refs.phoneNum.value = oldVal
      }
    },
    req6LenNum(val, oldVal) {
      if (!this.$validation.isRegNumber(val)) {
        if (oldVal === undefined) oldVal = ''
        this.req6LenNum = oldVal
        this.$refs.req6LenNum.value = oldVal
      }
    }
  },
  methods: {
    // click() {
    //   this.$router.push("/login/findSns/result");
    // },
    init: function() {
      this.reqBtnName = this.$t('main.text.request')
      this.messageType = ''
    },
    onClickAuthConfirm(e) {
      e.preventDefault()
      if (!this.isReadySubmit) return false

      let reqValidationCertNumber = this.validationCertNumber()
      if (reqValidationCertNumber !== false) {
        reqValidationCertNumber.then(result => {
          this.$log.debug(
            this.$options.name,
            ' validationCertNumber() result => ',
            result
          )
          // **************************************************************************
          // TODO: 1. result.data.timestamp 시간 비교하여 3분이 지난 경우 인증 실패 처리 로직 추가
          // **************************************************************************

          if (result.data.result === 'SUCCESS') {
            this.isReqPhoneNum = false

            clearInterval(this.timer)
            this.isShowAuthTimer = false
            this.isSuccesAuth = true

            this.$nextTick(() => {
              // this.$refs.req6LenNum.blur();
              this.onSubmit({id: result.data.id})
            })
          } else {
            this.messageType = 'incorrect'
            this.isReqPhoneNum = true
            this.isSuccesAuth = false
            // this.$refs.req6LenNum.value = "";
            // this.req6LenNum = "";
          }
          this.isPhoneNum = false
          this.isCheckdAuth = true
        })
      }
    },
    onSubmit: function({id}) {
      if (this.phoneNum === '') {
        this.isPhoneNum = true
        return false
      }
      const requestParams = {
        userMobile: this.phoneNum,
        userStatus: 'ACTIVATE',
      }
      this.$hiClass.userMobile.readUserStatus(requestParams)
        .then(res => {
          const findUser = res.data
          if (findUser && findUser.userType !== 'ADMIN') {
            this.$router.push(
              { path: './result', query: { userMobile: this.phoneNum, id } },
              () => {}
            )
          } else {
            this.$router.push({ path: './notFound' }, () => {})
          }
        })
        .catch(error => {
          this.$comn.log(this, 'error', error)
          this.$authentication.clear()

          switch (error.response.status) {
            case 404: {
              this.$router.push({ path: './notFound' }, () => {})
              break
            }
            default: {
              this.$router.push('/logout')
            }
          }
        })
        .finally(() => {
          //  검색 번호 저장
          this.$emit('setSearchUserMobile', this.phoneNum)
        })
    },
    onKeyInput(e) {
      try {
        const id = e.target.id
        const isEntered = e.keyCode === 13
        const isPhoneNum = id === 'phoneNum'
        const isReq6LenNum = id === 'req6LenNum'

        if (isEntered) {
          if (isPhoneNum && !this.isDisabledAuthReqBtn)
            this.startTimer('MESSAGE')

          if (isReq6LenNum && this.req6LenNum.length === 6)
            this.onClickAuthConfirm(e)

        } else if (id === 'phoneNum') {

          this.isCheckdAuth = false
          this.isReqPhoneNum = false
          this.isShowAuthTimer = false
          this.$refs['req6LenNum'].value = ''
          this.messageType = ''

          this.clearTimer()
        }

      } catch (e) {
        this.$log.debug(e)
      }
    },
    clearPhoneNum() {
      this.phoneNum = ''
      this.$refs.phoneNum.value = ''
      this.isShowAuthTimer = false
      clearInterval(this.timer)
    },
    clearReq6LenNum() {
      this.req6LenNum = ''
      this.$refs.req6LenNum.value = ''
    },
    validateById(id) {
      let jsonObj = {}
      if (id === 'phoneNum') {
        if (
          !this.$validation.isRegMobilePhoneNumberWithoutHyphen(this.phoneNum)
        ) {
          jsonObj.msg = this.$t(
            'login.auth.phone.message.validation.MobilePhone'
          )
          jsonObj.result = false
        }
      }
      // else if (id === "req6LenNum") {}

      return jsonObj
    },
    startTimer(sendType) {
      let jsonObj = this.validateById('phoneNum')
      let msg = jsonObj.msg
      let isError = jsonObj.result === false


      if (isError) {
        alert(msg)
        this.clearPhoneNum()
        return false
      }

      if (sendType === 'KAKAO') {
        this.isShowKaKaoConfirm = false
      }

      this.clearReq6LenNum()
      this.requestCertNumber(sendType)

      clearInterval(this.timer)
      this.messageType = ''
      this.timerValue = process.env.VUE_APP_CERT_NUMBER_TIME
      this.isAuthTimeout = false

      this.isShowAuthTimer = true
      this.timer = setInterval(() => {
        this.timerValue = this.timerValue - 1
      }, 1000)

      this.reqBtnName = this.$t('main.text.re_request')
      this.isCheckdAuth = true
      this.isPhoneNum = false
      this.isReqPhoneNum = true
      this.$nextTick(() => {
        setTimeout(() => {
          this.$refs.req6LenNum.focus()
        }, 100)
      })
    },
    requestCertNumber(sendType) {
      this.$axios({
        method: 'post',
        url: sendType === 'MESSAGE' ?'/sendMessages/certNumber' : '/sendMessages/certNumber/kakaotalk',
        data: {
          phone: this.phoneNum
        }
      })
    },
    validationCertNumber() {
      if (this.phoneNum.trim() === '' || this.req6LenNum.trim() === '') {
        alert(this.$t('main.text.authNumber.please'))
        return false
      } else {
        return this.$axios({
          method: 'post',
          url:
            '/sendMessages/certNumber/' + this.phoneNum + '/' + this.req6LenNum
        }).catch(error => {
          this.$log.debug(
            this.$options.name,
            ' validationCertNumber() error => ',
            error
          )
        })
      }
    },
    clearTimer() {
      this.timerValue = 0
      clearInterval(this.timer)
      this.timer = null
    },
    closeKakaoConfirm() {
      this.isShowKaKaoConfirm = false
    }
  },
  created: function() {
    this.init()
  },
  updated() {
    if (this.timer > 0 && (this.timerValue < 1 || this.timerValue === 0)) {
      this.messageType = 'timeout'
      this.isAuthTimeout = true
      this.clearTimer()
    }
  }
}
</script>

<style scoped></style>
