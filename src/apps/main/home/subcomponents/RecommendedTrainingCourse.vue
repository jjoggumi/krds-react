<template>
  <fragment>
    <!-- type A => 총 3개 이하의 아이템 썸네일을 균등하게 보여줌 -->
    <section-type-thumbnail
      v-for="(section, index) of getSectionsByThumbnail"
      :key="`${params.thumbnailType}-${index}`"
      :section="section"
      :tab-index="index"
      :thumbnail-type="params.thumbnailType"
    />
  </fragment>
</template>

<script>
import SectionTypeThumbnail from "@/apps/main/home/sectionType/Thumbnail";
import {mapGetters} from "vuex";
export default {
  name: "main-body-home-recommended-training-course",
  components: {SectionTypeThumbnail},
  data() {
    return {
      params: {
        sectionType: 'THUMBNAIL',
        thumbnailType: 'A'
      },
    }
  },
  computed: {
    ...mapGetters('storeHome', {
      getSectionsBySectionType: 'getSectionsBySectionType'
    }),
    getSectionsByThumbnail() {
      return this.getSectionsBySectionType(this.params)
        .filter(section => section.displayCount < 4)
    },
  },
}
</script>

<style scoped>

</style>