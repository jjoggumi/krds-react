<template>
  <component :is="curForm"></component>
</template>

<script>
import Faq from './faq/MobileHelpFaq.vue'
// import Faq from "./faq/MobileHelpFaqSearch.vue";
import Notice from './notice/MobileHelpNotice.vue'
import Question from './question/MobileHelpQuestion.vue'
import Suggestion from './suggestion/MobileHelpSuggestion.vue'

export default {
  name: 'MobileHelp',
  components: {
    Faq,
    Notice,
    Question,
    Suggestion
  },
  data: () => ({}),
  watch: {
    $route() {
      this.setComponent()
    }
  },
  methods: {
    setQuery(keys) {
      for (const key of keys) {
        if (this.$route.query[key] !== undefined)
          localStorage.setItem(key, this.$route.query[key])
      }
    },
    setComponent() {
      let id = this.$route.params.id
      this.curForm = id.replace(/^./, id[0].toUpperCase())
      document.title = 'MobileHelp-' + this.curForm
    }
  },
  created() {
    const keys = ['uuid', 'idToken', 'refreshToken', 'userType']
    this.setQuery(keys)

    this.setComponent()
  },
  destroyed() {
    this.$authentication.clear()
  }
}
</script>

<!--<style scoped src="../../../assets/css/m-customer.css" />-->
