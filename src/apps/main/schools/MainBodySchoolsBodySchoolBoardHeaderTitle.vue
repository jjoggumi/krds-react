<template>
  <div class="page-sub-heading"> <!-- .title-wrap -->
    <h3 class="heading">{{ title }}</h3>
  </div>
</template>

<script>
import {mapGetters} from "vuex";

export default {
  name: "main-body-schools-body-school-board-header-title",
  props: {
    postType: {
      type: String,
      default() {
        return ''
      }
    }
  },

  computed: {
    ...mapGetters({
      getPostTypeNameByCode: 'getPostTypeNameByCode',
    }),
    postTypeName() {
      if (this.postType === 'ALL') return '학교 전체'

      const params = { code: this.postType }
      return this.getPostTypeNameByCode(params)
    },
    title() {
      return this.postTypeName
    },
  }
}
</script>

<style scoped>

</style>