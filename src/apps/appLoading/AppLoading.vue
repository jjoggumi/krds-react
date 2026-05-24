<template>
  <div id="wrap" class="l-page-survey-responsive">
    <div class="m-movepage__content">
      <span class="hi-spinner-circle"></span>
      <p class="text">해당 페이지로 이동중입니다. <br>페이지 이동이 안된다면, 아래 버튼을 선택해주세요.</p>
      <button class="hi-btn btn-lg" @click="goAppStore">하이클래스 앱에서 보기</button>
    </div>
  </div>
</template>

<script>
export default {
  // 앱실행 로딩 페이지
  name: "app-loading",
  created() {
    window.location.href = `hiclassapp://${this.$route.query.appUrl}`
  },
  methods: {
    goAppStore() {
      const osType = this.$route.query.osType

      if (osType === 'AndroidOS') {
        window.location.href = this.$store.state.mobileAppDownloadUri.android
      } else {
        window.location.href = this.$store.state.mobileAppDownloadUri.ios
      }
    }
  }
}
</script>

<style scoped>

</style>