<template>
  <!-- 인쇄하기 버튼 -->
  <button
    v-if="isShowPrint"
    class="btn-print"
    @click="openPrintView"
  >
    <span>인쇄하기</span>
  </button>
</template>

<script>
import {mapGetters, mapMutations} from "vuex";

export default {
  name: "print-button",
  components: {},
  props: {
    /**
     * props: post item object
     * ( post | clazzesPost | schoolsPost )
     */
    postItem: {
      type: Object,
      required: true
    },
    /**
     * props: post item type
     * ( POST | CLAZZES_POST | SCHOOLS_POST )
     */
    postItemType: {
      type: String,
      required: true
    },
    postTypeName: {
      type: String,
      required: true
    },
    schoolType: {
      type: String,
    },
    className: {
      type: String
    },
  },
  data() {
    return {}
  },
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    }),
    isShowPrint() {
      return this.isPostTypeNote
    },
    isPostTypeNote() {
      return this.postItem.postType === this.CONSTANTS.POST_TYPE.NOTE
    },
  },
  methods: {
    ...mapMutations({
      setPrintView: 'setPrintView',
    }),
    openPrintView() {
      const content = this.postItem.postContent
      const className = this.className
      const posted = this.postItem.posted
      const postTypeName = this.postTypeName

      this.setPrintView({
        isOpen: true,
        content,
        className,
        posted,
        postTypeName
      })
    },
  }
}
</script>

<style scoped>

</style>