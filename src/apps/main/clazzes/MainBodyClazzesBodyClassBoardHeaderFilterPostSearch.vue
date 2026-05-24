<template>
  <div
    class="hi-searchbox"
    :class="{
      'is-active': focus.keyword  // 포커스 처리
    }"
  >
    <div class="searchbox__select">
        <button class="selected" ref="selectedEl" v-click-outside="closeSearchKindSelect" @click="onClickSearchKind">{{ selectedSearch }}</button>
        <div class="option__layer" ref="layerEl">
            <button class="option" @click="onClickSearchKindSelect('total')">전체</button>
            <button class="option" v-if="isManager" @click="onClickSearchKindSelect('user')">작성자</button>
            <button class="option" @click="onClickSearchKindSelect('date')">작성일</button>
        </div>
    </div>

    <div class="searchbox__input">
      <template v-if="searchSelect.date === true">
        <input
          ref="searchQueryKeyword"
          type="text"
          placeholder="작성일 검색"
          v-model="searchQuery.dayOfPosted"
          @click="onClickCalendar"
          @focus="focus.keyword = true"
          @blur="focus.keyword = false"
          readonly
        >
      </template>

      <template v-else-if="searchSelect.user === true">
        <input
          ref="searchQueryKeyword"
          class="searchUser"
          type="text"
          placeholder="작성자 검색"
          :value="input.insertedUser"
          @input="input.insertedUser = $event.target.value"
          @click="onClickInsertedUser"
          @focus="focus.keyword = true"
          @blur="focus.keyword = false"
        >
      </template>

      <template v-else>
        <input
          ref="searchQueryKeyword"
          type="text"
          placeholder="게시글 검색"
          maxlength="100"
          v-model="searchQuery.keyword"
          @focus="focus.keyword = true"
          @blur="focus.keyword = false"
          @keyup.enter="setSearchQuery"
        >
      </template>
      <button
        v-if="searchQuery.keyword || input.insertedUser"
        class="btn-delete"
        @click="clearSearchQueryKeyword"
      ></button>
      <i class="icon-calendar" v-if="searchSelect.date" @click="onClickCalendar"></i>
      <button
        class="btn-search"
        @click="onClickSearchButton"
      ></button>
    </div>

    <calendar-monthly
      v-if="isPopupCalendar"
      :timestamp="calendarDateTimestamp"
      :value-goe="null"
      :message-goe="''"
      :isBoardUse="true"
      v-click-outside="closePopupCalendar"
      @selectedDate="setCalendarDateTimestamp"
      @close="searchDate"
    />
    
    <member-list
      v-if="isMemberList"
      :userName="input.searchUser"
      v-click-outside="closePopupMemberList"
      @searchUser="searchUser"
    />
  </div>
</template>

<script>
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import {eventBus} from "@/main";
import { debounce } from "lodash";
import CalendarMonthly from "@/components/Calendar/CalendarMonthly";
import MemberList from "@/components/Member/MemberList";

