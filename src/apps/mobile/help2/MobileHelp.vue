<template>
  <component v-if='shown' :is="curForm" :parent="parent" ref="component"></component>
</template>

<script>
import Faq from './faq/MobileHelpFaq.vue'
// import Faq from "./faq/MobileHelpFaqSearch.vue";
import Notice from './notice/MobileHelpNotice.vue'
import Question from './question/MobileHelpQuestion.vue'
import QuestionList from './question/MobileHelpQuestionList.vue'
import Suggestion from './suggestion/MobileHelpSuggestion.vue'
import nativeInterface from '@/apps/mobile/nativeInterface';

export default {
  name: 'MobileHelp',
  components: {
    Faq,
    Notice,
    Question,
    QuestionList,
    Suggestion
  },
  data: () => ({
    shown: true,
    onComponentChanged: () => {},
    historyCount: 0,
  }),
  watch: {
    $route() {
      this.setComponent()
    }
  },
  computed: {
    parent() {
      return this
    }
  },
  methods: {
    async consumeComponentChanged() {
      await this.onComponentChanged();
      this.onComponentChanged = () => {};
    },
    setQuery(keys) {
      for (const key of keys) {
        if (this.$route.query[key] !== undefined)
          localStorage.setItem(key, this.$route.query[key])
      }
    },
    async setComponent() {
      let id = this.$route.params.id
      this.curForm = id.replace(/^./, id[0].toUpperCase())
      document.title = 'MobileHelp-' + this.curForm
      await this.redraw()
      this.consumeComponentChanged()
      this.historyCount++
    },
    async redraw() {
      this.shown = false
      await this.$nextTick()
      this.shown = true
    },
    focusFaqSearch () {
      this.onComponentChanged = () =>
        this.$refs.component.setFocus()
      this.$router.push('/mobile/help/faq')
    },
    back () {
      this.historyCount -= 2
      this.historyCount >= 0
        ? window.history.back() : nativeInterface.goBack()
    },
    async setFaqCategoriId(item) {
      if (this.curForm === 'Faq') {
        return this.$refs.component.setFaqCategoriId(item)
      }
      this.onComponentChanged = () =>
        this.$refs.component.setFaqCategoriId(item)
      this.$router.push('/mobile/help/faq')
    },
  },
  created() {
    const keys = ['uuid', 'idToken', 'refreshToken', 'userType']
    this.setQuery(keys)

    const meta = document.createElement('meta');
    meta.name = "viewport";
    meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
    document.getElementsByTagName('head')[0].appendChild(meta);

    this.setComponent()
  },
  destroyed() {
    this.$authentication.clear()
  }
}
</script>
