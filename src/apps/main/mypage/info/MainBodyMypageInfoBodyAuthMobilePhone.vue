<!--
@File(Method): MainBodyMypageInfoAuthMobilePhone.vue
@Author: -
@Date Created: -
@Description: 마이페이지 > 내 정보 관리 > 휴대폰 변경 클릭 > 휴대폰 번호 인증 모달
@Modified: 2025-01-17 - #71223 인증 문자 미수신시 카카오톡 알림톡 대체 발송 - 안내모달 추가 /  himodal로 변경
-->
<template>
  <div>
    <HiModal class="privacy-phone-modal" type="type01" size="md" @close="closeAuthMobilePhone">
      <template v-slot:heading><span class="highlight">휴대폰 번호 인증 </span></template>
      <template v-slot:content>
        <div class="desc mb-20" :inner-html.prop="certificationText"></div>
        <!-- step 1 -->
        <div class="certification-cont-wrap" v-if="!isCertification && option.mode === 'step1'">
          <div
            class="input-box-wrap mr-20 ml-20"
            :class="{
              focus: isFocusOldMobilePhone,
            }"
          >
            <input
              type="text"
              ref="oldMobilePhone"
              maxlength="11"
              :placeholder="$t('main.text.onlynum')"
              :value="oldMobilePhone"
              @input="oldMobilePhone = $event.target.value"
              @focus="isFocusOldMobilePhone = true"
              @blur="isFocusOldMobilePhone = false"
              @keydown.enter.prevent.stop
              @keyup.enter="checkCertification"
            />
          </div>

          <p v-if="isCertification === false" class="input-validation-text error-text">등록된 정보와 일치하지 않습니다.</p>
        </div>
        <!-- step 2 -->
        <div v-else-if="isCertification && option.mode === 'step2'" class="certification-cont-wrap">
          <div class="request-wrap">
            <div
              class="input-box-wrap input-id"
              :class="{
                focus: isFocusNewMobilePhone,
              }"
              style="width: 296px"
            >
              <input
                type="text"
                id="newMobilePhone"
                ref="newMobilePhone"
                maxlength="11"
                :placeholder="$t('main.text.onlynum')"
                :value="newMobilePhone"
                @input="newMobilePhone = $event.target.value"
                @focus="isFocusNewMobilePhone = true"
                @blur="isFocusNewMobilePhone = false"
                @keydown.enter.prevent.stop
                @keyup="onKeyInput($event)"
              />
            </div>
            <div class="request-btn-wrap">
              <form @submit.prevent="getUsersByMobilePhone">
                <button
                  type="submit"
                  class="btn-bg-c"
                  :class="{
                    dis: isDisabledAuthReqBtn,
                  }"
                  :disabled="isDisabledAuthReqBtn"
                >
                  {{ authReqBtnTxt }}
                </button>
              </form>
            </div>
          </div>
          <div
            class="input-box-wrap input-pw"
            :class="{
              focus: isFoucsAuthNumber,
              readonly: !isShowAuthTimer,
            }"
          >
            <input
              type="text"
              id="authNumber"
              ref="authNumber"
              maxlength="6"
              :placeholder="$t('main.text.req6lennum')"
              :disabled="!isShowAuthTimer"
              :value="authNumber"
              @input="authNumber = $event.target.value"
              @click="isFoucsAuthNumber = true"
              @blur="isFoucsAuthNumber = false"
              @keydown.enter.prevent.stop
              @keyup="onKeyInput($event)"
            />
            <div class="timer-text" v-if="isShowAuthTimer">
              {{ authTimer }}
            </div>
          </div>
          <p
            class="input-validation-text"
            :class="{
              'good-text': reqResultObj.result,
              'error-text': !reqResultObj.result,
            }"
            v-if="isShowMessage"
          >
            {{ reqResultObj.msg }}
          </p>

          <cert-number-guide v-if="isTimeout" @openKakaotalkSendModal="openKakaotalkSendModal" />
        </div>
      </template>
      <template v-slot:footer>
        <!-- step 1 -->
        <HiButton
          v-if="!isCertification && option.mode === 'step1'"
          color="primary"
          size="lg"
          :disabled="oldMobilePhone.length < 10"
          @click="checkCertification"
          >{{ $t('main.text.confirm') }}</HiButton
        >
        <!-- step 2 -->
        <HiButton
          v-else-if="isCertification && option.mode === 'step2'"
          color="primary"
          size="lg"
          :disabled="!activateConFirmBtn"
          @click="updateMobilePhone"
          >{{ $t('main.text.confirm') }}</HiButton
        >
      </template>
    </HiModal>

    <kakao-send-confirm
      v-if="isShowKakaoConfirm"
      :mobile="newMobilePhone"
      @sendKakaotalk="startTimer('KAKAO')"
      @closeKakaoSendConfirm="closeKakaoConfirm"
    />
  </div>
