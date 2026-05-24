<!--
@File(Method): LoginAuthBodyPhone.vue
@Description: 로그인 본문 - 휴대폰 인증
@Modified: 2026-01-07 : #83862 로그인/회원가입 > 만 14세 미만 법정대리인 동의 추가 : 마케팅 수신동의 문구 수정
-->
<template>
  <div class="loginSns-cont-wrap">
    <div
      class="input-box-wrap input-id"
      :class="{
        focus: isFocusName
      }"
      v-show="!isIscreamTeacher"
    >
      <input
        type="text"
        id="name"
        ref="name"
        maxlength="20"
        :placeholder="$t('main.text.name')"
        :value="name"
        @input="name = $event.target.value"
        @focus="isFocusName = true"
        @blur="isFocusName = false"
        @keydown.enter.prevent.stop
        @keyup="onKeyInput($event)"
      />
    </div>
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
        <form @submit.prevent="searchPhoneNum">
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
    <p class="input-validation-text error-text" v-if="isDuplePhoneNum">
      {{ $t('main.text.alreadyUsedPhoneNum') }}
    </p>
    <p class="input-validation-text error-text" v-else-if="isPhoneNum">
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
      ref="authSuccessMsg"
      class="input-validation-text"
      :class="{
        'good-text': isSuccesMsg,
        'error-text': !isSuccesMsg
      }"
      v-if="isCheckdAuth"
    >
      {{ authMsg }}
    </p>

    <cert-number-guide v-if="isAuthTimeout" @openKakaotalkSendModal="isShowKaKaoConfirm = true"/>

    <div class="checkbox-confirm-wrap">
      <div class="agree-terms-wrap">
        <input
          type="checkbox"
          id="agree-all"
          ref="chkAll"
          @click="onClickCheckboxAll"
        />
        <label for="agree-all">
          <span>{{ $t('main.text.agreeAll') }}</span>
        </label>
      </div>
      <div class="agree-terms-wrap"
        v-if="joinUserType !== 'STUDENT'"
      >
        <input
          type="checkbox"
          id="agree-14age"
          class="agreeChkBox"
          v-model="isAgree14Age"
          @change="onChangeCheckBox"
        />
        <label for="agree-14age">
          <span><strong class="label required">{{ $t('main.text.mandatory') }}</strong>&nbsp;{{ $t('main.text.agree0') }}</span>
        </label>
      </div>
      <div class="agree-terms-wrap">
        <input
          type="checkbox"
          id="agree-terms"
          class="agreeChkBox"
          v-model="isAgreeTerms"
          @change="onChangeCheckBox"
        />
        <label for="agree-terms">
          <span><strong class="label required">{{ $t('main.text.mandatory') }}</strong>&nbsp;{{ $t('main.text.agree1') }}</span>
        </label>
        <button class="btn-view" @click="openTermsView({ layerType: 'terms' })">{{ $t('main.text.showContent') }}</button>
      </div>
      <div class="agree-terms-wrap">
        <input
            type="checkbox"
            id="agree-privacy-terms"
            class="agreeChkBox"
            v-model="isAgreePrivacyTerms"
            @change="onChangeCheckBox"
        >
        <label for="agree-privacy-terms">
          <span><strong class="label required">{{ $t('main.text.mandatory') }}</strong>&nbsp;{{ $t('main.text.agree2') }}</span>
        </label>
        <button class="btn-view" @click="openTermsView({ layerType: 'collectionPersonalInfoPreview', userType: joinUserType })">{{ $t('main.text.showContent') }}</button>
      </div>
      <div class="agree-terms-wrap">
        <input
          type="checkbox"
          id="agree-sms"
          class="agreeChkBox"
          v-model="isAgreePush"
          @change="onChangeCheckBox"
        />
        <!-- <label for="agree-sms">
          <span><strong class="label select">{{ $t('main.text.optional') }}</strong>&nbsp;{{ $t('main.text.agree3') }}</span>
        </label> -->
        <!-- #83862 마케팅 수신동의 문구 수정 -->
        <label for="agree-sms" class="agree-sms">
          <span>
            <div class="tit">
              <strong class="label select">{{ $t('main.text.optional') }}</strong>&nbsp;{{ $t('main.text.agree3') }}
            </div>
            <div class="smr">{{ $t('main.text.agree4') }}</div>
          </span>
        </label>
      </div>
      <div class="confirm-btn-wrap">
        <button
          class="btn-bg-c"
          type="button"
          :class="{
            dis: !isReadySubmit
          }"
          :disabled="!isReadySubmit"
          @click="onSubmit"
        >
          {{ $t('main.text.next') }}
        </button>
      </div>
    </div>

    <MainLoadingNewTab v-if="isMainLoadingNewTab"></MainLoadingNewTab>

    <!-- 애플 로그인 버튼 -->
    <div
      id="appleid-signin"
      class="signin-button"
      data-type="sign in"
      style="display: none"
    ></div>

    <kakao-send-confirm
        v-if="isShowKaKaoConfirm"
        :mobile="phoneNum"
        @sendKakaotalk="reRequestButtonClick('KAKAO')"
        @closeKakaoSendConfirm="closeKakaoConfirm"
    />
  </div>
