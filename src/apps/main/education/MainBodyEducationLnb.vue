<template>
  <div class="column-lnb">
    <div class="column__inner">
      <div class="hi-lnb">
        <h2 class="heading-board">이벤트</h2>
        <ul class="lnb__list">
          <li
            v-for="(item, i) of linkClass"
            :key="item.currentId"
            class="lnb__item"
            :class="{
              'is-active': curTabIdx === i
            }"
            @click="goPage((curTabIdx = i))"
          >
            <span>{{ item.title }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import {eventBus} from "@/main";

export default {
  name: 'main-body-education-lnb',
  data: () => ({
    curTabIdx: 0,
    linkClass: [
      {
        url: '/main/education/event',
        title: '이벤트',
        form: 'EVENT'
      }
    ],
    chkNewPosts: {},
    isChkNewPostsLoaded: false,
    isNewEduPost: false,
    isNewEventPost: false
  }),
  components: {},
  watch: {
    $route() {
      this.curTabIdx = this.linkClass
        .map(function(d) {
          return d['url']
        })
        .indexOf(this.$route.path)
    }
  },
  created() {
    this.curTabIdx = this.linkClass
      .map(function(d) {
        return d['url']
      })
      .indexOf(this.$route.path)
  },
  methods: {
    goPage(idx) {
      const path = this.linkClass[idx].url
      if (path === this.$route.path) {
        eventBus.$emit('refresh-education-cur-form')
      } else {
        this.$router.push(path, () => {})
      }
    },
    setNew(form) {
      let flag = false
      this.$log.debug(form)

      if (form === 'EVENT') {
        flag = this.isNewEventPost
      } else {
        flag = this.isNewEduPost
      }
      return flag
    },
  }
}
</script>
