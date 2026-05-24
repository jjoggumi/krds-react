<!--
@File(Method): MainBodyClazzesBodyAttendanceStats.vue
@Author: -
@Date Created: -
@Description: 출결알리기 > 학생별 통계
@Modified: 2025-03-17 - #72058 출결알리기 개선 (편리한 기능, 체험학습 개수 제한)-->
<template>
  <div> <!-- 탭 변경영역 -->
    <!-- #72058 출결알리기 개선 - hi-row 그리드 적용-->
    <div class="attendance-search-group-stat hi-row sm-gutters">
        <div class="input-radio-wrap col-sm-6">
            <p class="chk">
                <input type="radio" name="search-filter" id="search-month" value="month" v-model="searchFilter">
                <label for="search-month"><span>월</span></label>
            </p>
            <p class="input search-month-input" ref="searchMonth">
                <span class="calendar-select" @click="calendarSelect(searchDate.month.year, searchDate.month.month, 'month', $event)">
                    {{ this.searchDate.month.year }}년 {{ this.searchDate.month.month }}월
                    <i class="calendar"></i>
                </span>                 
            </p>
            <p class="chk">
                <input type="radio" name="search-filter" id="search-period" value="period"  v-model="searchFilter">
                <label for="search-period"><span>기간</span></label>
            </p>
            <p class="input search-period-input" ref="searchPeriod">
                <span class="calendar-select" @click="calendarSelect(searchDate.period.start.year, searchDate.period.start.month, 'periodStart', $event)">
                    {{ this.searchDate.period.start.year }}년 {{ this.searchDate.period.start.month }}월
                    <i class="calendar"></i>
                </span>
                <span class="dash">-</span> 
                <span class="calendar-select" @click="calendarSelect(searchDate.period.end.year, searchDate.period.end.month, 'periodEnd', $event)">
                    {{ this.searchDate.period.end.year }}년 {{ this.searchDate.period.end.month }}월
                    <i class="calendar"></i>
                </span>
            </p>
        </div>

        <div class="hi-downloadbox col-sm-6 txt-right">
            <button class="hi-btn btn-md btn-line s1" v-click-outside="disappearExcel" @click="downloadExcel">
                <i class="icon-excel"></i>
                <strong>엑셀 다운로드</strong>
            </button>
            <ul class="hi-excel-dropbox" ref="excelDropBox">
                <li class="click-downloadExcel" @click="downloadExcelList">
                    출결현황
                    <span></span>
                </li>
                <li class="line"></li>
                <li class="click-downloadExcel" @click="downloadExcelDetail">
                    전체 학생 출결 상세
                    <span></span>
                </li>
            </ul>
        </div>
    </div>

    <div
        v-infinite-scroll="getList"
        :infinite-scroll-disabled="isAllLoaded"
        :infinite-scroll-distance="400"
        class="attendance-tbl-contatiner"
    >
        <table class="tbl-col stat fixed">
            <colgroup>
                <col width="110" /> 
                <col width="110" />
                <col width="50" />
                <col width="40" />
                <col width="40" />
                <col width="40" />
                <col width="40" />
                <col width="40" />
                <col width="40" />
                <col width="40" />
                <col width="40" />
                <col width="40" />
                <col width="40" />
                <col width="40" />
                <col width="40" />
                <col width="100" />
                <col width="auto" />
            </colgroup>
            <thead>
                <tr class="step1">
                    <th rowspan="2" class="r">
                        <HiSelectBox
                          class="opt-default"
                          empty-title="학반(태그)"
                          @clickOutside="getList(true)"
                        >
                        <template #btnType>
                            학반(태그) <HiIcon size="20" name="ico-filter-thin"/>
                        </template>

                        <template #custom-option>
                            <div class="option-list type02">
                                <div class="tit">학반(태그)선택</div>
                                <ul>
                                    <li v-for="item in usedClazzTags.map(t => ({ value: t.tagId, title: t.tagName }))" :key="item.value">
                                    <input type="checkbox" :id="`check-${item.value}`" :value="item.value" v-model="searchParams.tagId"/>
                                    <label :for="`check-${item.value}`">
                                        <span>{{ item.title }}</span>
                                    </label>
                                    </li>
                                    <li v-if="usedClazzTags.length === 0" class="hi-nodata sm">
                                    <p>등록된 태그가 없습니다.</p>
                                    </li>
                                </ul>
                            </div>
                        </template>
                        </HiSelectBox>

                    </th>
                    <th rowspan="2" class="r">학생명</th>
                    <th rowspan="2" class="r">출석<br>인정</th> 
                    <th colspan="3" class="rb">결석</th> 
                    <th colspan="3" class="rb">조퇴</th> 
                    <th colspan="3" class="rb">지각</th> 
                    <th colspan="3" class="rb">외출</th> 
                    <th class="rb">가정 체험학습</th> 
                    <th rowspan="2">첨부<br>파일</th> 
                </tr>
                <tr class="step2">
                    <th>질병</th>
                    <th>미인정</th>
                    <th class="r">기타</th>
                    <th>질병</th>
                    <th>미인정</th>
                    <th class="r">기타</th>
                    <th>질병</th>
                    <th>미인정</th>
                    <th class="r">기타</th>
                    <th>질병</th>
                    <th>미인정</th>
                    <th class="r">기타</th>
                    <th class="r">미인정</th>
                </tr>
            </thead>
            <tbody>
                <template v-if="list.length > 0">
                    <tr v-for="(item, idx) in list" :key="`attendance-stat-${idx}`">
                        <td>{{ item.student.tagId ? item.student.tagName : '-' }}</td>
                        <td @click="showDetail(item.student, '', '', false)" class="ml">
                            <p class="name">
                                <span class="num">{{ item.student.studentNo }}</span>
                                <span class="name"><span class="name-txt" :class="{
                                    'over': item.student.studentName.length > 5
                                }">{{ item.student.studentName }}</span>
                                    <template v-if="item.student.isUsed === false"><br /><span class="no-use">(미사용)</span></template>
                                </span>
                            </p>
                        </td>
                        <td @click="showDetail(item.student, '', '', true)">
                            <span class="underline blue">{{ attendanceTotal(item) }}</span>
                        </td>
                        <td @click="showDetail(item.student, 'ABSENCE', 'ILLNESS', false)">
                            <span class="underline">{{ item.absenceIllness }}</span>
                        </td>
                        <td @click="showDetail(item.student, 'ABSENCE', 'NOT_ACCEPT', false)">
                            <span class="underline">{{ item.absenceNotAccept }}</span>
                        </td>
                        <td @click="showDetail(item.student, 'ABSENCE', 'ETC', false)">
                            <span class="underline">{{ item.absenceEtc }}</span>
                        </td>
                        <td @click="showDetail(item.student, 'EARLY_LEAVE', 'ILLNESS', false)">
                            <span class="underline">{{ item.earlyLeaveIllness }}</span>
                        </td>
                        <td @click="showDetail(item.student, 'EARLY_LEAVE', 'NOT_ACCEPT', false)">
                            <span class="underline">{{ item.earlyLeaveNotAccept }}</span>
                        </td>
                        <td @click="showDetail(item.student, 'EARLY_LEAVE', 'ETC', false)">
                            <span class="underline">{{ item.earlyLeaveEtc }}</span>
                        </td>
                        <td @click="showDetail(item.student, 'LATENESS', 'ILLNESS', false)">
                            <span class="underline">{{ item.latenessIllness }}</span>
                        </td>
                        <td @click="showDetail(item.student, 'LATENESS', 'NOT_ACCEPT', false)">
                            <span class="underline">{{ item.latenessNotAccept }}</span>
                        </td>
                        <td @click="showDetail(item.student, 'LATENESS', 'ETC', false)">
                            <span class="underline">{{ item.latenessEtc }}</span>
                        </td>
                        <td @click="showDetail(item.student, 'OUT', 'ILLNESS', false)">
                            <span class="underline">{{ item.outIllness }}</span>
                        </td>
                        <td @click="showDetail(item.student, 'OUT', 'NOT_ACCEPT', false)">
                            <span class="underline">{{ item.outNotAccept }}</span>
                        </td>
                        <td @click="showDetail(item.student, 'OUT', 'ETC', false)">
                            <span class="underline">{{ item.outEtc }}</span>
                        </td>
                        <!-- #72058 출결알리기 개선 : 가정 체험학습 미인정 데이터추가-->
                        <td @click="showDetail(item.student, 'FIELD_STUDY', 'NOT_ACCEPT', false)">
                          <span class="underline">{{ item.fieldStudyNotAccept }}</span>
                        </td>
                        <td>
                            <span class="download" v-if="item.files" @click="downloadFile(item.student, item.files, $event)"></span>
                        </td>
                    </tr>
                </template>

                <template v-else>
                    <tr>
                        <td colspan="17" class="no-data">
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

    <main-body-calendar-picker-month-v2
      ref="calendarPickerMonth"
      :year="search.date.year"
      :month="search.date.month"
      :total="false"
      v-click-outside="disappearCalendar"
      @choiceMonth="choiceMonth"
    />

    <attendance-stat-detail-modal
        v-if="detail.open"
        :model="detail"
        @openDetail="openDetail"
        :filter="searchFilter"
        :date="searchDate"
        :detailAttendanceType="detailAttendanceType"
        :detailAttendanceConfirmType="detailAttendanceConfirmType"
        :detailAttendanceOk="detailAttendanceOk"
        :clazzMemberRole="clazzMemberRole"
    />

    <attendance-stat-detail-excel
        v-if="statDetailExcelDownload"
        ref="attendanceStatDetailExcel"
        :filter="searchFilter"
        :date="searchDate"
        :tagIds="searchParams.tagId"
        @downloadFinish="downloadExcelDetail"
    />

    <attendance-stats-excel 
        v-if="statsExcelDownload"
        :list="list"
        :filter="searchFilter"
        :date="searchDate"
        :tagIds="searchParams.tagId"
        @downloadFinish="downloadExcelList"
    />
  </div>