</template>

<script>
import KakaoSendConfirm from '@/components/Modal/KakaoSendConfirm';
import CertNumberGuide from '@/components/Login/CertNumberGuide';

export default {
  name: 'MainBodyMypageInfoAuthMobilePhone',
  components: { CertNumberGuide, KakaoSendConfirm },
  props: {
    user: Object,
  },
  data: () => ({
    option: {
      mode: 'step1',
    },
    isCertification: null,
    isFocusOldMobilePhone: false,
    isFocusNewMobilePhone: false,
    isFoucsAuthNumber: false,
    isShowAuthTimer: false,
    isTimeout: false,
    isDupleMobilePhone: false,
    oldMobilePhone: '',
    tmpMobilePhone: '',
    newMobilePhone: '',
    authNumber: '',
    messageType: '',
    timer: null,
    timerValue: process.env.VUE_APP_CERT_NUMBER_TIME,
    isShowKakaoConfirm: false,
  }),
  computed: {
    authTimer() {
      let rtnValue = '';
      if (this.timerValue > 0) {
        let minute = Math.floor(this.timerValue / 60);
        let second = Math.floor(this.timerValue % 60);
        if (second < 10) second = '0' + second;

        rtnValue = minute + ':' + second;
      } else {
        rtnValue = '0:00';
      }
      return rtnValue;
    },
    authReqBtnTxt() {
      let btnTxt = '';
      if (this.isShowAuthTimer) btnTxt = '재요청';
      else btnTxt = '요청';

      return btnTxt;
    },
    activateConFirmBtn() {
      return this.isShowAuthTimer && this.newMobilePhone.trim() !== '' && this.authNumber.length === 6 && this.isTimeout === false;
    },
    isDisabledAuthReqBtn() {
      if (this.timer > 0 && this.timerValue > 0) return true;

      const newMobilePhone = this.newMobilePhone.trim();
      return !(newMobilePhone.length > 9 && newMobilePhone.startsWith('0'));
    },
    isShowMessage() {
      return this.isShowAuthTimer || this.messageType === 'incorrect' || this.messageType === 'timeout';
    },
    reqResultObj() {
      let obj = {};
      if (this.messageType === 'incorrect') {
        obj.msg = this.$t('main.text.authWrongNumber');
        obj.result = false;
      } else if (this.messageType === 'timeout') {
        obj.msg = this.$t('main.text.authTimeout');
        obj.result = false;
      } else {
        obj.msg = this.$t('main.text.sendauthmsg');
        obj.result = true;
      }
      return obj;
    },
    certificationText() {
      return this.option.mode === 'step1'
        ? `현재 마이페이지에 등록 되어있는 휴대폰 번호를 입력하세요.`
        : `변경하실 휴대폰 번호를 입력해주세요.<br>휴대폰 번호 인증을 통해 등록된 번호를 변경합니다.`;
    },
  },
  watch: {
    newMobilePhone(val, oldVal) {
      if (!this.$validation.isRegNumber(val)) {
        if (oldVal === undefined) oldVal = '';
        this.newMobilePhone = oldVal;
        this.tmpMobilePhone = oldVal;
        this.$refs.newMobilePhone.value = oldVal;
      }
    },
    authNumber(val, oldVal) {
      if (!this.$validation.isRegNumber(val)) {
        if (oldVal === undefined) oldVal = '';
        this.authNumber = oldVal;
        this.$refs.authNumber.value = oldVal;
      }
    },
    oldMobilePhone(val) {
      // 숫자 가 아닌 경우 replace
      this.oldMobilePhone = this.oldMobilePhone.replace(/[^0-9]/g, '');

      if (val === '') this.isCertification = null;
    },
    timerValue(val) {
      if (this.timer > 0 && (val < 1 || val === 0)) {
        this.timerValue = 0;
        this.messageType = 'timeout';
        this.isTimeout = true;
        clearInterval(this.timer);
        this.timer = null;
      }
    },
  },
  methods: {
    init() {
      this.newMobilePhone = '';
      this.tmpMobilePhone = '';
      this.authNumber = '';
      this.$refs.newMobilePhone.value = '';
      this.$refs.authNumber.value = '';
      this.isShowAuthTimer = false;
      this.messageType = '';
      this.isTimeout = false;
      clearInterval(this.timer);
    },
    closeAuthMobilePhone() {
      this.$emit('closeAuthMobilePhone');
    },
    clearNewMobilePhone() {
      this.newMobilePhone = '';
      this.tmpMobilePhone = '';
      this.$refs.newMobilePhone.value = '';
      this.isShowAuthTimer = false;
      clearInterval(this.timer);
    },
    clearAuthNumber() {
      this.authNumber = '';
      this.$refs.authNumber.value = '';
      this.messageType = '';
    },
    updateMobilePhone() {
      const params = [];

      if (!this.activateConFirmBtn) return false;

      if (
        !this.$validation.isRegMobilePhoneNumberWithoutHyphen(this.newMobilePhone) ||
        !this.$validation.isRegNumber(this.authNumber) ||
        this.authNumber.length !== 6
      ) {
        this.init();
        alert('잘못된 입력입니다.');
        return false;
      }

      this.$store.commit('setIsDimLoading', true);

      let reqValidationCertNumber = this.validationCertNumber();
      if (reqValidationCertNumber !== false) {
        reqValidationCertNumber
          .then((result) => {
            this.$log.debug(this.$options.name, ' validationCertNumber() result => ', result);
            // **************************************************************************
            // TODO: 1. result.data.timestamp 시간 비교하여 3분이 지난 경우 인증 실패 처리 로직 추가
            //       2. 인증 시간 env에 정의
            // **************************************************************************

            if (result.data.result === 'SUCCESS') {
              // alert(this.$t("main.text.authComplete"));
              // 휴대폰 변경
              if (this.newMobilePhone.trim() !== '') params.push({ userMobile: this.newMobilePhone });

              this.$emit('setUserDataByParams', params);
            } else {
              this.messageType = 'incorrect';

              this.$store.commit('setIsDimLoading', false);
            }
          })
          .catch((error) => {
            this.$log.debug(this.$options.name, ' validationCertNumber() error => ', error);

            this.$store.commit('setIsDimLoading', false);
          });
      }
    },
    validateById(id) {
      let jsonObj = {};
      if (id === 'newMobilePhone') {
        if (this.oldMobilePhone === this.newMobilePhone.trim()) {
          jsonObj.msg = '이전 휴대폰 번호와 변경할 휴대폰 번호가 같습니다.';
          jsonObj.result = false;
          return jsonObj;
        }
        if (this.isDupleMobilePhone) {
          jsonObj.msg = '입력된 휴대폰 번호를 가진 사용자가 있습니다.';
          jsonObj.result = false;
          return jsonObj;
        }
        if (!this.$validation.isRegMobilePhoneNumberWithoutHyphen(this.newMobilePhone)) {
          jsonObj.msg = '잘못된 휴대폰 번호 형식입니다.';
          jsonObj.result = false;
        }
      }
      // else if (id === "authNumber") {}
      return jsonObj;
    },
    startTimer(sendType) {
      if (sendType === 'KAKAO') {
        this.isShowKakaoConfirm = false;
      } else {
        let jsonObj = this.validateById('newMobilePhone');
        let msg = jsonObj.msg;
        let isError = jsonObj.result === false;

        if (isError) {
          alert(msg);
          this.clearNewMobilePhone();
          return false;
        }
      }

      this.clearAuthNumber();
      this.requestCertNumber(sendType);

      clearInterval(this.timer);
      this.timerValue = process.env.VUE_APP_CERT_NUMBER_TIME;
      this.isTimeout = false;

      this.isShowAuthTimer = true;
      this.timer = setInterval(() => {
        this.timerValue = this.timerValue - 1;
      }, 1000);

      this.$nextTick(() => {
        setTimeout(() => {
          this.$refs.authNumber.focus();
        }, 100);
      });
    },
    onKeyInput(e) {
      const id = e.target.id;
      // const value = this.$refs[id].value;

      if (e.keyCode === 13 && this[id] !== '' && !this.isDisabledAuthReqBtn) {
        if (id === 'newMobilePhone') this.getUsersByMobilePhone();
        else if (id === 'authNumber' && this.authNumber.length === 6) this.updateMobilePhone();
      } else {
        if (id === 'newMobilePhone' && this.tmpMobilePhone.trim() !== this.newMobilePhone.trim()) {
          this.isShowAuthTimer = false;
          this.clearAuthNumber();
        }
      }
    },
    async requestCertNumber(sendType) {
      await this.$axios({
        method: 'post',
        url: sendType === 'MESSAGE' ? '/sendMessages/certNumber' : '/sendMessages/certNumber/kakaotalk',
        data: {
          phone: this.newMobilePhone,
        },
      });
    },
    validationCertNumber() {
      if (this.newMobilePhone.trim() === '' || this.authNumber.trim() === '') {
        alert(this.$t('main.text.authNumber.please'));
        return false;
      } else {
        return this.$axios({
          method: 'post',
          url: `/sendMessages/certNumber/${this.newMobilePhone}/${this.authNumber}`,
        });
      }
    },
    getUsersByMobilePhone() {
      const params = {
        _userMobile: this.newMobilePhone,
        _userStatus: 'ACTIVATE',
      };
      this.$hiClass.users
        .search(params)
        .then((result) => {
          this.$log.debug(this.$options.name, ' getUsersByMobilePhone() result => ', result);
          this.isDupleMobilePhone = result.data.page.totalElements > 0;

          this.$nextTick(() => {
            this.startTimer('MESSAGE');
          });

          this.tmpMobilePhone = this.newMobilePhone;
        })
        .catch((error) => {
          this.$log.debug(this.$options.name, ' getUsersByMobilePhone() error => ', error);
        });
    },

    async checkCertification() {
      if (this.$store.state.isLoading === false && this.oldMobilePhone.length >= 10) {
        this.$store.commit('setIsLoading', true);

        try {
          const res = await this.$axios.post(`/users/${this.user.currentId}/number`, { number: this.oldMobilePhone });
          this.isCertification = true;
          this.option.mode = 'step2';
        } catch (err) {
          this.$log.debug(err);
          if (err?.response?.status === 428) {
            this.isCertification = false;
          }
        } finally {
          this.$store.commit('setIsLoading', false);
        }
      }
    },

    openKakaotalkSendModal() {
      let jsonObj = this.validateById('newMobilePhone');
      let msg = jsonObj.msg;
      let isError = jsonObj.result === false;

      if (isError) {
        alert(msg);
        this.clearNewMobilePhone();
        return false;
      }

      this.isShowKakaoConfirm = true;
    },
    closeKakaoConfirm() {
      this.isShowKakaoConfirm = false;
    },
  },
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden');
  },
};
</script>
<style scoped lang="scss">
.hi-modal-common.modal-md {
  ::v-deep .modal__layer {
    max-width: 476px;
  }
}
.hi-modal-common.modal-sm {
  ::v-deep .modal__layer {
    .modal__header .heading strong {
      margin-top: 2px;
      display: block;
      line-height: 1.5;
    }
    .modal__footer .hi-btn {
      min-width: 80%;
      margin: 0;
    }
  }
}
.privacy-phone-modal {
  .certification-cont-wrap {
    padding: 0 20px;
    text-align: left;
    .input-box-wrap {
      height: 36px;
    }
    .request-wrap {
      margin-bottom: 12px;
      display: flex;
      gap: 8px;
      .input-box-wrap {
        float: left;
        width: 275px;
      }
      .request-btn-wrap {
        float: left;
        width: 76px;
        button {
          width: 100%;
          height: 36px;
          line-height: 36px;
          font-weight: 400;
          border-radius: 18px;
        }
      }
    }
    .timer-text {
      position: absolute;
      top: 10px;
      right: 13px;
      color: #fe5151;
    }
  }
}
</style>
