<!--
@File(Method): MainBodyClazzesBodyAttendanceList.vue
@Author: -
@Date Created: -
@Description: 출결알리기 > 제출내역
@Modified: 2025-03-17 - #72058 출결알리기 개선 (편리한 기능, 체험학습 개수 제한)-->
<template>
  <div>
    <!-- #72058 출결알리기 개선 - hi-row 그리드 적용 / radio >> selec box로 변경 / 일괄 확인 버튼 추가-->
    <div v-if="clazzMemberRole !== 'MEMBER'" class="attendance-search-group hi-row sm-gutters">
      <HiSelectBox  
        class="col-sm-2"
        :value="attendance.applyListSearch.params.isConfirmed"
        :items="[
          { value: null, title: '전체' },
          { value: false, title: '미 확인' },
          { value: true, title: '확인 완료' }
        ]"
        @update:value="attendance.applyListSearch.params.isConfirmed = $event"
        :empty-title="attendance.applyListSearch.params.isConfirmed || '전체'"          
      />
      <div class="date col-sm-2">
        <p class="input search-month-input">
          <span class="calendar-select" @click="openCalendar($event)">
            {{ 'attendanceMonth' in this.attendance.applyListSearch.params ? `${calendar.year}년 ${calendar.month}월` : '기간 전체' }}
            <i class="calendar"></i>
            <main-body-calendar-picker-month
                v-if="isOpenCalendar"
                style="display:block;"
                :year="calendar.year"
                :month="calendar.month"
                :total="calendar.total"
                @choiceMonth="choiceMonth"
                @choiceAll="choiceAll"
            />
          </span>
        </p>
      </div>
      <div class="col-sm-2">
        <HiButton color="primary" bitrounded size="md" :disabled="!isAnyChecked" @click="onClickConfirmAll" v-if="attendance.applyListSearch.params.isConfirmed !== true">
          일괄 확인완료
        </HiButton> 
      </div>
      <MemberSearch :clazzTags="usedClazzTags" @search="search" class="ml-auto col-sm-4" />
    </div>
    <div
        class="attendance-tbl-container"
        v-infinite-scroll="callAttendancesByClassId"
        :infinite-scroll-disabled="attendance.applyListSearch.isSearchEnd"
        :infinite-scroll-distance="attendance.applyListSearch.scrollLimit"
    >
      <table class="tbl-col fixed">
        <colgroup>
          <col style="width: 100px;">
          <col style="width: 110px;">
          <col style="width: 110px;">
          <col style="width: 150px;">
          <col style="width: auto">
          <col style="width: 110px;">
        </colgroup>
        <thead>
          <tr>
            <th>출결일</th>
            <th>출결 구분</th>
            <th>학반 (태그)</th>
            <th>학생명</th>
            <th>사유</th>
            <th>확인여부</th>
          </tr>
        </thead>
        <tbody v-if="attendance.applyList.length > 0">
          <tr v-for="applyItem of attendance.applyList" :key="applyItem.attendanceId">
            <td>
              <p class="default">
                <!-- #72058 출결알리기 개선 - 체크박스 추가 -->
                <template v-if="clazzMemberRole !== 'MEMBER'">                  
                  <span v-if="!applyItem.isConfirmed" class="attd-checkbox">
                    <input type="checkbox" :id="'checked' + applyItem.attendanceId" v-model="checkedItems[applyItem.attendanceId]"  />
                    <label :for="'checked' + applyItem.attendanceId"></label>
                  </span>
                  <span v-else class="attd-checkbox"> - </span>
                </template>
                {{ $moment(applyItem.attendanceDate).format('YY.MM.DD') }}
                </p>
            </td>
            <td>
               <!-- #72058 출결알리기 개선 - br 태그 추가되어 v-html로 변경 처리 -->
              <p class="status" v-html="setAttendanceStatus(applyItem)"></p>
            </td>
            <td><p class="default">{{ applyItem.student.tagId ? applyItem.student.tagName : '-'  }}</p></td>
            <td class="name-num" role="button" @click="openDetailModal(applyItem.attendanceId)">
              <p class="n-nm-name">
                <span class="tr-num">{{ applyItem.student.studentNo }}</span>
                <span class="default tr-name">{{ applyItem.student.studentName }}</span>
              </p>
            </td>
            <td class="reason-area" role="button" @click="openDetailModal(applyItem.attendanceId)">
              <div class="title-area">
                <p class="title default">
                  {{ applyItem.reason }}
                </p>
                <!-- #72058 출결알리기 개선 - 첨부파일 위치 및 UI 변경 -->
                <div class="file-n" v-if="applyItem.fileExists" @click.stop="openFileList(applyItem.attendanceId)">
                    <HiIcon name="ico-clip" color="default" size="18"></HiIcon>
                    <span class="file-count">{{ applyItem.fileCount }}</span>
                </div>
              </div>
              <p class="desc" v-if="applyItem.memo">
                {{ applyItem.memo }} 
              </p>
            </td>
            <td>
              <div class="attd-check">
                <p :class="{'uncheck': !applyItem.isConfirmed, 'check': applyItem.isConfirmed}">
                  {{ applyItem.isConfirmed ? '확인완료' : '미 확인' }}
                </p>
                <button class="file-add" v-if="applyItem.isConfirmed" @click="openFileRegister(applyItem.attendanceId)">
                  <i class="i-add"></i>
                  <span>첨부파일</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="hi-nodata" v-if="isEmpty">
        <p v-if="isSearch">검색결과가 없습니다.</p>
        <p v-else>제출내역이 없습니다.</p>
      </div>
    </div>

    <attendance-file-register-modal 
      v-if="isFileRegister"
      :attendanceId="fileListAttendanceId"
      :clazzMemberRole="clazzMemberRole"
      :attendanceFileMode="attendanceFileMode"
      @fileAddRegister="fileAddRegister"
      @openFileRegister="openFileRegister"
    />

    <attendance-file-list-modal 
      v-if="isFileList"
      :attendanceId="fileListAttendanceId"
      :clazzMemberRole="clazzMemberRole"
      @fileAddRegister="fileAddRegister"
      @openFileRegister="openFileRegister"
      @openFileList="openFileList"
    />
  </div>
