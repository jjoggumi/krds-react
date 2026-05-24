<template>
  <article
    :key="`${postId}-${postItemType}-${componentKey}`"
    class="hi-board board__item"
  >
    <card-item-header
      :key="`card-item-header-${componentKey}`"
      :post-title="postTitle"
      :post-type="postType"
      :post-type-name="postTypeName"
      :posted="posted"
      :school-image-path="schoolImagePath"
      :school-name="schoolName"
      :write-user="writeUser"

      :alarm-plus="alarmPlus"
      :alarm-plus-id="alarmPlusId"
    />

    <post-alarm-plus
      :key="`card-item-content-${componentKey}`"
      :post-item="postItem"
      :post-item-type="postItemType"

      :alarm-plus="alarmPlus"
      :alarm-plus-id="alarmPlusId"
    />

  </article>
</template>

<script>
import {mapGetters} from "vuex";

import CardItemHeader from "@/components/Card/CardItemHeader";
import PostAlarmPlus from "@/components/Card/content/PostAlarmPlus";
import {eventBus} from "@/main";

export default {
  name: "card-alarm-plus",
  components: {PostAlarmPlus, CardItemHeader},
  props: {
    // 게시글 상세
    post: {
      type: Object,
      default() {
        return {}
      }
    },
    posts: {
      type: Array,
    },
    // 클래스 목록에서 전달
    clazzesPost: {
      type: Object,
      default() {
        return {}
      }
    },
    clazzesPosts: {
      type: Array
    },
    // 학교 목록에서 전달
    schoolsPost: {
      type: Object,
      default() {
        return {}
      }
    },
    schoolsPosts: {
      type: Array
    },
    index: {
      type: Number,
    },
    param: {
      type: Object,
      default() {
        return {}
      }
    },
  },
  data(){
    return {
      componentKey: 0,
    }
  },
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
      getPostTypeNameByCode: "getPostTypeNameByCode",
    }),
    postItem() {
      if (this.isSchoolsPost) {
        return this.schoolsPost
      } else {
        return this.post
      }
    },
    postItemType() {
      if (this.isSchoolsPost) {
        return 'SCHOOLS_POST'
      } else {
        return 'POST'
      }
    },
    isSchoolsPost() { return this.schoolsPost.currentId },
    postId() { return this.postItem.currentId || null },
    postTitle() { return this.postItem.postTitle },
    postType() { return this.postItem.postType || ''},
    posted() { return this.postItem.posted || null },
    writeUser() { return this.postItem.writeUser || {} },
    alarmPlus: {
      get() {
        return this.postItem.alarmPlus
      },
      set(val) {
        this.postItem.alarmPlus = val
      }
    },
    alarmPlusId() { return this.postItem.alarmPlusId },

    // 학교 게시글용
    schoolImagePath() {
      let schoolImagePath = ''
      switch (this.postItemType) {
        case this.CONSTANTS.POST_ITEM_TYPE.SCHOOLS_POST: {
          schoolImagePath = this.postItem.schoolImagePath
          break
        }
        default: { schoolImagePath = this.postItem.parent.schoolImagePath }
      }
      return schoolImagePath
    },
    schoolName() {
      let schoolName = ''
      switch (this.postItemType) {
        case this.CONSTANTS.POST_ITEM_TYPE.SCHOOLS_POST: {
          schoolName = this.postItem.schoolName
          break
        }
        default: { schoolName = this.postItem.parent.schoolName }
      }
      return schoolName
    },
    postTypeName() {
      const params = { code: this.postType }
      return this.getPostTypeNameByCode(params)
    },

  },
  mounted() {
    eventBus.$on(`reload-alarm-plus-post-by-post-id|${this.postId}`, () => {
      this.reloadAlarmPlus()
    })

    // TODO: reload test
    // if (this.postItem.postTitle === '설문 대기설문 대기설문 대기 [돌봄교실] 돌봄교실 여름방학 급식 만족도 설문') {
    //   setTimeout(() => {
    //     this.reloadAlarmPlus()
    //   }, 5000)
    // }
  },
  beforeDestroy() {
    eventBus.$off(`reload-alarm-plus-post-by-post-id|${this.postId}`)
  },
  methods: {
    async reloadAlarmPlus() {
      const url = `/posts/${this.postId}`
      const reloadedPost = await this.$hiClass.posts.read(url).then(res => res.data)
      const reloadedAlarmPlus = reloadedPost.alarmPlus || null

      this.$log.debug(`JSON.stringify(this.alarmPlus) => ` + JSON.stringify(this.alarmPlus))
      this.$log.debug(`JSON.stringify(reloadedAlarmPlus) => ` + JSON.stringify(reloadedAlarmPlus))

      this.$log.debug(`JSON.stringify(this.alarmPlus).length => ` + JSON.stringify(this.alarmPlus).length)
      this.$log.debug(`JSON.stringify(reloadedAlarmPlus).length => ` + JSON.stringify(reloadedAlarmPlus).length)

      if (reloadedAlarmPlus) {
        this.alarmPlus = reloadedAlarmPlus
        // for (const [key, value] of Object.entries(reloadedAlarmPlus)) {
        //     this.alarmPlus[key] = value
        // }
        this.componentKey++
      }
    }
  }
}
</script>

<style scoped>

</style>