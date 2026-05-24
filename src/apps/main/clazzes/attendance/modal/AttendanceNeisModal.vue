<!--
@File(Method): AttendanceNeisModal.vue
@Author: -
@Date Created: -
@Description: 클래스 > 수업관리 > 출결 알리기 > 나이스 출석부
@Modified: 2025-03-17 - #72058 출결알리기 개선 (편리한 기능, 체험학습 개수 제한) - 안내 문구 추가
-->
<template>
  <div
      class="modal normal-modal slick-modal view-main-detail-modal ofy"
      id="attendanceNeisModal"
      style="display: block"
  >
    <div class="modal-cont-wrap" ref="scrollArea">
      <div class="modal-cont">
        <div class="modal-cont-inner">
          <div class="attendance-neis-container">
            <div class="header-wrap">
              <span class="title">NEIS 출석부</span>
              <span class="close" @click="close"></span>
            </div>

            <div class="content-wrap">

              <div class="calender-box">
                <div class="date">
                  <span class="prev" @click="calendarPrev"></span>
                  <span class="calendar-select" @click="calendarSelect(year, month, $event)">{{ year }}년 {{ month }}월<i class="calendar"></i>
                  </span>
                  <span class="next" @click="calendarNext"></span>
                </div>
              </div>

              <div class="info-box">
                <div class="class-total">
                  <span class="class">{{ curClassName }}</span>
                  <span class="total">총 {{ list.length }}명</span>
                </div>

                <div class="writebox">
                  <!-- #72058 출결알리기 개선 - 안내문구 추가 -->
                  <span class="txt-primary mr-10">* 체험학습은 결석으로 표시됩니다.</span>
                  <button class="hi-btn btn-lg" @click="openAttendanceRegisterModal"><strong>출결 등록하기</strong></button>
                  <button class="hi-btn btn-lg btn-line" @click="downloadPdf"><strong>출석부 인쇄</strong></button>
                  <button class="hi-btn btn-lg btn-line-lgray s1" @click="openNeisMark">
                    <strong>출결지표</strong>
                    <i class="question"></i>
                  </button>
                </div>
              </div>

              <div class="attendance-tbl-contatiner">
                <table class="tbl-col neis" id="attendance-neis-tbl">
                  <colgroup>
                      <col width="103" />
                      <col width="120" />
                      <col width="49" v-for="i in [...new Array(31).keys()]" :key="i"/>
                  </colgroup>
                  <thead>
                      <tr class="nb-top">
                        <th rowspan="2">학반</th>
                        <th rowspan="2">학생명</th>
                        <th v-for="day in days" :key="`day-${day}`" :class="{
                          'holiday' : 
                          getWeek(day) === 0 || getWeek(day) === 6 || 
                          isHoliday(day) 
                        }"><span :class="{
                          'today': nowDay(day)
                        }">{{ day }}</span>
                        </th>
                        <th v-for="day in remainDays" :key="`day-w-r-${day}`"></th>
                      </tr>
                      <tr>
                        <th v-for="day in days" :key="`day-w-${day}`" :class="{
                          'holiday' : 
                          getWeek(day) === 0 || getWeek(day) === 6 || 
                          isHoliday(day) 
                        }">{{ weekList[getWeek(day)] }}</th>
                        <th v-for="day in remainDays" :key="`day-w-r2-${day}`"></th>
                      </tr>
                  </thead>
                  <tbody>
                    <template v-if="list.length > 0">
                      <tr v-for="(item, idx) in list" :key="`neis-stats-${idx}`">
                          <td>{{ item.student.tagId ? item.student.tagName : '-' }}</td>
                          <td class="txt-left">
                            <span class="num">
                              {{ item.student.studentNo }}
                            </span>
                            <span class="name" @click="showDetail(item.student)">
                            {{ item.student.studentName }}
                            </span>
                            <span class="no-use" v-if="item.student.isUsed === false">(미사용)</span>
                          </td>
                          <td v-for="day in days" :key="`neis-stats-day-${day}`" @click="openAttendanceModal(item, day)">
                            <template v-if="getStatus(item, day) !== false">
                              <span class="status" v-if="getStatus(item, day).isConfirmed === false" :title="`${attendanceTypeText(getStatus(item, day).attendanceType)}`">
                                <span class="no-chk"></span>
                                <span class="text no-chk-text">{{ attendanceTypeText(getStatus(item, day).attendanceType) }}</span>
                              </span>

                              <span class="status" v-else :title="`${attendanceTypeText(getStatus(item, day).attendanceType)}(${attendanceConfirmTypeText(getStatus(item, day).attendanceConfirmType)})`">
                                <span class="mark">{{ attendanceConfirmTypeIcon(getStatus(item, day).attendanceType, getStatus(item, day).attendanceConfirmType) }}</span>
                                <span class="text">{{ attendanceTypeText(getStatus(item, day).attendanceType) }}</span>
                              </span>
                            </template>

                            <template v-else>
                              <span class="empty" title="빈 칸을 클릭하여 출결을 등록하세요."></span>
                            </template>
                          </td>
                          <td class="no-day" v-for="day in remainDays" :key="`neis-stats-day-no-day-${day}`"></td>
                      </tr>
                    </template>
                    <template v-if="list.length === 0 && !isSearching">
                      <tr>
                          <td class="no-data" colspan="33">
                            <span class="w-img">
                            </span>
                            <span class="w-text">
                                내역이 없습니다.
                            </span>
                          </td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <main-body-calendar-picker-month-v2
      ref="calendarPickerMonthNeis"
      :year="year"
      :month="month"
      :total="false"
      :neis="true"
      v-click-outside="disappearCalendar"
      @choiceMonth="choiceMonth"
    />

    <attendance-neis-mark-modal 
      v-if="isOpenNeisMark"
      @close="openNeisMark"
    />

    <attendance-neis-modal-pdf
      v-if="neisPdfDownload"
      :list="list"
      :year="year"
      :month="month"
      :days="days"
      @downloadPdfFinish="downloadPdf"
    />
    
    <attendance-neis-target-modal
      v-if="isOpenNeisTarget"
      :targetStudent="targetStudent"
      :attendanceList="targetList"
      @close="closeNeisTarget"
    />

    <attendance-register-modal 
      v-if="modal.isShowRegisterModal"
      :id="modal.id"
      :clazzMemberRole="clazzMemberRole"
      :isConfirmMode="modal.isConfirmdMode"
      :isNeis="true"
      :targetDate="modal.targetDate"
      :targetStudentId="modal.targetStudentId"
      @close="closeAttendanceRegisterModal" 
    />

    <attendance-detail-modal
      v-if="modal.isShowDetailModal"
      :id="modal.id"
      :clazzMemberRole="clazzMemberRole"
      :isNeis="true"
      @close="closeAttendanceDetailModal"
    />

    <attendance-stat-detail-modal
      v-if="detail.open"
      :model="detail"
      @openDetail="openDetail"
      :filter="'month'"
      :date="searchDate"
      :detailAttendanceType="''"
      :detailAttendanceConfirmType="''"
      :detailAttendanceOk="false"
      @openDetailModal="openAttendanceDetalModal"
    />
  </div>
