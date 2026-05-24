<template>
  <div class="privacy-info-box boundary-box">
    <div class="left-wrap">
      <div class="box-title">마케팅 활용 동의<br>(선택)</div>
    </div>
    <div class="right-wrap">
      <div class="info-category">
        <input
          type="checkbox"
          id="terms-check"
          v-model="isAllUsed"
          @change="updateAllUsed"
        />
        <label for="terms-check" class="d-flex">
          <span>
            이벤트, 당첨자 안내 등 마케팅 SMS, 앱 푸시 수신 동의합니다.
            <br/>
            수신하실 경우, 다양한 유익 정보 수신과 이벤트에 참여하실 수 있습니다.
          </span>
        </label>
      </div>
      <div class="info-category mt-15">
        <input type="checkbox" id="sms-check" v-model="user.userMarketingUsed" @change="updateUsed('userMarketingUsed')">
        <label for="sms-check" class="mr-20 ml-25"><span>SMS</span></label>
        <input type="checkbox" id="push-check" v-model="user.userPushUsed" @change="updateUsed('userPushUsed')">
        <label for="push-check"><span>앱 푸시 알림</span></label>
      </div>
    </div>
  </div>
</template>

<script>
import {mapActions} from "vuex";

export default {
  name: "MainBodyMypageInfoBodyTerms",
  data() {
    return {
      isAllUsed: false
    }
  },
  props: {
    user: Object
  },
  watch: {
    user: {
      handler() {
        this.setIsAllUsed()
      },
      deep: true
    }
  },
  mounted() {
    this.setIsAllUsed()
  },
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    setIsAllUsed() {
      this.isAllUsed = this.user.userMarketingUsed && this.user.userPushUsed
    },
    updateAllUsed() {
      this.$nextTick(() => {
        const params = [];
        let userMarketingUsed = false;
        let userPushUsed = false;
        let msg = this.$t("main.text.disagree");
        let toDay = this.$moment().format("YYYY.MM.DD");

        if (this.isAllUsed) {
          userMarketingUsed = true;
          userPushUsed = true;
          msg = this.$t("main.text.agree");
        }

        params.push({ userMarketingUsed: userMarketingUsed });
        params.push({ userPushUsed: userPushUsed });

        this.triggerAnalyticsLogEvent({ code: 'marketing_push_update' , params: {value: userPushUsed ? 1 : 0}})

        this.$emit("setUserDataByParams", params);

        this.$toasted.clear()
        this.$toasted.show(`${toDay} 마케팅 수신동의 약관에 ${msg}하셨습니다`);
      })
    },
    updateUsed(param) {
      this.$nextTick(() => {
        this.setIsAllUsed()

        const params = []
        let toDay = this.$moment().format("YYYY.MM.DD");
        let msg = this.user[param] ? this.$t("main.text.agree") : this.$t("main.text.disagree")
        let type = param === 'userMarketingUsed' ? '문자' : '푸시'

        params.push({ [param]: this.user[param] })

        if (param === 'userPushUsed') {
          this.triggerAnalyticsLogEvent({ code: 'marketing_push_update' , params: {value: this.user.userPushUsed ? 1 : 0}})
        }

        this.$emit("setUserDataByParams", params)

        this.$toasted.clear()
        this.$toasted.show(`${toDay} 마케팅 정보 ${type} 수신 ${msg}하셨습니다`)
      })
    }
  }
};
</script>
