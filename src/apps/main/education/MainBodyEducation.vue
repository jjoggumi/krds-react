<template>
  <div class="cont-box-inner clfix">
    <layer-item positionType="WEB_POPUP_EDUCATION" />
    <banner-item
      :key="$store.state.bannerTimestamp"
      positionType="WEB_BANNER_QUICK"
      isQuickClass="class-page"
      :banners="$store.state.banner.WEB_BANNER_QUICK"
    />

    <Lnb />

    <components
      v-if="curForm"
      :is="curForm"
    ></components>
  </div>
</template>

<script>
import BannerItem from '@/components/Banner/BannerItem.vue'
import LayerItem from '@/components/Banner/LayerItem.vue'

import Lnb from '@/apps/main/education/MainBodyEducationLnb.vue'
import MainBodyEducationEvent from '@/apps/main/education/event/MainBodyEducationEvent.vue'
import {eventBus} from "@/main";

export default {
  name: 'mainBodyEducation',
  data() {
    return {
      curForm: ''
    }
  },
  components: {
    Lnb,
    BannerItem,
    LayerItem,
    MainBodyEducationEvent
  },
  computed: {},
  watch: {
    $route(to) {
      this.setForm(to.path)
    }
  },
  created() {
    this.setForm(this.$route.path)
  },
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'bg-white')

    eventBus.$on('refresh-education-cur-form', () => {
      this.refreshEducationCurForm()
    })
  },
  beforeDestroy() {
    this.$hiClass.toggleBodyClass('remove', 'bg-white')

    eventBus.$off('refresh-education-cur-form')
  },
  methods: {
    setForm(routePath) {
      try {
        const routePage = this.$comn.split(routePath, '/')
        const pageName = routePage.replace(/^\w/, c => c.toUpperCase())
        this.curForm = `MainBodyEducation${pageName}`
      } catch (error) {
        this.$log.debug(error)
      }
    },
    refreshEducationCurForm() {
      const curForm = this.curForm
      this.curForm = null
      setTimeout(() => {
        this.curForm = curForm
      }, 200)
    },
  }
}
</script>

<style scoped></style>