</template>

<script>
import MainLoadingNewTab from '../../../main/MainLoadingNewTab.vue'
import {mapActions} from "vuex";
import KakaoSendConfirm from "@/components/Modal/KakaoSendConfirm";
import CertNumberGuide from "@/components/Login/CertNumberGuide";
import { postUsersGeneralConsents } from '@hiclass/core';
export default {
  name: 'loginAuthBodyPhone',
  data: () => ({
    name: '',
    reqBtnName: '',
    phoneNum: '',
    req6LenNum: '',
    authMsg: '',
    isCheckdAuth: false,
    isFailAuth: false,
    isSuccesAuth: false,
    isAuthTimeout: false,
    isReqPhoneNum: false,
    isDuplePhoneNum: false,
    isPhoneNum: false,
    isSubmitBtn: false,
    isAgree14Age: false,
    isAgreeTerms: false,
    isAgreePrivacyTerms: false,
    isAgreePush: false,
    isFocusName: false,
    isFocusPhoneNum: false,
    isFocusReq6LenNum: false,
    isShowAuthTimer: false,
    isSuccesClose: false,
    isMainLoadingNewTab: false,
    timer: null,
    timerValue: process.env.VUE_APP_CERT_NUMBER_TIME,
    userSns: {
      KAKAO: '카카오톡',
      NAVER: '네이버',
      GOOGLE: '구글',
      APPLE: '애플',
      GNE: '경남교육청',
      ISCREAM: '아이스크림',
      HICLASS: '하이클래스'
    },
    userType: { TEACHER: '선생님', PARENTS: '학부모', STUDENT: '학생' },
    callbackUrl: '',
    joinReadyUuid: '',
    beforePhoneNum: '',
    isShowKaKaoConfirm: false,
    joinUserType: ''
  }),
  components: {
    CertNumberGuide,
    KakaoSendConfirm,
    MainLoadingNewTab,
  },
  computed: {
    shouldCheckAge() {
      return this.joinUserType !== 'STUDENT'
    },
    isReadySubmit() {
      return this.name !== '' &&
        this.name.length >= 2 &&
        this.$validation.isRegNamePattern4(this.name) &&
        this.phoneNum !== '' &&
        this.reqBtnName !== '' &&
        this.req6LenNum.length === 6 &&
        this.isAuthTimeout === false &&
        this.isCheckdAuth &&
        this.isAgreeTerms &&
        this.isAgreePrivacyTerms && 
        (this.shouldCheckAge === true ? this.isAgree14Age : true)

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
      // 전화번호 체크
      const phoneNum = this.phoneNum.trim()
      if (!(phoneNum.length > 9 && phoneNum.startsWith('0'))) {
        return true
      }

      // 인증문자 3분 유효시간 진행 중 or 직전에 인증시도한 전화전호와 동일할 경우 => 버튼 비활성화
      return (this.timer > 0 && this.timerValue > 0) || phoneNum === this.beforePhoneNum.trim()
    },
    isSuccesMsg() {
      if (this.isAuthTimeout) return false
      else if (this.isFailAuth) return false
      else if (this.isSuccesAuth) return true
      else return this.isCheckdAuth;
    },
    isIscreamTeacher() {
      return localStorage.clientRegistrationId.toUpperCase() === 'ISCREAM' && localStorage.userType === 'TEACHER'
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
    iscream() {
      return (
        process.env.VUE_APP_BASE_LOGIN_URI +
        process.env.VUE_APP_BASE_LOGIN_ISCREAMMEDIA_PATH +
        this.callbackUrl
      )
    }
  },
  watch: {
    name(val, oldVal) {
      if (!this.$validation.isRegNamePattern4(val)) {
        if (oldVal === undefined) oldVal = ''
        this.name = oldVal
        this.$refs.name.value = oldVal
      }
    },
    phoneNum(val, oldVal) {
      if (!this.$validation.isRegNumber(val)) {
        if (oldVal === undefined) oldVal = ''
        this.phoneNum = oldVal
        this.$refs.phoneNum.value = oldVal
      }
      this.isDuplePhoneNum = false
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
    ...mapActions({
      openTermsView: "openTermsView",
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    init: function() {
      if (!this.$authentication.isAuthenticated())
        this.$router.push('/logout')
      this.reqBtnName = this.$t('main.text.request')
      this.authMsg = this.$t('main.text.sendauthmsg')
      const queryParam = this.$authentication.load()
      const userName = queryParam.name
      // 회원가입 전 로그인 uuid 저장
      this.joinReadyUuid = queryParam.uuid

      if (this.isIscreamTeacher && userName !== undefined && userName !== '') {
        this.name = userName
        // this.$refs.name.value = userName;
      }
    },
    reRequestButtonClick(sendType) {
      this.beforePhoneNum = this.phoneNum.trim()
      this.authMsg = this.$t('main.text.sendauthmsg')
      this.startTimer(sendType)
    },
    onSubmit: function() {
      if (this.name === '') {
        this.$nextTick(() => {
          this.$refs.name.focus()
        })
        return false
      }
      if (this.phoneNum === '') {
        this.isPhoneNum = true
        this.$nextTick(() => {
          this.$refs.phoneNum.focus()
        })
        return false
      }
      if (this.req6LenNum.trim() === '') {
        this.$nextTick(() => {
          this.$refs.req6LenNum.focus()
        })
        return false
      }
      if (!this.isAgreeTerms) {
        alert(this.$t('login.auth.phone.message.agreeTerms'))
        return false
      }
      if (!this.isAgreePrivacyTerms) {
        alert(this.$t('login.auth.phone.message.agreePrivacyTerms'))
        return false
      }
      if(this.shouldCheckAge && !this.isAgree14Age) {
        alert(this.$t('login.auth.phone.message.selectAge'))
        return false
      }
      if (this.req6LenNum.length !== 6) {
        this.authMsg = this.$t('main.text.authWrongNumber')
        this.isFailAuth = true
        this.$nextTick(() => {
          this.$refs.req6LenNum.focus()
        })
        return false
      }

      const queryParam = this.$authentication.load()
      // 저장된 로그인 uuid와 localStorage.uuid 값 비교하여 다르면 로그아웃 처리
      if (this.joinReadyUuid !== queryParam.uuid) {
        alert(
          '로그인 정보가 변경되었습니다.\n회원가입이 정상 처리되지 않았습니다.'
        )
        this.$router.push('/logout', () => {})
        return false
      }

      let reqValidationCertNumber = this.validationCertNumber()
      if (reqValidationCertNumber !== false) {
        reqValidationCertNumber.then(result => {
          this.$log.debug(
            this.$options.name,
            ' validationCertNumber() result => ',
            result
          )
          if (result.data.result === 'SUCCESS') {
            this.onSubmitProc()

          } else {
            this.authMsg = this.$t('main.text.authWrongNumber')
            this.isReqPhoneNum = true
            this.isSuccesAuth = false
            this.isFailAuth = true
            // this.$refs.req6LenNum.value = "";
            // this.req6LenNum = "";
          }
          this.isPhoneNum = false
          this.isCheckdAuth = true
          return false
        })
      }
    },
    onSubmitProc() {
      let queryParam = this.$authentication.load()

      let createUserParams = {
        userName: this.name,
        userMarketingUsed: this.isAgreePush,
        userPushUsed: this.isAgreePush,
        userMobile: this.phoneNum,
        userType: queryParam.userType,
        deviceInfo: 'PC',
        isUseSetting: false
      }
      const requestParams = {
        _userMobile: this.phoneNum
      }
      this.$hiClass.users.search(requestParams)
        .then(async res => {
          const findUsers = res.data._embedded.users.filter(user => user.userType !== 'ADMIN')

          if (findUsers.length === 0) {
            // PUSH 체크 여부 추가 확인
            if (!this.isAgreePush)
              this.reConfirmAgreePushCheck()

            // PUSH 체크 여부 추가 반영
            if (this.isAgreePush) {
              createUserParams.userMarketingUsed = this.isAgreePush
              createUserParams.userPushUsed = this.isAgreePush
            }
            this.isMainLoadingNewTab = true
            const clientRegistrationId = localStorage.getItem('clientRegistrationId') || null
            
            const selectAgeUnder14 = sessionStorage.getItem('selectAgeUnder14') || null
            console.log(`selectAgeUnder14 ${selectAgeUnder14}`);
            if(this.shouldCheckAge || selectAgeUnder14 === 'false') {
              await this.postGeneralConsents();
              sessionStorage.removeItem('selectAgeUnder14');
            }
            const userUri = await this.createUser(createUserParams)

            // 회원 가입시 비동기로 sign_up 이벤트 발생
            this.triggerAnalyticsLogEvent({code: 'sign_up', params: { method: clientRegistrationId?.toLowerCase() }}).then()

            this.redirectMain(userUri)

          } else if (findUsers.length === 1) {
            const userInfo = findUsers[0]
            let msg = ''
            msg += `${userInfo.userMobile}<br><br>`
            msg += `'${this.userType[userInfo.userType.toUpperCase()]}',`
            msg += `'${this.userSns[userInfo.userSns.toUpperCase()]}' `
            msg += `계정으로 회원가입 이력이 있습니다.<br>`
            msg += `해당 계정으로 로그인하시겠습니까?`

            this.$hiClass.confirm(msg, 'info')
              .then(() => {
                // 해당 계정으로 연결
                this.isMainLoadingNewTab = true
                if (userInfo.userSns.toUpperCase() === 'ISCREAM'
                  && queryParam.clientRegistrationId.toUpperCase() === 'ISCREAM') {
                  this.logoutTeacher()
                } else {
                  this.socialButtonClick(userInfo)
                }
              })

          } else if (findUsers.length > 1) {
            this.$hiClass.alert(`해당 휴대전화의 회원이 여러 명입니다.<br>고객센터에 문의해주세요.`, 'warning')
              .then(() => this.$router.push('/logout'))
          }
        })
        .catch(error => {
          this.$comn.log(this, 'error', error)
          this.$authentication.clear()
        })
    },
    onKeyInput(e) {
      const id = e.target.id
      // const value = this.$refs[id].value;

      if (e.keyCode === 13 && this[id] !== '' && !this.isDisabledAuthReqBtn) {
        if (id === 'phoneNum') this.searchPhoneNum()
      } else {
        if (id === 'phoneNum') {
          // 방향키 왼쪽, 오른쪽
          if (e.keyCode === 37 || e.keyCode === 39) return

          this.isCheckdAuth = false
          this.isReqPhoneNum = false
          this.isShowAuthTimer = false
          this.isSuccesAuth = false
          this.isFailAuth = false
          this.$refs['req6LenNum'].value = ''

          // backspace, delete
          if (e.keyCode === 8 || e.keyCode === 46) {
            this.$refs.req6LenNum.value = "";
            this.req6LenNum = "";

            clearInterval(this.timer)
            this.timer = null
            this.timerValue = 0
          }
        }
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
      this.isSuccesAuth = false
      this.isFailAuth = false
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
    onClickCheckboxAll() {
      this.$log.debug('onClickCheckboxAll => ', this.$refs.chkAll.checked)
      const checkValue = this.$refs.chkAll.checked

      console.log(`this.shouldCheckAge ${this.shouldCheckAge}`)
      if (checkValue) {
        this.isAgreeTerms = true
        this.isAgreePrivacyTerms = true
        this.isAgreePush = true
        if(this.shouldCheckAge === true) this.isAgree14Age = true
      } else {
        this.isAgreeTerms = false
        this.isAgreePrivacyTerms = false
        this.isAgreePush = false
        if(this.shouldCheckAge === true) this.isAgree14Age = false
      }
    },
    onChangeCheckBox() {
      var checkBoxs = document.getElementsByClassName('agreeChkBox')
      let isCheckedAll = false
      let checkBoxTrueCount = 0
      for (let i = 0; i < checkBoxs.length; i++) {
        this.$log.debug(`checkBoxs[${i}].checked => ` + checkBoxs[i].checked)
        if (checkBoxs[i].checked === true) checkBoxTrueCount++
      }
      if (checkBoxs.length === checkBoxTrueCount) isCheckedAll = true

      this.$refs.chkAll.checked = isCheckedAll
    },
    socialButtonClick(userInfo) {
      const userSns = userInfo.userSns.toLowerCase()
      const userType = userInfo.userType
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
    reConfirmAgreePushCheck() {
      let msg = ''
      let flag = false
      msg +=
        '마케팅 SMS, 앱 푸시 알림 수신 동의(선택) 항목에 미동의할 경우 이벤트 참여가 불가하거나 혜택을 받으실 수 없습니다. 동의하고 가입하시겠습니까?'
      flag = confirm(msg)
      this.isAgreePush = flag
    },
    postOnceChecks(flag, userUri) {
      if (userUri === undefined) {
        return false
      }

      return this.$axios({
        method: 'post',
        url: '/onceChecks',
        data: {
          user: userUri,
          flag: flag
        }
      })
    },
    logoutTeacher() {
      const protocol = window.location.protocol
      const hostname = window.location.hostname
      const port = this.$comn.getLocationPort()
      const domainUrl = protocol + '//' + hostname + port
      let callbackUrl =
        // domainUrl + process.env.VUE_APP_BASE_LOGOUT_CALLBACK_PARAMETER_SUFFIX;
        domainUrl + '/login/teacher'

      window.location.href = process.env.VUE_APP_BASE_ISCREAM_OAUTH2_URI +
        process.env.VUE_APP_BASE_LOGIN_ISCREAM_SSO_LOGOUT_PATH +
        process.env.VUE_APP_BASE_LOGIN_CALLBACK_PARAMETER_PREFIX +
        encodeURIComponent(callbackUrl)
      return false
    },

    searchPhoneNum() {
      const requestParams = {
        _userMobile: this.phoneNum
      }
      this.$hiClass.users.search(requestParams)
        .then(res => {
          if (res.data._embedded.users.length > 0) {
            this.isDuplePhoneNum = true

          } else {
            // 해당 휴대폰 번호로 가입 가능
            this.isDuplePhoneNum = false
            this.reRequestButtonClick('MESSAGE')
          }
        })
        .catch(err => {
          this.$log.error(err)
        })
    },

    async postGeneralConsents() {
      await postUsersGeneralConsents();
    },

    createUser(createUserParams) {
      // userUri 값을 반환
      return this.$hiClass.users.create(createUserParams)
        .then(res => res.data._links.self.href)
        .catch(error => {
          this.$comn.log(this, 'error', error)
          this.isMainLoadingNewTab = false
        })
    },

    redirectMain(userUri) {
      if (userUri) {
        if (this.isAgreePush)
          this.postOnceChecks('userMarketingUsed', userUri)

        this.postOnceChecks('userAgreeTerms', userUri)
          .then(() => this.isSuccesClose = true)
          .finally(() => this.$router.push('/main', () => {}))
      } else {
        this.isSuccesClose = true
        this.$router.push('/main', () => {})
      }
    },

    closeKakaoConfirm() {
      this.isShowKaKaoConfirm = false
    }

  },
  created() {
    this.joinUserType = this.$authentication.load().userType || ''
    this.setCallbackUrl()
  },
  mounted() {
    this.init()
    this.$nextTick(() => {
      if (this.isIscreamTeacher && (this.name === '' || this.name === null))
        this.name = '미입력'
    })
  },
  updated() {
    if (this.timer > 0 && (this.timerValue < 1 || this.timerValue === 0)) {
      this.beforePhoneNum = ''
      this.authMsg = this.$t('main.text.authTimeout')
      this.timerValue = 0
      this.isAuthTimeout = true
      clearInterval(this.timer)
      this.timer = null
    }
  }
}
</script>

<style scoped>
.page-login .loginSns-cont-wrap .request-wrap .request-btn-wrap button {
  border-radius: 4px;
}
</style>