</template>

<script>
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import MainBodyCalendarPickerMonth from "@/apps/main/clazzes/MainBodyCalendarPickerMonth";
import AttendanceFileRegisterModal from "./modal/AttendanceFileRegisterModal"
import AttendanceFileListModal from "./modal/AttendanceFileListModal"
import MemberSearch from "@/components/Search/MemberSearch";

export default {
  name: "main-body-clazzes-body-attendance-list",
  components: {MainBodyCalendarPickerMonth, AttendanceFileRegisterModal, AttendanceFileListModal, MemberSearch},
  data() {
    return {
      isBusy: false,
      isSearchEnd: false,
      scrollLimit: 400,
      isSearch: false,
      isSearchMonth: false,
      isOpenCalendar: false,
      calendar: {
        year: null,
        month: null,
        total: true
      },
      isFileRegister: false,
      isFileList: false,
      fileListAttendanceId: null,
      attendanceFileMode: "write",

      usedClazzTags: [],
      checkedItems: {},  // #72058 출결알리기 개선 - 체크박스 데이터
    }
  },
  props: {
    clazzMemberRole: String
  },
  computed: {
    ...mapState({
      curClassItem: 'curClassItem'
    }),
    ...mapState('storeClazzes', {
      attendance: 'attendance'
    }),
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    }),
    isEmpty() {
      return !this.attendance.applyListSearch.isSearching && this.attendance.applyList.length === 0
    },
    //  // #72058 출결알리기 개선 - 체크된 항목이 하나라도 있는지 확인
    isAnyChecked() {
      return Object.values(this.checkedItems).some(value => value);
    }
  },
  methods: {
    ...mapActions('storeClazzes', ['callAttendancesByClassId']),
    ...mapMutations('storeClazzes', [
      'setAttendanceApplyList',
      'setAttendanceApplyListSearchParams',
      'clearAttendanceApplyListSearch'
    ]),
    setAttendanceStatus(attendance) {
       let attendanceStatus = this.CONSTANTS.ATTENDANCE_TYPE[attendance.attendanceType]
      if (attendance.isConfirmed) {
        if (attendanceStatus === '가정 체험학습') {
          attendanceStatus += `<br>(${this.CONSTANTS.ATTENDANCE_RESULT[attendance.attendanceConfirmType]})`
        } else {
          attendanceStatus += `(${this.CONSTANTS.ATTENDANCE_RESULT[attendance.attendanceConfirmType]})`
        }
      }
       return attendanceStatus
    },
    openDetailModal(id) {
      this.$emit('openDetailModal', id)
    },
    searchAttendances() {
      this.isSearch = this.attendance.applyListSearch.params.studentName.trim() !== '' ||
          this.attendance.applyListSearch.params.tagId.length > 0
      this.callAttendancesByClassId({init: true, isDeleted: false})
    },
    openCalendar(e) {
      if (!(e.target.className === 'calendar' || e.target.className === 'calendar-select')) return
      this.isOpenCalendar = !this.isOpenCalendar
    },
    choiceMonth(data) {
      for (const [key, value] of Object.entries(data)) {
        this.calendar[key] = value
      }
      this.isSearchMonth = true
      this.isOpenCalendar = false
      let attendanceMonth = `${this.calendar.year}-${this.calendar.month < 10 ? `0${this.calendar.month}` : this.calendar.month}`
      this.setAttendanceApplyListSearchParams({attendanceMonth: attendanceMonth})
      this.callAttendancesByClassId({init: true, isDeleted: false})
    },
    choiceAll() {
      if ('attendanceMonth' in this.attendance.applyListSearch.params) {
        this.isSearchMonth = false
        delete this.attendance.applyListSearch.params.attendanceMonth
      }
      this.isOpenCalendar = false
      this.callAttendancesByClassId({init: true, isDeleted: false})
    },
    setCurYearMonth() {
      this.calendar.year = parseInt(this.$moment().format('YYYY'))
      this.calendar.month = parseInt(this.$moment().format('M'))
    },
    openFileRegister(id = null, mode ="write") {
      this.fileListAttendanceId = id
      this.attendanceFileMode = mode
      this.isFileRegister = !this.isFileRegister
    },
    openFileList(id = null) {
      this.fileListAttendanceId = id
      this.isFileList = !this.isFileList
    },
    fileAddRegister(id) {
      this.$emit("fileAddRegister", id)
    },
    search({ searchType, searchValue }) {
      if (searchType === 'KEYWORD') {
        this.attendance.applyListSearch.params.studentName = searchValue
      } else if (['TAG', 'TAG_MULTI'].includes(searchType)) {
        this.attendance.applyListSearch.params.tagId = searchValue
      } else {
        this.attendance.applyListSearch.params.studentName = ''
        this.attendance.applyListSearch.params.tagId = []
      }
      this.searchAttendances()
    },
    async getUsedClazzTags() {
      try {
        const res = await this.$axios.get(`/clazzes/${this.curClassItem.currentId}/tags`, { params: {isUsedClazzStudents: true} } )
        this.usedClazzTags = [...res.data._embedded.clazzTags]
      } catch(err) {
        this.usedClazzTags = []
      }
    },
    onClickConfirmAll() {
      this.$emit('openConfirmAllModal', Object.keys(this.checkedItems).filter(key => this.checkedItems[key]))
    },
    clearCheckedItems () {
      this.checkedItems = {}
    }
  },
  created() {
    if (this.clazzMemberRole === 'MEMBER') {
      this.setAttendanceApplyListSearchParams({isConfirmed: null, sort: ['attendanceDate,desc', 'insertedTimestamp,desc']})
    } else {
      const isConfirmed = null
      this.setAttendanceApplyListSearchParams({sort: ['attendanceDate,desc', 'insertedTimestamp,desc'], isConfirmed: isConfirmed})
    }
    this.setCurYearMonth()
    this.setAttendanceApplyListSearchParams({classId: this.curClassItem.currentId})
    this.getUsedClazzTags()
  },
  mounted() {
    const isAttendanceUnCheckedAlarmMove = localStorage.getItem('attendanceUnCheckedAlarmMove')

    if(JSON.parse(isAttendanceUnCheckedAlarmMove) === true) {
      this.attendance.applyListSearch.params.isConfirmed = false
      localStorage.setItem('attendanceUnCheckedAlarmMove', JSON.stringify(false))
    }
  },
  beforeDestroy() {
    this.clearAttendanceApplyListSearch()
    this.setAttendanceApplyList([])
  },
  watch: {
    'attendance.applyListSearch.params.isConfirmed'(newVal, oldVal) {
      if (oldVal === null && (newVal === false || newVal === true)) { // 전체 -> 미확인
        // 월 검색 했으면
        if ('attendanceMonth' in this.attendance.applyListSearch.params) {
          this.isSearchMonth = false
          this.setCurYearMonth()
          delete this.attendance.applyListSearch.params.attendanceMonth
        }
      }

      if (newVal === null || newVal === true) { // 전체
        if (this.clazzMemberRole === 'OWNER' || this.clazzMemberRole === 'MANAGER') {
          this.setAttendanceApplyListSearchParams({sort: 'attendanceDate,desc'})
        }
      }

      if (newVal === false) { // 전체가 아닐 경우 (확인, 미확인)
        if (this.clazzMemberRole === 'OWNER' || this.clazzMemberRole === 'MANAGER') {
          this.setAttendanceApplyListSearchParams({sort: ['attendanceDate,asc', 'insertedTimestamp,desc']})
        }
      }

      this.isSearch = false
      this.callAttendancesByClassId({init: true, isDeleted: false})
    }
  }
}
</script>

