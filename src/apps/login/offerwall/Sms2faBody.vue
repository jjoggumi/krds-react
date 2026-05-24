<template>
  <div id="loginBodyFindIdBodyItemSearch" class="login-box-wrap boundary-box">
    <p class="title-text">
      휴대폰 번호 인증
    </p>
    <p class="description-text">
      로그인한 계정에 등록된 휴대폰 번호로 2차 인증을 진행합니다.<br>
      휴대폰 번호가 잘못 등록 되어 있거나 바뀐 경우 관리자에게 문의해 주세요.
    </p>

    <div class="findSnsId-cont-wrap step1">
      <div class="request-wrap">
        <!-- User info and authentication button -->
        <div class="user-info">
          <p><span class="label">아이디 : </span> <span class="value">{{ loginId }}</span></p>
          <p><span class="label">휴대폰 번호 : </span> <span class="value">{{ phoneNum }}</span></p>
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

      <div class="confirm-btn-wrap">
        <button
          class="btn-border"
          type="button"
          @click="goToPreviousPage"
        >
          이전화면으로 이동
        </button>
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
    </div>
  </div>
</template>

<script>
export default {
  name: 'loginBodyFindIdBodyItemSearch',
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
    isShowKaKaoConfirm: false,
    isPhoneNumDisabled: false,
    hasApiError: false,
    apiErrorMessage: '',
    loginId: '',
    userInfo: null,
    isFormSubmitted: false
  }),
  computed: {
    isReadySubmit() {
      return this.reqBtnName !== '' &&
          this.isCheckdAuth &&
          this.req6LenNum.length === 6 &&
          this.isAuthTimeout === false &&
          this.isFormSubmitted;
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
          this.messageType === 'timeout' ||
          this.messageType === 'error';
    },
    reqResultObj() {
      let obj = {}
      if (this.messageType === 'incorrect') {
        obj.msg = this.$t('main.text.authWrongNumber')
        obj.result = false
      } else if (this.messageType === 'timeout') {
        obj.msg = this.$t('main.text.authTimeout')
        obj.result = false
      } else if (this.messageType === 'error') {
        obj.msg = "인증번호 발송 중 오류 발생"
        obj.result = false
      } else {
        obj.msg = "계정에 등록된 휴대폰 번호로 인증번호가 전송되었습니다."
        obj.result = true
      }
      return obj
    }
  },
  watch: {
    req6LenNum(val, oldVal) {
      if (!this.$validation.isRegNumber(val)) {
        if (oldVal === undefined) oldVal = ''
        this.req6LenNum = oldVal
        this.$refs.req6LenNum.value = oldVal
      }

      // Check if the input is 6 digits and update isCheckdAuth
      if (val && val.length === 6) {
        this.isCheckdAuth = true;
      }
    }
  },
  methods: {
    init: function() {
      this.reqBtnName = this.$t('main.text.request')
      this.messageType = ''
      this.isFormSubmitted = false
    },
    fetchUserInfo: function() {
      var uuid = localStorage.getItem('uuid');
      var idToken = localStorage.getItem("idToken");

      if(uuid === null || idToken === null) {
        this.$router.push('/logout', () => {})
        return false
      }

      this.$axios({
        method: 'get',
        url: `/advertiser/${uuid}`,
        headers: {
          Authorization: 'Bearer ' + idToken
        },
      })
      .then(response => {
        this.userInfo = response.data;
        if (this.userInfo) {
          this.loginId = this.userInfo.loginId;
          // Mask the phone number if available
          if (this.userInfo.userMobile) {
            const mobile = this.userInfo.userMobile;
            // Format: 010****1234
            if (mobile.length >= 11) {
              const first = mobile.substring(0, 3);
              const last = mobile.substring(mobile.length - 3);
              this.phoneNum = `${first}-****-*${last}`;
            } else {
              this.phoneNum = mobile;
            }
          }
        }
      })
      .catch(error => {
        this.$log.debug(
          this.$options.name,
          ' fetchUserInfo() error => ',
          error
        );
      });
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
              this.clearReq6LenNum();
              // this.$refs.req6LenNum.blur();
              this.$router.push('/offerwall', () => {})
            })
          } else {
            this.messageType = 'incorrect'
            this.isReqPhoneNum = true
            this.isSuccesAuth = false
            // this.$refs.req6LenNum.value = "";
            // this.req6LenNum = "";
            this.clearReq6LenNum();
          }
          this.isPhoneNum = false
          this.isCheckdAuth = true
        })
      }
    },
    onKeyInput(e) {
      try {
        const id = e.target.id
        const isEntered = e.keyCode === 13
        const isReq6LenNum = id === 'req6LenNum'

        if (isEntered) {
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
      this.isFormSubmitted = true
      this.$nextTick(() => {
        setTimeout(() => {
          this.$refs.req6LenNum.focus()
        }, 100)
      })
    },
    requestCertNumber(sendType) {
      this.clearReq6LenNum();
      // Reset error state
      this.hasApiError = false;
      this.apiErrorMessage = '';
      this.messageType = '';

      var uuid = localStorage.getItem('uuid');
      var idToken = localStorage.getItem("idToken");
      if(uuid === null || idToken === null) {
        this.$router.push('/logout', () => {})
        return false
      }
      this.$log.debug(
        this.$options.name,
        ' requestCertNumber() uuid => ',
        uuid
      )
      this.$axios({
        method: 'post',
        url: '/sendMessages/certNumber/advertiser',
        data: {
          userId: uuid
        },
        headers: {
          Authorization: 'Bearer ' + idToken
        },
      })
      .then(response => {
        // API call successful
        this.hasApiError = false;
        this.apiErrorMessage = '';
        // Set messageType to trigger the correct behavior in reqResultObj()
        this.messageType = '';
        // Make sure isShowMessage is true
        this.isShowAuthTimer = true;
      })
      .catch(error => {
        // API call failed
        this.hasApiError = true;
        this.apiErrorMessage = error.response ? error.response.data : error.message;
        // Set messageType to 'error' when there's an error
        this.messageType = 'error';
        this.$log.debug(
          this.$options.name,
          ' requestCertNumber() error => ',
          error
        );
      });
    },
    validationCertNumber() {
      if (this.req6LenNum.trim() === '') {
        alert(this.$t('main.text.authNumber.please'))
        return false
      } else {
        return this.$axios({
          method: 'get',
          url:
            '/sendMessages/certNumber/advertiser/' + this.req6LenNum
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
    },
    goToPreviousPage() {
      // 이전으로 갈때는 이미 로그인한 것이기에 로그 아웃 시킨 후 로그인 화면으로 이동시킨다.
      this.$router.replace('/logout/offerwall');
    }
  },
  created: function() {
    this.init()
    // Fetch user information first
    this.fetchUserInfo();

    this.$nextTick(() => {
      this.reqBtnName = this.$t('main.text.request')
      this.isCheckdAuth = true
      this.isReqPhoneNum = true
    })
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

<style scoped>
.title-text {
  font-size: 24px;
  color: #0066cc;
  font-weight: bold;
  margin-bottom: 15px;
  text-align: center;
}

.description-text {
  font-size: 16px;
  color: #333;
  margin: 15px 0 25px;
  text-align: center;
  line-height: 1.5;
}

.auth-message {
  font-size: 16px;
  color: #333;
  margin: 15px 0;
  text-align: center;
  line-height: 1.5;
  font-weight: 500;
}

.auth-message.error {
  color: #e74c3c;
  font-weight: 600;
}

.request-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.user-info {
  text-align: left;
  margin-right: 15px;
}

.user-info p {
  margin: 5px 0;
  font-size: 14px;
}

.user-info .label {
  display: inline-block;
  width: 100px;
  text-align: right;
  font-weight: bold;
}

.user-info .value {
  display: inline-block;
  font-weight: bold;
  margin-left: 5px;
}

.request-btn-wrap {
  flex-shrink: 0;
}

.confirm-btn-wrap {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.confirm-btn-wrap button {
  flex: 1;
}

.btn-border {
  background-color: white;
  color: #333;
  border: 1px solid #333;
  height: 44px;
  line-height: 42px;
  border-radius: 44px;
  cursor: pointer;
  font-size: 15px;
  transition: all 0.3s ease;
}

.btn-border:hover {
  background-color: #f5f5f5;
}
</style>
