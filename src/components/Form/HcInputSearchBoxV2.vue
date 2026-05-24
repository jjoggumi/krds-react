<template>
  <div
      class="new-search-input"
      :class="{'class-school-search': isClassSchoolSearchResult}"
  >
    <div class="input-prefix">
      <HiIcon class="input-icon" name="ico-input-search" color="default" size="20" />
    </div>
    <input
        ref="value"
        type="text"
        :placeholder="isClassSchoolSearchResult ? '클래스, 학교 찾기' : '검색어 입력'"
        :value="value"
        @input="value = $event.target.value"
        @focus="focus.value = true"
        @blur="focus.value = false"
        @keydown.enter.prevent.stop="onClickSearchButton"
        @keyup.esc="$emit('close-layer')"
        maxlength="15"
    >
    <button class="delete-btn" v-if="value" @click="onClickDeleteButton"></button>
    <button class="search-btn-txt" @click="onClickSearchButton">
      <span>검색</span>
      <!-- <span v-if="!isNavSearchBar">검색</span> -->
    </button>
    <button
      class="search-date-btn"
      v-if="isNavSearchBar || isPostsSearchResult"
      @click="toggleCalendar"
    />
    <calendar-monthly
        v-click-outside="closeCalendar"
        :timestamp="null"
        :isSearchPosts="true"
        v-if="isShowCalendar"
        @selectedDate="goSearchDate"
        @close="closeCalendar"
    />
  </div>
</template>

<script>
import {mapActions} from "vuex";
import CalendarMonthly from "@/components/Calendar/CalendarMonthly";

export default {
  name: "hc-input-search-box",
  components: {CalendarMonthly},
  props: {
    searchKeyword: {
      type: String,
      default() {
        return ''
      }
    },
    isNavSearchBar: {
      type: Boolean
    }
  },
  data() {
    return {
      focus: {
        value: false
      },
      isShowCalendar: false
    }
  },
  computed: {
    value: {
      get() {
        return this.searchKeyword
      },
      set(val) {
        const searchKeyword = !this.$comn.isEmpty(val)
          ? val.trim()
          : val
        this.$emit('update:searchKeyword', searchKeyword)
      }
    },
    isClassSchoolSearchResult() {
      return !this.isNavSearchBar && this.$route.query.searchType === 'class_school'
    },
    isPostsSearchResult() {
      return !this.isNavSearchBar && this.$route.query.searchType === 'post'
    }
  },
  watch: {
    value() {
      // 한글, 영대, 영소, 숫자, 공백 \s 가 아닌 경우 replace
      this.value = this.value.replace(/[^A-Za-z0-9\sㄱ-ㅎㅏ-ㅣ가-힣]/g, '')
    },
  },

  mounted() {
    this.$nextTick(() => {
      this.$refs.value.focus()
      this.$emit('mounted')
    })
  },

  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    onClickSearchButton() {
      this.goSearchKeyword()
    },
    onClickDeleteButton() {
      this.value = ''
      this.$nextTick(() => {
        this.$refs.value.focus()
      })
    },
    focusValue() {
      this.$refs.value.focus()
    },
    validation() {
      return new Promise((resolve, reject) => {
        if (this.$comn.isEmpty(this.value) || this.value.trim() === '') {
          let msg = '검색어를 입력해 주세요.'
          this.$hiClass.alert(msg)
            .finally(() => {
              this.value = ''
              setTimeout(() => {
                this.$refs.value.focus()
              }, 300)
            })
          reject(false)
        } else {
          resolve(true)
        }
      })
    },
    async goSearchKeyword() {
      this.triggerAnalyticsLogEvent({ code: 'analytics.home.click.button.search' })

      const validationResult = await this.validation()
      if (validationResult) {
        this.value = this.value.trim()
        this.$refs.value.value = this.value

        const result = new Promise(resolve => {
          const searchKeyword = this.value
          const searchType = this.isClassSchoolSearchResult ? 'class_school' : 'post'
          const query = { searchType, searchKeyword }
          this.goSearch(query)
          resolve(true)
        })

        result.then(() => {
          if (this.isNavSearchBar) {
            this.$emit('close-layer')
          }
        })
      }
    },
    goSearchDate(date) {
      const searchDate = this.$moment({ year: date.year, month: date.month, day: date.date}).format('YYYY-MM-DD')
      const searchType = 'post'
      const searchSort = 'latest'
      const query = { searchType, searchDate, searchSort }
      this.goSearch(query)
      if (this.isNavSearchBar) {
        this.$emit('close-layer')
      }
    },
    goSearch(query) {
      const path = '/main/search'
      const routeMethod = this.$route.path.includes('/main/search') ? 'replace' : 'push'
      this.$router[routeMethod]({ path, query }, () => {})
    },
    closeCalendar() {
      this.isShowCalendar = false
    },
    toggleCalendar() {
      this.isShowCalendar = !this.isShowCalendar
      this.$emit('calendar-toggle', this.isShowCalendar)
    }
  }
}
</script>

