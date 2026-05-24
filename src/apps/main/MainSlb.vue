<template>
  <!-- right-menu-cont-wrap -->
  <div
    v-if="isSideBar"
    id="mainSlb"
    class="right-menu-cont-wrap"
    :class="{
      on: isShowSlb,
      'is-alarmplus': isAlarmplus
    }"
  >
    <!-- :style="{ top: slbStyle.top, height: slbStyle.height }" -->
    <div class="right-menu-cont-inner">
      <div
        class="open-btn-wrap"
        @click="toggleSidebar"
      >
        <button type="button">
          <span></span>
        </button>
      </div>
      <div class="menu-cont-wrap">
        <div class="top-menu">
          <ul>
            <li
              v-for="menu of topMenus"
              :key="menu.id"
            >
              <template v-if="menu.openType === 'tab'">
                <a
                  :ref="menu.id"
                  :href="menu.url"
                  target="_blank"
                >
                  <span>{{ menu.name }}</span>
                </a>
              </template>
              <template v-else-if="menu.openType === 'playSound'">
                <a
                  href="javascript:void(0)"
                  @click="setAudioType((curAudioTypeIdx = 0), notiSounds[0].mp3)"
                >
                  <span>{{ menu.name }}</span>
                </a>
              </template>
              <template v-else-if="menu.openType === 'popup'">
                <a
                  :ref="menu.id"
                  href="javascript:void(0)"
                  @click="openNewWindow(menu.url, menu.name)"
                >
                  <span>{{ menu.name }}</span>
                </a>
              </template>
              <template v-else-if="menu.openType === 'layer'">
                <a
                  :ref="menu.id"
                  href="javascript:void(0)"
                  @click="openLayer(menu.url, menu.name, menu.id)"
                >
                  <span>{{ menu.name }}</span>
                </a>
              </template>
            </li>
          </ul>
        </div>
        <div class="btm-menu">
          <ul>
            <li
              v-for="menu of bottomMenus"
              :key="menu.id"
            >
              <template v-if="menu.openType === 'tab'">
                <a
                  :ref="menu.id"
                  :href="menu.url"
                  target="_blank"
                >
                  <span>{{ menu.name}}</span>
                </a>
              </template>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Attension -->
    <transition name="fade">
      <Attention
        v-if="isShowAttension"
        :key="attensionKey"
        :isShowSlb="isShowSlb"
        @close-attension="isShowAttension = false"
      ></Attention>
    </transition>
  </div>
  <!-- right-menu-cont-wrap -->
</template>

<script>
import Attention from '@/components/Attention/Attention.vue'

