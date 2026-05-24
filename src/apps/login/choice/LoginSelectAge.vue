<template>
  <div class="login-cont-wrap verify-age-wrap">
    <div class="login-style-wrap">
      <div class="verify-age">
        <div class="verify-age-title">
          <div class="tit-txt">연령 정보 확인</div>
          <div class="sub-txt"
            v-html="fromLogin === true 
              ? '서비스를 계속 이용하려면 나이 확인이 필요합니다.<br>해당되는 항목을 선택해 주세요.'
              : '해당되는 항목을 선택해 주세요.'">
          </div>
        </div>
        <div class="verify-age-btns">
          <input
            type="radio"
            id="check-btn"
            name="age"
            class="btn-type under14"
            v-model="selectedAge"
            value="under14"
          />
          <label for="check-btn">
            <span>만 14세 미만</span>
          </label>
          <input
            type="radio"
            id="checked-btn"
            name="age"
            class="btn-type over14"
            v-model="selectedAge"
            value="over14"
          />
          <label for="checked-btn">
            <span>만 14세 이상</span>
          </label>
        </div>
        <div class="verify-age-checkbox">
          <div class="form-check" v-if="selectedAge === 'under14'">
            <input type="checkbox" id="checked" v-model="guardianConsent" />
            <label for="checked">
              <span>
                <em>(필수) <strong>만 14세 미만 법정대리인 동의</strong></em>
                하이클래스 회원가입 및 법정대리인의 개인정보 수집에 동의합니다.
              </span>
            </label>
          </div>
          <div class="ft-blue-warning mb-25" v-if="selectedAge === 'under14'">          
            만 14세 미만은 회원가입 시 보호자(법정대리인)의 본인 확인과 동의가 필요합니다. 부모님과 함께 회원가입을 진행해 주세요.
          </div>
          <HiButton
            type="button"
            :color="selectedAge === 'under14' ? 'noti' : 'primary'"
            bitrounded
            block
            size="xl"
            :disabled="!isNextEnabled"
            @click="handleClickNext"
            >{{ submitText }}</HiButton
          >
        </div>        
      </div>
    </div>
  </div>
</template>

<script>
import { postUsersGeneralConsents } from '@hiclass/core';
import { mapActions } from "vuex";
export default {
  name: "login-select-age",
  components: {},
  data: () => ({
    selectedAge: "",
    guardianConsent: false, 
    fromLogin: false,
  }),
  computed: {
      submitText() {
        return (this.selectedAge === "" || this.selectedAge === "over14") ? "다음" : "법정대리인 인증"
      },
      isNextEnabled() {
        return (
            this.selectedAge === "over14" ||
            (this.selectedAge === "under14" && this.guardianConsent)
        );
      },
   },
   created() {
    const from = this.$route.query.from;
    const user = this.$store.state.user;

    if(from === 'login' && user && user.userType === 'STUDENT' && user.isConsentVerified === false) {
      this.fromLogin = true;
    } else {
      this.fromLogin = false;
    }
  },
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),

      async postGeneralConsents() {
        await postUsersGeneralConsents();
      },
      handleClickNext() {
        // 만 14세 미만일 때만 안내 후 진행
        if (this.selectedAge === "under14") {
          this.$hiClass
            .confirm(
              '보호자(법정대리인) 명의의 휴대전화 번호로 <br/>인증을 진행해 주세요.',
              null,
              {
                confirmButtonText: '법정대리인 인증',
                cancelButtonText: '취소',
              }
            )
            .then(() => {
              this.onClickNext();
            })
            .catch(() => {});
        } else {
          this.onClickNext();
        }
      },
      async onClickNext() {
        if(this.selectedAge === "under14") {
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

            const idToken = this.$authentication.load().idToken;
            const popup = window.open(
              `/popup/identity-verification?idToken=${idToken}`,
              "_blank",
              features 
            );
            popup.focus();
        } else {
            if(this.fromLogin === true) {
              await this.postGeneralConsents();
              this.triggerAnalyticsLogEvent({code: 'analytics.user.age.verification.14older.completed'})
              this.$router.push("/main");
            } else {
              sessionStorage.setItem('selectAgeUnder14', 'false');
              this.$router.push("/login/auth/phone"); 
            }
        }
      },

      async handleAuthenticationResult(resultCd) {
        switch(resultCd) {
            case 'UNDERAGE':
              this.$hiClass.alert('법정대리인(보호자)는<br>만 19세 이상이여야 합니다.', 'info');
              break;
            case 'SUCCESS': 
              if(this.fromLogin === true) {
                this.triggerAnalyticsLogEvent({code: 'analytics.user.age.verification.14under.completed'})
                this.$router.push("/main");
              } else {
                sessionStorage.setItem('selectAgeUnder14', 'true');
                this.$router.push("/login/auth/phone");
              }
              break;
            default: 
              this.$toasted.clear()
              this.$toasted.show('인증에 실패했습니다. 다시 시도해주세요.', {
                  duration: 2000,
                  className: 'type01'
              })
              break;
        }
      },
  },
};
</script>
<style scoped></style>
