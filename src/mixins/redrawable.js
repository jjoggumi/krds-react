export default {
  data: () => ({ shown: true}),
  methods: {
    redraw() {
      this.shown = false
      this.$nextTick(() => {
        this.shown = true
      })
    }
  },
}
