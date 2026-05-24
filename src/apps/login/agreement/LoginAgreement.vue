<template>
  <div v-if="isLoaded" class="loginAgreement-cont-wrap">
    <!-- 전체 동의 -->
    <div v-if="!shouldGuardianVerification" class="checkbox-confirm-wrap">
      <div class="agree-terms-wrap">
        <input
          type="checkbox"
          id="agree-all"
          ref="chkAll"
          @click="onClickCheckboxAll"
          :disabled="isSubmitting"
        />
        <label for="agree-all">
          <span>전체 동의</span>
        </label>
      </div>

      <!-- 동의 항목 동적 렌더링 -->
      <div
        v-for="(item, index) in agreementItems"
        :key="index"
        class="agree-terms-wrap"
      >
        <input
          type="checkbox"
          :id="'agree-' + index"
          class="agreeChkBox"
          v-model="item.isAgreed"
          @change="onChangeCheckBox"
          :disabled="isSubmitting"
        />
        <label :for="'agree-' + index">
          <span>
            <strong v-if="item.required">(필수)</strong>
            <strong v-else-if="item.consentType !== 'ageVerification' && !item.required">(선택)</strong>
            {{ item.title }}
          </span>
        </label>
        <button
          v-if="item.selectType"
          class="btn-view"
          @click="openTermsView({ layerType: item.selectType, modalClass: 'sensitive-info-modal' })"
        >
          보기
        </button>
      </div>

      <div class="confirm-btn-wrap">
        <HiButton
          color="primary"
          size="xl"
          block
          bitrounded
          type="button"
          :disabled="!isReadySubmit || isSubmitting"
          @click="onSubmit"
        >
          {{ submitButtonText }}
        </HiButton>
      </div>
    </div>
    <div v-if="shouldGuardianVerification" class="guardian-verification-wrap">      
      <div class="txt-body-b1 font-bold">
        만 14세 미만의 회원은 서비스 이용을 위해<br>
        보호자(법정대리인)의 본인 확인 및 동의가 필요합니다.<br>
        보호자 명의의 휴대폰으로 인증을 진행해 주세요.
      </div>
      <div class="confirm-btn-wrap">
        <HiButton
          color="noti"
          size="xl"
          block
          bitrounded
          type="button"
          :disabled="isSubmitting"
          @click="onClickGuardianVerification"
        >
          법정대리인 인증
        </HiButton>
      </div>
    </div>
  </div>
</template>

<script>
import HiButton from '@/components/Button/HiButton.vue';
import { mapActions, mapState } from 'vuex';
import { getUserConsentsInfo, postUserConsentsAgreement } from '@hiclass/core';

