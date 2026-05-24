<template>
  <!-- <div ref="personnelsExcel">
    <table>
      <thead>
        <tr>
          <th :colspan="tblCols">{{ excelItem.checklistTitle }}</th>
        </tr>
        <tr>
          <th :colspan="tblCols">{{ selectedDateString(dateConvertTimeStamp(excelItem.checklistDate)) }}</th>
        </tr>
        <tr>
          <th :colspan="tblCols"></th>
        </tr>
        <tr>
          <th>번호</th>
          <th>학생명</th>
          <th v-for="(item, index) in excelItem.items" :key="`item-check-list-th-excel-${item}`">
            <span v-if="item.itemLabel">{{ item.itemLabel }}</span>
            <span v-else>
              <template v-if="excelItem.checklistType === 'CHECK'">
                항목{{ index + 1 }}
              </template>

              <template v-else-if="excelItem.checklistType === 'SCORE'">
                {{ index + 1 }}
              </template>
            </span>
          </th>
          <th>
            <p class="memo">
              메모
            </p>
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(student) of excelItem.students">
          <tr :key="`write-item-list-student-excel-${student.studentNo}`">
            <td>
              <span>{{ student.studentNo }}</span>
            </td>
            <td class="align-l">
              <span>{{ student.studentName }}</span>
            </td>
            <td style="text-align: center;" v-for="(item, index) in excelItem.items" :key="`item-check-list-td-excel-${item}`">
              <template v-if="excelItem.checklistType === 'CHECK'">
                <span v-if="isItemChecked(student, item) === true">ｖ</span>
                <span v-else></span>
              </template>

              <template v-else-if="excelItem.checklistType === 'SCORE'">
                <span v-if="isItemChecked(student, item) === true">
                  <template v-if="item.itemLabel">
                    {{ item.itemLabel }}
                  </template>

                  <template v-else>
                    {{ index + 1 }}
                  </template>
                </span>
                <span v-else></span>
              </template>
            </td>
            <td>
              <span>{{ student.checkMemo }}</span>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div> -->
  <div></div>
</template>

<script>
import { mapState } from 'vuex';
import XLSX from "xlsx";

export default {
  name: "personnel-inwon-excel",
  props: {
    excelItem: Object
  },
  data() {
    return {
    }
  },
  computed: {
    ...mapState('storeBehavior', {
        curClassroom: 'curClassroom',
    }),
    checklistDate() {
      return this.excelItem.checklistDate.replace(/-/gi, "")
    },
    tblCols() {
      return this.excelItem.items.length + 3
    }
  },
  methods: {
    isItemChecked: function(student, item) {
      if(item.itemKey === "A") {
        return student.checkItemA
      } else if(item.itemKey === "B") {
        return student.checkItemB
      } else if(item.itemKey === "C") {
        return student.checkItemC
      } else if(item.itemKey === "D") {
        return student.checkItemD
      } else if(item.itemKey === "E") {
        return student.checkItemE
      }  
    },
    getDayName(day) {
      switch (day) {
        case 1:
        return this.$t("chat.settings.monday");
        case 2:
        return this.$t("chat.settings.tuesday");
        case 3:
        return this.$t("chat.settings.wednesday");
        case 4:
        return this.$t("chat.settings.thursday");
        case 5:
        return this.$t("chat.settings.friday");
        case 6:
        return this.$t("chat.settings.saturday");
        case 0:
        return this.$t("chat.settings.sunday");
      }
    },
    selectedDateString: function(timestamp) {
      const date = this.$moment(new Date(timestamp)) 
      return `${date.format('YY.MM.DD')} ${'('+this.getDayName(date.day())+')'}`
    },
    dateConvertTimeStamp: function(date) {
      const convertDate = new Date(date).getTime()
      return convertDate
    },
    excelDownload() {
      let excelData = []
      excelData.push([this.excelItem.checklistTitle])
      excelData.push([this.selectedDateString(this.dateConvertTimeStamp(this.excelItem.checklistDate))])
      excelData.push([''])

      // 제목
      let headerNameList = ['번호', '학생명']
      this.excelItem.items.map((item, index) => {
        if(item.itemLabel) {
          headerNameList.push(item.itemLabel)
        } else {
          if(['CHECK','LEVEL_COMMENT'].includes(this.excelItem.checklistType)) {
            headerNameList.push(`항목${index+1}`)
          } else if(this.excelItem.checklistType === 'SCORE') {
            headerNameList.push(`${index+1}`)
          }
        }
      })
      headerNameList.push('메모')
      excelData.push(headerNameList)

      // 내용 
      this.excelItem.students.map(student => {
        let row = [student.studentNo, student.studentName]

        this.excelItem.items.map((item, index) => {
          if(this.excelItem.checklistType === 'CHECK') {
            if(this.isItemChecked(student, item) === true) {
              row.push("ｖ")
            } else {
              row.push("")
            }
          } else if(this.excelItem.checklistType === 'SCORE') {
            if(this.isItemChecked(student, item) === true) {
              if(item.itemLabel) {
                row.push(item.itemLabel)
              } else {
                row.push(index+1)
              }
            } else {
              row.push("")
            }
          } else if(this.excelItem.checklistType === 'LEVEL_COMMENT') {
            row.push(student[`levelComment${item.itemKey}`] || '')
          }
        })
        row.push(student.checkMemo)
        excelData.push(row)
      })

      if(!['MEMO', 'LEVEL_COMMENT'].includes(this.excelItem.checklistType)) {
        let bottom = ["", ""]
        this.excelItem.items.map((item) => {
          bottom.push(this.checkCount(item.itemKey))
        })
        excelData.push(bottom)
      }

      const workSheet = XLSX.utils.aoa_to_sheet(excelData)
      const workBook = XLSX.utils.book_new()
      workSheet['!merges'] = [
          { s: {c: 0, r:0}, e: { c: this.tblCols-1, r:0 } },
          { s: {c: 0, r:1}, e: { c: this.tblCols-1, r:1 } },
          { s: {c: 0, r:2}, e: { c: this.tblCols-1, r:2 } },
      ]
      XLSX.utils.book_append_sheet(workBook, workSheet)
      let fileName = this.curClassroom.classroomName ? `${this.curClassroom.classroomName}_` : ''
      fileName += `${this.excelItem.checklistTitle}_${this.$moment().format('YYYYMMDD')}.xlsx`
      XLSX.writeFile(workBook, fileName)
      // this.$nextTick(() => this.$emit('downloadExcelInwonClose')) 
      this.$emit('downloadExcelInwonClose')
    },
    checkCount(key) {
      let itemKey = ""
      if(key === "A") {
        itemKey = "checkItemA"
      } else if(key === "B") {
        itemKey = "checkItemB"
      } else if(key === "C") {
        itemKey = "checkItemC"
      } else if(key === "D") {
        itemKey = "checkItemD"
      } else if(key === "E") {
        itemKey = "checkItemE"
      }
      return this.excelItem.students.filter(v => v[itemKey] === true).length
    },
  },
  mounted() {
    this.excelDownload()
  },
}
</script>

<style scoped>
table thead tr th,
table tbody tr td {
  text-align: center;
}
</style>