<style scoped lang="scss">
.member-search{
  width: 250px;
  background: none;
  border: 0;
  padding: 0;
}
/* 출결알리기 제출내역 검색 영역 */
.attendance-search-group {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    
    .date p.input span.calendar-select {
        display: inline-block;
        width: 140px;
        height: 40px;
        border-radius: 4px;
        border: 1px solid #E0E0E0;
        font-size: 15px;
        font-weight: 400;
        line-height: 38px;
        padding: 0 10px;
        cursor: pointer;
        position: relative;
    }
    .date p.input span .calendar {
        display: inline-block;
        position: absolute;
        top: 50%;
        right: 10px;
        transform: translateY(-50%);
        width: 18px;
        height: 18px;
        background: url(~@/assets/img/icon/icon_calendar_s3.svg) no-repeat;
    }
}
.hi-selectbox::v-deep{
  .selected.default{
    color: #222;
  }
  .option__layer{
    left: 6px;
    right: 6px;
    width: auto;
  }
}
.attendance-tbl-container {
  .tbl-col {
    tbody {
      tr {
        td {
          p {
            &.desc {
              display: block;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
              max-width: 380px;
            }
          }
          span {
            font-size: 15px;
          }
          div {
            &.file-n {
              display: flex;
              align-items: center;
              justify-content: center;
              background: #F3F4F8;
              height: 23px;
              margin-left: 4px;
              border-radius: 50px;
              padding: 5px 7px;
              .hi-ico{
                padding: 0;
                width: 16px;
                height: 16px;
                min-width: 16px;
                min-height: 16px;
                border: 0;
                margin-top: -1px;
              }
            }
            &.attd-check {
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            }
          }
          button {
            &.file-add {
              border: 1px solid #9E9E9E;
              border-radius: 4px;
              width: 82px;
              height: 28px;
              display: flex;
              justify-content: center;
              align-items: center;
              span {
                display: inline-block;
                color: #222222;
                font-size: 13px;
                font-weight: 400;
                line-height: 26px;
              }
              i {
                &.i-add {
                  display: inline-block;
                  width: 16px;
                  height: 16px;
                  background: url("~@/assets/img/icon/ic_plus_2.svg") no-repeat;
                }
              }
            }
          }
        }
        .status {
          font-weight: 400;
          color: var(--primary);
        }
        .n-nm-name {
          width: 100%;
          display: flex;
          align-items: flex-start;
        }
        .default {
          color: #222222;
          .attd-checkbox{
            margin-right: 5px;
            width: 20px;
            display: inline-block;
          }
        }
        .tr-num {
          border: 1px solid  #9E9E9E;
          width: 28px;
          min-width: 28px;
          height: 18px;
          border-radius: 20px;
          font-size: 12px;
          line-height: 16px;
          color: #616161;
          margin-right: 6px;
          display: inline-block;
          float: left;
        }
        .tr-name {
          max-width: 105px;
          line-height: 18px;
          text-align: left;
          float: left;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          word-break: break-all;
        }
        .uncheck{
          color: #FF6A6A;
          line-height: 23px;
        }
        .check{
          color: #9E9E9E;
          line-height: 23px;
        }
        .reason-area {
          padding-left: 10px;
        }
        .title-area {
          max-width: 340px;
          display: flex;
        }
        .title{
          display: block;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-weight: 400;
          &:hover{
            text-decoration: underline;
          }
        }
        span {
          &.file-count {
            display: inline-block;
            cursor: pointer;
            font-size: 13px;
            font-weight: 400;
            color: #616161;
          }
        }
      }
    }
  }
}
</style>