export default {
  name: 'login-agreement',
  components: { HiButton },
  data() {
    return {
      isLogouting: false,
      agreementItems: [],
      shouldGuardianVerification: false,
      isAgreedSuccessfully: false,
      onlyAgeVerification: false,
      isLoaded: false,
      isSubmitting: false,
    }
  },
  computed: {
    ...mapState(['user']),
    isReadySubmit() {
      // 필수(required: true) 항목이 모두 체크되었는지 확인
      return this.agreementItems
        .filter(item => item.required)
        .every(item => item.isAgreed);
    },
    isTemporaryStudent() {
      const userType = this.user?.userType?.toUpperCase();
      const userSns = this.user?.userSns?.toLowerCase();
      return userType === 'STUDENT' && userSns === 'hiclass';
    },
    submitButtonText() {
      return this.agreementItems.some(item => item.required) ? '동의 완료' : '완료';
    }
  },
  watch: {
    shouldGuardianVerification(val) {
      this.$emit('change-guardian-verification', val);
    }
  },
  async created() {
    if (!this.user || Object.keys(this.user).length === 0) {
      await this.initUser();
    }

    const res = await getUserConsentsInfo();
    const items = res._embedded?.consents || [];
    this.agreementItems = items.map(item => ({
      ...item,
      isAgreed: false
    }));

    if (this.user?.userType?.toUpperCase() === 'STUDENT' && !this.isTemporaryStudent && this.agreementItems.length === 1) {
      const ageItem = this.agreementItems.find(item => item.consentType === 'ageVerification');
      if (ageItem) {
        this.shouldGuardianVerification = true;
        this.onlyAgeVerification = true;
      }
    }

    this.isLoaded = true;
    this.$emit('component-ready');
  },
  mounted() {
    history.pushState(null, null, location.href);
    window.addEventListener('popstate', this.onPopState);
  },
  destroyed() {
    window.removeEventListener('popstate', this.onPopState);
  },
  methods: {
    ...mapActions(['openTermsView', 'logout', 'initUser']),
    ...mapActions("storeHitalk",{
      callChatWebToken: "callChatWebToken"
    }),
    
    onPopState() {
      if (!this.isAgreedSuccessfully && !this.isLogouting) {
        if(!this.onlyAgeVerification && this.shouldGuardianVerification) {
          this.shouldGuardianVerification = false;
          history.pushState(null, null, location.href);
        } else {
          this.logout();
        }
      }
    },

    async logout() {
      if(!this.isLogouting) {
        this.isLogouting = true
        await this.callChatWebToken({
          token : "",
          method : "delete"
        });
        
        this.$router.push("/logout", () => {
          this.isLogouting = false
        });
      }
    },
    onClickCheckboxAll() {
      if (this.isSubmitting) return;
      const checkValue = this.$refs.chkAll.checked;
      this.agreementItems.forEach(item => {
        item.isAgreed = checkValue;
      });
    },
    onChangeCheckBox() {
      if (this.isSubmitting) return;
      const allChecked = this.agreementItems.every(item => item.isAgreed);
      this.$refs.chkAll.checked = allChecked;
    },
    onClickGuardianVerification() {
      if (this.isSubmitting) return;
      window.authenticationResult = (resultCd) => {
        this.handleAuthenticationResult(resultCd);
      };
      const width = 425;
      const height = 550;
      const left = window.screenX || window.screenLeft;
      const top = window.screenY || window.screenTop;

      const outerWidth = window.outerWidth || document.documentElement.clientWidth;
      const outerHeight = window.outerHeight || document.documentElement.clientHeight;

      const popupLeft = left + outerWidth / 2 - width / 2;
      const popupTop = top + outerHeight / 2 - height / 2;

      const features = `width=${width},height=${height},left=${popupLeft},top=${popupTop},scrollbars=yes`;

      const idToken = this.$authentication.load().idtoken;
      const popup = window.open(
        `/popup/identity-verification?idToken=${idToken}`,
        "_blank",
        features 
      );
      popup.focus();
    },
    async handleAuthenticationResult(resultCd) {
      switch(resultCd) {
        case 'UNDERAGE':
          this.$hiClass.alert('법정대리인(보호자)는<br>만 19세 이상이여야 합니다.', 'info');
          break;
        case 'SUCCESS': 
          try {
            if(this.isAgreedSuccessfully || this.isSubmitting) return;
            
            this.isSubmitting = true;
            await this.updateUserConsentsAgreement();
            this.isAgreedSuccessfully = true;
            
            window.removeEventListener('popstate', this.onPopState);
            history.back();
            setTimeout(() => {
              this.$router.push("/main/home");
            }, 50);
          } catch(e) {
            this.$hiClass.alert('동의 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
            this.isAgreedSuccessfully = false; 
            this.isSubmitting = false;
          }
          break;
        default: 
          this.$hiClass.alert('인증에 실패했습니다. 다시 시도해주세요.');
          break;
      }
    },
    async onSubmit() {
      if (!this.isReadySubmit || this.isSubmitting) return;

      try {
        // SNS 계정 학생의 경우 "14세 이상" 항목을 체크하지 않았다면 보호자 동의가 필요함
        if (this.user.userType?.toUpperCase() === 'STUDENT' && !this.isTemporaryStudent) {
          const ageItem = this.agreementItems.find(item => item.consentType === 'ageVerification');
          if (ageItem && !ageItem.isAgreed) {
              this.shouldGuardianVerification = true;
              return;
          }
        }

        this.isSubmitting = true;
        await this.updateUserConsentsAgreement();
        this.isAgreedSuccessfully = true;

        window.removeEventListener('popstate', this.onPopState);
        history.back();
        setTimeout(() => {
          this.$router.push('/main/home');
        }, 50);
      } catch (error) {
        this.$hiClass.alert('동의 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
        this.isSubmitting = false;
      }
    },

    async updateUserConsentsAgreement() {
      const consents = this.agreementItems.map(item => ({
            consentType: item.consentType,
            isAgreed: item.isAgreed
      }));
      await postUserConsentsAgreement({ consents });
    }
  }
};
</script>

<style lang="scss">
.page-login .login-box-wrap.login-box-agreement-wrap {
  width: 536px;
  padding: 52px;

  .login-start-text {
    text-align: left;
    line-height: 1.6;
    letter-spacing: 0;
  }

  .loginAgreement-cont-wrap {
    width: 100% ;
    margin-top: 32px;

    // 서비스 이용약관 동의 
    .checkbox-confirm-wrap {
      .agree-terms-wrap {
        margin: 0;
        padding: 9px 0;
        justify-content: space-between;
        label span{
          color: #1D1D1D;
          font-size: 15px;
          font-weight: 400;
          line-height: 150%; 
          letter-spacing: 0;
          strong{
            font-weight: 400;
            color: #616161;
          }
        }
        &:first-of-type {
          padding: 14px 0;
          margin-bottom: 8px;
          label span{
            font-weight: 600;
          }
        }
      }      
    }
    
    .confirm-btn-wrap {
      margin-top: 32px;
    }
  }
}

// 민감정보, 알러지 약관 재동의
.modal .modal-cont-wrap.sensitive-info-modal{
  max-width: 650px !important;
  width: 100% !important;
  margin: 0 !important;
  transform: translate(-50%, -50%) !important;
  
  .modal-cont.boundary-box{
    width:100% !important;
    .gray-box02{
      background: #fff;
      flex: 1 1 auto;
      overflow-y: auto;
    }
  }
}
@media (max-width: 640px) {
  .modal .modal-cont-wrap.sensitive-info-modal{
    position: absolute;
    top: 50%;
    left: 50%;
  } 
}
</style>
