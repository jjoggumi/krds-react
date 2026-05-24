<template>
  <div>
    <recommend-code-main
        :pageType="pageType"
        :eventId="eventId"
        :postId="postId"
    />
  </div>
</template>

<script>
import RecommendCodeMain from "@/apps/events/recommendCode/Main.vue"
export default {
  name: "event-main",
  components: {
    RecommendCodeMain
  },
  data() {
    return {
      eventId: '',
      eventName: '', // 지금은 추천이벤트만 존재하지만 이후 다른 이벤트 페이지도 그릴경우 eventName으로 분기처리
      pageType: '',
      postId: '',
      uuid: '',
      idToken: '',
      isAos: false,
      isIos: false,
      isWeb: false
    }
  },
  async created() {
    window.onstorage = (event) => {
      if (localStorage.uuid !== this.$route.query.uuid) {
        this.$hiClass.alert('로그인 정보가 변경되었습니다.<br>창을 닫습니다.', 'info')
            .then(() => {
              window.close()
            })
      }
    }
    this.eventId = this.$route.params.eventId ? this.$route.params.eventId : ''
    this.eventName = this.$route.params.eventName ? this.$route.params.eventName : ''
    this.pageType = this.$route.params.pageType ? this.$route.params.pageType : ''
    this.postId = this.$route.params.postId ? this.$route.params.postId : ''
    await this.setLocalStorage()
    if (Object.keys(this.$route.query).length > 0) {
      await this.$router.replace({'query': {uuid: this.$route.query.uuid}})
    }
  },
  methods: {
    setLocalStorage() {
      const keys = ['uuid', 'idToken']
      for (const key of keys) {
        if (this.$route.query[key] !== undefined) {
          localStorage.setItem(key, this.$route.query[key])
        }
      }

      if ((!localStorage.getItem('uuid') || !localStorage.getItem('idToken')) && this.pageType === 'form') {
        this.$router.push('/')
      }
    }
  }
}
</script>

<style scoped>

</style>