<template>
  <div class="loginSns-cont-wrap">

    <!-- 이름 -->
    <div
      v-if="isIncludeUserName"
      class="input-box-wrap input-id"
      :class="{
        focus: option.focus.userName,
        readonly: option.disabled.userName
      }"
    >
      <input
        ref="userName"
        v-model="model.userName"
        :placeholder="$t('main.text.name')"
        :disabled="option.disabled.userName"
        @keydown.enter.prevent.stop
        @keyup="handleInputUserName"
        @focus="handleInputUserName"
        @blur="handleInputUserName"
      />
    </div>

    <div class="request-wrap">

      <!-- 휴대폰 번호 입력 -->
      <div
        class="input-box-wrap input-id"
        :class="{
          focus: option.focus.userMobile,
          readonly: option.disabled.userMobile
        }"
      >
        <hc-input-mobile-phone
          ref="userMobile"
          :value="model.userMobile"
          :disabled="option.disabled.userMobile"
          @handleInput="handleInputUserMobile"
        />
      </div>

      <!-- 인증요청 버튼 -->
      <div class="request-btn-wrap">
        <form @submit.prevent="clickRequestButton('MESSAGE')">
          <button
            type="submit"
            class="btn-bg-c"
            :class="{
              dis: isDisabledAuthRequestButton
            }"
            :disabled="isDisabledAuthRequestButton"
          >
            {{ requestButtonName }}
          </button>
        </form>
      </div>

    </div>

    <p class="input-validation-text error-text" v-if="isAuthRequest && !model.userMobile">
      {{ $t('main.text.reqphonenum') }}
    </p>

    <div
      class="input-box-wrap input-pw"
      :class="{
        focus: option.focus.certNumber,
        dis: option.disabled.certNumber
      }"
    >
      <hc-input-cert-number
        ref="certNumber"
        :value="model.certNumber"
        :disabled="option.disabled.certNumber"
        @handleInput="handleInputCertNumber"
      />

      <div
        v-if="option.show.authTimer"
        class="timer-text"
      >
        {{ authTimer }}
      </div>

    </div>

    <p
      v-if="option.flag.checkdAuth"
      class="input-validation-text"
      :class="{
        'good-text': isSuccessMsg,
        'error-text': !isSuccessMsg
      }"
    >
      {{ message.auth }}
    </p>

    <cert-number-guide v-if="option.flag.authTimeout" @openKakaotalkSendModal="option.show.kaKaoConfirm = true"/>

    <div class="checkbox-confirm-wrap">
      <div class="confirm-btn-wrap">
        <form @submit.prevent="onSubmit">
          <button
            class="btn-bg-c"
            type="submit"
            :class="{
              dis: !isReadySubmit
            }"
            :disabled="!isReadySubmit"
          >
            {{ $t('main.text.next') }}
          </button>
        </form>
      </div>
    </div>

    <div>
      <ul class="text-list">
        <li
          v-for="(content, index) of contents"
          :key="`recertification-content-${index}`"
          :inner-html.prop="content"
        ></li>
      </ul>
    </div>

    <!-- 로딩 백그라운드 투명 처리 -->
    <loading-overlay
      key="loading-overlay"
      :active.sync="option.flag.busy"
      :can-cancel="false"
      :is-full-page="true"
      :color="'#4275df'"
      :backgroundColor="'rgba(90,90,90,0)'"
      :blur="'0px'"
      :opacity="0"
    />

    <!-- 애플 로그인 버튼 -->
    <div
      id="appleid-signin"
      class="signin-button"
      data-type="sign in"
      style="display: none"
    ></div>

    <kakao-send-confirm
        v-if="option.show.kaKaoConfirm"
        :mobile="model.userMobile"
        @sendKakaotalk="clickRequestButton('KAKAO')"
        @closeKakaoSendConfirm="closeKakaoConfirm"
    />
  </div>
</template>

<script>
import HcInputName from "@/components/Form/HcInputName";
import HcInputMobilePhone from "@/components/Form/HcInputMobilePhone";
import HcInputCertNumber from "@/components/Form/HcInputCertNumber";
import validate from "uuid-validate";
import KakaoSendConfirm from "@/components/Modal/KakaoSendConfirm";
import CertNumberGuide from "@/components/Login/CertNumberGuide";
import {mapActions} from "vuex";

