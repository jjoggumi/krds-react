<template>
  <div class="login-cont-wrap">
    <div class="login-style-wrap">
      <div class="login-style type-lg-blue">
        <button type="button" @click="goJoinPage">
          <span>{{ $t('login.choice.button.join') }}</span>
        </button>
      </div>
      <div class="login-style type-lg-white">
        <button type="button" @click="goReCertificationPage">
          <span>{{ $t('login.choice.button.recertification') }}</span>
        </button>
      </div>
      <div class="find-my-sns-id">
        <button @click="onClick()">
          {{ $t('login.choice.button.findMySnsId') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>

import {mapActions} from "vuex";

export default {
  name: "login-select",
  components: {},
  data() {
    return {
      loginChoiceSnsTypes: ['KAKAO', 'NAVER', 'GOOGLE', 'APPLE'],
    }
  },
  computed: {},
  created() {
    this.init()
  },
  mounted() {
    this.triggerAnalyticsLogEvent({ code: `analytics.login.choice.mount` })
  },
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    init() {
      try {
        const snsType = localStorage.clientRegistrationId ? localStorage.clientRegistrationId.toUpperCase() : null

        if (!this.$authentication.isAuthenticated() || !this.loginChoiceSnsTypes.includes(snsType))
          this.$router.push('/logout')

      } catch (e) {
        this.$router.push('/logout')
      }
    },
    goRoute(path) {
      this.$router.push(path, () => {})
    },
    goJoinPage() {
      let userType = sessionStorage.getItem('selectedUserType');
      if(userType.toLowerCase() === 'student') {
        this.goRoute('/login/selectAge')
      } else {
        this.goRoute('/login/auth/phone')
        this.triggerAnalyticsLogEvent({ code: `analytics.login.choice.join` })
      }
    },
    goReCertificationPage() {
      this.goRoute('/login/recertification')
      this.triggerAnalyticsLogEvent({ code: `analytics.login.choice.recertification` })
    },
    onClick() {
      const authentication =  this.$authentication.load()
      const userTypeLowerCase = authentication.userType.toLowerCase()

      this.$router.push({
        path: "/login/findSns/search",
        query: {
          userType: userTypeLowerCase
        }
      })
    }
  }
};
</script>