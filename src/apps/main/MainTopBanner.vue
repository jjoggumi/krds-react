<template>
  <banner-top
    v-if="isShow"
    :section="section"
    @toggle-banner="toggleBanner"
  />
</template>

<script>
import BannerTop from "@/apps/main/home/sectionType/BannerTop";
import {mapGetters} from "vuex";

export default {
  name: "main-top-banner",
  components: {BannerTop},
  data() {
    return {
      params: {
        sectionType: 'BANNER_TOP'
      },
      isShow: true
    }
  },
  mounted() {
    // 마운트 시 부모에게 현재 상태를 알림(초기 동기화)
    this.$emit('banner-toggle', !!this.isShow)
  },
  watch: {
    // 내부 상태가 변경되면 부모에 항상 알림
    isShow(val) {
      this.$emit('banner-toggle', !!val)
    }
  },
  computed: {
    ...mapGetters('storeHome', {
      getSectionsBySectionType: 'getSectionsBySectionType'
    }),
    getSections() {
      return this.getSectionsBySectionType(this.params)
    },
    section() {
      return this.getSections.length > 0 ? this.getSections[0] : {}
    },
  },
  methods: {
    toggleBanner(val) {
      this.isShow = val
    }
  }
}
</script>

<style scoped>

</style>