export default {
  name: 'mainSlb',
  components: {
    Attention
  },
  props: {
    isAlarmplus: {
      type: Boolean,
      default: false
    },
    variant: {
      type: String,
      default: 'default'
    },
    hasTopBanner: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isShowSlb: !+localStorage.getItem('isOpenSideBar'),
      isShowAttension: false,
      attensionKey: 0,
      curAudioTypeIdx: 0,
      audio: null,
      notiSounds: [
        {
          name: '주의집중',
          mp3:
            process.env.URL_PROTOCOL +
            process.env.CDN_URI +
            '/static/sounds/slb/sound3.mp3',
          thumb:
            process.env.URL_PROTOCOL +
            process.env.CDN_URI +
            '/static/images/slb/sound3.png',
        }
      ],
      topMenus: [
        {
          id: 'iscreamBoard',
          name: '판서',
          url: 'https://www.i-scream.co.kr/multiview/main/popup/Board.do',
          openType: 'popup'
        },
        // {
        //   id: 'classAnnouncement',
        //   name: '발표도우미',
        //   url: 'https://www.i-scream.co.kr/classtool/main/classAnnouncement.do',
        //   openType: 'popup'
        // },
        {
          id: 'classTimer',
          name: '타이머',
          url: 'https://toolkit.i-scream.co.kr/apps/timer/',
          openType: 'popup'
        },
        {
          id: 'attension',
          name: '주의 집중',
          url: '/module/attension/index.html',
          openType: 'layer'
        },
        
      ],
      bottomMenus: [
        {
          id: 'quizUserHome',
          name: '띵커벨',
          url: 'https://www.tkbell.co.kr/user/main.do',
          openType: 'tab'
        },
        {
          id: 'i-scream',
          name: '아이스크림',
          url: 'https://www.i-scream.co.kr',
          openType: 'tab'
        },
        {
          id: 'teacher',
          name: '연수원',
          url: 'https://teacher.i-scream.co.kr',
          openType: 'tab'
        },
        {
          id: 'ssemtube',
          name: '쌤튜브',
          url: 'https://www.ssemtube.com',
          openType: 'tab'
        },
        {
          id: 'sblog',
          name: '쌤블로그',
          url: 'https://sblog.i-scream.co.kr/user/Main.do',
          openType: 'tab'
        },
        {
          id: 'i-screammall',
          name: '아이스크림몰',
          url: 'https://i-screammall.co.kr',
          openType: 'tab'
        },
        {
          id: 'text-i-scream',
          name: '아이스크림교과서',
          url: 'https://text.i-scream.co.kr/user/introduce/introduceMain.do',
          openType: 'tab'
        },
        {
          id: 'ctool',
          name: '클래스툴',
          url: 'https://ctool.co.kr',
          openType: 'tab'
        },
        {
          id: 'i-scream-edubank',
          name: '아이스크림 에듀뱅크',
          url: 'https://edubank.i-scream.co.kr',
          openType: 'tab'
        },
        {
          id: 'aidt',
          name: 'AIDT',
          url: 'https://aidt.i-scream.co.kr',
          openType: 'tab'
        },

        // {
        //   id: 'hiStore',
        //   name: '하이스토어',
        //   url: 'https://hi-store.co.kr',
        //   openType: 'tab'
        // },

        // {
        //   id: "cookie",
        //   name: "쿠키",
        //   url: "#",
        //   openType: "tab"
        // }
      ],
      userType: localStorage.userType || '',
      windowWidth: window.innerWidth
    }
  },
  computed: {
    isSideBar() {
      return this.userType === 'TEACHER'
    },
    // slbStyle() {
    //   // 창 너비에 따라 헤더/배너 높이 반영
    //   const isSmall = this.windowWidth <= 768;
    //   // 768px 이하: 탑배너 숨김, 고정 top 65px
    //   // 768px 초과: variant에 따라 기본 top 적용
    //   let top = isSmall ? 65 : (this.variant === 'alarmplus' && 66);
    //   // 탑배너는 768px 초과일 때만 추가 높이 반영
    //   if (!isSmall && this.hasTopBanner) top += 115;
    //   return {
    //     top: top + 'px',
    //     height: `calc(100% - ${top}px)`
    //   }
    // }
  },
  methods: {
    toggleSidebar() {
      if (this.isShowSlb) {
        localStorage.setItem('isOpenSideBar', '1')
      } else {
        localStorage.setItem('isOpenSideBar', '0')
      }

      this.isShowSlb = !this.isShowSlb
    },
    setAudioType(idx, mp3) {
      this.audio.pause()
      this.audio.currentTime = 0

      if (mp3) {
        this.audio = new Audio(mp3)
        this.audio.play()
      }
    },
    openNewWindow(url, winName) {
      this.$comn.winFullPopup(
        url,
        winName,
        screen.availWidth,
        screen.availHeight - this.$store.state.TASKBAR_HEIGHT,
        'yes'
      )
    },
    openLayer(url, winName, layerId) {
      if (layerId === 'attension') {
        this.isShowAttension = true
        this.attensionKey++
      }
    },
    handleResize() {
      this.windowWidth = window.innerWidth
    }
  },
  created() {},
  mounted() {
    this.audio = new Audio()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },
}
</script>

<style lang="scss" scoped>
.fade-enter-active {
  transition: opacity 0.3s;
}
.fade-leave-active {
  transition: opacity 0.1s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}


</style>
