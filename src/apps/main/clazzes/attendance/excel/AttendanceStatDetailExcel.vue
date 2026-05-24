<template>
  <div class="attendance-tbl-contatiner statDetailExcel" ref="attendanceStatDetailExcel">
    <table class="tbl-col">
        <thead>
          <tr>
              <th colspan="7">
                전체 학생 출결 상세
                &nbsp;
                (
                <template v-if="filter === 'month'">
                  {{ date.month.year }}년 {{ date.month.month }}월
                </template>

                <template v-else>
                  {{ date.period.start.year }}년 {{ date.period.start.month }}월 ~ {{ date.period.end.year }}년 {{ date.period.end.month }}월
                </template>
                )
              </th>
          </tr>
          <tr>
            <th colspan="7">
            </th>
          </tr>
          <tr>
              <th>학반</th>
              <th>번호</th>
              <th>학생명</th>
              <th>출결일</th>
              <th>출결 구분</th>
              <th>상세 구분</th>
              <th>사유</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in list" :key="`attendance-detail-excel-list-${idx}`">
              <td>{{ item.student.tagId ? item.student.tagName : '-' }}</td>
              <td>{{ item.student.studentNo }}</td>
              <td>{{ item.student.studentName }}</td>
              <td>{{ item.attendanceDate }}</td>
              <td><span class="atd">{{ getAttendanceType(item.attendanceType) }}</span></td>
              <td><span class="detail">{{ getAttendanceConfirmType(item.attendanceConfirmType) }}</span></td>
              <td class="ml">{{ item.reason }}</td>
          </tr>
        </tbody>
    </table>
  </div>
</template>

<script>
import XLSX from "xlsx";
import {mapGetters} from "vuex";
import qs from "qs";

export default {
  name: "attendance-stat-detail-excel",
  props: {
    filter : String,
    date : Object,
    tagIds: Array
  },
  data() {
    return {
      searchParams : {
        size : 1000,
        sort : 'asc'                  
      },
      searchPeriod: "",
      searchFinish: false,
      list: []
    }
  },
  computed: {
    ...mapGetters({
      curClassId: 'curClassId'
    }),
  }, 
  watch: {
    searchFinish(v) {
      if(v === true) this.download()
    }
  },
  mounted() {
    this.init()
  },
  created() {
  },
  methods: {
    init() {
      if(this.filter === 'month') {
        this.searchPeriod = `attendanceMonth=${this.date.month.year}-${String(this.date.month.month).padStart(2, '0')}`
      } else {
        this.searchPeriod = `attendanceDateBetween=${this.date.period.start.year}-${String(this.date.period.start.month).padStart(2, '0')}-01&attendanceDateBetween=${this.date.period.end.year}-${String(this.date.period.end.month).padStart(2, '0')}-31`
      }
      this.getList(0)
    },
    async getList(num) {
      const search = {
        page : num, 
        classId : this.curClassId,
        tagId: this.tagIds,
        ...this.searchParams
      }

      const res = await this.$axios({
        method: 'GET',
        url: `/attendances?${this.searchPeriod}`,
        params: search,
        paramsSerializer: (params) => {
          return qs.stringify(params, {arrayFormat: 'repeat'})
        }
      })

      this.$log.debug("statDetail res => ", res)

      if(res.data.page.totalElements > 0) {
        this.list = [...this.list, ...res.data._embedded.attendances]
        if(res.data.page.totalElements === this.searchParams.size) {
          this.getList(num+1)
        } else {
          this.list.sort((a, b) => {
            if(a.student.studentNo === b.student.studentNo) {
              const x = a.student.studentName.toUpperCase()
              const y = b.student.studentName.toUpperCase()

              if(x == y) {
                if(a.attendanceDate > b.attendanceDate) return 1;
                else if(a.attendanceDate < b.attendanceDate) return -1;
                else if(a.attendanceDate === b.attendanceDate) return 0;
              } else if(x > y) {
                return 1
              } else if(x < y) {
                return -1
              }
            } else {
              return a.student.studentNo - b.student.studentNo
            }

            //  return a.student.studentName.toUpperCase() - b.student.studentName.toUpperCase()
            // if(a.student.studentNo > b.student.studentNo) return 1;
            // else if(a.student.studentNo < b.student.studentNo) return -1;
            // else if(a.student.studentNo === b.student.studentNo) return 0;

            // else if(a.student.studentName.toUpperCase() > b.student.studentName.toUpperCase()) return 1;
            // else if(a.student.studentName.toUpperCase() < b.student.studentName.toUpperCase()) return -1;
            // else if(a.student.studentName.toUpperCase() === b.student.studentName.toUpperCase()) return 0;

            // else if(a.attendanceDate > b.attendanceDate) return 1;
            // else if(a.attendanceDate < b.attendanceDate) return -1;
            // else if(a.attendanceDate === b.attendanceDate) return 0;
          })
          this.searchFinish = true
        }
      } else {
        this.searchFinish = true
      }

      // if(this.list % ((num+1) * 1000) > 0) this.getList(num+1)
      // else this.searchFinish = true
    },
    getAttendanceType: type => ({
      ABSENCE: "결석",
      EARLY_LEAVE: "조퇴",
      LATENESS: "지각",
      OUT: "외출",
      FIELD_STUDY: "가정 체험학습",
    }[type]) || '',
    getAttendanceConfirmType: type => ({
      ILLNESS: "질병",
      NOT_ACCEPT: "미인정",
      ETC: "기타",
      ATTENDANCE: "출석인정"
    }[type]) || '',
    download() {
      this.$nextTick(function() { 
        const ele = this.$refs.attendanceStatDetailExcel
        const workBook = XLSX.utils.book_new()
        const workSheet = XLSX.utils.table_to_sheet(ele, { raw: true })
        Object.keys(workSheet).forEach((cell) => {
          if (cell.startsWith('A')) {
            workSheet[cell] = { t: "s", v: workSheet[cell].v,  z: "@" }
          }
        })
        XLSX.utils.book_append_sheet(workBook, workSheet)
        XLSX.writeFile(workBook, `전체학생출결상세_${this.$moment().format('YYYYMMDD')}.xlsx`)
        this.$emit('downloadFinish')
        this.searchFinish = false
      })
    }
  }
}
</script>

<style scoped>
.statDetailExcel {
  visibility: hidden;
}
</style>