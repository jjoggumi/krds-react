<template>
  <div class="board__content" @click="link">
    <detail-post-item-body-post-content-event
      v-if="postItem.currentId"
      :post="postItem"
    />
  </div>
</template>

<script>
import DetailPostItemBodyPostContentEvent from "@/components/DetailPost/DetailPostItemBodyPostContentEvent";
export default {
  name: "post-event",
  components: {DetailPostItemBodyPostContentEvent},
  props: {
    postItem: {
      type: Object
    },
    postItemType: {
      type: String
    }
  },
  methods: {
    link() {
      this.$emit('link')
    }
  }
}
</script>

<style scoped>

</style>