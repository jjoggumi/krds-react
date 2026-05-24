<template>
  <div v-if="isLoadComplete">
    <div id="wrap" :class="className">
      <div id="cont-wrap">
        <!-- header -->
        <help-header v-if="!isLogin" />
        <main-header v-else-if="isLogin && isShowMainHeader" key="20200710" :user="$store.state.user" />

        <!-- SLB -->
        <main-slb />

        <div id="cont-box-wrap">
          <div class="cont-box-inner clfix">
            <banner-item
              v-if="isLogin"
              :key="$store.state.bannerTimestamp"
              positionType="WEB_BANNER_QUICK"
              :banners="$store.state.banner.WEB_BANNER_QUICK"
            />

            <!-- LNB -->
            <help-lnb
              :mypageCurrentTab="mypageCurrentTab"
              :isLogin="isLogin"
              @onChangeTab="changeTab"
            />

            <!-- help-body -->
            <router-view :isLogin="isLogin" />
          </div>
        </div>

        <!-- TODO: 20200410 로그인 후 고객센터에서 알림목록 아이템을 선택 시 처리 필요 -->

        <transition name="fade">
          <!-- top-btn -->
          <main-to-top-btn v-if="isShowMainToTopBtn" />
        </transition>
      </div>

      <!-- 외부 팝업 open -->
      <open-popup
        v-if="$store.state.openPopup.path"
        :windowId="$store.state.openPopup.id"
        :key="`open-popup-${$store.state.openPopup.path}`"
        :path="$store.state.openPopup.path"
        :type="$store.state.openPopup.type"
        :size="$store.state.openPopup.size"
        :params="$store.state.openPopup.params"
      />

    </div>

    <!-- footer -->
    <hc-footer />
  </div>
</template>

<script>
import HelpLnb from './HelpLnb.vue'
import MainHeader from '../main/MainHeaderV2.vue'
import HelpHeader from './HelpHeader.vue'
import MainSlb from '../main/MainSlb.vue'
import MainToTopBtn from '../main/MainToTopBtn.vue'
import BannerItem from '../../components/Banner/BannerItem'

import OpenPopup from "@/components/Popup/openPopup";

import axios from 'axios'
import ErrorLoadFailAsyncComponent from "@/apps/error/ErrorLoadFailAsyncComponent";
import {mapActions} from "vuex";

const HcFooter = () => ({
  component: import('@/components/Form/HcFooter'),
  error: ErrorLoadFailAsyncComponent,
})

export default {
  name: 'help-home',
  components: {
    OpenPopup,
    HelpLnb,
    MainHeader,
    HelpHeader,
    MainSlb,
    MainToTopBtn,
    BannerItem,
    HcFooter,
  },
  data() {
    return {
      mypageCurrentTab: 0,
      className: '',
      isLoadComplete: null,
      windowTop: 0
    }
  },
  computed: {
    headerIgnorePaths() {
      return ['/', '/main', '/help']
    },
    isShowMainHeader() {
      return !(this.headerIgnorePaths.find(path => path === this.$route.path))
    },
    isShowMainToTopBtn() {
      const isAlarmPlus = this.$route.path.includes('/main/alarmplus')
      return this.windowTop > 0 && !isAlarmPlus;
    },
    isLogin() {
      return this.$store.state.user.currentId !== undefined
    }
  },
  watch: {
    $route() {
      this.setClassName()

      const bannerTimestamp = this.$store.state.bannerTimestamp
      if (
        bannerTimestamp !== null &&
        this.$moment().diff(bannerTimestamp, 'minutes') >= 10
      ) {
        this.getMainBanners()
      }
    }
  },
  created() {
    this.setClassName()
    this.loginCheck()
  },
  mounted() {
    window.addEventListener('scroll', this.onScroll)
    // 고객센터 진입 시 최상단으로 이동
    window.scrollTo(0, 0)
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.onScroll)
  },
  methods: {
    ...mapActions({
      getBanners: 'getBanners'
    }),
    setClassName() {
      let name = this.$route.meta.class
      if (typeof name === 'undefined') name = 'school-class'
      this.className = `page-${name}`
    },
    changeTab(param) {
      this.mypageCurrentTab = param.index
    },
    loginCheck() {
      const params = this.$authentication.load()
      const uuid = params.uuid

      if (uuid === undefined || uuid === null) {
        this.isLoadComplete = true
        return false
      }

      // 공통 API 를 사용할 경우 404 오류 시 로그아웃 시킴
      axios({
        method: 'GET',
        url: `${this.$apiUrl}/users/${uuid}`,
        headers: { Authorization: `Bearer ${params.idToken}`}
      })
        .then(res => {
          const user = res.data
          if (user.userStatus === 'ACTIVATE') {
            // 최초 회원정보 저장
            this.$store.commit('setUserUri', user._links.self.href)
            this.$store.commit('setUserType', user.userType)
            this.$store.commit('setUser', user)

            // 최초 구독정보 저장
            this.getCurUserAllSubscribes()
          } else {
            this.$router.push('/logout', () => {})
          }
        })
        .catch(err => {
          this.$log.debug(this.$options.name, ' loginCheck() err: ', err)
          // token 을 획득한 비회원이 고객센터 진입 시 인증 정보 삭제
          this.$authentication.clear()
        })
        .finally(() => {
          this.getMainBanners()
          this.isLoadComplete = true
        })
    },
    onScroll(e) {
      this.windowTop = e.target.documentElement.scrollTop || window.pageYOffset
    },
    getMainBanners() {
      const requestParams = {
        deviceType: 'WEB',
        positionType: [
          'WEB_BANNER_QUICK',
          'NOTIFICATION_BOX'
        ]
      }
      this.getBanners(requestParams)
    },
    getCurUserAllSubscribes() {
      Promise.all([
        this.$hiClass.clazzSubscribeViews.search({
          userId: this.$store.state.user.currentId,
          size: 500,
          // 정렬 우선 순위: 최신 구독순 (20200408 정책 변경)
          sort: 'insertedTimestamp,desc'
        }),
        this.$hiClass.schoolSubscribeViews.search({
          userId: this.$store.state.user.currentId,
          size: 500,
          sort: 'insertedTimestamp,desc'
        }),
        /*this.$hiClass.informations.search({
          size: 500,
          _infoStatus: 'ACTIVATE'
        })*/
      ])
        .then(r => {
          // this.$comn.log(this, "getCurUserAllSubscribes() r => ", r);
          const clazzSubscribeViews = r[0].data._embedded.clazzSubscribeViews
          const schoolSubscribeViews = r[1].data._embedded.schoolSubscribeViews

          this.$store.commit('setClazzSubscribeViews', clazzSubscribeViews)
          this.$store.commit('setSchoolSubscribeViews', schoolSubscribeViews)
        })
        .catch(e => {
          this.$comn.log(this, 'getCurUserAllSubscribes() e => ', e)
        })
        .finally(() => {
          this.isLoadCount++
        })
    }
  }
}
</script>

<style scoped></style>
<style>
#nprogress .bar {
  background: #3867c6 !important;
}

#nprogress .peg {
  box-shadow: 0 0 10px #3867c6, 0 0 5px #3867c6 !important;
}

#nprogress .spinner-icon {
  border-top-color: #3867c6 !important;
  border-left-color: #3867c6 !important;
}
</style>