<style scoped>
/*ui 프로젝트와 맞지않아서 페이지에 css적용*/
.page-join-class .join-class-cont-wrap .new-search-wrap .new-search-input:not(.class-school-search) .delete-btn {
  margin-left: -94px;
  margin-top: 10px;
}
.page-join-class .join-class-cont-wrap .new-search-wrap .class-school-search .delete-btn {
  margin-left: -55px;
  margin-top: 10px;
}
</style>
<style lang="scss" scoped>
  .header-search-layer {    
    .new-search-input {
      position: relative;
      width: 388px;
      margin: 15px 0 0 0;
      .input-prefix {
        position: absolute;
        top: 50%;
        left: 10px;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        gap: 4px;
        pointer-events: none;

        .input-icon {
          padding: 0;
        }
      }
      .search-date-btn {
        height: 40px;
        width: 24px;
        margin-left: 284px;
        background: url('../../assets/img/icon/icon_calendar_s5.svg') 55% 10px no-repeat;
      }
       input {
        width: 320px;
        height: 40px;
        font-family: var(--font-body);
        font-size: 14px;
        font-weight: 500;
        padding: 4px 75px 4px 38px;
        border-radius: 4px;
        margin-right: 0;
        border: 1px solid #8EA4D1;
        background: #F8F9FC;
      }
      .search-btn-txt {
        position: relative;
        width: 58px;
        height: 40px;
        border-radius: 4px;
        margin-left: 10px;
        color: #fff;
        background: var(--primary);
        &:hover {
          background: #3C65BA;
        }
      }
      .delete-btn {
        margin-left: 250px;
        margin-top: 0;
        width: 18px;
        height: 40px;
        background: url('../../assets/img/icon/icon_close_18.svg') right center / 18px auto no-repeat;
      }
      .calendar__layer {
        width: 388px;
        top: 52px;
        border: 1px solid #CCD0D7;
      }

      @media (max-width: 480px) {
        width: 100%;
        min-width: 290px;
        input {
          width: calc(100% - 68px);
          padding-right: 55px;
          min-width: 230px;
        }
        .delete-btn {
          position: absolute;
          margin-left: 0;
          right: 104px;
          top: 0;
        }
        .search-date-btn {
          position: absolute;
          margin-left: 0;
          right: 74px;
          top: 0;
        }
        .search-btn-txt {
          min-width: 42px;
        }
        .calendar__layer {
          width: 100%;
        }
      }
    }
    .search-date-btn {
      height: 40px;
      width: 24px;
      margin-left: 284px;
      background: url('../../assets/img/icon/icon_calendar_s5.svg') 55% 10px no-repeat;
    }
    input {
      width: 320px;
      height: 40px;
      font-family: 'Pretendard';
      font-size: 14px;
      font-weight: 500;
      padding: 4px 12px 4px 38px;
      border-radius: 4px;
      margin-right: 0;
      border: 1px solid #8ea4d1;
      background: #f8f9fc;
    }
    .search-btn-txt {
      position: relative;
      width: 58px;
      height: 40px;
      border-radius: 4px;
      margin-left: 10px;
      color: #fff;
      background: #4778de;
      &:hover {
        background: #3c65ba;
      }
    }
    .delete-btn {
      margin-left: 250px;
      margin-top: 0;
      width: 18px;
      height: 40px;
      background: url('../../assets/img/icon/icon_close_18.svg') right center / 18px auto no-repeat;
    }
    .calendar__layer {
      width: 388px;
      top: 52px;
      border: 1px solid #ccd0d7;
    }
  }
</style>
