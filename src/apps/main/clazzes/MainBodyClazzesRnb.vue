<!--
@File(Method): MainBodyClazzesRnb.vue
@Author: -
@Date Created: -
@Description: 클래스 > 우측영역
@Modified: 2025-02-18 - #71944 초대하기 > 다국어 설치 안내문 배너
-->
<template>
  <!-- 2022-08-01 사이드 영역 -->
  <div
    :key="isCurClassOwnerOrManager"
    class="column-aside"
    :class="{
      'is-fixed': getIsFixed(),
      'is-fixed-nofilter': getIsFixed()
    }"
  > <!-- .school-class-cont-right-wrap -->
    <div class="column__inner"> <!-- .school-class-cont-right-inner -->

      <main-body-clazzes-rnb-board-write
        v-if="isShowBoardWrite"
      />

      <!-- 이전과 동일함 -->
      <!-- calendar -->
      <main-body-clazzes-rnb-calendar
        :clazzes="curClassItem"
        :monthlyPosts="monthlyPosts"
        :selectedDate="selectedDate"
        :parentUri="parentUri"
        :dayPosts="dayPosts"
        @setSelectedDate="setSelectedDate"
        @onClickDate="onClickDate"
        @getDayPosts="getDayPosts"
      />
      <!-- // calendar -->

      <!-- calendar info -->
      <main-body-clazzes-rnb-calendar-info
        :user="user"
        :clazzes="curClassItem"
        :isManager="isCurClassOwnerOrManager"
        :isClassActivated="isCurClassActivated"
        :selectedDate="selectedDate"
        :dayPosts="dayPosts"
        :monthlyPosts="monthlyPosts"
        @editCalendarClass="editCalendarClass"
        @initCalendarClass="initCalendarClass"
      />
      <!-- // calendar info -->

      <div class="right-btm-btn-wrap">
        <button
          v-if="isCurClassOwnerOrManager && isCurClassActivated"
          class="btn-bg-w2 icon add-icon add-schedule-btn"
          @click="
            triggerAnalyticsLogEvent({ code: 'analytics.class.click.button.calendarClass.post' });
            writeSchedule();
          "
        >
          <span>우리반 일정 등록하기</span>
        </button>
        
        <hc-all-note-down
          buttonClass="btn-bg-w2"
          :classId="curClassId"
          v-if="$route.params.board === 'note' && isCurClassOwnerOrManager"
        >{{ postTypeName }} 전체 다운로드</hc-all-note-down>

        <div v-if="user.userType === 'TEACHER'" class="tooltip-ani tooltip-top rnb-tooltip-hide">
          <span>외 총 9개 언어 버전 제공</span>
        </div>        
      </div>

      <!-- RNB 다운로드 영역 -->
      <!-- <div
        v-if="$route.params.board === 'member' || $route.params.board === 'invite'"
        class="right-btm-btn-wrap mt-10"
      > -->
        <!-- 
        #71944 초대하기 > 다국어 설치 안내문 배너 : 기존 코드 삭제
        <button
          class="btn-bg-w2 icon download"
          @click="
          $comn.download(
            $store.state.classTermsPrivacyDocIntl,
            '(학교+학급 이용) 하이클래스 이용 정보 동의서+14세 이용 동의+설명서_2025.01.zip'
          )
        "
        >
          <span style="color: rgb(255,109,109)">다국어&nbsp;</span>
          <span>설치 안내문 · 개인정보동의</span>
        </button> -->
        <!-- <div class="tooltip-ani tooltip-top rnb-tooltip-hide">
          <span>4개 언어 버전 제공</span>
        </div> -->
      <!-- </div> -->
      <!-- // 이전과 동일함 -->
      <!-- RNB banner -->
      <banner-item
        :key="$store.state.bannerTimestamp"
        positionType="WEB_BANNER_RNB"
        :banners="$store.state.banner.WEB_BANNER_RNB"
      />
      <!-- RNB banner -->
    </div>
  </div>
  <!-- //2022-08-01 사이드 영역 -->
</template>

<script>
import {eventBus} from "@/main";
import {mapActions, mapGetters, mapState} from "vuex";

import MainBodyClazzesRnbCalendar from '@/apps/main/clazzes/MainBodyClazzesRnbCalendar.vue'
import MainBodyClazzesRnbCalendarInfo from '@/apps/main/clazzes/MainBodyClazzesRnbCalendarInfo.vue'
import BannerItem from '@/components/Banner/BannerItem.vue'
import HcAllNoteDown from '@/components/Form/HcAllNoteDown.vue'
import MainBodyClazzesRnbBoardWrite from "@/apps/main/clazzes/MainBodyClazzesRnbBoardWrite";