export default {
  name: "login-recertification",
  components: {
    CertNumberGuide,
    KakaoSendConfirm,
    HcInputCertNumber,
    HcInputMobilePhone,
    HcInputName,
    LoadingOverlay: () => import('vue-loading-overlay')
  },
  data() {
    return {
      option: {
        flag: {
          busy: false,
          authTimeout: false,
          checkdAuth: false,
          userMobile: false,
          certNumber: false,
          succesAuth: false,
          failAuth: false
        },
        show: {
          authTimer: false,
          kaKaoConfirm: false
        },
        focus: {
          userName: false,
          userMobile: false,
          certNumber: false
        },
        disabled: {
          userName: false,
          userMobile: false,
          requestButton: false,
          certNumber: true
        },
        action: null // 인증 처리 상태
      },
      model: {
        userName: null,
        userMobile: null,
        certNumber: null
      },
      userCertifications: {
        phone: null,
        certNumber: null,
        timestamp: null,
        last: null,
        result: null,             // 최종 인증 상태 (성공, 실패)
        resultCertNumber: null,   // 인증번호 검증 상태 (성공, 실패)
        resultUpdate: null,       // 인증 업데이트 상태 (성공, 실패)
        resultUserName: null,
        reason: null,
        snsType: null,
        userName: null,           // 마스킹된 마이페이지 이름
      },
      authModel: {
        userName: null,
        userMobile: null,
        certNumber: null
      },
      message: {
        auth: this.$t('main.text.sendauthmsg')
      },
      callbackUrl: null,
      timer: null,
      timerValue: process.env.VUE_APP_CERT_NUMBER_TIME,
      requestButtonName: this.$t('main.text.request'),
      loginChoiceSnsTypes: ['KAKAO', 'NAVER', 'GOOGLE', 'APPLE'],
    }
  },
  computed: {
    isAuthRequest() {
      return this.option.action === 'request'
    },
    isDisabledAuthRequestButton() {
      if (!this.model.userMobile || this.timer > 0 && this.timerValue > 0) {
        return true
      } else if (this.isIncludeUserName && !this.model.userName) {
        return true
      }
      const userMobile = this.model.userMobile.trim()
      return !(userMobile.length > 9 && userMobile.startsWith('0'));
    },
    isReadyUserName() {
      return this.isIncludeUserName
        ? this.model.userName && this.model.userName.length >= 2 && this.$validation.isRegNamePattern4(this.model.userName)
        : true
    },
    isReadyUserMobile() {
      return this.model.userMobile && this.model.userMobile.length > 9 && this.model.userMobile.startsWith('0')
    },
    isReadyCertNumber() {
      return this.model.certNumber && this.model.certNumber.length === 6
    },
    isReadySubmit() {
      return this.isReadyUserName &&
        this.isReadyUserMobile &&
        this.isReadyCertNumber &&
        this.option.flag.authTimeout === false &&
        this.option.flag.checkdAuth &&
        !this.option.flag.busy
    },
    isSuccessMsg() {
      if (this.option.flag.authTimeout) return false
      else if (this.option.flag.failAuth) return false
      else if (this.option.flag.succesAuth) return true
      else return this.option.flag.checkdAuth;
    },
    userCertificationId() {
      let uuid = sessionStorage.getItem('userCertificationId')
      if (uuid && !validate(uuid))
        uuid = null

      return uuid
    },
    isIncludeUserName() {
      return !this.userCertificationId
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
    contents() {
      let contents = []
      const text1 = this.isIncludeUserName ? this.$t('login.recertification.content.text1') : this.$t('login.recertification.content.text3')
      const text2 = `${this.$t('login.recertification.content.text2-1')}${this.$t('login.recertification.content.text2-2')}`
      contents.push(text1)
      contents.push(text2)
      return contents
    },
    kakao() {
      return (
        process.env.VUE_APP_BASE_LOGIN_URI +
        process.env.VUE_APP_BASE_LOGIN_KAKAO_PATH +
        this.callbackUrl
      )
    },
    naver() {
      return (
        process.env.VUE_APP_BASE_LOGIN_URI +
        process.env.VUE_APP_BASE_LOGIN_NAVER_PATH +
        this.callbackUrl
      )
    },
    google() {
      return (
        process.env.VUE_APP_BASE_LOGIN_URI +
        process.env.VUE_APP_BASE_LOGIN_GOOGLE_PATH +
        this.callbackUrl
      )
    },
    apple() {
      return (
        process.env.VUE_APP_BASE_LOGIN_URI +
        process.env.VUE_APP_BASE_LOGIN_APPLE_PATH
      )
    },
    gne() {
      return (
        process.env.VUE_APP_BASE_LOGIN_URI +
        process.env.VUE_APP_BASE_LOGIN_GNE_PATH +
        this.callbackUrl
      )
    },
  },
  created() {
    this.init()
  },
  updated() {
    if (this.timer > 0 && this.timerValue <= 0) {
      this.message.auth = this.$t('main.text.authTimeout')
      this.timerValue = 0
      this.option.flag.authTimeout = true
      clearInterval(this.timer)
      this.timer = null
    }
  },
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    init() {
      try {
        const snsType = localStorage.clientRegistrationId ? localStorage.clientRegistrationId.toUpperCase() : null

        if (!this.$authentication.isAuthenticated() || !this.loginChoiceSnsTypes.includes(snsType))
          this.$router.push('/logout')

      } catch (e) {
        this.$router.push('/logout')
      }

      this.setCallbackUrl()
    },

    setCallbackUrl() {
      const protocol = window.location.protocol
      const hostname = window.location.hostname
      const port = this.$comn.getLocationPort()
      const domainUrl = protocol + '//' + hostname + port
      this.callbackUrl =
          process.env.VUE_APP_BASE_LOGIN_CALLBACK_PARAMETER_PREFIX +
          domainUrl +
          process.env.VUE_APP_BASE_LOGIN_CALLBACK_PARAMETER_SUFFIX
    },

    setModelValue(elName, evt) {
      if (evt.type === 'blur' ||
        evt.type === 'keyup' && evt.keyCode === 13) {
        this.model[elName] = evt.target.value
      }
    },

    setInputFocus(elName) {
      if (this.$refs[elName])
        this.$refs[elName].$el.focus()
    },

    handleInputFocus(elName, evtType) {
      if (evtType === 'focus')
        this.option.focus[elName] = true
      else if (evtType === 'blur')
        this.option.focus[elName] = false
    },

    handleInputUserName(evt) {
      const elName = 'userName'
      this.handleInputFocus(elName, evt.type)
      // this.setModelValue(elName, evt)
      this.model[elName] = evt.target.value

      if (evt.type === 'keyup' && evt.keyCode === 13) {
        this.setInputFocus('userMobile')
      }

      if (this.model[elName] === null || this.model[elName] === '') {
        this.clearForm('userMobile')
        this.clearForm('certNumber')
      }
    },

    handleInputUserMobile(evt) {
      const elName = 'userMobile'
      this.handleInputFocus(elName, evt.type)
      // this.setModelValue(elName, evt)
      this.model[elName] = evt.target.value

      if (evt.type === 'keyup' && evt.keyCode === 13 &&
          this.model[elName].length > 9 && this.model[elName].startsWith('0')
      ) {
        this.clickRequestButton('MESSAGE')
      }

      if (this.model[elName] === null || this.model[elName] === '') {
        this.clearForm('certNumber')
      }
    },

    handleInputCertNumber(evt) {
      const elName = 'certNumber'
      this.handleInputFocus(elName, evt.type)
      // this.setModelValue(elName, evt)
      this.model[elName] = evt.target.value

      if (evt.type === 'keyup' && evt.keyCode === 13 &&
          this.model[elName].length === 6 && this.isReadySubmit) {
        this.onSubmit()
      }
    },

    clickRequestButton(sendType) {
      // 메시지 초기화
      this.option.action = null

      this.message.auth = this.$t('main.text.sendauthmsg')
      this.option.action = 'request'

      if (sendType === 'KAKAO') {
        this.option.show.kaKaoConfirm = false
      }

      this.startTimer(sendType)
    },

    startTimer(sendType) {
      let jsonObj = this.validateById('userMobile')
      let msg = jsonObj.msg
      let isError = jsonObj.result === false

      if (isError) {
        this.$hiClass.alert(msg)
        this.clearForm('userMobile')
        return false
      }

      this.clearForm('certNumber')
      this.requestCertNumber(sendType)

      clearInterval(this.timer)
      this.timerValue = process.env.VUE_APP_CERT_NUMBER_TIME
      this.option.show.authTimer = false
      this.option.flag.authTimeout = false

      this.option.show.authTimer = true
      this.timer = setInterval(() => {
        this.timerValue = this.timerValue - 1
      }, 1000)

      this.requestButtonName = this.$t('main.text.re_request')

      this.option.flag.checkdAuth = true
      this.option.flag.userMobile = false
      this.option.disabled.certNumber = false

      this.authModel = Object.assign({}, this.model)

      this.$nextTick(() => {
        setTimeout(() => {
          this.setInputFocus('certNumber')
        }, 100)
      })
    },

    validateById(id) {
      let jsonObj = {}
      if (id === 'userMobile') {
        if (
          !this.$validation.isRegMobilePhoneNumberWithoutHyphen(this.model.userMobile)
        ) {
          jsonObj.msg = this.$t(
            'login.auth.phone.message.validation.MobilePhone'
          )
          jsonObj.result = false
        }
      }

      return jsonObj
    },

    async requestCertNumber(sendType) {
      await this.$axios({
        method: 'post',
        url: sendType === 'MESSAGE' ? '/sendMessages/certNumber' : '/sendMessages/certNumber/kakaotalk',
        data: {
          phone: this.model.userMobile
        }
      })
    },

    clearTimer() {
      this.option.show.authTimer = false

      clearInterval(this.timer)
      this.timer = null
      this.timerValue = process.env.VUE_APP_CERT_NUMBER_TIME
    },

    clearForm(elName) {
      this.model[elName] = null
      this.$refs[elName].$el.value = null

      if (elName === 'userMobile') {
        this.clearTimer()

      } else if (elName === 'certNumber') {
        this.option.flag.succesAuth = false
        this.option.flag.failAuth = false
        this.option.flag.checkdAuth = false

        this.clearTimer()
      }
    },

    async onSubmit() {
      if (!this.option.flag.busy) {
        const elNameArr = ['userMobile', 'certNumber']
        if (this.isIncludeUserName)
          elNameArr.push('userName')

        for (const elName of elNameArr) {
          if (!this.model[elName]) {
            this.$nextTick(() => this.setInputFocus(elName))
            return false
          }
        }

        if (this.model['userMobile'] !== this.authModel['userMobile']) {
          this.$hiClass.alert(this.$t('login.recertification.error.change.userMobile'))
            .then(() => this.setInputFocus('userMobile'))
          return false
        }

        if (this.model['certNumber'].length !== 6) {
          this.message.auth = this.$t('main.text.authWrongNumber')
          this.option.flag.failAuth = true
          this.$nextTick(() => this.setInputFocus('certNumber'))
          return false
        }

        this.option.flag.busy = true

        // 재인증 요청
        this.onSubmitProc()
          .then(() => {
            const isNotLast = (this.userCertifications.last !== null && this.userCertifications.last === false)
            const isWrongCertNumber = this.userCertifications.resultCertNumber === 'FAIL' || this.userCertifications.certNumber !== this.model.certNumber
            const isWrongUserName = this.userCertifications.resultUserName === 'INVALID_NAME'
            const maskedUserName = this.userCertifications.userName

            // 입력한 인증번호가 유효하지 않은 경우
            if (isNotLast || isWrongCertNumber) {
              const message = this.$t('login.recertification.error.wrong.certNumber')
              this.$hiClass.alert(message)

              return false
            }

            // 재인증 성공 시 진입했던 소셜로그인 재요청
            if (this.userCertifications.result === 'SUCCESS') {
              this.triggerAnalyticsLogEvent({ code: `analytics.login.recertification.success` })
              this.doLogin()
              return false
            }

            // 재인증 실패
            if (this.userCertifications.result === 'FAIL') {
              const reason = this.userCertifications.reason
              const responseSnsType = this.userCertifications.snsType ? this.userCertifications.snsType.toUpperCase() : null
              const requestSnsType = localStorage.clientRegistrationId ? localStorage.clientRegistrationId.toUpperCase() : null

              /**
               * 재인증 실패 케이스
               */
              // 회원정보가 존재하지 않는 경우
              if (reason === 'NOT_EXIST') {
                this.loginFailMessage()

                return false
              }

              /**
               * [이름 & 휴대폰번호 입력 화면] 휴대폰 재인증 실패
               */
              if (this.isIncludeUserName) {

                // 재인증 시 입력한 마이페이지 이름이 일치하지 않는 경우 이름을 마스킹하여 안내
                if (isWrongUserName && maskedUserName) {
                  this.loginFailMessage('mismatchedUserName')

                // sns 유형 일치 시 고객센터 안내 메시지
                } else if (responseSnsType === requestSnsType) {
                  this.loginFailMessage()

                  // sns 유형 불일치 시 SNS 찾기
                } else {
                  this.routeFindSnsResult()
                }

                /**
                 * [휴대폰번호 입력 화면] 휴대폰 재인증 실패
                 */
              } else {
                this.loginFailMessage()
                // this.userCertifications.resultUpdate === 'INVALID_PHONE'
                //   ? this.loginFailMessage()
                //   : this.loginFailMessage()
              }
            } else {
              this.loginFailMessage()
            }
          })
          .finally(() => {
            this.option.flag.busy = false

            // 인증번호 form 블러 처리
            this.$refs.certNumber.$el.blur()
          })

      }

    },

    onSubmitProc() {
      const params = {
        userMobile: this.model.userMobile,
        certNumber: this.model.certNumber
      }
      this.isIncludeUserName
        ? params.userName = this.model.userName
        : params.userId = this.userCertificationId

      return this.$axios({
        method: 'patch',
        url: '/user/certifications',
        data: params
      })
        .then(res => {
          this.$log.debug(`/user/certifications patch res => `, res)
          if (res && res.data)
            this.userCertifications = res.data
        })
        .catch(err => {
          this.$log.warn(`/user/certifications patch err => `, err)
        })
    },

    doLogin() {
      const queryParam = this.$authentication.load()
      const userSns = queryParam.clientRegistrationId.toLowerCase()
      const userType = queryParam.userType
      const path = this[userSns]

      // 애플 로그인
      if (userSns.indexOf('apple') > -1) {
        window.AppleID.auth.init({
          clientId: 'ios.com.iscreammedia.app.hiclass',
          scope: 'name email',
          redirectURI: `${path}?userType=${userType}`,
          state: 'STATE'
        })
        document.querySelector('#appleid-signin').click()
      } else {
        window.location.href = `${path}?userType=${userType}`
      }
    },

    routeFindSnsResult() {
      const pathObj = {
        path: '/login/findSns/result',
        query: { userMobile: this.model.userMobile, recertification: true }
      }
      this.$router.push(pathObj,  () => {})
    },

    loginFailMessage(code) {
      let message
      switch (code) {
        case 'mismatchedUserName': {
          message = this.$t('login.recertification.error.fail.mismatchedUserName', { maskedUserName: this.userCertifications.userName })
          break
        }
        default: {
          message = this.$t('login.recertification.error.fail.certification1') + this.$t('login.recertification.error.fail.certification2')
        }
      }

      this.$hiClass.alert(message)
    },

    /**
     * alert modal message
     * @param message
     */
    alert(message) {
      const popupMessage = {
        isOpen: true,
        message,
      }
      this.$store.commit('setPopupMessage', popupMessage)
    },

    closeKakaoConfirm() {
      this.option.show.kaKaoConfirm = false
    }
  }
}
</script>

<style scoped>

</style>