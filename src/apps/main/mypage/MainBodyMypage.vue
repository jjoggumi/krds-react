<template>
  <div class="cont-box-inner clfix">
    <banner-item
      :key="$store.state.bannerTimestamp"
      positionType="WEB_BANNER_QUICK"
      :banners="$store.state.banner.WEB_BANNER_QUICK"
    />

    <Lnb
      :user="user"
      :mypageCurrentTab="mypageCurrentTab"
      @onChangeTab="changeTab"
    ></Lnb>
    <div class="right-cont-wrap">
      <div class="contetns-title-wrap" v-if="mypageCurrentTab !== 4">
        <div class="title">{{ title }}</div>
        <p v-if="mypageCurrentTab === 1" class="text">학교는 최대 20개까지만 구독 가능합니다.</p>
      </div>
      <router-view
        v-if="existsBody"
        :user="user"
        :isTempStudent="isTempStudent"
        :mypageCurrentTab="mypageCurrentTab"
      ></router-view>
      <br />
    </div>
  </div>
</template>

<script>
import Lnb from './MainBodyMypageLnb'
import BannerItem from '../../../components/Banner/BannerItem'

export default {
  name: 'mainBodyMypage',
  props: {
    user: Object,
    isTempStudent: Boolean
  },
  components: {
    Lnb,
    BannerItem
  },
  data: () => ({
    mypageCurrentTab: 0,
    titleSet: [
      '내 정보 관리',
      '나의 학교',
      '나의 클래스',
      '나의 스크랩',
      '050 안심 번호 서비스'
    ]
  }),
  computed: {
    existsBody() {
      return this.mypageCurrentTab > -1
    },
    title() {
      return this.titleSet[this.mypageCurrentTab]
    },
  },
  watch: {
    $route(to) {
      this.$comn.log(this, 'mypage to => ', to.path)
      this.init(to.path)
    }
  },
  methods: {
    init(path) {
      if (path === '/main/mypage') {
        path = path + '/info'
        this.$router.replace(path, () => {})
      }
    },
    changeTab(param) {
      this.mypageCurrentTab = param.index
    }
  },
  created: function() {
    this.init(this.$route.path)
  }
}
</script>

<style scoped></style>
