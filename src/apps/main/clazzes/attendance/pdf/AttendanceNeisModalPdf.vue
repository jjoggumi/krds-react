<template>
  <div class="attendance-neis-container-pdf" ref="attendanceNeisPdf" style="background: #fff;">
    <div class="content-wrap">
      <div class="calender-box">
        <div class="date">
          <span class="calendar-select">
            {{ year }}년 {{ month }}월
          </span>
        </div>
      </div>

      <div class="info-box">
        <div class="class-total">
          <span class="class">{{ curClassName }}</span>
          <span class="total">총 {{ list.length }}명</span>
        </div>
      </div>

      <div class="attendance-tbl-contatiner">
        <table class="tbl-col neis">
          <colgroup>
              <col width="71" />
              <col width="152" />
              <col width="49" />
              <col width="49" />
              <col width="49" />
              <col width="49" />
              <col width="49" />
              <col width="49" />
              <col width="49" />
              <col width="49" />
              <col width="49" />
              <col width="49" />
              <col width="49" />
              <col width="49" />
              <col width="49" />
              <col width="49" />
              <col width="49" />
              <col width="49" />
              <col width="49" />
              <col width="49" />
              <col width="49" />
              <col width="49" />
              <col width="49" />
              <col width="49" />
              <col width="49" />
              <col width="49" />
              <col width="49" />
              <col width="49" />
              <col width="49" />
              <col width="49" />
              <col width="49" />
              <col width="49" />
              <col width="49" />
          </colgroup>
          <thead>
            <tr class="nb-top">
                <th rowspan="2">학반</th>
                <th rowspan="2">학생명</th>
                <th v-for="day in days" :key="`day-pdf-${day}`" :class="{
                  'holiday' : 
                  getWeek(day) === 0 || getWeek(day) === 6 || 
                  isHoliday(day) 
                }"><span>{{ day }}</span>
                </th>
                <th v-for="day in remainDays" :key="`day-pdf-w-r-${day}`"></th>
              </tr>
              <tr>
                <th v-for="day in days" :key="`day-pdf-w-${day}`" :class="{
                  'holiday' : 
                  getWeek(day) === 0 || getWeek(day) === 6 || 
                  isHoliday(day) 
                }">{{ weekList[getWeek(day)] }}</th>
                <th v-for="day in remainDays" :key="`day-pdf-w-r2-${day}`"></th>
              </tr>
          </thead>
          <tbody>
            <template v-if="list.length > 0">
              <tr v-for="(item, idx) in list" :key="`neis-stats-pdf-${idx}`">                
                  <td>{{ item.student.tagId ? item.student.tagName : '-' }}</td>
                  <td>                    
                    <span class="num">
                      {{ item.student.studentNo }}
                    </span>
                    <span class="name" @click="showDetail(item.student)">
                    {{ item.student.studentName }}
                    </span>
                    <span class="no-use" v-if="item.student.isUsed === false">(미사용)</span>
                  </td>
                  <td v-for="day in days" :key="`neis-stats-pdf-day-${day}`">
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
                  </td>
                  <td class="no-day" v-for="day in remainDays" :key="`neis-stats-day-no-day-${day}`"></td>
              </tr>
            </template>
            <template v-if="list.length === 0">
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
</template>

<script>
import {mapGetters} from "vuex";
import {mapFields} from "vuex-map-fields";

export default {
  name: "attendance-neis-pdf-modal",
  props: {
    list: Array, 
    year: Number, 
    month: Number,
    days: Number
  },
  data() {
    return {
      weekList: ['일', '월', '화', '수', '목', '금', '토'],
    }
  },
  computed: {
    ...mapGetters({
      curClassName: 'curClassName',
    }),
    ...mapFields({
      htmlPdfDownload: 'htmlPdfDownload',
      htmlPrint: 'htmlPrint',
    }),
    remainDays() {
      return 31 - this.days
    },
  },
  mounted() {
    this.download()
  },
  methods: {
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
    attendanceTypeText(data) {
      switch(data){
        case "ABSENCE":
          return "결석"
           
        case "EARLY_LEAVE":
          return "조퇴"
           
        case "LATENESS":
          return "지각"
           
        case "OUT":
          return "외출"
           
        case "FIELD_STUDY":
          return "결석"
      }
    },
    attendanceConfirmTypeText(data) {
      switch(data){
        case "ILLNESS":
          return "질병"
           
        case "NOT_ACCEPT":
          return "미인정"
           
        case "ETC":
          return "기타"
           
        case "ATTENDANCE":
          return "출석인정"
      }
    },
    attendanceConfirmTypeIcon(a, b) {
      if(a === "ABSENCE") {
        if(b === "ILLNESS") {
          return "♡"
        } else if(b === "NOT_ACCEPT") {
          return "♥"
        } else if(b === "ETC") {
          return "▲"
        } else if(b === "ATTENDANCE") {
          return "△"
        }
      } else if(a === "EARLY_LEAVE") {
        if(b === "ILLNESS") {
          return "＠"
        } else if(b === "NOT_ACCEPT") {
          return "◎"
        } else if(b === "ETC") {
          return "∽"
        } else if(b === "ATTENDANCE") {
          return "▷"
        }
      } else if(a === "LATENESS") {
        if(b === "ILLNESS") {
          return "＃"
        } else if(b === "NOT_ACCEPT") {
          return "X"
        } else if(b === "ETC") {
          return "≠"
        } else if(b === "ATTENDANCE") {
          return "◁"
        }
      } else if(a === "OUT") {
        if(b === "ILLNESS") {
          return "☆"
        } else if(b === "NOT_ACCEPT") {
          return "◇"
        } else if(b === "ETC") {
          return "＝"
        } else if(b === "ATTENDANCE") {
          return "▽"
        }
      } else if(a === "FIELD_STUDY") {
        if(b === "ILLNESS") {
          return "♡"
        } else if(b === "NOT_ACCEPT") {
          return "♥"
        } else if(b === "ETC") {
          return "▲"
        } else if(b === "ATTENDANCE") {
          return "△"
        }
      }
    },
    download() {
      this.$nextTick(function() {
        // const formPdfFileName = `출석부${this.year}${this.month}`
        const ele = this.$refs.attendanceNeisPdf

        this.htmlPrint.content = ele.cloneNode(true)
        this.htmlPrint.isOpen = true

        // const pdfContent = ele.cloneNode(true)
        // const pdfContentHeight = pdfContent.offsetHeight

        // console.log("pdfContentHeight", pdfContentHeight)
        // this.htmlPdfDownload.pdfContent = pdfContent
        // this.htmlPdfDownload.pdfContentHeight = pdfContentHeight
        // this.htmlPdfDownload.fileName = formPdfFileName
        // this.htmlPdfDownload.isOpen = true

        this.$emit('downloadPdfFinish')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .attendance-neis-container-pdf {
    height: auto;
    display: flex;
    align-items: center;
    flex-direction: column;
    background: #FFF;
    z-index: 9999;
    .header-wrap {
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
        }
        .writebox {
          width: 406px;
          display: flex;
          justify-content: space-between;
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
      border: 0;
      border: 1px solid #EEEEEE;
    }
    table {
      &.tbl-col {
        &.neis {
          width: 100%;
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
                span {
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
                  &.num {
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
                    padding: 2px;
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
                &.no-data {
                  height: 735px;
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