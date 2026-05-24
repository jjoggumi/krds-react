<template>
  <!-- TODO: 목록에서 API 요청 개선 필요 -->
  <div
    :class="{ 'next-meal-info': nextItem }"
    v-observe-visibility="
      isVisible
      ? {
          callback: visibilityChanged,
          intersection: {
            threshold: 0.1,
          },
          once: true,
        }
      : false
    "
  >
    <template v-if="nextItem && checkViewDate">
      <strong class="heading">다음 급식 예고</strong>
      <span class="date">{{ postedStr }}</span>
      <pre v-html="nextItem.postContent"></pre>
    </template>
  </div>
</template>

<script>
import {mapState} from "vuex";
import {ObserveVisibility} from "vue-observe-visibility";

export default {
  name: "post-meal-next",
  directives: {
    ObserveVisibility
  },
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
  data() {
    return {
      isVisible: true,
      nextItem: null
    }
  },
  computed: {
    ...mapState({
      curSchoolSearchQuery: 'curSchoolSearchQuery',
    }),
    postedStr() {
      if (!this.nextItem) return ''

      let dateFormat = 'M[월] D[일] ddd[요일]'
      const posted = this.nextItem.posted
      const nowYear = this.$moment().year()
      const paramYear = this.$moment(posted).year()

      if (nowYear - paramYear > 0)
        dateFormat = `YYYY[년] ${dateFormat}`

      return this.$moment(posted).format(dateFormat)
    },
    parentId() {
      return this.postItem.parent
        ? this.postItem.parent.currentId
        : this.postItem.parentId
    },
    parentUri() {
      return `${this.$apiUrl}/schools/${this.parentId}`
    },
    nowDate() {
      return this.$comn.nowDateType01()
    }, 
    nextDate() {
      let dateFormat = "YYYYMMDD"
      const posted = this.nextItem.posted
      return this.$moment(posted).format(dateFormat)
    },
    checkViewDate() {
      return this.nowDate < this.nextDate
    }, 
  },
  mounted() {
    // this.getNextMeal()
  },
  methods: {
    async getNextMeal() {
      if (this.postItem && this.postItem.posted) {
        const parentUri = this.parentUri
        const query = {
          _parentUri: parentUri,
          _postType: 'MEAL',
          _postedGte: this.$moment(this.postItem.posted).endOf('day').valueOf(),
          sort: 'posted,asc',
          size: 1
        }

        for (const [key, value] of Object.entries(this.curSchoolSearchQuery)) {
          if (value !== null)
            query[key] = value
        }

        // this.$hiClass.posts.search(query)
        //   .then(res => {
        //     if (res) {
        //       if (res.data.page.totalElements > 0
        //         && res.data._embedded.posts.length > 0
        //       ) {
        //         // this.isVisible = true
        //         this.nextItem = res.data._embedded.posts[0]
        //       } else {
        //         // this.isVisible = false
        //       }
        //     }
        //   })
        //   .catch(err => {
        //     this.$log.debug(this.$options.name, " getNextMeal() error => ", err)
        //   })

        try {
          const res = await this.$hiClass.posts.search(query)
          
          if (res) {
            if (res.data.page.totalElements > 0
              && res.data._embedded.posts.length > 0
            ) {
              // this.isVisible = true
              this.nextItem = res.data._embedded.posts[0]
            } else {
              // this.isVisible = false
            }
          }
        } catch (err) {
          this.$log.debug(this.$options.name, " getNextMeal() error => ", err)
        }
      }
    },
    visibilityChanged(isVisible, entry) {
      if (isVisible) {
        this.$log.debug(this.$options.name, 'visibilityChanged: ', `getNextMeal()`)
        if(this.index === 0) this.getNextMeal()
      }
    },
  }
}
</script>

<style scoped>

</style>