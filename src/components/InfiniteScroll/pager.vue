<template>
  <div class='infinite-scroll-pager'>
    <Container @scroll-bottom="next" v-if="list.length > 0" ref='container'>
      <template v-for="item in list">
        <slot name="item" :item="item"></slot>
      </template>
    </Container>
    <div v-else>
      <slot name="nodata">검색 결과가 없습니다.</slot>
    </div>
  </div>
</template>

<script>
import Container from './container.vue'

export default {
  components: {
    Container
  },
  data() {
    return {
      lastCount: 0,
      list: [],
      page: 0
    }
  },
  watch: {
    searchParams: {
      handler() {
        this.initialize()
      },
      deep: true
    }
  },
  props: {
    search: {
      type: Function,
      required: true
    },
    searchParams: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    next() {
      this.page++
      this.loadPage(this.page)
    },
    async loadPage(page=0) {
      const data = await this.search({...this.searchParams, page})
      if (!data || data.length === 0) return
      this.list = this.list.concat(data)
      if (this.list.length > this.lastCount)
        this.maximizeHeight()
      this.lastCount = this.list.length
      await this.$nextTick()
      this.syncHeight()
    },
    syncHeight() {
      this.$el.style.height = this.$el.parentElement.clientHeight + 'px'
      this.$refs.container.maximizeHeight()
      this.$refs.container.minimizeHeight()
      this.minimizeHeight()
    },
    maximizeHeight() {
      this.$el.style.height = window.getComputedStyle(this.$el.parentElement).getPropertyValue('max-height')
    },
    minimizeHeight() {
      this.$el.style.height = Math.min(
        this.$refs.container.$el.clientHeight,
        this.$el.clientHeight
      ) + 'px'
    },
    initialize() {
      this.page = 0
      this.list = []
      this.loadPage()
    }
  },
  mounted() {
    this.initialize()
  }
}
</script>

<style scoped>
.infinite-scroll-pager {
  overflow: hidden;
}
</style>