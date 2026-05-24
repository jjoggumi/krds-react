<template>
  <div class="login-cont-wrap">
    <div class="login-style-wrap">
      <!-- 본인인증서비스 요청 form --------------------------->
      <form name="reqKMCISForm" method="post" action="#">
        <input type="hidden" name="tr_cert" :value="tr_cert" />
        <input type="hidden" name="tr_url" :value="tr_url" />
        <input type="hidden" name="tr_ver" value="V2" />
      </form>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";
export default {
  name: "identity-verification",
  components: {},
  computed: {
    ...mapState({
      isMobileObj: "isMobileObj",
    }),
    ...mapGetters({
      isMobile: "isMobile",
    }),
  },
  data() {
    return {
      tr_cert: null,
      tr_url: null,
    };
  },
  watch: {},
  methods: {
    handleResultData(resultCd) {
      if (this.isMobile) {
        // aos
        if (
          this.isMobileObj.android.device ||
          this.isMobileObj.android.phone ||
          this.isMobileObj.android.tablet
        ) {
          AOSHandler.authenticationResult(resultCd);
        } else {
          // ios
          const postMessage = {
            command: "authenticationResult",
            resultCd: resultCd,
          };
          window.webkit.messageHandlers.iOSHandler.postMessage(postMessage);
        }
      } else {
        // web
        window.opener.authenticationResult(resultCd);
        window.close();
      }
    },

    async openKMCWindow(idToken) {
      await this.getData(idToken);
      document.reqKMCISForm.target = "";
      document.reqKMCISForm.action = "https://evt.kmcert.com/kmcis/web/kmcisReq.jsp";

      document.reqKMCISForm.submit();
    },

    async getData(idToken) {
      try {
        const response = await this.$axios.get("users/parentalConsents", {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        this.tr_cert = response.data.trCert;
        this.tr_url = response.data.trUrl;
      } catch (error) {
        console.error(error);
      }
    },
  },
  async created() {
    const resultCd = this.$route.query.resultCd;
    const idToken = this.$route.query.idToken;

    if (resultCd) {
      this.handleResultData(resultCd);
    } else {
      if(!idToken) {
        this.handleResultData('FAILURE');
      } else {
        this.$nextTick(async () => {
          this.openKMCWindow(idToken);
        });
      }
    }
  },
};
</script>

<style scoped>
#wrap {
  /* 모바일 기준 */
  min-width: 100%;
}
</style>