</template>

<script>
import {mapGetters} from "vuex";
import MainBodyCalendarPickerMonthV2 from '../../MainBodyCalendarPickerMonthV2.vue'
import AttendanceNeisMarkModal from './AttendanceNeisMarkModal.vue'
import AttendanceNeisModalPdf from '../pdf/AttendanceNeisModalPdf.vue'
import AttendanceNeisTargetModal from './AttendanceNeisTargetModal.vue'
import AttendanceRegisterModal from "./AttendanceRegisterModal";
import AttendanceDetailModal from "./AttendanceDetailModal";
import AttendanceStatDetailModal from "../modal/AttendanceStatDetailModal"
import qs from 'qs'

export default {
  name: "attendance-neis-modal",
  props: {
    clazzMemberRole: String,
  },
  components: {
    MainBodyCalendarPickerMonthV2,
    AttendanceNeisMarkModal,
    AttendanceNeisModalPdf,
    AttendanceNeisTargetModal,
    AttendanceRegisterModal,
    AttendanceDetailModal,
    AttendanceStatDetailModal
  },
  data() {
    return {
      searchParams : {
          page : 0, 
          size : 1000                  
      },
      weekList: ['일', '월', '화', '수', '목', '금', '토'],
      year: null,
      month: null,
      days: null,
      nowDate: {
        year: null,
        month: null,
        day: null
      },
      isOtherUse: true,
      isTeacher: true,
      enableDays: [],
      list: [],
      isSearching: false,
      search: {
        target : null
      },
      isOpenNeisMark: false,
      neisPdfDownload: false,
      isOpenNeisTarget: false,
      targetStudent: {
        date: '',
        name: ''
      },
      targetList: [],
      modal: {
        id: null,
        isShowRegisterModal: false,
        isShowDetailModal: false,
        isConfirmdMode: false,
        targetDate: null,
        targetStudentId: null
      },
      detail : {
        studentId : "",
        open: false
      },
      searchDate: {
        month: {
          year: null,
          month: null
        }
      }
    }
  },
  mounted() {
    this.init()
  },
  created() {
  },
  computed: {
    ...mapGetters({
      curClassName: 'curClassName',
      curClassId: 'curClassId'
    }),
    remainDays() {
      return 31 - this.days
    },
  }, 
  methods: {
    init() {
      const date = new Date()
      this.year = date.getFullYear()
      this.month = date.getMonth() + 1

      this.nowDate.year = this.year
      this.nowDate.month = this.month
      this.nowDate.day = date.getDate()

      this.initSearch()
    },
    initSearch() {
      this.list = []
      this.lastDaysInMonth()
      this.getList()
    },
    async getList() {
      this.isSearching = true
      const searchMonth = `${this.year}-${String(this.month).padStart(2, '0')}`

      try {
        const res = await this.$axios({
            method: 'GET',
            url: `/attendances/month/${this.curClassId}/${searchMonth}`,
            params: this.searchParams
        })
        this.$log.debug('get neis List() ok => ', res)

        if(res.data.page.totalElements > 0) {
            const data = res.data._embedded.attendanceMonth
            this.list = data
        }
      } catch (err) {
          this.$log.debug('get neis List() error => ', err)
      }
      this.isSearching = false
    },
    getStatus(item, day) {
      if(!item.attendances === false) {
        const date = `${this.year}-${String(this.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      
        const data = item.attendances[date]
        if(data){
          return {
            isConfirmed: data.isConfirmed,
            attendanceType: data.attendanceType,
            attendanceConfirmType: data.attendanceConfirmType
          }
        }
      }

      return false
    },
    attendanceTypeText: key => ({
      ABSENCE: "결석",
      EARLY_LEAVE: "조퇴",
      LATENESS: "지각",
      OUT: "외출",
      FIELD_STUDY: "결석",
    }[key] || ""),
    attendanceConfirmTypeText: key => ({ ILLNESS: "질병", NOT_ACCEPT: "미인정", ETC: "기타", ATTENDANCE: "출석인정"}[key] || ""),
    attendanceConfirmTypeIcon: (a, b) => ({
      ABSENCE:     { ILLNESS: "♡", NOT_ACCEPT: "♥",  ETC: "▲",  ATTENDANCE: "△" },
      EARLY_LEAVE: { ILLNESS: "＠", NOT_ACCEPT: "◎", ETC: "∽", ATTENDANCE: "▷" },
      LATENESS:    { ILLNESS: "＃", NOT_ACCEPT: "X",  ETC: "≠",  ATTENDANCE: "◁" },
      OUT:         { ILLNESS: "☆", NOT_ACCEPT: "◇", ETC: "＝", ATTENDANCE: "▽" },
      FIELD_STUDY: { ILLNESS: "♡", NOT_ACCEPT: "♥",  ETC: "▲",  ATTENDANCE: "△" },
    }[a] || {})[b] || "",
    calendarPrev() {
      if(this.month === 1) {
        this.year = this.year - 1
        this.month = 12
      } else {
        this.month = this.month - 1
      }
      this.initSearch()
    },
    calendarNext() {
      if(this.month === 12) {
        this.year = this.year + 1
        this.month = 1
      } else {
        this.month = this.month + 1
      }
      this.initSearch()
    },
    calendarSelect(year, month, e) {
        if(e.target.className === 'calendar-select' || e.target.className === 'calendar') {
            let target = e.target
            if(e.target.className === 'calendar') {
                target = e.target.parentElement
            }

            const open = this.$refs.calendarPickerMonthNeis.$el
            if(open.style.display === 'block') {
                open.style.display = 'none'
                const delEl = target.querySelector('.picker-calendar-month')
                if(!delEl === false) delEl.remove()
            } else {
                this.$refs.calendarPickerMonthNeis.calendarYear = year
                this.$refs.calendarPickerMonthNeis.calendarMonth = month
                this.year = year
                this.month = month
                this.search.target = target
                open.style.display = 'block'
                target.append(open)
            }
        }
    },
    choiceMonth(date) {
      this.$refs.calendarPickerMonthNeis.$el.style.display = 'none'
      const delEl = this.search.target.querySelector('.picker-calendar-month')
      delEl.remove()
      this.search.target = ""
      this.year = date.year
      this.month = date.month
      this.initSearch()
    },
    lastDaysInMonth() {
      const now = new Date(this.year, this.month, 0)
      this.days = now.getDate()
      this.$log.debug("this.days", this.days)
    },
    getWeek(day) {
      const now = new Date(`${this.year}-${String(this.month).padStart(2, '0')}-${day}`)
      return now.getDay()
    },
    isHoliday(day) {
      let calenderHolidays = localStorage.getItem('calenderHolidays')
      calenderHolidays = JSON.parse(calenderHolidays)
      const index = calenderHolidays.findIndex(v => v.year === this.year && v.month === this.month && v.day === day)
      
      if(index > -1) {
        return true
      } else {
        return false
      }
    },
    nowDay(day) {
      return (
        this.nowDate.year === this.year && 
        this.nowDate.month === this.month && 
        this.nowDate.day === day
      )
    },
    close() {
      this.$emit("close")
    },
    disappearCalendar(e) {
      const clickCalendarSelect = e.target.classList.contains('calendar')
      if(clickCalendarSelect === false) {
        this.$refs.calendarPickerMonthNeis.$el.style.display = 'none'
        const el = document.querySelector('.calendar-select')
        const delEl = el.querySelector('.picker-calendar-month')
        if(!delEl === false) delEl.remove()
      }
    },
    openNeisMark() {
      this.isOpenNeisMark = !this.isOpenNeisMark
    },
    downloadPdf() {
      this.$toasted.clear()
      this.neisPdfDownload = !this.neisPdfDownload
    },
    async searchAttendanceByStudent(params) {
      try {
        const res = await this.$axios({
          method: 'GET',
          url: '/attendances',
          params: {...params},
          paramsSerializer: (params) => {
              return qs.stringify(params, {arrayFormat: 'repeat'});
          }
        })
        
        if (res.data._embedded && res.data._embedded.attendances.length > 0) {
            return res.data._embedded.attendances.sort((a, b) => b.insertedTimestamp - a.insertedTimestamp)
        }
        return []
      } catch (err) {
          this.$log.debug('searchAttendanceByStudent error => ', err)
      }
    },
    async openAttendanceModal(item, day) {
      const targetDate = `${this.year}-${this.month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
      if(item.attendances && item.attendances[targetDate]) {
        const studentId = item.student.studentId
        const params = {
          classId: this.curClassId,
          studentId,
          attendanceDateBetween: [targetDate, targetDate]
        }
        this.targetList  = await this.searchAttendanceByStudent(params)
        if(this.targetList.length > 1) {
          this.targetStudent = {
            date: `${this.month}월 ${day}일(${this.weekList[this.getWeek(day)]})`,
            name: `${item.student.studentName} 학생`
          }
          this.isOpenNeisTarget = true
        } else if(this.targetList.length === 1) {
          this.modal = {id: this.targetList[0].attendanceId, isShowRegisterModal: false, isShowDetailModal: true, isConfirmdMode: false}
        }
      } else {
        if(this.getWeek(day) === 0 || this.getWeek(day) === 6 || this.isHoliday(day)) {
          this.$hiClass.alert('평일만 선택 가능합니다. (토/일, 공휴일 선택불가)')
        } else {
          this.modal = {id: null, isShowRegisterModal: true, isShowDetailModal: false, isConfirmdMode: false, targetDate, targetStudentId: item.student.studentId}
        }
      }
    },
    closeNeisTarget(id) {
      this.targetList = []
      this.isOpenNeisTarget = false
      if(id) {
        this.modal = {id, isShowRegisterModal: false, isShowDetailModal: true, isConfirmdMode: false}
      }
    },
    openAttendanceRegisterModal: function() {
      this.modal = {id: null, isShowRegisterModal: true, isShowDetailModal: false, isConfirmdMode: false}
    },
    closeAttendanceRegisterModal: async function() {
      this.modal = {id: null, isShowRegisterModal: false, isShowDetailModal: false, isConfirmdMode: false}
      await this.getList()
    },
    showDetail(item) {
      this.detail.studentNo = item.studentNo
      this.detail.studentId = item.studentId
      this.detail.studentName = item.studentName
      this.detail.tagId = item.tagId
      this.detail.tagName = item.tagId ? item.tagName : null
      this.searchDate.month.year = this.year
      this.searchDate.month.month = this.month
      this.openDetail()
    },
    openDetail() {
      if(this.detail.open === false) this.$hiClass.toggleBodyClass('add', 'hidden')
      else this.$hiClass.toggleBodyClass('remove', 'hidden')
      this.detail.open = !this.detail.open
    },
    openAttendanceDetalModal(id) {
      this.$log.debug("NeisModal", id)
      this.$emit('openDetailModal', id)
    },
    closeAttendanceDetailModal: async function(value) {
      this.$hiClass.toggleBodyClass('remove', 'hidden')
      this.modal = {id: value.id, isShowRegisterModal: value.id ? true: false, isShowDetailModal: false, isConfirmdMode: value.isConfirm}
      if(value.isDeleted) {
        await this.getList()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  #attendanceNeisModal {
    #attendanceNeisMarkModal {
      background: rgba(0,0,0,0.7);
      ::v-deep .modal-cont-wrap {
        overflow-y: scroll;
        .modal-cont {
          height: auto;
          min-height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          .modal-cont-inner {
            width:100%;
          }
        }
      }
    }
  }
  .attendance-neis-container {
    height: 100vh;
    display: flex;
    align-items: center;
    flex-direction: column;
    background: #FFF;
    .header-wrap {
      width: 100%;
      height: 59px;
      min-height: 59px;
      background: #223359;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 50px;
      span {
        &.title {
          font-size: 22px;
          font-weight: 700;
          color: #fff;
        }
        &.close {
          width: 24px;
          height: 24px;
          background: url("~@/assets/img/icon/icon_close_white.svg") no-repeat center/cover;
          cursor: pointer;
        }
      }
    }
    .content-wrap {
      width: 100%;
      max-width: 1852px;
      padding: 13px 50px 50px 50px;
      background: #fff;
      .calender-box {
        height: 62px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-bottom: 1px solid #EEEEEE;
        .date {
          display: flex;
          justify-content: center;
          align-items: center;
          span {
            &.calendar-select {
              display: flex;
              margin: 0 34px;
              width: auto;
              font-size: 24px;
              font-weight: 700;
              color: #000000;
              text-align: left;
              justify-content: center;
              align-items: center;
              i {
                &.calendar {
                  display: inline-block;
                  width: 20px;
                  height: 20px;
                  margin-left: 11px;
                  background: url("~@/assets/img/icon/icon_calendar_s3.svg") no-repeat;
                }
              }
            }
            &:not(.calendar-select) {
              cursor: pointer;
            }
            &.prev {
              width: 20px;
              height: 20px;
              background:url('~@/assets/img/icon/icon_calandar_arrow_left.svg') center/cover no-repeat;
            }
            &.next {
              width: 20px;
              height: 20px;
              background:url('~@/assets/img/icon/icon_calandar_arrow_right.svg') center/cover no-repeat;
            }
          }
        }
        .calendar {
          cursor: pointer;
        }
      }
      .info-box {
        height: 44px;
        margin-top: 15px;
        margin-bottom: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 1820px;
        width: auto;
        .class-total {
          display: flex;
          align-items: center;
          .class {
            font-size: 18px;
            font-weight: 700;
            color: #000;
            display: flex;
            align-items: center;
            &::after {
              content: "";
              width: 1px;
              height: 22px;
              background: #D9D9D9;
              display: inline-block;
              margin-left: 10px;
              margin-right: 10px;
            }
          }
          .total {
            font-size: 16px;
            font-weight: 400;
            color: #000;
          }
        }
        .writebox {
          width: auto;
          display: flex;
          gap: 8px;
          align-items: center;
          button {
            width: 133px;
            font-size: 15px;
            border-radius: 6px;
            &.s1 {
              width: 126px;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 44px;
              i {
                &.question {
                  display: inline-block;
                  width: 16px;
                  height: 16px;
                  background:url('~@/assets/img/icon/icon_info_question.svg') center/cover no-repeat;
                  margin-left: 4px;
                }
              }
            }
          }
        }
      }
    }
    .attendance-tbl-contatiner {
      height: auto;
      max-height: calc(100vh - 251px);
      min-height: 143px;
      overflow: auto;
      border: 1px solid #eee;
      &::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      &::-webkit-scrollbar-track {
        background: transparent;
      }
      &::-webkit-scrollbar-thumb {
        background-color: #cfd3db;
        min-height:40px;
        background-clip: padding-box;
        border-radius: 50px;
        border-top: 0;
        border-bottom: 0;
      } 
    }
    table {
      &.tbl-col {
        &.neis {
          width: 1742px;
          border-top: 0;
          border-spacing: 0;
          border-collapse: separate;
          thead {
            tr {
              th {
                height: 44px;
                background: #F9FAFC;
                padding: 0;
                border-right: 1px solid #EEEEEE;
                border-bottom: 1px solid #EEEEEE;
                font-size: 15px;
                font-weight: 500;
                color: #222;
                border-spacing: 0;
                border-collapse: separate;
                &.holiday {
                  color: #FF4E4E;
                }
                span {
                  &.today {
                    display: inline-block;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: var(--primary);
                    font-size: 15px;
                    font-weight: 500;
                    color: #fff;
                    line-height: 36px;
                    text-align: center;
                  }
                }
              }
              &.nb-top {
                th {
                  border-top: 0;
                }
              }
            }
          }
          tbody {
            tr {
              td {
                height: 49px;
                padding: 0;
                font-size: 15px;
                font-weight: 400;
                color: #222;
                border-right: 1px solid #EEEEEE;
                border-bottom: 1px solid #EEEEEE;
                background: #fff;
                line-height: 20px;
                word-break: break-all;
                white-space: normal;
                border-spacing: 0;
                border-collapse: separate;
                padding: 6px 8px;
                span {
                  &.num{
                    font-size: 9px;
                    font-weight: 500;
                    color: #888;
                    height: 14px;
                    display: inline-block;
                    border: 1px solid #888;
                    min-width: 23px;
                    border-radius: 10px;
                    vertical-align: middle;
                    text-align: center;
                    padding: 2px 0;
                  } 
                  &.name {
                    word-break: break-all;
                    white-space: normal;
                    cursor: pointer;    
                  }
                  &.status {
                    display: inline-block;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
                    span {
                      &.mark,
                      &.text {
                        display: inline-block;
                        font-weight: 400;
                      }
                      &.mark {
                        font-size: 15px;
                        color: #222;
                        height: 19px;
                        line-height: 19px;
                      }
                      &.text {
                        font-size: 12px;
                        color: #616161;
                        height: 18px;
                        line-height: 18px;
                      }
                      &.no-chk {
                        display: inline-block;
                        width: 18px;
                        height: 18px;
                        background: url("~@/assets/img/icon/icon_alert_fill_red.svg") no-repeat;
                      }
                      &.no-chk-text {
                        color: #FF6A6A;
                      }
                    }
                  }
                  &.empty {
                    display: block;
                    width: 100%;
                    height: 100%;
                    cursor: pointer;
                    &:hover {
                      background: #4778DE14;
                    }
                  }
                  &.no-use {
                    font-size: 12px;
                    font-weight: 400;
                    color: #22222275;
                    display: block;
                    margin-top: 2px;
                  }
                }
                &.no-day {
                  background: #F3F3F3;
                }
                &.num {
                  line-height: 14px;
                }
                &.no-data {
                  height: auto;
                  padding: 50px;
                  span {
                    display: block;
                    margin-top: 16px;
                    font-size: 16px;
                    font-weight: 400;
                    color: #616161;
                    &.w-img {
                      display: inline-block;
                      width: 64px;
                      height: 64px;
                      background: url("~@/assets/img/icon_excla_mark.svg") no-repeat;
                    }
                  }
                }
              }
              &:last-child {
                td {
                  border-bottom: 0;
                }
              }
            }
          }
        }
      }
    }
  }
</style>