<template>
  <strong class="heading" :inner-html.prop="computedPostTitle || ''"></strong>
</template>

<script>
import { mapState } from "vuex"

export default {
  name: "post-title",
  props: {
    postType: {
      type: String,
      required: true
    },
    postTypeName: {
      type: String,
      required: true
    },
    postTitle: {
     type: [String, null]
    },
    posted: {
     type: [Number, null]
    },
  },
  computed: {
    ...mapState({
      curClassSearchQuery: 'curClassSearchQuery',
    }),
    isNote() {
      return this.postType === 'NOTE'
    },
    isMeal() {
      return this.postType === 'MEAL'
    },
    title() {
      let title = this.postTitle || ''
      let posted = null

      if (this.isNote && !title) {
        posted = this.posted
      } else if (this.isMeal) {
        posted = this.postTitle
      }

      if (this.$moment(posted).isValid())
        title = this.$moment(posted).format(`M월 D일 (ddd) ${this.postTypeName}`)

      return title
    },
    computedPostTitle() {
      let title = this.postType === 'NOTE' || this.postType === 'MEAL' ? this.title : this.postTitle

      title = title ? title.replaceAll('>', '&gt;').replaceAll('<', '&lt;') : title
      if (this.curClassSearchQuery.keyword) {
        const regex = new RegExp(`(${this.curClassSearchQuery.keyword})(?![^<]*>)(?![^&amp;|&nbsp;|&lt;|&gt;|&quot;|&ndash;|&mdash;|&copy;|&reg;|&trade;|&asymp;|&ne;|&pound;|&euro;|&deg;]*;)`, "gi")
        title = title.replace(regex, "<span class='highlight'>" + this.curClassSearchQuery.keyword + "</span>")
      }

      return title
    },
  }
}
</script>

<style scoped>
</style>