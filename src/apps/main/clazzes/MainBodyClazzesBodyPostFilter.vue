<template>
  <div class="board__filter"> <!-- .selete-view-style-wrap -->
    <div class="group-filter-sub">
      <button
        v-for="(tab, i) of items"
        :key="`button-${i}`"
        :class="{
          [tab.class]: true,
          'is-active': i === curTabIdx
        }"
        @click="$emit('tab-click',(tabIdx = i))"
      >
        {{ tab.name }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "main-body-clazzes-body-post-filter",
  props: {
    curTabIdx: {
      type: Number,
      required: true
    },
    postType: {
      type: String,
      required: true
    },
    items: {
      type: Array,
      required: true
    }
  },
  computed: {
    tabIdx: {
      get() {
        return this.curTabIdx
      },
      set(val) {
        this.$emit('update:curTabIdx', val)
      }
    }
  }
}
</script>

<style scoped>

</style>