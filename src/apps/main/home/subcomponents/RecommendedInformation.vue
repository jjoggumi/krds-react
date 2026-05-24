<template>
  <fragment>
    <section-type-tab-thumbnail
      v-for="(tab, index) of tabs"
      :key="index"
      :tab="tab"
      :tab-index="index"
    >
      <template
        v-if="index === 0"
        v-slot:description
      >
        <p class="desc">학교생활에 꼭 필요한<br>교육 정보 모음</p>
      </template>
    </section-type-tab-thumbnail>
  </fragment>
</template>

<script>
import SectionTypeTabThumbnail from "@/apps/main/home/sectionType/TabThumbnail";
import {mapGetters} from "vuex";
export default {
  name: "main-body-home-recommended-information",
  components: {SectionTypeTabThumbnail},
  data() {
    return {
      params: {
        sectionType: 'TAB'
      },
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
    tabs() {
      return this.section.tabs ? this.section.tabs.filter(tab => tab.type === 'TAB_THUMBNAIL') : []
    },
  },
}
</script>

<style scoped>

</style>