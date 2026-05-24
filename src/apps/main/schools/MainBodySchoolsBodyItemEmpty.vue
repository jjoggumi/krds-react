<template>
  <div class="board__nodata">
    <p v-if="isShowFirstLine">{{ $t('main.text.post.notFound') }}</p>
    <p v-else :inner-html.prop="message"></p>
  </div>
</template>

<script>
import {mapState} from "vuex";

export default {
  name: 'main-body-schools-body-item-empty',
  props: [
    'text',
    'isFirst',
  ],
  computed: {
    ...mapState({
      curSchoolSearchQuery: 'curSchoolSearchQuery'
    }),
    searchKeyword() {
      return this.curSchoolSearchQuery.keyword
    },
    existsSearchKeyword() {
      return this.curSchoolSearchQuery.keyword && this.curSchoolSearchQuery.keyword.length > 0
    },
  },
  methods: {
    isShowFirstLine() {
      let flag = false
      if (this.isFirst && this.searchKeyword === '') flag = true
      return flag
    },
    message() {
      let text = ''

      if (this.existsSearchKeyword)
        text = this.$t('main.text.post.search.notFound')
      else if (this.text)
        text = this.text
      else if (text === '' && !this.isFirst)
        text = this.$t('main.text.post.notFound')

      return text
    }
  }
}
</script>
