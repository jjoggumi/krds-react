<!--
@File(Method): AttendanceStatDetailModal.vue
@Author: -
@Date Created: -
@Description: 출결알리기 > 학생별 통계 > 학생별 출결현황 모달
@Modified: 2025-03-17 - #72058 출결알리기 개선 (편리한 기능, 체험학습 개수 제한) - himodal 적용 / 
-->
<template>
  <div>
    <HiModal type="type01" size="xl" @close="close">
      <template v-slot:heading>학생별 출결현황</template>
      <template v-slot:content> 
        <div class="attendance-model-stat">
          <div class="search-wrap">
            <div class="search">
                <label>학반</label>
                <div
                    class="hi-selectbox"
                    :class="{'is-opened' : openClazzTags}"
                    ref="hiSelectboxTag"
                    v-click-outside="disappearTagSelectBox"
                >
                    <button class="selected" @click="[openClazzTags = !openClazzTags]">
                      {{ select.tagId ? select.tagName : '-' }}
                    </button>
                    <div class="option__layer">
                        <button class="option"
                          v-for="(tag, idx) in usedClazzTags" :key="`student-${idx}`"
                          @click="selectTag(tag)"
                        >
                          <span class="icon-color"></span>{{ tag.tagName }}
                        </button>
                    </div>
                </div>
            </div>
            <div class="search">
                <label>학생명</label>
                <div class="hi-selectbox"
                  :class="{
                    ' is-opened' : openStudent
                  }"
                  ref="hiSelectboxStudent"
                  v-click-outside="disappearSelectBox1"
                >
                    <button class="selected" @click="[openStudent = !openStudent]">{{ select.student.studentNo }}번 {{ select.student.studentName }}</button>
                    <div class="option__layer">
                        <button class="option"
                          v-for="(clazzStudent, idx) in studentList" :key="`student-${idx}`"
                          @click="selectStudent(clazzStudent)"  
                        >
                          <span class="icon-color"></span>{{ clazzStudent.studentNo }}번 {{ clazzStudent.studentName }}
                        </button>
                    </div>
                </div>
            </div>
            <div class="search">
                <label>출결구분</label>
                <div class="hi-selectbox"
                  :class="{
                    ' is-opened' : openAttendance
                  }"
                  ref="hiSelectboxAttendance"
                  v-click-outside="disappearSelectBox2"
                >
                    <button class="selected" @click="[openAttendance = !openAttendance]" :disabled="detailAttendanceOk">{{ getAttendanceType(select.attendanceType) }}</button>
                    <div class="option__layer">
                      <button class="option"
                        v-for="(attendance, idx) in attendances" :key="`attendance-${idx}`"
                        @click="selectAttendanceType(attendance)" 
                      >
                        <span class="icon-color"></span>
                        {{ getAttendanceType(attendance) }}
                      </button>
                    </div>
                </div>
            </div>

            <div class="search">
                <input type="checkbox" name="search-filter" id="send-push" v-model="detailAttendanceOk" :checked="detailAttendanceOk">
                <label for="send-push"><span>출석인정만 보기</span></label>
            </div>
          </div>
          
          <div class="info-wrap">
              <div class="top">
                  <p>
                      {{  textPeriod }}
                  </p>
                  
                  <button class="hi-btn btn-md btn-line s1" @click="downloadExcelList">
                      <i class="icon-excel"></i>
                      <strong>엑셀 다운로드</strong>
                  </button>
              </div>
              <template v-if="getAttendanceCheck">
                <div class="stat">
                  <p 
                    :class="{
                      'selected' : select.attendanceOnlyOkType === ''
                    }"
                  >
                    전체: <span @click="selectAttendanceOnlyOkType('')">{{ total.total }}건</span>
                  </p>
                  <p 
                    :class="{
                      'selected' : select.attendanceOnlyOkType === 'ABSENCE'
                    }"
                  >
                      결석: <span @click="selectAttendanceOnlyOkType('ABSENCE')">{{ total.absence }}건</span>
                  </p>
                  <p 
                    :class="{
                      'selected' : select.attendanceOnlyOkType === 'EARLY_LEAVE'
                    }"
                  >
                      조퇴: <span @click="selectAttendanceOnlyOkType('EARLY_LEAVE')">{{ total.earlyLeave }}건</span>
                  </p>
                  <p 
                    :class="{
                      'selected' : select.attendanceOnlyOkType === 'LATENESS'
                    }"
                  >
                      지각: <span @click="selectAttendanceOnlyOkType('LATENESS')">{{ total.lateness }}건</span>
                  </p>
                  <p 
                    :class="{
                      'selected' : select.attendanceOnlyOkType === 'OUT'
                    }"
                  >
                      외출: <span @click="selectAttendanceOnlyOkType('OUT')">{{ total.out }}건</span>
                  </p>                      
                  <p 
                    :class="{
                      'selected' : select.attendanceOnlyOkType === 'FIELD_STUDY'
                    }"
                  >
                      가정 체험학습: <span @click="selectAttendanceOnlyOkType('FIELD_STUDY')">{{ total.fieldStudy ?? 0 }}건</span>
                  </p>
                </div>
              </template>
              <template v-else>
                <div class="stat" v-if="select.attendanceType === ''">
                  <p>
                      결석: <span @click="selectAttendanceType('ABSENCE')">{{ total.absence }}건</span>
                  </p>
                  <p>
                      조퇴: <span @click="selectAttendanceType('EARLY_LEAVE')">{{ total.earlyLeave }}건</span>
                  </p>
                  <p>
                      지각: <span @click="selectAttendanceType('LATENESS')">{{ total.lateness }}건</span>
                  </p>
                  <p>
                      외출: <span @click="selectAttendanceType('OUT')">{{ total.out }}건</span>
                  </p>                      
                  <p>
                      가정 체험학습: <span @click="selectAttendanceType('FIELD_STUDY')">{{ total.fieldStudy }}건</span>
                  </p>
                </div>
                
                <div class="stat" v-else>
                  <p 
                    :class="{
                      'selected' : select.attendanceConfirmType === ''
                    }"
                  >
                    전체: <span @click="selectAttendanceConfirmType('')">{{ total.total }}건</span>
                  </p>
                  <p v-if="!isFieldStudySelected"
                    :class="{
                      'selected' : select.attendanceConfirmType === 'ILLNESS'
                    }"
                  >
                    질병: <span @click="selectAttendanceConfirmType('ILLNESS')">{{ total.illness }}건</span>
                  </p>
                  <p 
                    :class="{
                      'selected' : select.attendanceConfirmType === 'NOT_ACCEPT'
                    }"
                  >
                    미인정: <span @click="selectAttendanceConfirmType('NOT_ACCEPT')">{{ total.notAccept }}건</span>
                  </p>
                  <p v-if="!isFieldStudySelected"
                    :class="{
                      'selected' : select.attendanceConfirmType === 'ETC'
                    }"
                  >
                    기타: <span @click="selectAttendanceConfirmType('ETC')">{{ total.etc }}건</span>
                  </p>
                  <p 
                    :class="{
                      'selected' : select.attendanceConfirmType === 'ATTENDANCE'
                    }"
                  >
                    출석인정: <span @click="selectAttendanceConfirmType('ATTENDANCE')">{{ total.attendance }}건</span>
                  </p>
                </div>
              </template>
          </div>  

          <div class="tbl-wrap">
              <div class="attendance-tbl-contatiner">
                  <table class="tbl-col">
                      <colgroup>                            
                          <col width="110" />
                          <col width="70" />
                          <col width="90" />
                          <col width="110" />
                          <col width="110" />
                          <col width="auto" />
                      </colgroup>
                      <thead>
                          <tr>
                              <th>학반</th>
                              <th>번호</th>
                              <th>출결일</th>
                              <th>출결 구분</th>
                              <th>상세 구분</th>
                              <th>사유</th>
                          </tr>
                      </thead>
                      <tbody>
                        <template v-if="list.length > 0">
                          <tr v-for="(item, idx) in list" :key="`attendance-list-${idx}`" @click="openAttendanceDetalModal(item.attendanceId)">
                              <td>{{ item.student.tagId ? item.student.tagName : '-' }}</td>
                              <td>{{ item.student.studentNo }}</td>
                              <td>{{ item.attendanceDate.split("-").join(".") }}</td>
                              <td><span class="atd">{{ getAttendanceType(item.attendanceType) }}</span></td>
                              <td><span class="detail">{{ getAttendanceConfirmType(item.attendanceConfirmType) }}</span></td>
                              <td class="ml reason"><span class="reason">{{ item.reason }}<i class="icon-file-gray" v-if="item.fileExists"></i></span></td>
                          </tr>
                        </template>

                        <template v-if="list.length === 0 && !isSearching">
                          <tr>
                              <td colspan="6" class="no-data">
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
        <attendance-stat-detail-modal-excel
          v-if="statDetailModalExcelDownload"
          :list="list"
          :select="select"
          :detailAttendanceOk="detailAttendanceOk"
          @downloadFinish="downloadExcelList"
        />

        <attendance-register-modal 
          v-if="modal.isShowRegisterModal"
          :id="modal.id"
          :clazzMemberRole="clazzMemberRole"
          :isConfirmMode="modal.isConfirmdMode"
          :isNeis="true"
          @close="closeAttendanceRegisterModal" 
        />

        <attendance-detail-modal
          v-if="modal.isShowDetailModal"
          :id="modal.id"
          :clazzMemberRole="clazzMemberRole"
          :isNeis="true"
          @close="closeAttendanceDetailModal"
        />
      </template>    
  </HiModal>
  </div>
