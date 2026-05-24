<template>
  <fragment>

    <div class="school-class-cont-top">
      <div class="title-wrap">
        <div class="top">
          <div class="title">{{ title }}</div>
          <span class="more" v-if="isManager"><a href="https://hiclass.notion.site/c294ce0e03224dc58c4716bca2c610b6" target="_blank">학교 양식 신청서 가이드</a></span>
        </div>
        <p class="text">{{ titleDescription }}</p>
        <p
          v-if="isManager"
          class="text-notice"
        >
          {{ titleDescription2_1 }} &gt;
          <button class="link" @click="goRouteClassManagement">{{ titleDescription2_2 }}</button>
        </p>
      </div>
      <div
        v-if="isManager"
        class="btn-wrap"
      >
        <button
          class="btn-bg-w2 btn-register"
          @click="onClickCreateWorkSheet(classId)"
        >
          우리학교 양식 등록하기
        </button>
        <button
          class="btn-bg-c btn-import"
          :class="{
            ani: option.isShowImportTooltip
          }"
          @click="onClickLoadWorkSheet(classId)"
        >
          <span>신청서 불러오기</span>
        </button>
        <div
          v-if="option.isShowImportTooltip"
          class="common-tooltip"
          :class="{
            ani: option.isShowImportTooltip
          }"
        >
          <span>학교 양식을 불러와 사용해볼까요?</span>
          <div
            role="button"
            class="close"
            @click="closeImportTooltip"
          ></div>
        </div>
      </div>
    </div>
    <!-- tab -->
    <div class="hi-tabs">
      <div class="hi-tab tab-xl">
        <button
          v-for="tab of tabs"
          :key="tab.tabName"
          :class="{
            'is-active' : option.curTabName === tab.tabName
          }"
          @click="setCurTabNameAndChangeTab(tab.tabName)"
        >
          {{ tab.title }}
        </button>
      </div>
    </div>

    <!--  content  -->
    <div class="form-managemnet-cont-wrap">

      <components
        :is="componentName"
        :isManager="isManager"
        :clazz="clazzes"
        :applyTypes="applyTypes"
        @on-click-create-form="onClickCreateForm"
      />

    </div>
  </fragment>

</template>

<script>
import MainBodyClazzesBodyFormApplyList from './MainBodyClazzesBodyFormApplyList'
import MainBodyClazzesBodyFormApplyStudentList from './MainBodyClazzesBodyFormApplyStudentList'
import {mapActions, mapState} from "vuex";
import {eventBus} from "@/main";
import {mapFields} from "vuex-map-fields";
import MainBodyClazzesBodyFormSheetList from "@/apps/main/clazzes/form/MainBodyClazzesBodyFormSheetList";
import MainBodyClazzesBodyFormSheetListMember from "@/apps/main/clazzes/form/MainBodyClazzesBodyFormSheetListMember";

