<template>
  <div id="loginParent">
    <div class="login-cont-wrap">
      <div class="login-style-wrap">
        <LoginBottomSocial></LoginBottomSocial>
        <LoginBottomFindId></LoginBottomFindId>
      </div>
    </div>
  </div>
</template>

<script>
import LoginBottomSocial from "../LoginBottomSocial";
import LoginBottomFindId from "../LoginBottomFindId";
import {mapActions} from 'vuex'

export default {
  name: "loginParent",
  components: {
    LoginBottomSocial,
    LoginBottomFindId
  },
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    })
  },
  created() {
    this.triggerAnalyticsLogEvent({code: `analytics.login.parents`})
  }
};
</script>