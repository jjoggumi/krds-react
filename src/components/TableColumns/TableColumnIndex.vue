<template>
  <div v-text="getIndex()"></div>
</template>

<script>
export default {
  name: "table-column-index",
  props: {
    total: {
      type: Number,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    // page: {
    //   type: Number,
    //   required: true
    // },
    // size: {
    //   type: Number,
    //   required: true
    // },
    sort: {
      type: Boolean,
      default() {
        return false
      }
    }
  },
  methods: {
    getIndex() {
      // 더보기 스타일로 인해 수정
      if (this.sort) {
        return (
          //this.total - (this.total - this.page * this.size - this.index) + 1
          this.total - (this.total - this.index) + 1
        )
      } else {
        //return this.total - (this.page * this.size) - this.index
        return this.total - this.index
      }
    }
  }
}
</script>