export default {
  name: "main-body-clazzes-body-form",
  components: {
    MainBodyClazzesBodyFormSheetListMember,
    MainBodyClazzesBodyFormApplyList,
    MainBodyClazzesBodyFormApplyStudentList,
    MainBodyClazzesBodyFormSheetList,
  },
  props: {
    clazzes: Object,
    isManager: {
      type: Boolean
    },
    isClassActivated: {
      type: Boolean,
      default() {
        return false
      }
    }
  },
  data() {
    return {
      option: {
        curTabName: 'sheetListMember', // 사용중인 양식: sheetListMember | 제출 내역 : applyList | 학생별 현황 : applyStudentList | 신청서 관리: sheetList
        tabs: [
          {
            tabName: 'sheetListMember',
            title: '사용중인 양식',
            isShowManager: false
          },
          {
            tabName: 'applyList',
            title: '제출 내역',
            isShowManager: false
          },
          {
            tabName: 'applyStudentList',
            title: '학생별 현황',
            isShowManager: true
          },
          {
            tabName: 'sheetList',
            title: '신청서 양식',
            isShowManager: true
          },
        ],
        isShowImportTooltip: false
      },
      userSign: this.$store.state.user.userSignImagePath,
      applyTypes: []
    }
  },
  computed: {
    ...mapFields([
      'notSupportedBrowser'
    ]),
    tabs() {
      const tabs = []
      const memberTabs = [
        {
          tabName: 'sheetListMember',
          title: '사용중인 양식'
        },
        {
          tabName: 'applyList',
          title: '제출 내역',
        },
      ]
      const managerTabs = [
        {
          tabName: 'applyStudentList',
          title: '학생별 현황',
          isShowManager: true
        },
        {
          tabName: 'sheetList',
          title: '신청서 관리',
          isShowManager: true
        },
      ]

      tabs.push(...memberTabs)

      if (this.isManager)
        tabs.push(...managerTabs)

      return tabs
    },
    componentName() {
      let componentNamePrefix = 'MainBodyClazzesBodyForm'
      let componentName = componentNamePrefix + 'SheetListMember'

      switch (this.option.curTabName) {
        case 'sheetListMember':
        case 'applyList':
        case 'applyStudentList':
        case 'sheetList':
          componentName = componentNamePrefix + this.option.curTabName.replace(/\b[a-z]/, letter => letter.toUpperCase())
          break
      }
      return componentName
    },
    title() {
      return '학교 양식 신청서'
    },
    titleDescription() {
      return this.isManager
          ? '결석, 체험 학습, 투약 등에 필요한 양식을 등록하여 온라인으로 제출하고, 수합/결재/인쇄 할 수 있습니다.'
          : '신청서 작성 및 제출현황을 확인할 수 있는 메뉴입니다.'
    },
    titleDescription2_1() {
      return `신청서 기능을 사용하지 않으시려면 설정에서 off하세요.`
    },
    titleDescription2_2() {
      return `'수업관리 설정' 바로가기`
    },
    postType() { return 'APPLY' },
    parent() { return this.clazzes },
    itemUsed() { return this.parent[`${this.postType.toLowerCase()}Used`] },
    classId() {
      return this.clazzes && this.clazzes.currentId
        ? this.clazzes.currentId
        : ''
    }
  },
  watch: {
    $route(to) {
      this.changeTab(to)
    }
  },
  created() {
    // 게시판 사용 금지 설정인 경우 main으로 이동 처리
    if (!this.itemUsed) {
      this.$toasted.show('사용 중지된 게시판이거나 읽기 권한이 없습니다.')
      this.$router.push('/', () => {})
    }

    this.initTab(this.$route)

    eventBus.$on('clazzes-form-open-modal', payload => {
      this.openModal(payload)
    })
    if (this.isManager) {
      eventBus.$emit('set-is-unidentified-clazz-apply-exist', false)
    }
  },
  mounted() {
    this.getApplyTypes()

    // 저장된 공휴일을 초기화 (prevYear, curYear, nextYear)
    this.initCalenderHolidays({ year: this.$moment().year() })

    this.checkImportTooltip()

    window.addEventListener('message', this.handlePopupTask)
  },
  destroyed() {
    window.removeEventListener('message', this.handlePopupTask)

    eventBus.$off('clazzes-form-open-modal')
  },
  methods: {
    ...mapActions({
      reloadUser: "reloadUser",
      initCalenderHolidays: 'initCalenderHolidays'
    }),
    initTab(routeObj) {
      if (routeObj.params.boardId) {
        this.setCurTabNameAndChangeTab(routeObj.params.boardId)
      } else {
        const routeMethod = 'replace'
        const routeTabName = this.isManager ? 'applyList' : 'sheetListMember'
        this.setCurTabNameAndChangeTab(routeTabName, routeMethod)
      }
    },
    changeTab(routeObj) {
      const tabName = routeObj.params.boardId
      if (tabName)
        this.option.curTabName = tabName
    },
    setCurTabNameAndChangeTab(tabName, routeMethod) {
      // 탭 설정시 해당 탭으로 이동
      const routeObj = {
        path: `/main/clazzes/${this.$route.params.id}/${this.$route.params.board}/${tabName}`,
        query: this.$route.query
      }
      this.$router[routeMethod || 'push'](routeObj, () => {})
      this.option.curTabName = tabName
    },
    onClickCreateForm(payload/*formName, mode*/) {
      this.openModal(payload)
    },
    onClickCreateWorkSheet(classId) {
      this.$comn.isIE()
        ? this.notSupportedBrowser.isOpen = true
        : this.$router.push(`/worksheetCreate/${classId}`, () => {})
    },
    onClickLoadWorkSheet(classId) {
      this.$comn.isIE()
        ? this.notSupportedBrowser.isOpen = true
        : this.$router.push(`/worksheetCreate/${classId}?isOpenShareForms=1`, () => {})
    },
    openModal(payload) {
      const clazzApply = {
        sheetId: payload.sheetId
      }
      const clazzApplicationForm = {
        isOpen: true,
        isManager: this.isManager,
        clazz: this.clazzes,
        formName: payload.formName || null,
        mode: payload.mode || null,
        clazzApply
      }
      if (payload.userId) clazzApplicationForm['userId'] = payload.userId

      this.$store.commit('setClazzApplicationForm', clazzApplicationForm)
    },

    handlePopupTask(e) {
      if (e.data !== undefined && e.data !== null && e.data !== '' && typeof e.data === 'string'
        && e.data.includes('changeUserSign|')
      ) {
        this.userSign = this.$comn.split(e.data, '|') || null
      }
    },

    goRouteClassManagement() {
      const classId = this.clazzes.currentId
      const to = 'class'
      this.$router.push(`/main/clazzes/${classId}/${to}`, () => {})
    },

    checkImportTooltip() {
      const data = { currentId: `class-apply-import-tooltip` }

      // false 인 경우 툴팁 노출
      if (!this.$hiClass.replayData.isReplayDataANYMORE(data))
        this.option.isShowImportTooltip = true
    },

    closeImportTooltip() {
      const data = { currentId: `class-apply-import-tooltip` }
      this.$hiClass.replayData.setReplayDataANYMORE(data)

      this.option.isShowImportTooltip = false
    },

    async getApplyTypes() {
      try {
        const res = await this.$hiClass.sheetInfos.readApplyTypes()
        this.applyTypes = Object.entries(res.data.applyTypes).map(([key, value]) => ({ code: key, name: value }))
      } catch (e) {
        this.applyTypes = this.$constants.CLASS_APPLY.applyType
        this.$log.warn(e)
      }
    }
  }
}
</script>

<style scoped>

</style>