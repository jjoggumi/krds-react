<template>
  <!-- lnb -->
  <div class="lnb-cont-wrap type2">
    <div class="lnb-wrap edu-info">
      <div class="lnb-inner">
        <div class="total-lnb-wrap">
          <div class="lnb-school-title">마이 페이지</div>
          <ul class="lnb-list">
            <!-- <li class="on"><span>개인정보</span></li>
            <li class="new"><span>나의 클래스</span></li>-->
            <li
              v-for="(item, i) in linkClass"
              :class="{ on: i === mypageCurrentTab }"
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
  <!-- lnb -->
</template>

<script>
import {mapActions} from "vuex";

export default {
  name: "mainBodyMypageLnb",
  props: {
    mypageCurrentTab: Number,
    user: Object
  },
  data: () => ({
    linkClass: [
      {
        url: "/main/mypage/info",
        title: "내 정보 관리",
        index: 0
      },
      {
        url: "/main/mypage/schools",
        title: "나의 학교",
        index: 1
      },
      {
        url: "/main/mypage/clazzes",
        title: "나의 클래스",
        index: 2
      },
      {
        url: "/main/mypage/scrap",
        title: "나의 스크랩",
        index: 3
      }
    ]
  }),
  components: {},
  watch: {
    $route() {
      this.init();
    }
  },
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    goPage(link, i) {
      let surfix = this.$comn.split(link, "/")
      this.triggerAnalyticsLogEvent({ code: `analytics.mypage.click.lnb.${surfix.toLowerCase()}` })

      // 탭 메뉴 클릭 시 기존 탭 초기화
      this.onClickTab(-1);
      this.$nextTick(() => {
        this.onClickTab(i);
        this.$router.push(link, () => {});
      })
    },
    onClickTab(i) {
      const param = {
        index: i
      };
      this.$emit("onChangeTab", param);
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
          this.$emit("onChangeTab", param);
        }
      }
      if (!existPath) {
        this.$emit("onChangeTab", { index: 0 });
      }
    }
  },
  created() {
    this.init();
  }
};
</script>
