<template>
  <recommend-code-form
      v-if="pageType === 'form'"
      :eventId="eventId"
      :postId="postId"
  />
  <recommend-code-info v-else/>
</template>

<script>
import RecommendCodeForm from "@/apps/events/recommendCode/Form";
import RecommendCodeInfo from "@/apps/events/recommendCode/Info";
export default {
  name: "recommend-code-main",
  components: {RecommendCodeForm, RecommendCodeInfo},
  props: {
    pageType: {
      type: String
    },
    eventId: {
      type: String
    },
    postId: {
      type: String
    }
  },
  methods: {
    setTitle() {
      if (this.pageType === 'form') {
        document.title = '추천코드 입력하기'
      } else {
        document.title = '유치원 사용법 알아보기'
      }
    }
  },
  mounted() {
    this.setTitle()
  },
  watch: {
    $route() {
      this.setTitle()
    }
  },
}
</script>

<style scoped>

</style>