export default {
  name: 'main-body-clazzes-rnb',
  props: {
    parentUri: Array
  },
  data() {
    return {
      monthlyPosts: [],
      dayPosts: [],
      selectedDate: '',
      clickedDate: '',
      initComplete: false,
      curItem: {}
    }
  },
  components: {
    MainBodyClazzesRnbBoardWrite,
    MainBodyClazzesRnbCalendar,
    MainBodyClazzesRnbCalendarInfo,
    BannerItem,
    HcAllNoteDown
  },
  computed: {
    ...mapState({
      user: 'user',
      curClassItem: 'curClassItem',
    }),
    ...mapGetters({
      isCurClassActivated: 'isCurClassActivated',
      isCurClassOwnerOrManager: 'isCurClassOwnerOrManager',
      curClassId: 'curClassId',
      getPostTypeNameByCode: "getPostTypeNameByCode",
      getIsFixed: "getIsFixed",
    }),
    postTypeName() {
      return this.getPostTypeNameByCode({
        code: 'NOTE',
        type: this.curClassItem.school.schoolType
      })
    },
    isShowBoardWrite() {
      const boards = ['note', 'album', 'board', 'homework']
      return boards.includes(this.$route.params.board)
    },
  },
  created() {
    eventBus.$on('clazzes-rnb-init-calendar-class', () => this.initCalendarClass())
    eventBus.$on('clazzes-rnb-clear-cur-item', () => this.clearCurItem())
  },
  beforeDestroy() {
    eventBus.$off('clazzes-rnb-init-calendar-class')
    eventBus.$off('clazzes-rnb-clear-cur-item')
  },
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    showSchedule() {
      const clazzCalendarSchedule = {
        isOpen: true,
        clazzes: this.curClassItem,
        curItem: this.curItem,
        clickedDate: this.clickedDate
      }
      this.$store.commit('setClazzCalendarSchedule', clazzCalendarSchedule)
    },
    setSelectedDate(dateJson) {
      this.selectedDate = `${dateJson.year},${dateJson.month + 1},${
        dateJson.date
      }`
      this.getDayPosts(dateJson)
    },
    onClickDate(dateJson) {
      this.clickedDate = `${dateJson.year},${dateJson.month + 1},${
        dateJson.date
      }`
    },
    getDayPosts(dateJson) {
      let param = {}
      let url = '/posts/!q'
      let year = dateJson.year
      let month = dateJson.month
      let date = dateJson.date
      const fromTimestamp = new Date(year, month, date).getTime()
      const toTimestamp = fromTimestamp + 86399999

      if (this.curClassItem.currentId) {
        const clazzUrl = `${process.env.VUE_APP_BASE_API_URI}/clazzes/${this.curClassItem.currentId}`
        const schoolUri = `${process.env.VUE_APP_BASE_API_URI}/schools/${this.curClassItem.school.currentId}`
        const parentUriArr = [schoolUri, clazzUrl]
        const postTypeArr = ['CALENDAR_SCHOOL', 'CALENDAR_CLASS']

        param['page'] = this.curPage
        param['size'] = 100
        param['sort'] = 'posted,asc'
        param['_posted'] = [fromTimestamp, toTimestamp]
        param['_parentUri'] = parentUriArr
        param['_postType'] = postTypeArr

        // this.$log.warn(this.$options.name + " param : ", param);

        this.$nextTick(() => {
          this.$axios({
            method: 'post',
            url: url,
            params: param
          })
            .then(result => {
              this.dayPosts.splice(0)

              for (const post of result.data._embedded.posts)
                this.dayPosts.push(post)
            })
            .catch(error => {
              this.$log.debug(
                this.$options.name + ' getDayPosts() error : ',
                error
              )
            })
        })
      }
    },
    initCalendarClass() {
      let dateJsons = this.selectedDate.split(',')
      let dateJson = {
        year: dateJsons[0],
        month: dateJsons[1] - 1,
        date: dateJsons[2]
      }
      let dateJsonMonth = {
        year: dateJsons[0],
        month: dateJsons[1] - 1
      }
      this.getDayPosts(dateJson)
    },
    editCalendarClass(item) {
      this.curItem = item
      this.showSchedule()
    },
    clearCurItem() {
      this.curItem = {}
    },
    writeSchedule() {
      this.clearCurItem()
      this.showSchedule()
    },
  }
}
</script>

<style scoped lang="scss">
.right-btm-btn-wrap{
  position: relative;
}
.tooltip-ani{
  left: 50%;
  transform: translateX(-50%);
  span{
    width: 245px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 5px 0;
    background-color:#8CABEA;
    &::after{
      left: 13px;
      top: 100%;
      border-right-color: transparent;
      border-top-color: #8CABEA;
    }
    &::before{
      vertical-align: bottom;
      display: inline-block;
      content: '';
      width: 96px;
      height: 17px;
      background: url("~@/assets/img/icon/multi-lang.png");
    }
  }
}

.rnb-tooltip-hide {
  position: absolute;
  z-index: 1;
  bottom: -21px;
  animation: tooltipGone 0.1s forwards;
  animation-delay: 10.5s;
}

@keyframes tooltipGone {
  from { opacity: 1; }
  to { opacity: 0; }
}

</style>
