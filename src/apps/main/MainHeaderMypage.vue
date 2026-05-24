<!--
@File(Method): MainHeaderMypage.vue
@Description: 마이페이지 header
@Modified: header v2 적용으로 파일 미사용중
-->
<template>
  <div class="mypage-wrap">
    <ul v-if="isLoginUser">
      <li class="user-name">
        <!-- <a href="javascript:" v-html="loginUserHtml"></a> -->

        <a href="javascript:">
          <span class="photo">
            <img :src="loginUserPhoto" @error="loginUserPhotoReplace" alt="" />
          </span>
          {{ user.userName }}
          <span v-if="!loginUserType === false">
            {{ loginUserType }}
          </span>
        </a>
      </li>
      <li>
        <a href="javascript:" @click="onClick('LOGOUT')">로그아웃</a>
      </li>
      <li>
        <a href="javascript:" @click="onClick('MY_PAGE')">마이페이지</a>
      </li>
      <li>
        <a href="javascript:" @click="onClick('HELP')">고객센터</a>
      </li>
    </ul>
    <ul v-else>
      <li>
        <a href="javascript:" @click="logout()">인트로 페이지로 이동</a>
      </li>
    </ul>
  </div>
</template>

<script>

import {mapActions} from "vuex";

export default {
  name: "mainHeader",
  props: {
    user: Object
  },
  components: {},
  data: () => ({
    callbackUrl: "",
    isLogouting: false
  }),
  computed: {
    isLoginUser() {
      return this.user.userName !== undefined;
    },
    loginUserPhoto() {
      const userPhoto = this.user.userPhoto
        ? this.user.userPhoto
        : this.$store.state.userProfileDefault

      // return `<span class="photo" style="background-image: url('${userPhoto}');"></span>`
      return userPhoto
    },
    loginUserStr() {
      let loginUserStr = this.user.userName
      loginUserStr += '<span>'

      switch (this.user.userType) {
        case 'TEACHER':
          loginUserStr += ' 선생님'
          break
        case 'PARENTS':
          loginUserStr += ' 학부모'
          break
        case 'STUDENT':
          loginUserStr += ' 학생'
          break
      }
      // loginUserStr += ' 님'
      loginUserStr += "</span>"

      return loginUserStr;
    },
    loginUserHtml() {
      return this.loginUserPhoto + this.loginUserStr
    },
    loginUserType() {
      let loginUserType = null
      switch (this.user.userType) {
        case 'TEACHER':
          loginUserType = ' 선생님'
          break
        case 'PARENTS':
          loginUserType = ' 학부모'
          break
        case 'STUDENT':
          loginUserType = ' 학생'
          break
      }
      return loginUserType
    }
  },
  created() {},
  mounted() {},
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    ...mapActions("storeHitalk",{
      callChatWebToken: "callChatWebToken"
    }),
    goRoute(path) {
      if (path === this.$route.path) this.$router.go(0);
      else this.$router.push(path, () => {});
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
    onClick(button) {
      switch (button) {
        case 'LOGOUT':
          this.triggerAnalyticsLogEvent({ code: 'analytics.header.gnbMyPage.logout.click' })
          this.logout()
          break
        case 'MY_PAGE':
          this.triggerAnalyticsLogEvent({ code: 'analytics.header.gnbMyPage.myPage.click' })
          this.triggerAnalyticsLogEvent({ code: 'analytics.mypage.click' })
          this.goRoute('/main/mypage')
          break
        case 'HELP':
          this.triggerAnalyticsLogEvent({ code: 'analytics.header.gnbMyPage.help.click' })
          this.triggerAnalyticsLogEvent({ code: 'analytics.help.click' })
          this.goRoute('/help')
          break
      }
    },
    loginUserPhotoReplace(e) {
      e.target.src = this.$store.state.userProfileDefault
    }
  },
};
</script>

<style scoped>
</style>
