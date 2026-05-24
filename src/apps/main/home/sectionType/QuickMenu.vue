<template>
  <div class="component-main-shortcut">
    <div class="main-shortcut__date">
      <span class="today">오늘</span>
      <strong class="date">{{ todayFormat }}</strong>
    </div>
    <div class="main-shortcut__list">

      <!-- 임시학생인 경우 새 클래스 만들기 버튼 숨김 처리 -->
      <template v-if="isCurUserTempStudent"></template>
      <div
        v-else-if="isCurUserTypeTeacher"
        class="main-shortcut__item"
      >
        <a
          href="javascript:void(0);"
          class="btn-create"
          @click="executeCommand('createClass')"
        >
          <i :class="[getContentsIconByCode('SCHOOL')]"></i>
          <span>새 클래스 만들기</span>
        </a>
      </div>
      <div
        v-else
        class="main-shortcut__item"
      >
        <a
          href="javascript:void(0);"
          class="btn-create"
          @click="executeCommand('openSearchLayer')"
        >
          <i :class="[getContentsIconByCode('SEARCH')]"></i>
          <span>클래스/학교 찾기</span>
        </a>
      </div>

      <!-- 임시학생인 경우 초대코드로 가입 버튼 숨김 처리 -->
      <template v-if="isCurUserTempStudent"></template>
      <div
        v-else
        class="main-shortcut__item"
      >
        <a
          href="javascript:void(0);"
          class="btn-join"
          @click="executeCommand('openJoinInviteCode')"
        >
          <i :class="[getContentsIconByCode('INVITE_CODE')]"></i>
          <span>초대코드로 가입</span>
        </a>
      </div>

      <div
        v-for="(content, index) of contents"
        :key="`${content.contents}-${index}`"
        class="main-shortcut__item"
      >
        <a href="javascript:void(0);" @click="onClickQuickMenu(content)">
          <i v-if="getContentsIconByCode(content.titleSub)" :class="[getContentsIconByCode(content.titleSub)]"></i>
          <i v-else :style="getContentsIconStyle(content)"></i>
          <span>{{ content.title }}</span>
        </a>
      </div>

    </div>
  </div>
</template>

<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import {eventBus} from "@/main";
import {openPopup} from "@/plugins/utils";
import CONSTANTS from "@/plugins/constants";