export default {
  name: "main-body-clazzes-body-class-board-header-filter-post-search",
  components: {CalendarMonthly, MemberList},
  data() {
    return {
      // 요청 딜레이 flag
      isBusy: false,
      focus: {
        keyword: false,
      },
      searchQuery: {
        // 검색엔진 키워드 검색 (제목,내용,파일명)
        keyword: null,
        // 검색엔진 키워드 검색 댓글 포함 여부 default:true (댓글내용,파일명)
        keywordCommentUsed: true,
        // 검색엔진 작성자 아이디로 조회
        insertedUser: null,
        // 검색엔진 게시일로 조회
        dayOfPosted: null,

        // (게시판 고도화)게시판 관리 ID
        boardId: null,
        // (게시판 고도화)게시판 폴더 관리 ID
        folderId: null,
      },
      searchSelect: {
        total: true,
        user: false, 
        date: false
      },
      input: {
        insertedUser: "",
        searchUser: ""
      },
      search: {
        selected: false
      }, 
      // 이전 query 요청
      prevSearchQuery: null,
      isPopupCalendar: false,
      isMemberList: false,
      calendarDateTimestamp: null
    }
  },
  props: {
    isManager: {
      type: Boolean
    }
  },
  computed: {
    ...mapState({
      curClassSearchQuery: 'curClassSearchQuery',
      curClassTabCode: 'curClassTabCode',
    }),
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
    }),
    selectedSearch() {
      if(this.searchSelect.user === true) {
        return "작성자"
      } else if(this.searchSelect.date === true) {
        return "작성일"
      } else {
        return "전체"
      }
    },
    inputInsertedUser() {
      return this.input.insertedUser
    }
  },
  watch: {
    searchSelect(v) {
      this.searchQuery.keyword = null
      this.searchQuery.insertedUser = null
      this.searchQuery.dayOfPosted = null
      this.input.insertedUser = ""
      this.input.searchUser = ""

      // if(v.user === false) {
      //   this.input.insertedUser = ""
      //   this.input.searchUser = ""
      // }

      if(v.date === true) {
        const selected = this.$moment(this.$moment().valueOf())
        const selectedYear = selected.year()
        const selectedMonth = selected.month() + 1
        const selectedDate = selected.date()
        
        this.calendarDateTimestamp = this.$moment().valueOf()

        this.setCurClassSearchQueryAttr({
          sort: "posted,desc"
        })

        // this.searchQuery.dayOfPosted = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`
      } else if(v.total === true) {
        this.setCurClassSearchQueryAttr({
          sort: null
        })
      } else if(v.user === true) {
        this.setCurClassSearchQueryAttr({
          sort: "posted,desc"
        })
      }
      this.setSearchQuery()
    },
    inputInsertedUser: debounce(function(v) {
      if(this.searchSelect.user === true) {
        if(this.search.selected === false) {
          this.isMemberList = true
          this.input.searchUser = v
        } else {
          this.isMemberList = false
          this.search.selected = false
        }
      }
    }, 200)
  },
  mounted() {
    this.calendarDateTimestamp = this.$moment().valueOf()
  },
  methods: {
    ...mapMutations({
      setCurClassSearchQueryAttr: 'setCurClassSearchQueryAttr',
      setCurClassTabCode: 'setCurClassTabCode',
    }),
    ...mapActions({
      initCurClassSearchQuery: 'initCurClassSearchQuery',
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    // duplicatedSearchQuery() {
    //   return _.isEqual(this.prevSearchQuery, this.searchQuery)
    // },
    async setSearchQuery() {
      // 이미 검색한 query 인 경우 검색 중단
      // if (this.duplicatedSearchQuery()) return false

      // 파일 모아보기 탭이 활성화되어 있는 경우 리스트 탭으로 변경
      if (this.curClassTabCode === 'FILE') this.setCurClassTabCode('LIST')

      if (!this.isBusy) {
        this.isBusy = true

        // 기존 필터 초기화
        this.initCurClassSearchQuery()

        // 검색어에 불필요한 좌우 공백 제거
        this.searchQuery.keyword =
          this.searchQuery.keyword ? this.searchQuery.keyword.trim() : null

        // vuex store 에 query 저장
        this.setCurClassSearchQueryAttr({
          keyword: this.searchQuery.keyword,
          dayOfPosted: this.searchQuery.dayOfPosted,
          keywordCommentUsed: this.searchQuery.keywordCommentUsed,
          insertedUser: this.searchQuery.insertedUser
        })

        // 게시글 목록만 new query 로 새로고침
        eventBus.$emit('refresh-class-board-posts')

        // 요청한 query 임시 저장
        this.prevSearchQuery = Object.assign({}, this.searchQuery)

        if(this.searchQuery.insertedUser) {
          this.$emit("getUser", this.input.insertedUser)
        } else {
          this.$emit("getUser", "")
        }

        // 검색 딜레이 300ms 후 초기화
        setTimeout(() => {
          this.isBusy = false

          // 최상단으로 이동
          this.$hiClass.documentBodyScrollToTop(this)
        }, 300)
      }
    },
    onClickSearchButton() {
      if(this.searchSelect.total === true) {
        this.triggerAnalyticsLogEvent({ code: 'analytics.class.click.button.search' });
        this.setSearchQuery()
      }
    },
    clearSearchQueryKeyword() {
      this.searchQuery.keyword = null
      this.input.insertedUser = ""
      this.input.searchUser = ""
      this.searchQuery.insertedUser = null

      this.focusSearchQueryKeyword()
    },
    focusSearchQueryKeyword() {
      if (this.$refs.searchQueryKeyword)
        this.$refs.searchQueryKeyword.focus()
    },
    onClickSearchKind(e) {
      this.closePopupCalendar()
      this.closePopupMemberList()
      e.target.classList.toggle('is-active')
      const isActive = e.target.classList.contains('is-active')
      
      const layerEl = this.$refs.layerEl
      if(isActive === true) {
        layerEl.classList.add('opened')
      } else {
        layerEl.classList.remove('opened')

        if(this.searchSelect.user === true) {
          this.input.searchUser = this.input.insertedUser
          this.isMemberList = true
        } else if(this.searchSelect.date === true) {
          this.isPopupCalendar = true
        }
      }
    },
    onClickSearchKindSelect(data) {
      const layerEl = this.$refs.layerEl
      const selectedEl = this.$refs.selectedEl
      layerEl.classList.remove('opened')
      selectedEl.classList.remove('is-active')

      if(data === 'total') {
        this.isPopupCalendar = false
        this.isMemberList = false
        this.searchSelect = {
          total: true,
          user: false, 
          date: false
        }
      } else if(data === 'user') {
        this.isPopupCalendar = false
        this.isMemberList = true
        this.searchSelect = {
          total: false,
          user: true, 
          date: false
        }
      } else if(data === 'date') {
        this.isPopupCalendar = true
        this.isMemberList = false
        this.searchSelect = {
          total: false,
          user: false, 
          date: true
        }
      }
    },
    onClickInsertedUser() {
      this.input.searchUser = this.input.insertedUser
      this.isMemberList = true
    },
    onClickCalendar() {
      const layerEl = this.$refs.layerEl
      const selectedEl = this.$refs.selectedEl
      layerEl.classList.remove('opened')
      selectedEl.classList.remove('is-active')
      this.isPopupCalendar = true
    },
    closeSearchKindSelect() {
      // if(this.searchSelect.date !== true) {
      const layerEl = this.$refs.layerEl
      const selectedEl = this.$refs.selectedEl
      layerEl.classList.remove('opened')
      selectedEl.classList.remove('is-active')

      if(this.search.selected === true && this.searchSelect.date === true) {
        this.isPopupCalendar = false
        this.search.selected = false
      }
      // if(this.search.selected === false) {
      //   if(this.searchSelect.user === true) {
      //     this.isMemberList = true
      //   } else if(this.searchSelect.date === true) {
      //     this.isPopupCalendar = true
      //   }
      // } else {
      //   this.isMemberList = false
      //   this.isPopupCalendar = false
      //   this.search.selected = false
      // }

      // this.isMemberList = false
      // this.isPopupCalendar = false
      // this.search.selected = false
      // }
    },
    setCalendarDateTimestamp(dateTimeJson) {
      const tmpYear = dateTimeJson.year
      let tmpMonth = dateTimeJson.month + 1
      if (tmpMonth.toString().length === 1) {
        tmpMonth = '0' + tmpMonth
      }
      let tmpDate = dateTimeJson.date
      if (tmpDate.toString().length === 1) {
        tmpDate = '0' + tmpDate
      }
      const dateTime = `${tmpYear}/${tmpMonth}/${tmpDate}`
      this.calendarDateTimestamp = this.$moment(dateTime, 'YYYY/MM/DD', true).valueOf()
      // this.searchQuery.dayOfPosted = `${tmpYear}-${String(tmpMonth).padStart(2, '0')}-${String(tmpDate).padStart(2, '0')}`
    },
    searchDate() {
      const selected = this.$moment(this.calendarDateTimestamp)
      const selectedYear = selected.year()
      const selectedMonth = selected.month() + 1
      const selectedDate = selected.date()
      
      this.searchQuery.dayOfPosted = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`
      this.isPopupCalendar = false
      this.search.selected = true
      this.setSearchQuery()
      this.closePopupCalendar()
    },
    searchUser(user) {
      this.searchQuery.insertedUser = user.userId
      this.input.insertedUser = user.userName
      this.search.selected = true
      this.setSearchQuery()
      this.closePopupMemberList()
    }, 
    closePopupCalendar() {
      this.isPopupCalendar = false
    },
    closePopupMemberList(e) {
      if(!e === false) {
        if(e.target.classList.contains('searchUser') !== true && e.target.classList.contains('btn-search') !== true) {
          this.isMemberList = false
        }
      }
    }
  }
}
</script>

<style scoped>
.searchbox__select .option__layer.opened {
  display: block;
}
.searchbox__input .icon-calendar {
  cursor: pointer;
}
</style>