<template>
  <div
    class="column-lnb"
    :class="{ 'is-fixed': getIsFixed() }"
  >
    <div class="column__inner">
      <div class="hi-lnb">
        <h2 class="heading-school">{{ $t('main.schools.lnb.heading') }}</h2>
        <ul class="lnb__list">
          <li
            v-for="(item, i) of lnbListSchools"
            :key="item.path"
            class="lnb__item"
            :class="{
              'is-active': i === schoolsCurrent
            }"
            @click="lnbListTabOnSchools(i)"
          >
            <span>{{ item.text }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
// import Lbanner from './MainBodySchoolsLnbBanner.vue'
import { eventBus } from "@/main";
import {mapActions, mapGetters} from "vuex";

export default {
  name: 'main-body-schools-lnb',
  props: {
    schoolUuid: String,
    schools: Object
  },
  data() {
    return {
      isLoading: false,
      currentTab: '',
      lnbListSchools: [],
      schoolsCurrent: 0 // 초기에는 활성화 될 필요없음
    }
  },
  components: {
    // Lbanner
  },
  computed: {
    ...mapGetters({
      getIsFixed: "getIsFixed",
    }),
  },
  watch: {
    $route(from, to) {
      const prev = this.$comn.split(from.path, '/')
      const next = this.$comn.split(to.path, '/')
      if (prev !== next) {
        this.init()
      }
    },
  },
  created() {
    this.init()

    eventBus.$on('schools-init-lnb-menu', () => {
      this.init()
    })
  },
  beforeDestroy() {
    eventBus.$off('schools-init-lnb-menu')
  },
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    init() {
      this.lnbListSchools = []

      this.lnbListSchools.push({
        text: '전체',
        path: '',
        form: 'ALL'
      })

      this.lnbListSchools.push({
        text: '가정통신문',
        path: '/alarm',
        form: 'ALARM'
      })

      this.lnbListSchools.push({
        text: '급식',
        path: '/meal',
        form: 'MEAL'
      })

      this.lnbListSchools.push({
        text: '학교공지',
        path: '/notice',
        form: 'NOTICE'
      })

      if (this.schools.alarmEduOfficeUsed) {
        this.lnbListSchools.push({
          text: '가정통신문(교육청)',
          path: '/alarm_edu_office',
          form: 'ALARM_EDU_OFFICE'
        })
      }

      this.lnbTabSetting()
    },
    lnbListTabOnSchools(i) {
      if (!this.isLoading) {
        this.isLoading = true

        this.$emit('initCurSchoolSearchQuery')

        const nextPathObj = this.lnbListSchools[i]
        const nextForm = nextPathObj.form

        const eventCode = `analytics.school.click.lnb.${nextForm.toLowerCase()}`
        this.triggerAnalyticsLogEvent({ code: eventCode })

        if (i === this.schoolsCurrent) {
          // 현재 게시판 새로 고침 (curSchoolsPosts, Rnb)
          eventBus.$emit('refresh-cur-form')
        } else {
          this.$router.push('/main/schools/' + this.$route.params.id + nextPathObj.path)
        }

        setTimeout(() => this.isLoading = false, 100)
      }
    },
    lnbTabSetting() {
      // 왼쪽 탭란 현재 url path에 따라 고정
      let path = '/' + this.$comn.split(this.$route.path, '/')

      let boardIdx = this.lnbListSchools
        .map(function(d) {
          return d['path']
        })
        .indexOf(path)

      this.schoolsCurrent = boardIdx < 0 ? 0 : boardIdx
    },
  }
}
</script>

<style lang="scss" scoped>

</style>
