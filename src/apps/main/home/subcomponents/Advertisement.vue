<template>
  <fragment>
    <section-type-group
      v-for="(section, index) of getSectionByGroup"
      :key="`advertisement-section-${index}`"
      :section="section"
      :tab-index="index"
      :thumbnail-type="params.thumbnailType"
    />
  </fragment>
</template>

<script>
import {mapGetters} from "vuex";
import SectionTypeGroup from "@/apps/main/home/sectionType/Group";

export default {
  name: "main-body-home-advertisement",
  components: {
    SectionTypeGroup
  },
  data() {
    return {
      params: {
        thumbnailType: 'B'
      },
    }
  },
  computed: {
    ...mapGetters({
    }),
    ...mapGetters('storeHome', {
      getSectionsBySectionType: 'getSectionsBySectionType'
    }),
    getSectionByGroup() {
      return this.getSectionsBySectionType({ sectionType: 'GROUP'})
    },
  },
}
</script>

<style scoped>

</style>