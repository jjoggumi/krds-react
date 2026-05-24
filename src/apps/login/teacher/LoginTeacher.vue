<!--
@File(Method): LoginTeacher.vue
@Author: -
@Date Created: -
@Description: 선생님 로그인 페이지 > 나의 SNS 계정 찾기
@Modified: 2024-11-25 - #70004 경남교육청 계정 SNS 변경 및 로그인 제거 -  나의 SNS 계정 찾기 제거
-->
<template>
  <div id="loginTeacher">
    <div class="login-cont-wrap">
      <div class="login-style-wrap">
        <login-bottom-social />
        <login-bottom-find-id v-if="!fromTemporaryEntry"/>
      </div>
    </div>
  </div>
</template>

<script>


import LoginBottomSocial from "@/apps/login/LoginBottomSocial";
import LoginBottomFindId from "@/apps/login/LoginBottomFindId";
import {mapActions} from 'vuex'
export default {
  name: 'login-teacher',
  components: {
    LoginBottomFindId,
    LoginBottomSocial
  },
  computed: {
    fromTemporaryEntry () {
      return window.location.search.includes('tep')
    }
  },
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    })
  },
  created() {
    this.triggerAnalyticsLogEvent({code: "analytics.login.teacher"})
  }
}
</script>

<style lang="scss" scoped>
// #70004 경남교육청 계정 SNS 변경 및 로그인 제거 -  smr 추가
.page-login {
  .login-cont-wrap{
    .login-style-wrap{
      .smr{    
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
