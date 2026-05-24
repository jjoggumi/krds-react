<template>
  <strong
    v-if="(computedPostTitle || '') !== ''"
    :key="`postTitle-${computedPostTitle}`"
    class="heading"
    :inner-html.prop="computedPostTitle"
  />
</template>

<script>
export default {
  name: "detail-post-item-body-post-title",
  props: {
    post: {
      type: Object,
      required: true
    },
    postTypeName: {
      type: String,
      default() {
        return ''
      }
    }
  },
  computed: {
    isNote() {
      return this.post.postType === 'NOTE'
    },
    isMeal() {
      return this.post.postType === 'MEAL'
    },
    title() {
      let title = this.post.postTitle || ''
      let posted = null

      if (this.isNote && !title) {
        posted = this.post.posted
      } else if (this.isMeal) {
        posted = this.post.postTitle
      }

      if (this.$moment(posted).isValid())
        title = this.$moment(posted).format(`M월 D일 (ddd) ${this.postTypeName}`)

      return title
    },
    computedPostTitle() {
      switch (this.post.postType) {
        case 'NOTE':
        case 'MEAL':
          return this.title
        default:
          return this.post.postTitle
      }
    },
  },
}
</script>

<style scoped>

</style>