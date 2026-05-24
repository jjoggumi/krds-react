<template>
  <!--
  <div class="cont-empty-wrap" :class="{ setWidth: width }">
    <div class="img-wrap">
      <img src="@/assets/img/icon_cont_empty_face_108.png" alt />
    </div>
    <div class="text-wrap">
      <p v-if="isShowFirstLine">{{ $t('main.text.post.notFound') }}</p>
      <p :inner-html.prop="message"></p>
    </div>
  </div>
  -->

  <div class="board__nodata">
    <p v-if="isShowFirstLine">{{ $t('main.text.post.notFound') }}</p>
    <p :inner-html.prop="message"></p>
  </div>
</template>

<script>
import {mapState} from "vuex";

export default {
  name: 'main-body-clazzes-body-item-empty',
  props: [
    'text',
    'isFirst',
    'width',
    'isManager',
    'isParents',
    'textParents'
  ],
  computed: {
    ...mapState({
      curClassSearchQuery: 'curClassSearchQuery',
    }),
    searchKeyword() {
      return this.curClassSearchQuery.keyword
    },
    existsSearchKeyword() {
      return this.curClassSearchQuery.keyword && this.curClassSearchQuery.keyword.length > 0
    },
    isShowFirstLine() {
      return this.isFirst && !this.existsSearchKeyword
    },
    message() {
      let text = ''

      if (this.existsSearchKeyword)
        text = this.$t('main.text.post.search.notFound2')
      else if (this.isManager)
        text = this.text
      else if (!this.isManager && this.isParents)
        text = this.textParents
      else if (text === '' && !this.isFirst)
        text = this.$t('main.text.post.notFound')

      return text
    }
  },
  methods: {

  }
}
</script>
