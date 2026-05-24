<template>
  <div class="lnb-cont-wrap type2">
    <div class="lnb-wrap edu-info">
      <div class="lnb-inner">
        <div class="total-lnb-wrap">
          <div class="lnb-school-title">더보기</div>
          <ul class="lnb-list">
            <li
              v-for="(item, i) of linkClass"
              :class="{
                on: i === currentTabIndex,   // 선택한 메뉴
                new: false                   // 신규 점 표시
              }"
              :key="item.currentId"
              @click="goPage(item.url, i)"
            >
              <span>{{ item.title }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapActions} from "vuex";
import {mapFields} from "vuex-map-fields";

export default {
  name: "main-body-my-board-lnb",
  components: {},
  data() {
    return {
      linkClass: [
        {
          url: "/main/myboard/news",
          title: "내 소식",
          index: 0
        },
        {
          url: "/main/myboard/alarmplus",
          title: "학교알리미 설문",
          index: 1
        },
      ],
      currentTabIndex: 0
    }
  },
  computed: {
    ...mapFields('storeMyBoard',{
      myBoardLnb: 'lnb'
    })
  },
  watch: {
    $route() {
      this.init();
    },
    currentTabIndex(val) {
      this.myBoardLnb.currentTabIndex = val
    }
  },
  created() {
    this.init();
  },
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    ...mapActions('storeMyBoard', {
      reloadMyBoard: 'reloadMyBoard'
    }),
    goPage(link, i) {
      let suffix = this.$comn.split(link, "/")

      this.triggerAnalyticsLogEvent({ code: `analytics.myboard.click.lnb.${suffix.toLowerCase()}` })
      this.onClickTab(i);

      const isSelectCurrentMenu = this.$route.path === link
      if (isSelectCurrentMenu) {
        this.reloadMyBoard()
      } else {
        this.$router.push(link, () => {})
      }
    },
    onClickTab(i) {
      const param = { index: i };
      this.changeTab(param)
    },
    init() {
      const path = this.$route.path;
      let existPath = false;
      for (const item of this.linkClass) {
        if (item.url.includes(path)) {
          const param = {
            index: item.index
          };
          existPath = true;
          this.changeTab(param)
        }
      }
      if (!existPath) {
        this.changeTab({ index: 0 })
      }
    },
    changeTab(param) {
      this.currentTabIndex = param.index
    }
  },
}
</script>

<style scoped>

</style>