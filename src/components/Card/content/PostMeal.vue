<template>
  <!-- 급식 .item-cont-wrap-->
  <div class="board__content"> <!-- .item-cont-wrap-->
    <div class="board__meal">
      <div>
        <pre v-html="postContent"></pre>
      </div>

      <div
        v-if="mealImagePath"
        class="image"
        role="button"
        @click="$hiClass.handleImageClick($event, postItem)"
      >
        <img :src="mealImagePath" alt="">
      </div>

      <div class="allergy-info">
        <strong class="heading">{{ $t("main.schools.meal.allergy.title") }}</strong>
        <p>{{ $t("main.schools.meal.allergy.content") }}</p>
      </div>
      <p class="text-refer">※ 식단은 학교 사정에 의해서 변경될 수 있습니다.</p>

      <!-- TODO: 목록에서 API 요청 개선 필요 -->
      <post-meal-next
        :post-item="postItem"
        :post-item-type="postItemType"
        :index="index"
      ></post-meal-next>
    </div>
  </div>
</template>

<script>
import PostMealNext from "@/components/Card/content/PostMealNext";
export default {
  name: "post-meal",
  components: {PostMealNext},
  props: {
    /**
     * props: post item object
     * ( post | clazzesPost | schoolsPost )
     */
    postItem: {
      type: Object,
      required: true
    },
    /**
     * props: post item type
     * ( POST | CLAZZES_POST | SCHOOLS_POST )
     */
    postItemType: {
      type: String,
      required: true
    },
    index: {
      type: Number,
    },
  },
  computed: {
    postContent() {
      return this.postItem.postContent
    },
    files() {
      return this.postItem.files || []
    },
    mealImagePath() {
      const foundItem = this.files.find(file => file.fileOriginalPath)
      return foundItem ? foundItem.fileOriginalPath : ''
    }
  },
}
</script>

<style scoped>

</style>