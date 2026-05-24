<template>
  <div id="loginStudent">
    <div class="login-cont-wrap">
      <div class="login-style-wrap">
        <div class="login-style type-site" v-if="!fromTemporaryEntry">
          <button type="button" @click="socialButtonClick(hiClass)">
            <span>{{ $t("login.student2") }}</span>
          </button>
          <p>{{ $t("login.student3") }}</p>
        </div>
        <LoginBottomSocial></LoginBottomSocial>
        <LoginBottomFindId v-if="!fromTemporaryEntry"></LoginBottomFindId>
      </div>
    </div>
  </div>
</template>

<script>
import LoginBottomSocial from "../LoginBottomSocial";
import LoginBottomFindId from "../LoginBottomFindId";
import { mapActions } from "vuex";

export default {
  name: "loginStudent",
  components: {
    LoginBottomSocial,
    LoginBottomFindId,
  },
  data: () => ({
    callbackUrl: "",
  }),
  computed: {
    fromTemporaryEntry() {
      return window.location.search.includes("tep");
    },
    hiClass() {
      return (
        process.env.VUE_APP_BASE_LOGIN_URI +
        process.env.VUE_APP_BASE_LOGIN_HICLASS_PATH +
        this.callbackUrl
      );
    },
  },
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: "triggerAnalyticsLogEvent",
    }),
    socialButtonClick(loginType) {
      this.triggerAnalyticsLogEvent({ code: "analytics.login.student.temporary" });
      let path = this.$comn.split(this.$route.path, "/").toUpperCase();
      // alert(loginType + "?userType=" + path);
      window.location.href = loginType + "?userType=" + path;
    },
    setCallbackUrl() {
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      const port = this.$comn.getLocationPort();

      let domainUrl = "";
      // if (hostname.includes("hiclass.net")) domainUrl += "https://";
      // else domainUrl += protocol + "//";
      domainUrl += protocol + "//";
      domainUrl += hostname;
      domainUrl += port;

      this.callbackUrl =
        process.env.VUE_APP_BASE_LOGIN_CALLBACK_PARAMETER_PREFIX +
        domainUrl +
        process.env.VUE_APP_BASE_LOGIN_CALLBACK_PARAMETER_SUFFIX;
    },
  },
  created() {
    this.setCallbackUrl();
    this.triggerAnalyticsLogEvent({ code: "analytics.login.student" });
  },
};
</script>
<style lang="scss" scoped>
// #70004 경남교육청 계정 SNS 변경 및 로그인 제거 -  smr 추가
.page-login {
  .login-cont-wrap {
    .login-style-wrap {
      .smr {
        color: #999;
        font-size: 14px;
        text-align: center;
        font-weight: 400;
        padding: 0 0 30px;
      }
    }
  }
}
</style>