export default {
  name: "section-type-quick-menu",
  data() {
    return {
      params: {
        sectionType: 'QUICK_MENU'
      },
      contentsCodes: [
        {
          code: 'SCHOOL',
          icon: 'icon-school',
          name: '새클래스만들기'
        },
        {
          code: 'SEARCH',
          icon: 'icon-search',
          name: '클래스/학교찾기'
        },
        {
          code: 'INVITE_CODE',
          icon: 'icon-invitecode',
          name: '초대코드로가입'
        },
        {
          code: 'NEWS',
          icon: 'icon-news',
          name: '최근받은소식'
        },
        {
          code: 'EVENT',
          icon: 'icon-event',
          name: '진행중인이벤트'
        },
        {
          code: 'STUDENT_HEALTH',
          icon: 'icon-studenthealth',
          name: '학생건강자가진단'
        },
        {
          code: 'NOTICE',
          icon: 'icon-notice',
          name: '공지사항'
        },
        {
          code: 'FAQ',
          icon: 'icon-faq',
          name: '자주하는문의'
        },
        {
          code: 'QNA',
          icon: 'icon-qna',
          name: '1:1 문의하기'
        },
        {
          code: 'MY_BOARD_ALARM_PLUS',
          icon: 'icon-survey',
          name: '학교알리미 설문'
        },
        {
          code: 'HITALK',
          icon: 'icon-hitalk',
          name: '하이톡'
        },
      ]
    }
  },
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
      isCurUserTypeTeacher: 'isCurUserTypeTeacher',
      isCurUserTempStudent: 'isCurUserTempStudent',
    }),
    ...mapGetters('storeHome', {
      getSectionsBySectionType: 'getSectionsBySectionType',
      myNewsSectionId: 'myNewsSectionId',
    }),
    getSections() {
      return this.getSectionsBySectionType(this.params)
    },
    section() {
      return this.getSections.length > 0 ? this.getSections[0] : {}
    },
    contents() {
      // 홈 화면관리 > '컨텐츠 연결' 세팅
      return this.section.contents || []

      // 홈 화면관리 > '링크 연결' 세팅
      // return this.section.links || []
    },
    todayFormat() {
      return this.$moment(this.$store.state.currentTimestamp).format('YYYY[년] M[월] D[일] (ddd)')
    }
  },
  created() {
  },
  mounted() {
  },
  methods: {
    ...mapMutations('storeHome', {
      setSectionMainMoreSectionId: 'setSectionMainMoreSectionId',
    }),
    ...mapActions({
      openHitalkPopup: 'openHitalkPopup',
      initChatUncheckedMessage: 'initChatUncheckedMessage',
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    ...mapActions('storeHome', {
      callHomeContentsLink: 'callHomeContentsLink',
      toggleJoinWithInviteCode: 'toggleJoinWithInviteCode',
    }),
    goRoute(path) {
      this.$router.push(path, () => {})
    },
    openSearchLayer() {
      const searchType = 'class_school'
      const path = '/main/search'
      const query = { searchType }
      this.$router.push({ path, query }, () => {})
    },
    executeCommand(command) {
      switch (command) {
        case 'openJoinInviteCode':
          this.triggerAnalyticsLogEvent({ code: 'analytics.home.quickMenu.invitecode.click' })
          this.toggleJoinWithInviteCode({ isOpen: true })
          break
        case 'openSearchLayer':
          this.triggerAnalyticsLogEvent({ code: 'analytics.home.quickMenu.search.click' })
          this.openSearchLayer()
          break
        case 'createClass':
          this.triggerAnalyticsLogEvent({ code: 'analytics.home.quickMenu.create.click' })
          this.goRoute('/main/create')
      }
    },
    callSectionMainMore() {
      this.triggerAnalyticsLogEvent({ code: 'analytics.myboard.click.news' })

      this.$log.debug(`this.myNewsSectionId => `, this.myNewsSectionId)
      this.setSectionMainMoreSectionId({ sectionId: this.myNewsSectionId })
      this.$router.push('/main/myboard/news', () => {})
    },
    getContentsIconByCode(code) {
      const findItem = this.contentsCodes.find(content => content.code === code)
      return findItem ? findItem.icon : ''
    },
    getContentsIconStyle(content) {
      if (content.file && content.file.fileOriginalPath) {
        const imagePath = content.file.fileOriginalPath
        return {
          background: `url(${imagePath}) no-repeat`,
          'background-size': `24px auto`
        }
      }
    },
    onClickQuickMenu(content) {
      this.quickMenuLogEvent(content)

      const menuCode = content.titleSub
      switch (menuCode) {
        // 최근 받은 소식
        case 'NEWS': {
          this.callSectionMainMore()
          break
        }
        // 진행중인 이벤트
        case 'EVENT': {
          this.goRoute('/main/education/event')
          break
        }
        // 학생건강자가진단
        case 'STUDENT_HEALTH': {
          window.open(this.$store.state.HealthConditionSelfCheck.url, 'STUDENT_HEALTH')
          break
        }
        // 공지사항
        case 'NOTICE': {
          this.goRoute('/help/notice')
          break
        }
        // 자주하는 문의
        case 'FAQ': {
          this.goRoute('/help/faq')
          break
        }
        // 1:1 문의하기
        case 'QNA': {
          this.goRoute('/help/question')
          break
        }
        // 학교알리미 설문
        case 'MY_BOARD_ALARM_PLUS': {
          this.goRoute('/main/myboard/alarmplus')
          break
        }
        // 하이톡
        case 'HITALK': {
          //this.openHitalkPopup(null) openPopup 으로 교체
          this.initChatUncheckedMessage()
          openPopup(CONSTANTS.POPUP.HI_TALK)
          break
        }
        default: {
          this.callHomeContentsLink(content)
        }
      }
    },
    quickMenuLogEvent(content) {
      const contentTitle = content.title
      const logPayload = {
        code: 'analytics.home.quickMenu.item.click',
        value1: contentTitle
      }
      this.triggerAnalyticsLogEvent(logPayload)
    },
  }
}
</script>

<style lang="scss" scoped>
.menu-hidden {
  display: none;
}
</style>