</template>

<script>
import {mapActions, mapGetters} from "vuex";
import AttendanceStatDetailModalExcel from "../excel/AttendanceStatDetailModalExcel"
import AttendanceRegisterModal from "./AttendanceRegisterModal";
import AttendanceDetailModal from "./AttendanceDetailModal";


export default {
name: "attendance-stat-detail-modal",
components: {
  AttendanceStatDetailModalExcel,
  AttendanceRegisterModal,
  AttendanceDetailModal
},
props: {
  model : Object,
  filter : String,
  date : Object,
  detailAttendanceType: String, 
  detailAttendanceConfirmType: String,
  detailAttendanceOk: Boolean,
  clazzMemberRole: String
  
},
data() {
  return {
    searchParams : {
      isConfirmed : true,
      page : 0, 
      size : 1000,
      sort : 'asc'                  
    },
    list: [],
    clazzStudents: [],
    usedClazzTags: [],
    openClazzTags: false,
    openStudent: false,
    openAttendance: false,
    attendances: ['', 'ABSENCE', 'EARLY_LEAVE', 'LATENESS', 'OUT', 'FIELD_STUDY'],
    select: {
      student: {},
      attendanceType: "",
      attendanceOnlyOkType: "",
      attendanceConfirmType: "",
      tagId: null,
      tagName: ''
    },
    total : {
      total: 0,
      absence: 0, 
      earlyLeave: 0,
      lateness: 0,
      out: 0,
      illness: 0,
      notAccept: 0, 
      etc: 0,
      attendance: 0
    },
    textPeriod: "",
    searchPeriod: "",
    statDetailModalExcelDownload: false,
    isSearching: false,
    isRefesh: false,
    modal: {
      id: null,
      isShowRegisterModal: false,
      isShowDetailModal: false,
      isConfirmdMode: false,
    }
  }
},
computed: {
  ...mapGetters({
    curClassId: 'curClassId'
  }),
  getConfirmTypeTotalCounter() {
    if(this.getAttendanceCheck === true) {
      return this.total.absence + this.total.earlyLeave + this.total.lateness + this.total.out
    } else {
      return this.total.illness + this.total.notAccept + this.total.etc + this.total.attendance
    }
  },
  getAttendanceCheck() {
    return this.detailAttendanceOk
  },
  studentList() {
    return this.clazzStudents.filter(s => {
      const notUsedDate = this.$moment(s.notUsedTimestamp).format('YYYYMM')
      const standardDate = this.filter === 'month' 
        ? `${this.date.month.year}${(this.date.month.month.toString()).padStart(2, '0')}`
        : `${this.date.period.start.year}${(this.date.period.start.month.toString()).padStart(2, '0')}`

      return ( s.isUsed || (notUsedDate && (parseInt(standardDate, 10) <= parseInt(notUsedDate, 10))) ) &&
          this.select.tagId === s.tagId
    })
  },
  isFieldStudySelected () {
    return this.select.attendanceType === 'FIELD_STUDY'
  },
},
watch: {
  getAttendanceCheck(v) {
    this.select.attendanceType = ''
    this.getList()
  }
}, 
mounted() {
  this.init()
  this.getUsedClazzTags()
},
created() {},
methods: {
  init() {
    if(this.filter === 'month') {
      this.textPeriod = `${this.date.month.year}년 ${this.date.month.month}월`
      this.searchPeriod = `attendanceMonth=${this.date.month.year}-${String(this.date.month.month).padStart(2, '0')}`
    } else {
      this.textPeriod = `${this.date.period.start.year}년 ${this.date.period.start.month}월 ~ ${this.date.period.end.year}년 ${this.date.period.end.month}월`
      this.searchPeriod = `attendanceDateBetween=${this.date.period.start.year}-${String(this.date.period.start.month).padStart(2, '0')}-01&attendanceDateBetween=${this.date.period.end.year}-${String(this.date.period.end.month).padStart(2, '0')}-31`
    }
    this.select.attendanceType = this.detailAttendanceType
    this.select.attendanceConfirmType = this.detailAttendanceConfirmType
    this.getStudents()
  },
  async getStudents() {
    this.isSearching = true
    const clazzStudentsParams = {
      isAll: true,
      page: 0,
      size: 1000,
      sort: 'studentNo,asc'
    }

    const res = await this.$axios({
      method: 'GET',
      url: `/clazzStudents/clazz/${this.curClassId}`,
      params: clazzStudentsParams
    })

    if (res.data.page.totalElements > 0) {
      this.clazzStudents = res.data._embedded.clazzStudents
    }
    this.select.student.studentNo = this.model.studentNo
    this.select.student.studentId = this.model.studentId
    this.select.student.studentName = this.model.studentName
    this.select.tagId = this.model.tagId
    this.select.tagName = this.model.tagName
    await this.getList()
    this.isSearching = false
  },
  async getUsedClazzTags() {
    try {
      const res = await this.$axios.get(`/clazzes/${this.curClassId}/tags`, { params: {isUsedClazzStudents: true} } )
      this.usedClazzTags = [...res.data._embedded.clazzTags]
    } catch(err) {
      this.usedClazzTags = []
    }
  },
  selectTag(tag) {
    this.select.tagId = tag.tagId
    this.select.tagName = tag.tagName
    this.openClazzTags = false

    if (!this.studentList.some(s => s.studentId === this.select.student.studentId)) {
      this.select.student = this.studentList[0]
    }
    this.getList()
  },
  selectStudent(student) {
    this.select.student = student
    this.select.attendanceConfirmType = ""
    this.openStudent = false
    this.getList()
  },
  selectAttendanceType(type) {
    this.$log.debug("attendance type => ", type)
    this.select.attendanceType = type
    this.select.attendanceConfirmType = ""
    this.openAttendance = false
    this.getList()
  },
  selectAttendanceOnlyOkType(type) {
    this.$log.debug("attendance type => ", type)
    this.select.attendanceOnlyOkType = type
    this.getList()
  },
  selectAttendanceConfirmType(confirmType) {
    this.$log.debug("attendance type => ", confirmType)
    this.select.attendanceConfirmType = confirmType
    this.getList()
  },
  async getList() {
    const search = {
      classId : this.curClassId,
      studentId : this.select.student.studentId,
      studentName : this.select.student.studentName,
    }

    if(this.getAttendanceCheck === true) {
      if(this.select.attendanceOnlyOkType) {
        search.attendanceType = this.select.attendanceOnlyOkType
      }
      search.attendanceConfirmType = "ATTENDANCE"
    } else {
      if(this.select.attendanceType) {
        search.attendanceType = this.select.attendanceType

        if(this.select.attendanceConfirmType) {
          search.attendanceConfirmType = this.select.attendanceConfirmType
        }
      }
    }

    const params = {
      ...this.searchParams, 
      ...search
    }

    this.$log.debug("params => ", params)

    const res = await this.$axios({
      method: 'GET',
      url: `/attendances?${this.searchPeriod}`,
      params: params
    })

    this.$log.debug("list res => ", res)
    
    if(res.data.page.totalElements > 0) {
      this.list = res.data._embedded.attendances
      this.list.sort((a, b) => {
        if(a.attendanceDate > b.attendanceDate) return 1;
        else if(a.attendanceDate < b.attendanceDate) return -1;
        else if(a.attendanceDate === b.attendanceDate) {
          const x = a.insertedTimestamp
          const y = b.insertedTimestamp

          return x == y ? 0 : x > y ? 1 : -1
        }
      })
    } else {
      this.list = []
    }

    if(this.getAttendanceCheck === true) {
      this.getAttendanceTotals()
    } else {
      this.getTotals()
    }

    if(this.select.attendanceType) {
      this.getConfirmTypeTotals()
    }
  },
  getTotals() {
    this.total.total = this.list.length
    this.total.absence = this.list.filter(v => v.attendanceType === 'ABSENCE').length
    this.total.earlyLeave = this.list.filter(v => v.attendanceType === 'EARLY_LEAVE').length
    this.total.lateness = this.list.filter(v => v.attendanceType === 'LATENESS').length
    this.total.out = this.list.filter(v => v.attendanceType === 'OUT').length
    this.total.fieldStudy = this.list.filter(v => v.attendanceType === 'FIELD_STUDY').length
  },
  async getAttendanceTotals() {
    const res = await this.$axios({
        method: 'GET',
        url: `/attendances/stats/${this.curClassId}?${this.searchPeriod}`,
        params: {
          studentId: this.select.student.studentId,
          attendanceConfirmType: 'ATTENDANCE',
          page: 0, 
          size: 1000   
        }
    })
    const data = res.data._embedded.attendanceStats[0]
    this.setAttendanceTotal(data)
  },
  async getConfirmTypeTotals() {
    const res = await this.$axios({
        method: 'GET',
        url: `/attendances/stats/${this.curClassId}?${this.searchPeriod}`,
        params: {
          studentId: this.select.student.studentId,
          attendanceType: this.select.attendanceType,
          page: 0, 
          size: 1000   
        }
    })
    const data = res.data._embedded.attendanceStats[0]
    this.setAttendanceConfirmTypeTotal(data)
  },
  setAttendanceTotal(item) {
    this.total.absence = item.absenceAttendance
    this.total.earlyLeave = item.earlyLeaveAttendance
    this.total.lateness = item.latenessAttendance
    this.total.out = item.outAttendance
    this.total.fieldStudy = item.fieldStudyAttendance
    this.total.total = item.absenceAttendance + item.earlyLeaveAttendance + item.latenessAttendance + item.outAttendance + item.fieldStudyAttendance
  },
  setAttendanceConfirmTypeTotal(item) {
    if(this.select.attendanceType === 'ABSENCE') {
      this.total.illness = item.absenceIllness
      this.total.notAccept = item.absenceNotAccept
      this.total.etc = item.absenceEtc
      this.total.attendance = item.absenceAttendance
      this.total.total = item.absenceIllness + item.absenceNotAccept + item.absenceEtc + item.absenceAttendance + item.fieldStudyAttendance
    } else if(this.select.attendanceType === 'EARLY_LEAVE') {
      this.total.illness = item.earlyLeaveIllness
      this.total.notAccept = item.earlyLeaveNotAccept
      this.total.etc = item.earlyLeaveEtc
      this.total.attendance = item.earlyLeaveAttendance
      this.total.total = item.earlyLeaveIllness + item.earlyLeaveNotAccept + item.earlyLeaveEtc + item.earlyLeaveAttendance
    } else if(this.select.attendanceType === 'LATENESS') {
      this.total.illness = item.latenessIllness
      this.total.notAccept = item.latenessNotAccept
      this.total.etc = item.latenessEtc
      this.total.attendance = item.latenessAttendance
      this.total.total = item.latenessIllness + item.latenessNotAccept + item.latenessEtc + item.latenessAttendance
    } else if(this.select.attendanceType === 'OUT') {
      this.total.illness = item.outIllness
      this.total.notAccept = item.outNotAccept
      this.total.etc = item.outEtc
      this.total.attendance = item.outAttendance
      this.total.total = item.outIllness + item.outNotAccept + item.outEtc + item.outAttendance
    } else if(this.select.attendanceType === 'FIELD_STUDY') {
      this.total.illness = 0
      this.total.notAccept = item.fieldStudyNotAccept
      this.total.etc = 0
      this.total.attendance = item.fieldStudyAttendance
      this.total.total = item.fieldStudyNotAccept + item.fieldStudyAttendance
    }
  },
  getAttendanceType: type => ({
    ABSENCE: "결석",
    EARLY_LEAVE: "조퇴",
    LATENESS: "지각",
    OUT: "외출",
    FIELD_STUDY: "가정 체험학습"
  }[type] || "전체"),
  getAttendanceConfirmType: type => ({
    ILLNESS: "질병",
    NOT_ACCEPT: "미인정",
    ETC: "기타",
    ATTENDANCE: "출석인정"
  }[type] || ''),
  downloadExcelList() {
    this.statDetailModalExcelDownload = !this.statDetailModalExcelDownload
  },
  close() {
    this.$emit("openDetail", this.isRefesh)
  },
  disappearTagSelectBox() {
    this.openClazzTags = false
    const el = this.$refs.hiSelectboxTag
    el.classList.remove('is-opened')
  },
  disappearSelectBox1() {
    this.openStudent = false
    const el = this.$refs.hiSelectboxStudent
    el.classList.remove('is-opened')
  },
  disappearSelectBox2() {
    this.openAttendance = false
    const el = this.$refs.hiSelectboxAttendance
    el.classList.remove('is-opened')
  },
  closeAttendanceRegisterModal: async function(id) {
    this.modal = {id: null, isShowRegisterModal: false, isShowDetailModal: false, isConfirmdMode: false}
    await this.getList()
  },
  openAttendanceDetalModal(id) {
    this.modal = {id, isShowRegisterModal: false, isShowDetailModal: true, isConfirmdMode: false}
  },
  closeAttendanceDetailModal: async function(value) {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
    this.modal = {id: value.id, isShowRegisterModal: value.id ? true: false, isShowDetailModal: false, isConfirmdMode: value.isConfirm}
    if(value.isDeleted) {
      await this.getList()
    }
  }
},
}
</script>

