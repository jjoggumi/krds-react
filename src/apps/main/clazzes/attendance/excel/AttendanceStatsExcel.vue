<template>
  <div class="attendance-tbl-contatiner statsExcel" ref="attendanceStatsExcel">
    <table class="tbl-col stat">
        <thead>
            <tr>
                <th colspan="17">
                  출결현황&nbsp;
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
              <th colspan="17"></th>
            </tr>
            <tr class="step1">
                <th rowspan="2" class="r">학반</th>
                <th rowspan="2" class="r">번호</th>
                <th rowspan="2" class="r">학생명</th>
                <th rowspan="2" class="r">출석인정</th> 
                <th colspan="3" class="rb">결석</th> 
                <th colspan="3" class="rb">조퇴</th> 
                <th colspan="3" class="rb">지각</th> 
                <th colspan="3" class="rb">외출</th>
                <th class="rb">가정 체험학습</th> 
                <th rowspan="2">첨부파일</th> 
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
                <th>미인정</th>
            </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in excelList" :key="`attendance-stat-excel-${idx}`">
            <td>
              <span>{{ item.student.tagId ? item.student.tagName : '-' }}</span>
            </td>
            <td>
              <span>{{ item.student.studentNo }}</span>
            </td>
            <td>
              <span>{{ item.student.studentName }}</span>
            </td>
            <td>
              <span>{{ attendanceTotal(item) }}</span>건
            </td>
            <td>
                <span class="underline">{{ item.absenceIllness }}건</span>
            </td>
            <td>
                <span class="underline">{{ item.absenceNotAccept }}건</span>
            </td>
            <td>
                <span class="underline">{{ item.absenceEtc }}건</span>
            </td>
            <td>
                <span class="underline">{{ item.earlyLeaveIllness }}건</span>
            </td>
            <td>
                <span class="underline">{{ item.earlyLeaveNotAccept }}건</span>
            </td>
            <td>
                <span class="underline">{{ item.earlyLeaveEtc }}건</span>
            </td>
            <td>
                <span class="underline">{{ item.latenessIllness }}건</span>
            </td>
            <td>
                <span class="underline">{{ item.latenessNotAccept }}건</span>
            </td>
            <td>
                <span class="underline">{{ item.latenessEtc }}건</span>
            </td>
            <td>
                <span class="underline">{{ item.outIllness }}건</span>
            </td>
            <td>
                <span class="underline">{{ item.outNotAccept }}건</span>
            </td>
            <td>
                <span class="underline">{{ item.outEtc }}건</span>
            </td>
            <td>
                <span class="underline">{{ item.fieldStudyNotAccept }}건</span>
            </td>
            <td>
                <template v-if="item.files">
                  <span>{{ item.files.length }}</span>건
                </template>
            </td>
        </tr>
        </tbody>
    </table>
  </div>
</template>

<script>
import {mapGetters} from "vuex";
import XLSX from "xlsx";
import qs from "qs";

export default {
  name: "attendance-stats-excel",
  props: {
    list: Array,
    filter : String,
    date : Object,
    tagIds: Array
  },
  data() {
    return {
      excelList: [],
      searchParams : {
        size : 1000                  
      },
      searchPeriod: "",
      searchFinish: false,
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
    // this.download()
    this.init()
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
        tagId: this.tagIds,
        ...this.searchParams,
      }

      try {
        const res = await this.$axios({
            method: 'GET',
            url: `/attendances/stats/${this.curClassId}?${this.searchPeriod}`,
            params: search,
            paramsSerializer: (params) => {
              return qs.stringify(params, {arrayFormat: 'repeat'})
            }
        })
        this.$log.debug('excelList() ok => ', res)

        if(res.data.page.totalElements > 0) {
          this.excelList = [...this.excelList, ...res.data._embedded.attendanceStats]
          if(res.data.page.totalElements === this.searchParams.size) {
            this.getList(num+1)
          } else {
            this.searchFinish = true
          }
        } else {
          this.searchFinish = true
        }
      } catch (err) {
          this.$log.debug('excelList() error => ', err)
      }
    },
    attendanceTotal(item) {
      return ['absence', 'earlyLeave', 'lateness', 'out', 'fieldStudy'].reduce((a, k) => a + (item[`${k}Attendance`] || 0), 0)
    },
    download() {
      this.$nextTick(function() { 
        const ele = this.$refs.attendanceStatsExcel
        const workBook = XLSX.utils.book_new()
        const workSheet = XLSX.utils.table_to_sheet(ele, { raw: true })
        Object.keys(workSheet).forEach((cell) => {
          if (cell.startsWith('A')) {
            workSheet[cell] = { t: "s", v: workSheet[cell].v,  z: "@" }
          }
        })
        XLSX.utils.book_append_sheet(workBook, workSheet)
        XLSX.writeFile(workBook, `출결현황_${this.$moment().format('YYYYMMDD')}.xlsx`)
        this.$emit('downloadFinish')
        this.searchFinish = false
      })
    }
  }
}
</script>

<style scoped>
.statsExcel {
  visibility: hidden;
}
</style>