</template>

<script>
import {mapActions, mapState, mapGetters} from "vuex";
import jszip from 'jszip'
import { saveAs } from 'file-saver'
import axios from "axios";
import MainBodyCalendarPickerMonthV2 from '../MainBodyCalendarPickerMonthV2.vue'
import AttendanceStatDetailModal from "./modal/AttendanceStatDetailModal"
import AttendanceStatDetailExcel from "./excel/AttendanceStatDetailExcel"
import AttendanceStatsExcel from "./excel/AttendanceStatsExcel"

export default {
  name: "main-body-clazzes-body-attendance-stats",
  props: {
    clazzMemberRole: String,
  },
  components: {
    MainBodyCalendarPickerMonthV2,
    AttendanceStatDetailModal,
    AttendanceStatDetailExcel,
    AttendanceStatsExcel
  },
  data() {
    return {
        searchParams : {
            page : 0, 
            size : 50,
            tagId: []
        },
        searchFilter : "month",
        searchDate : {
            month : {
                year : null, 
                month : null,
            },
            period : {
                start : {
                    year : null, 
                    month : null,
                },
                end : {
                    year : null, 
                    month : null,
                }
            }
        },
        search : {
            kind : "month", 
            target : "",
            date : {
                year : null,
                month : null
            }
        },
        list : [],
        nowDate : {
            year : null, 
            month : null
        },
        detail : {
            studentId : "",
            open: false
        },
        headerKeyList: [],
        statsExcelDownload: false,
        statDetailExcelDownload: false,
        fileNameObj: {},
        detailAttendanceType: "",
        detailAttendanceConfirmType: "",
        detailAttendanceOk: false,
        usedClazzTags: [],
        isAllLoaded: false,
        isCallStats: false
    }
  },
  computed: {
    ...mapGetters(['curClassId'])
  }, 
  watch: {
    searchFilter(v) {
        if(this.$refs.excelDropBox.style.display === 'block') {
            this.$refs.excelDropBox.style.display = 'none'
        }

        if(v === 'month') {
            this.$refs.searchMonth.style.display = 'inline-block'
            this.$refs.searchPeriod.style.display = 'none'
        } else {
            this.$refs.searchMonth.style.display = 'none'
            this.$refs.searchPeriod.style.display = 'inline-block'
        }
        this.getList(true)
    }
  },
  created() {
    this.init()
    this.getUsedClazzTags()
  },
  methods: {
    ...mapActions(['download']),
    init() {
        const date = new Date()
        const yyyy = date.getFullYear()
        let mm = date.getMonth() + 1

        this.nowDate.year = yyyy
        this.nowDate.month = mm
        this.searchDate = {
            month : {
                year : yyyy, 
                month : mm,
            },
            period : {
                start : {
                    year : yyyy, 
                    month : 1,
                },
                end : {
                    year : yyyy, 
                    month : mm,
                }
            }
        }

        this.search.date.year = yyyy
        this.search.date.month = mm
    },
    initSearch() {
        this.list = []
        this.searchParams.page = 0
        this.isAllLoaded = false
    },
    async getList(init = false) {
        if (init) {
          this.initSearch()
        }
        if (this.isAllLoaded || this.isCallStats) return
        this.isCallStats = true
        let url = ""
        if(this.searchFilter === 'month') {
            url = `attendanceMonth=${this.searchDate.month.year}-${String(this.searchDate.month.month).padStart(2, '0')}`
        } else {
            url = `attendanceDateBetween=${this.searchDate.period.start.year}-${String(this.searchDate.period.start.month).padStart(2, '0')}-01&attendanceDateBetween=${this.searchDate.period.end.year}-${String(this.searchDate.period.end.month).padStart(2, '0')}-31`
        }
        
        try {
            const res = await this.$axios({
                method: 'GET',
                url: `/attendances/stats/${this.curClassId}?${url}`,
                params: this.searchParams
            })
            this.$log.debug('getList() ok => ', res)

            if (res.data.page.totalElements > 0) {
                const data = res.data._embedded.attendanceStats
                if(data.length > 0) {
                    this.list.push(...data)
                }
                this.searchParams.page = this.searchParams.page + 1
                this.isAllLoaded = this.searchParams.page >= res.data.page.totalPages
            } else {
              this.isAllLoaded = true
            }

        } catch (err) {
            this.$log.debug('getList() error => ', err)
        } finally {
          this.isCallStats = false
        }
    },
    async getUsedClazzTags() {
      try {
        const res = await this.$axios.get(`/clazzes/${this.curClassId}/tags`, { params: {isUsedClazzStudents: true} } )
        this.usedClazzTags = [...res.data._embedded.clazzTags]
      } catch(err) {
        this.usedClazzTags = []
      }
    },
    showDetail(student, attendanceType, attendanceConfirmType, detailAttendanceOk) {
        this.detail.studentNo = student.studentNo
        this.detail.studentId = student.studentId
        this.detail.studentName = student.studentName
        this.detail.tagId = student.tagId
        this.detail.tagName = student.tagId ? student.tagName : null
        this.detailAttendanceType = attendanceType
        this.detailAttendanceConfirmType = attendanceConfirmType
        this.detailAttendanceOk = detailAttendanceOk
        this.openDetail()
    },
    attendanceTotal(item) {
      return ['absence', 'earlyLeave', 'lateness', 'out', 'fieldStudy'].reduce((a, k) => a + (item[`${k}Attendance`] || 0), 0)
    },
    openDetail() {
        if(this.detail.open === false) this.$hiClass.toggleBodyClass('add', 'hidden')
        else this.$hiClass.toggleBodyClass('remove', 'hidden')
        this.detail.open = !this.detail.open
    },
    downloadExcel() {
        // const open = this.$refs.calendarPickerMonth.$el
        // if(open.style.display === 'block') {
        //     open.style.display = 'none'
        //     const calEls = document.querySelectorAll('.calendar-select')
        //     calEls.forEach(ele => {
        //         const delEl = ele.querySelector('.picker-calendar-month')
        //         if(!delEl === false) {
        //             delEl.remove()
        //         }
        //     })
        // }
        if(this.$refs.excelDropBox.style.display === 'block') {
            this.$refs.excelDropBox.style.display = 'none'
        } else {
            this.$refs.excelDropBox.style.display = 'block'
        }    
    },
    calendarSelect(year, month, kind, e) {
        this.search.kind = kind
        if(e.target.className === 'calendar-select' || e.target.className === 'calendar') {
            let target = e.target
            if(e.target.className === 'calendar') {
                target = e.target.parentElement
            }

            const open = this.$refs.calendarPickerMonth.$el
            if(open.style.display === 'block') {
                open.style.display = 'none'
                const delEl = target.querySelector('.picker-calendar-month')
                if(!delEl === false) delEl.remove()
            } else {
                this.$refs.calendarPickerMonth.calendarYear = year
                this.$refs.calendarPickerMonth.calendarMonth = month
                this.search.date.year = year
                this.search.date.month = month
                this.search.target = target
                open.style.display = 'block'
                target.append(open)
            }
        }
    },
    choiceMonth(date) {
        this.$refs.calendarPickerMonth.$el.style.display = 'none'
        const delEl = this.search.target.querySelector('.picker-calendar-month')
        delEl.remove()
        this.search.target = ""
        if(this.search.kind === 'month') {
            this.searchDate.month.year = date.year
            this.searchDate.month.month = date.month
        } else if(this.search.kind === 'periodStart') {
            const month = this.compareMonth(
                date.year, 
                date.month, 
                this.searchDate.period.end.year,
                this.searchDate.period.end.month
            )

            const chk = this.compareMonthCheck(month)
            if(chk == false) return

            this.searchDate.period.start.year = date.year
            this.searchDate.period.start.month = date.month
        } else if(this.search.kind === 'periodEnd') {
            const month = this.compareMonth(
                this.searchDate.period.start.year, 
                this.searchDate.period.start.month, 
                date.year,
                date.month
            )
            
            const chk = this.compareMonthCheck(month)
            if(chk == false) return

            this.searchDate.period.end.year = date.year
            this.searchDate.period.end.month = date.month
        }
        this.getList(true)
    },
    downloadExcelList() {
        this.statsExcelDownload = !this.statsExcelDownload
    },
    downloadExcelDetail() {
        this.statDetailExcelDownload = !this.statDetailExcelDownload
    },
    getAttendanceType(type) {
      switch(type){
        case "ABSENCE":
          return "결석"
           
        case "EARLY_LEAVE":
          return "조퇴"
           
        case "LATENESS":
          return "지각"
           
        case "OUT":
          return "외출"

        default:
          return "전체"
      }
    },
    getAttendanceConfirmType(type) {
      switch(type){
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
    compareMonth(startY, startM, endY, endM) {
        const month = (endY - startY) * 12 + (endM - startM) + 1;
        return month
    },
    compareMonthCheck(month) {
        if(month <= 0) {
            this.$hiClass.alert('조회 시작 기간을 조회 끝 기간보다 이전으로 선택해주세요.', 'warning', false)
            return false
        } else if(month >= 13) {
            this.$hiClass.alert('1년 이내만 선택 가능합니다.', 'warning', false)
            return false
        }

        return true
    },
    async downloadFile(student, files, e) {
        e.stopPropagation()
        if (files.length === 1) {
            const search = {
                classId : this.curClassId,
                studentId : student.studentId,
                studentName : student.studentName,
            }

            let searchPeriod = ""
            if(this.filter === 'month') {
                searchPeriod = `attendanceMonth=${this.searchDate.month.year}-${String(this.searchDate.month.month).padStart(2, '0')}`
            } else {
                searchPeriod = `attendanceDateBetween=${this.searchDate.period.start.year}-${String(this.searchDate.period.start.month).padStart(2, '0')}-01&attendanceDateBetween=${this.searchDate.period.end.year}-${String(this.searchDate.period.end.month).padStart(2, '0')}-31`
            }

            const params = {
                page : 0, 
                size : 1000,
                sort : 'asc',   
                ...search
            }
            this.$log.debug("params => ", params)

            const res = await this.$axios({
                method: 'GET',
                url: `/attendances?${searchPeriod}`,
                params: params
            })
            this.$log.debug("downloadFile list res => ", res)

            const list = res.data._embedded.attendances
            const obj = list.find(v => v.fileExists === true)

            const res2 = await this.$axios({
                method: 'GET',
                url: `/attendances/${obj.attendanceId}`,
                params: {}
            })

            const item = res2.data
            
            const file = item.files[0]
            const fileArr = file.fileName.split(".")
            const fileName = fileArr.join("_")
            const fileExt = fileArr.pop()

            const dateArr = item.attendanceDate.split("-")
            const dateStr = dateArr.join("")

            const archiveFileName = `${dateStr}_${this.getAttendanceType(item.attendanceType)}(${this.getAttendanceConfirmType(item.attendanceConfirmType)})_${fileName}.${fileExt}`

            const payload = {
                src: file.fileOriginalPath,
                name: archiveFileName
            }

            try {
                await this.download(payload)
            } catch (err) {
                this.$log.debug(`downloadfile => `, err)
                this.$hiClass.alert('파일 다운로드를 실패하였습니다.', 'error')
            }
        } else {
            let zip = new jszip()
            // let archiveFileName = `출결알리미_${this.$moment().format('YYYY-MM-DD')}.zip`
            
            let fileNameDate = ""
            if(this.searchFilter === 'month') {
                fileNameDate = `${this.searchDate.month.year}${String(this.searchDate.month.month).padStart(2, '0')}`
            } else {
                fileNameDate = `[${this.searchDate.period.start.year}${String(this.searchDate.period.start.month).padStart(2, '0')}_${this.searchDate.period.end.year}${String(this.searchDate.period.end.month).padStart(2, '0')}]`
            }

            const archiveFileName = `${student.studentName}_${fileNameDate}_${this.$moment().format('YYYYMMDD')}`
            
            const requests = []
            let fileCount = 0

            for(const file of files) {
                const request = axios({
                    method: "get",
                    url: file.fileOriginalPath,
                    responseType: "blob",
                    headers: "",
                    fileName: file.fileName
                });
                requests.push(request)
            }

            Promise.all(requests)
                .then(responses => {
                    // zip 파일 압축
                    responses.map((res, index) => {
                        const indexExt = res.config.fileName.lastIndexOf('.')
                        const name = res.config.fileName.substring(0, indexExt)
                        const ext = res.config.fileName.substring(indexExt, res.config.fileName.length).toLowerCase()
                        //const fileName = this.getFileName((res.config.fileName || files[index].fileName))
                        const existName = zip.filter((p, z) => z.name.indexOf(name) === 0).length
                        const fileName = existName === 0 
                            ? res.config.fileName 
                            : `${name}(${existName})${ext}`
                        const blob = new Blob([res.data], {
                            type: 'application/octet-stream'
                        })
                        
                        // 과제 파일명
                        zip.file(fileName, blob)
                        fileCount++

                        if (files.length === fileCount) {
                            zip
                            .generateAsync({type: 'blob'})
                            .then(function (blob) {
                                // 과제 모음 zip 파일명
                                saveAs(blob, archiveFileName)
                            })
                            .finally(() => {
                                // this.$hiClass.alert('파일 일괄 다운로드가 완료되었습니다.', 'success')
                            })
                        }
                    })
                })
                .catch(() => {
                    this.$hiClass.alert('파일 일괄 다운로드를 실패하였습니다.', 'error')
                })
        }
    },
    disappearCalendar(e) {
        const clickCalendarSelect = e.target.classList.contains('calendar-select')
        const clickCalendar = e.target.parentNode.classList.contains('calendar-select')
        if(clickCalendarSelect === false && clickCalendar === false) {
            this.$refs.calendarPickerMonth.$el.style.display = 'none'
            const els = document.querySelectorAll('.calendar-select')
            for(const el of els) {
                const delEl = el.querySelector('.picker-calendar-month')
                if(!delEl === false) delEl.remove()
            }
        }
    },
    disappearExcel(e) {
        const clickExcelDownload = e.target.classList.contains('click-downloadExcel')
        if(clickExcelDownload === false) {
            this.$refs.excelDropBox.style.display = 'none'
        }
    }
  }
}
</script>

<style scoped lang="scss">
.attendance-search-group-stat {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    .input-radio-wrap {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        gap: 16px;
    }
    .input-radio-wrap p.search-period-input{
        display: none;
    }
    .input-radio-wrap p.input span.calendar-select {
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
    .input-radio-wrap p.input span .calendar {
        display: inline-block;
        position: absolute;
        top: 50%;
        right: 10px;
        transform: translateY(-50%);
        width: 18px;
        height: 18px;
        background: url("~@/assets/img/icon/icon_calendar_s3.svg") no-repeat;
    }
    .input-radio-wrap p.input span.dash {
        display: inline-block;
        width: 23px;
        /* height: 40px; */
        font-size: 14px;
        font-weight: 400;
        color: #222;
        text-align: center;
        border: 0;
        padding: 0;
    }
    .hi-downloadbox {
        position: relative;
        button {
            width: 176px;
            height: 40px;
            border-radius: 20px;
            border: 1px solid #267E4E;
            color: #267E4E;
            font-size: 16px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        button i.icon-excel {
            width: 18px;
            height: 18px;
            background: url("~@/assets/img/icon/icon_file_excel_2.svg") no-repeat;
            margin-right: 4px;
        }
        button strong {
            font-size: 15px;
        }
        ul {
            position: absolute;
            top: calc(100% + 5px);
            right: 0;
            width: 188px;
            border: 1px solid #000;
            background: #fff;
            border: 1px solid #E0E0E0;
            border-radius: 4px;
            display: none;
        }
        ul li {
            display: flex;
            height: 49px;
            line-height: 49px;
            padding: 0 16px;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
        }
        ul li.line {
            height: 1px;
            background: #ECECEC;
        }
        ul li span {
            display: inline-block;
            width: 18px;
            height: 18px;
            background: url("~@/assets/img/icon/icon_download_black.svg") no-repeat;
        }
    }
}

.hi-ico.ico-filter-thin{
    padding: 0;
    vertical-align: middle;
}
.hi-selectbox{
    ::v-deep {
        .selected{
            font-weight: 500;
            padding: 0 16px;
            border: none;
            background: transparent;
            &::after{display:none;}
        }
        .option__layer{
            width: 215px;
            .option-list{
                > ul {
                    overflow: auto;
                    max-height: 176px;
                }
            }
        }
    }
}
</style>
