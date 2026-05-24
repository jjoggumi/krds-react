<template>
  <div
    class="column-aside"
    :class="{
      'is-fixed': getIsFixed(),
      'is-fixed-nofilter': getIsFixed()
    }"
  >
    <div class="column__inner">
      <!--
      <div
        v-if="isShowSearchKeyword"
        class="input-box-wrap round-search-box search-box-wrap"
      >
        <input
            ref="search"
            type="text"
            maxlength="100"
            v-model="searchKeyword"
            @keypress.enter.prevent.stop="goSearch(searchKeyword, $event)"
            :placeholder="$t('main.schools.rnb.searchKeyword.placeholder')"
        />
        <button
            class="search-btn"
            v-on:click="goSearch(searchKeyword, $event)"
        ></button>
        <button
            class="input-text-delete-btn"
            v-if="searchKeyword"
            :style="{ display: 'inline-block' }"
            @click="searchKeyword = ''"
        ></button>
      </div>
      -->

      <!-- calendar -->
      <MainBodySchoolsRnbCalendar
          :monthlyPosts="monthlyPosts"
          :selectedDate="selectedDate"
          :parentUri="parentUri"
          @setSelectedDate="setSelectedDate"
          @getDayPosts="getDayPosts"
      ></MainBodySchoolsRnbCalendar>
      <!-- // calendar -->

      <!-- calendar info -->
      <MainBodySchoolsRnbCalendarInfo
          :selectedDate="selectedDate"
          :dayPosts="dayPosts"
          :monthlyPosts="monthlyPosts"
      ></MainBodySchoolsRnbCalendarInfo>
      <!-- // calendar info -->
      <div class="right-btm-btn-wrap">
        <div v-if="user.userType === 'TEACHER'" class="tooltip-ani tooltip-top rnb-tooltip-hide">
          <span>외 총 9개 언어 버전 제공</span>
        </div> 
      </div>
      <banner-item
          :key="$store.state.bannerTimestamp"
          positionType="WEB_BANNER_RNB"
          :banners="$store.state.banner.WEB_BANNER_RNB"
      />

      <!--
      <div class="right-btm-btn-wrap">
      </div>
      -->

    </div>
  </div>
  <!-- right-wrap -->
</template>

<script>
import MainBodySchoolsRnbCalendar from './MainBodySchoolsRnbCalendar.vue'
import MainBodySchoolsRnbCalendarInfo from './MainBodySchoolsRnbCalendarInfo.vue'
import BannerItem from '../../../components/Banner/BannerItem'
import {mapGetters} from "vuex";
import {mapFields} from "vuex-map-fields";

export default {
  name: 'mainBodySchoolsRnb',
  props: {
    schools: Object,
    user: Object,
    parentUri: Array
  },
  data: () => ({
    isShowSchedule: false,
    searchKeyword: '',
    monthlyPosts: [],
    dayPosts: [],
    selectedDate: '',
    initComplete: false
  }),
  components: {
    MainBodySchoolsRnbCalendar,
    MainBodySchoolsRnbCalendarInfo,
    BannerItem
  },
  computed: {
    ...mapGetters({
      getIsFixed: "getIsFixed",
    }),
    ...mapFields({
      curSchoolSearchQuery: 'curSchoolSearchQuery'
    }),
    isShowSearchKeyword() {
      const boards = [undefined, 'alarm', 'meal', 'notice']
      return boards.includes(this.$route.params.board)
    }
  },
  watch: {
    'curSchoolSearchQuery.keyword'(val) {
      if (!val) {
        this.searchKeyword = ''
      }
    }
  },
  methods: {
    goSearch: function(keyword) {
      // 이벤트 ( 키입력, 마우스 버튼 클릭으로 검색 시)로 검색 요청시 검색어공백 체크함
      // if (typeof event !== "undefined") {
      //   if (typeof keyword === "undefined" || keyword === "") {
      //     alert("검색어를 입력해 주세요.");
      //     return false;
      //   }
      // }
      this.curSchoolSearchQuery.keyword = keyword.trim()

      this.$parent.doBoardSearch(keyword.trim())
      this.searchKeyword = keyword.trim()
    },
    getSearchKeyword: function() {
      return this.searchKeyword
    },
    showSchedule() {
      this.isShowSchedule = true
    },
    hideSchedule() {
      this.isShowSchedule = false
    },
    setSelectedDate(dateJson) {
      this.selectedDate = `${dateJson.year},${dateJson.month + 1},${
        dateJson.date
      }`
      this.$log.debug('this.selectedDate => ' + this.selectedDate)
      this.getDayPosts(dateJson)
    },
    getDayPosts(dateJson) {
      let param = {}
      let url = '/posts/!q'
      let year = dateJson.year
      let month = dateJson.month
      let date = dateJson.date
      const fromTimestamp = new Date(year, month, date).getTime()
      const toTimestamp = fromTimestamp + 86399999

      if (this.schools._links !== undefined) {
        const schoolUri = this.schools._links.self.href
        const parentUriArr = [schoolUri]
        const postTypeArr = ['CALENDAR_SCHOOL']

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
    }
  },
  created() {}
}
</script>
<style soped lang="scss">
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