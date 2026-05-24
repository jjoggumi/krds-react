<template>
  <div class="attendance-tbl-contatiner" ref="attendanceStatDetailModalExcel">
    <table class="tbl-col">
        <thead>
          <tr>
            <th colspan="6">
              학생 출결현황 {{ select.student.studentNo }}번 {{ select.student.studentName }}
              (
                <template v-if="detailAttendanceOk">
                  출석인정
                </template>

                <template v-else>
                  <template v-if="select.attendanceType">
                    {{ getAttendanceType(select.attendanceType) }}
                    <template v-if="select.attendanceConfirmType">
                      - {{ getAttendanceConfirmType(select.attendanceConfirmType) }}
                    </template>
                  </template>

                  <template v-else>전체</template>
                </template>
              )
            </th>
          </tr>
          <tr>
            <th colspan="6"></th>
          </tr>
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
          <tr v-for="(item, idx) in excelList" :key="`attendance-modal-detail-excel-${idx}`">
              <td>{{ item.student.tagId ? item.student.tagName : '-' }}</td>
              <td>{{ item.student.studentNo }}</td>
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

export default {
  name: "attendance-stat-detail-modal-excel",
  props: {
    list: Array,
    select: Object,
    detailAttendanceOk: Boolean
  },
  data() {
    return {
      excelList: []
    }
  },
  mounted() {
    this.excelList = [...this.list]
    this.excelList.sort((a, b) => {
      if(a.attendanceDate > b.attendanceDate) return 1;
      if(a.attendanceDate < b.attendanceDate) return -1;
      if(a.attendanceDate === b.attendanceDate) return 0;
    })
    this.download()
  },
  methods: {
    download() {
      this.$nextTick(function() { 
        const ele = this.$refs.attendanceStatDetailModalExcel
        const workBook = XLSX.utils.book_new()
        const workSheet = XLSX.utils.table_to_sheet(ele, { raw: true })
        Object.keys(workSheet).forEach((cell) => {
          if (cell.startsWith('A')) {
            workSheet[cell] = { t: "s", v: workSheet[cell].v,  z: "@" }
          }
        })
        XLSX.utils.book_append_sheet(workBook, workSheet)
        XLSX.writeFile(workBook, `${this.select.student.studentName}_출결현황_${this.$moment().format('YYYYMMDD')}.xls`)
        this.$emit('downloadFinish')
      })
    },
    getAttendanceType: type => ({
      ABSENCE: "결석",
      EARLY_LEAVE: "조퇴",
      LATENESS: "지각",
      OUT: "외출",
      FIELD_STUDY: "가정 체험학습",
    }[type] || "전체"),
    getAttendanceConfirmType: type => ({
      ILLNESS: "질병",
      NOT_ACCEPT: "미인정",
      ETC: "기타",
      ATTENDANCE: "출석인정"
    }[type] || '')
  }
}
</script>