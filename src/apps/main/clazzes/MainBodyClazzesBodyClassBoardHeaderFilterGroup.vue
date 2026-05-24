<template>
  <!-- TODO: 2022-09-20 new feature ! -->
  <div class="group-filter">
    <button
      v-for="(tab, index) of tabs"
      :key="`${tab.code}-${index}`"
      :class="{
        'is-active': activeTabCode === tab.code,
        [tab.class]: true
      }"
      @click="changeActiveTab(tab.code)"
    >
      {{ tab.name }}
    </button>
    <!-- _class_filter_file.html 참고 -->
  </div>

</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import {eventBus} from "@/main";

export default {
  name: "main-body-clazzes-body-class-board-header-filter-group",
  props: {
    isManager: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      tabs: [
        {
          code: 'LIST',
          name: '리스트',
          class: 'btn-list'
        },
        {
          code: 'FILE',
          name: '파일 모아보기',
          class: 'btn-file'
        }
      ]
    }
  },
  computed: {
    ...mapState({
      curClassTabCode: 'curClassTabCode',
    }),
    activeTabCode() {
      return this.curClassTabCode
    }
  },
  watch: {
    // 탭이 변경되면 최상단으로 이동
    activeTabCode() {
      this.$scrollTo("body", { duration: 0 })
    }
  },
  created() {
    const firstTab = this.tabs[0]
    if (firstTab && firstTab.code) {
      this.setCurClassTabCode(firstTab.code)
    }
  },
  methods: {
    ...mapMutations({
      setCurClazzesPosts: 'setCurClazzesPosts',
      setCurClassTabCode: 'setCurClassTabCode',
    }),
    ...mapActions({
      initCurClassSearchQuery: 'initCurClassSearchQuery',
      initCurClassPostFileSearchQuery: 'initCurClassPostFileSearchQuery',
    }),
    changeActiveTab(code) {
      // 기존 게시글 필터 초기화
      this.initCurClassSearchQuery()

      // 기존 파일 필터 초기화
      this.initCurClassPostFileSearchQuery()

      this.setCurClazzesPosts(undefined)
      this.setCurClassTabCode(null)
      this.$nextTick(() => this.setCurClassTabCode(code))

      // 게시글 목록 초기화
      if(code !== 'LIST') this.$nextTick(() => eventBus.$emit('refresh-class-board-posts'))
    },
  }
}
</script>

<style scoped>

</style>