<style scoped lang="scss">
.attendance-model-stat {
  position: relative;
  width: 100%;
  border-radius: 16px;
  background: #fff;  
}
.search-wrap {
  width: 100%;
  height: 70px;
  background: #FAFAFA;
  border-radius: 8px;
  margin: 0 auto;
  padding: 15px 20px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  div.search {
    margin-right: 16px;
    display: flex;
    align-items: center;
  }
  div.search label {
    margin-right: 12px;
    font-size: 15px;
    font-weight: 500;
    color: #616161;
  }
  div.search .hi-selectbox {
    width: 135px;
  }
  div.search + .search + .search + .search{margin-right: 0px;}
}

.info-wrap {
  width: 100%;
  height: 98px;
  margin: 0 auto;
  margin-top: 27px;
  margin-bottom: 25px;
  .top {
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 40px;
    margin-bottom: 8px;
  }
  .top p {
    margin-top: 13px;
    font-size: 18px;
    font-weight: 700;
    color: #222;
  }
  .top button {
    width: 176px;
    height: 40px;
    border-radius: 20px;
    border: 1px solid #267E4E;
    color: #267E4E;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .stat {
    height: 50px;
    border-top: 1px solid #222;
    border-bottom: 1px solid #E0E0E0;
    display: flex;
    justify-content: flex-start;
  }
  .stat p {
    padding: 13px 0 12px 0;
    display: flex;
    align-items: center;
    font-size: 15px;
    font-weight: 400;
    color: #222;
  }
  .stat p:before {
    content: "";
    display: inline-block;
    margin-left: 10px;
  }
  .stat p:not(:last-child):after {
    content: "";
    width: 1px;
    height: 18px;
    background: #E0E0E0;
    display: inline-block;
    margin-right: -100%;
    margin-left: 10px;
  }
  .stat p span {
    display: inline-block;
    font-size: 15px;
    font-weight: 500;
    color: #616161;
    margin-left: 6px;
  }
  .stat p span:hover {
    text-decoration: underline;    
  }
  .stat p.selected {
    font-weight: 700;
    color: var(--primary);
  }
  .stat p.selected span {
    color: var(--primary);
  }
}
.tbl-wrap {
  width: 100%;
  height: 376px;
  margin: 0 auto;
  border: 1px solid #E0E0E0;
  padding: 12px 9px;
  overflow: auto;
  &::-webkit-scrollbar {
      width: 8px;
  }
  &::-webkit-scrollbar-track {
      background: transparent;
  }
  &::-webkit-scrollbar-thumb {
      background-color: #cfd3db;
    min-height:40px;
      background-clip: padding-box;
      border: 2px solid transparent;
      border-radius: 50px;
      border-top: 0;
      border-bottom: 0;
  }
  table tbody tr {
      cursor: pointer;
  }
  table tbody tr td span {
      font-weight: 500;
  }
  table tbody tr td span.atd {
      color: var(--primary);
  }
  table tbody tr td span.reason {
      cursor: pointer;
  }
  table tbody tr td span.reason:hover {
      text-decoration: underline;
  }
  table tbody tr td.ml {
      text-align: left;
  }
  table tbody tr td.reason span.reason {
      position: relative;
      word-break: break-all;
      white-space: pre-wrap;
      line-height: 20px;
  }
  table tbody tr td.reason span.reason i.icon-file-gray {
      position: absolute;
  }
  table tbody tr td.no-data {
      height: 299px;
  }
  table tbody tr td.no-data span.w-img {
      display: inline-block;
      width: 64px;
      height: 64px;
      background: url("~@/assets/img/icon_excla_mark.svg") no-repeat;
  }
  table tbody tr td.no-data span {
      display: block;
      margin-top: 16px;
      font-size: 16px;
      font-weight: 400;
      color: #616161;
  }
}
.attendance-model-stat .modal-close-btn {
    position: absolute;
    width: 24px;
    height: 24px;
    top: 20px;
    right: 20px;
    background: url("~@/assets/img/icon/icon_modal_close.svg") no-repeat;
    cursor: pointer;
}
.attendance-model-stat .downloadfile {
    display: inline-block;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: url("~@/assets/img/icon/icon_download_gray.svg") no-repeat center/cover;
    background-color: #EBEEF4;
    background-size: 18px 18px;
    cursor: pointer;
    margin-left: 2px;
}
.attendance-model-stat .info-wrap button strong {
    font-size: 15px;
}

.stat span {
cursor: pointer;
}

.modal.ofy.slick-modal .modal-close-btn {
  right: 20px;
}
</style>