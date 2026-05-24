<template>
  <div></div>
</template>

<script>
import {mapActions, mapGetters} from "vuex";

export default {
  name: "section-type-thumbnail-btn",
  props: {
    section: {
      type: Object,
      required: true
    },
    tabIndex: {
      type: Number,
      required: true
    },
  },
  data() {
    return {
      moreRoutePath: [
        // '/main/education/info'
      ]
    }
  },
  computed: {
    ...mapGetters('storeHome', {
    }),
    contents() {
      return this.section.contents || []
    },
  },
  methods: {
    ...mapActions('storeHome', {
      callHomeContentsLink: 'callHomeContentsLink'
    })
  }
}
</script>

<style scoped>

</style>