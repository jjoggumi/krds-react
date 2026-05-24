<!--
@File(Method): CalendarInput.vue
@Author: -
@Date Created: -
@Description: 달력 팝업 컴포넌트
@Modified: 2025-01-24 - #69577 쌍방향 단체톡 - 외부에서 props로 placeholder 전달 추가
-->
<template>
  <div class="set-date-wrap">
    <div
        class="date-cont-wrap"
        @click="clickDateInput"
    >
      <button class="calendar-icon-btn"></button>
      <div class="date-wrap">
        <div class="date" v-if="isShowNoticeMessage">
          {{placeholder}}
        </div>
        <div class="date" v-else>
          {{ `${selectedDate.month + 1}월 ${selectedDate.day}일(${makeDay()}) ${selectedDate.hour}시 ${selectedDate.minute}분` }}
        </div>
      </div>
    </div>
    <calendar-popup
        v-if="sendMessageItem.isOpenPopupCalendar"
        :defaultSelectedDate="selectedDate"
        @closePopupCalendar="closePopupCalendar"
        :notForReservation="notForReservation"
        :defaultPaddingMinutes="defaultPaddingMinutes"
        :minutePadding="minutePadding"
        :maxDateTimestamp="maxDateTimestamp"
    />
  </div>
</template>

<script>
import CalendarPopup from "@/components/CalendarPopup/Calendar";
import { checkTeacherChatTime } from "@/apps/hitalk/utils";
import {mapMutations, mapState} from "vuex";
import moment from 'moment-timezone'
export default {
  name: "CalendarInput",
  components: {CalendarPopup},
  props: {
    targetUserTime: [Object, null, undefined],
    placeholder: {
      type: String,
      default: '예약 시간을 선택해주세요.'
    },
    notForReservation: {
      type: Boolean,
      default: false
    },
    defaultHour: {
      type: Number,
      default: 10
    },
    defaultPaddingMinutes: {
      type: Number,
      default: 10
    },
    minutePadding: {
      type: Number,
      default: 9
    },
    maxDateTimestamp: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      selectedDate: {},
      isShowNoticeMessage: true,
      userTime: null
    }
  },
  computed: {
    ...mapState('storeHitalk', ['sendMessageItem'])
  },
  watch: {
    targetUserTime(val) {
      if(val) {
        this.userTime = val
        this.initDate()
      }
    }
  },
  methods: {
    ...mapMutations('storeHitalk', {
      setSendMessageItem: 'setSendMessageItem'
    }),
    clickDateInput: function() {
      if(this.targetUserTime) {
        this.$emit('targetUserTimeReload')
      }
      if(new Date().getTimezoneOffset() !== -540) {
        this.$toasted.clear()
        const options = { duration: 2000 }
        this.$toasted.show('한국 시간을 기준으로 발송시간을 선택해주세요.', options)
      }
      this.setSendMessageItem({isOpenPopupCalendar: true})
    },
    /**
     * 날짜 data 설정
     */
    initDate() {
      // 기본 설정 날짜 오늘 날짜 + 1, 예약 메시지 작성 날짜가 금요일 또는 주말일 경우, 다음 월요일, 오전 10시
      let addDate = 1
      let today = moment().tz('Asia/Seoul')
      
      if (today.day() === 5) { // 금
        addDate = 3
      }
      if (today.day() === 6) { // 토
        addDate = 2
      }

      let reservationDate = 0
      if (this.sendMessageItem.reservationTime > 0) {
        const timeString = moment(this.sendMessageItem.reservationTime).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm')
        reservationDate = new Date(timeString).getTime()
      } else {
        if(this.userTime && !this.userTime.isOver) {
          const chatDayArr = this.userTime.userTime.userChatDay.split(',').filter(d => +d > today.day())
          const hour = +this.userTime.userTime.userChatStartTime.substring(0, 2)
          const min = +this.userTime.userTime.userChatStartTime.substring(2, 4)
          if(chatDayArr.length === 0) {
            today.day(+(this.userTime.userTime.userChatDay.split(',')[0]) + 7)
          } else {
            today.day(+(chatDayArr[0]))
          }
          reservationDate = new Date(today.hour(hour).minute(min).second(0).millisecond(0).format('YYYY-MM-DD HH:mm')).getTime()
        } else {
          reservationDate = new Date(today.add(addDate, 'd').hour(this.defaultHour).minute(0).second(0).millisecond(0).format('YYYY-MM-DD HH:mm')).getTime()
        }
         
      }

      this.selectedDate.year = parseInt(moment(reservationDate).format('YYYY'))
      this.selectedDate.month = parseInt(moment(reservationDate).format('M')) - 1
      this.selectedDate.day = parseInt(moment(reservationDate).format('DD'))
      this.selectedDate.hour = parseInt(moment(reservationDate).format('HH'))
      this.selectedDate.minute = parseInt(moment(reservationDate).format('mm'))
    },

    /**
     * 요일 구하기
     * @returns {string}
     */
    makeDay() {
      const day = moment(this.sendMessageItem.reservationTime).day()

      switch (day) {
        case 0:
          return '일'
        case 1:
          return '월'
        case 2:
          return '화'
        case 3:
          return '수'
        case 4:
          return '목'
        case 5:
          return '금'
        case 6:
          return '토'
        default:
          return ''
      }
    },
    /**
     * 팝업 달력 닫기
     * @param selectedDate
     */
    closePopupCalendar(selectedDate) {
      if (selectedDate) {
        const timeString = moment(selectedDate).format('YYYY-MM-DD HH:mm')
        if(this.userTime) {
          if(!this.userTime.isUseChat) {
            this.$hiClass.alert('예약 가능한 시간이 없습니다.', 'info')
          } else {
            if(!this.userTime.isOver) {
              if(checkTeacherChatTime(false, this.userTime.userTime, selectedDate)){
                this.selectedDate = selectedDate
                this.setSendMessageItem({reservationTime: new Date(moment.tz(timeString, 'Asia/Seoul')).getTime()})
                this.isShowNoticeMessage = false
              } else {
                this.$emit('alertDialog', this.userTime.userTime)
              }
            } else {
              this.selectedDate = selectedDate
              this.setSendMessageItem({reservationTime: new Date(moment.tz(timeString, 'Asia/Seoul')).getTime()})
              this.isShowNoticeMessage = false
            }
          }
        } else {
          this.selectedDate = selectedDate
          this.setSendMessageItem({reservationTime: new Date(moment.tz(timeString, 'Asia/Seoul')).getTime()})
          this.isShowNoticeMessage = false
        }

        this.$emit('select', this.selectedDate)
      }

      this.setSendMessageItem({isOpenPopupCalendar: false})
    }
  },
  created() {
    this.initDate()
    if (this.sendMessageItem.reservationTime > 0) {
      this.isShowNoticeMessage = false
    }
  }
}
</script>

<style lang="scss" scoped>
// 날짜세팅(단체방 만들기, 일괄메시지작성(예약))
.set-date-wrap {
  position: relative;
  display: inline-block;
  vertical-align: middle;
  .date-cont-wrap {
    cursor: pointer;
    display: flex;
    align-items: center;
    height: 36px;
    .date-wrap {
      display: inline-block;
      width: 182px;
      height: 100%;
      font-size: 14px;
      background-color: #fff;
      border: 1px solid #e0e0e0;
      padding: 0 10px;
      border-left: 0;
      border-radius: 0 4px 4px 0;
      vertical-align: middle;
      .date {
        color: var(--primary);
        line-height: 34px;
      }
    }
    .calendar-icon-btn {
      width: 36px;
      height: 36px;
      background-color: #929BB9;
      border-radius: 4px 0 0 4px;
      vertical-align: middle;
    }
    .calendar-icon-btn::before {
      content: "";
      display: inline-block;
      width: 20px;
      height: 20px;
      background: url("~@/assets/img/icon/icons_hitalk.png") 0 -370px/200px auto no-repeat;
      vertical-align: middle;
    }
  }
}
</style>