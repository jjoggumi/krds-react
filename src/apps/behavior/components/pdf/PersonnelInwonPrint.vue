<template>
  <div ref="personnelsPrint" class="personnel-pdf-container">
    <div class="record-recording__content">
      <div class="record-recording__content__inwon check">
        <div class="top">
          <div class="check">
            <input type="checkbox" id="inwon-check-total-print" v-model="printItem.isCompleted"/>
            <label for="inwon-check-total-print"></label>
          </div>

          <div class="content">
            <div class="title"><h2>{{ printItem.checklistTitle }}</h2></div>
            <div class="etc">
              <i class="input-btn-calendar bh-icon-calendar-24 cursor-pointer"></i>
              <span class="date">{{ selectedDateString(dateConvertTimeStamp(printItem.checklistDate)) }}</span>
            </div>
          </div>
        </div>

        <div class="list-wrap">
          <div class="list">
            <table>
              <colgroup>
                <col width="6%" />
                <col width="14%" />
                <col v-for="item in printItem.items" :key="`item-check-list-colgroup-print-${item.itemKey}`" :width="detailTableWidth"/>
                <template v-if="printItem.checklistType === 'MEMO'">
                  <col width="" />
                </template>

                <template v-else>
                  <col width="24%" />
                </template>
              </colgroup>
              <thead>
              <tr>
                <th>번호</th>
                <th>학생명</th>
                <th v-for="(item) in printItem.items" :key="`item-check-list-th-print-${item.itemKey}`">
                  <p class="check-list">
                    <span v-if="item.itemLabel">{{ item.itemLabel }}</span>
                  </p>
                </th>
                <th>
                  <p class="memo">
                    메모
                  </p>
                </th>
              </tr>
              </thead>
            <tbody>
                <tr v-for="(student) of printItem.students" :key="`write-item-list-student-print-${student.studentNo}`">
                  <td>{{ student.studentNo }}</td>
                  <td class="align-l">
                    <p class="name">{{ student.studentName }}</p>
                  </td>
                    <td v-for="(item) in printItem.items" :key="`item-check-list-td-print-${item.itemKey}`">
                      <p v-if="printItem.checklistType !== 'LEVEL_COMMENT'" 
                        class="check-list"
                        :class="{
                          'check-point': printItem.checklistType === 'SCORE',
                          'check-a': item.itemKey === 'A' && printItem.checklistType !== 'SCORE', 
                          'check-b': item.itemKey === 'B' && printItem.checklistType !== 'SCORE', 
                          'check-c': item.itemKey === 'C' && printItem.checklistType !== 'SCORE', 
                          'check-d': item.itemKey === 'D' && printItem.checklistType !== 'SCORE', 
                          'check-e': item.itemKey === 'E' && printItem.checklistType !== 'SCORE', 
                          checked: isItemChecked(student, item)
                        }"
                      >
                        <i></i>
                      </p>
                      <p v-if="printItem.checklistType === 'LEVEL_COMMENT'">
                        {{ student[`levelComment${item.itemKey}`] || ''}}
                      </p>
                    </td>
                    <!-- <td v-else-if="printItem.checklistType === 'SCORE'" v-for="(item) in printItem.items" :key="`item-check-list-td-print-${item}`">
                      <p class="check-list check-point"
                        :class="{
                          checked: isItemChecked(student, item)
                        }"
                      >
                        <i></i>
                      </p>
                    </td> -->
                  <td>
                    <div class="input-text">
                      <div class="text">
                        {{ student.checkMemo }}
                      </div>
                    </div>
                  </td>
                </tr>
                <template v-if="printItem.checklistType !== 'MEMO' && printItem.checklistType !== 'LEVEL_COMMENT'">
                  <tr class="bottom-count">
                    <td class="none"></td>
                    <td class="none"></td>

                    <td v-for="(item) in printItem.items" :key="`item-check-list-td-count-bottom-print-${item.itemKey}`" :style="{ width: detailTableWidth }">
                      <em :class="[
                        printItem.checklistType === 'SCORE' ? {
                          'score': true
                        } : {
                          'a': item.itemKey === 'A',
                          'b': item.itemKey === 'B',
                          'c': item.itemKey === 'C',
                          'd': item.itemKey === 'D',
                          'e': item.itemKey === 'E',
                        }
                      ]">{{ checkCount(item.itemKey) }}</em>
                    </td>

                    <td class="none"></td>
                  </tr>
                </template>
              </tbody>
            </table>

            <!-- <div class="nodata">
              <i class="bh-icon-warning-circle-fill-52"></i>
              <span>내역이 없습니다.</span>  
            </div> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapFields } from "vuex-map-fields";

export default {
  name: "personnel-inwon-print",
  props: {
    printItem: Object
  },
  data() {
    return {
    }
  },
  computed: {
    ...mapFields({
      htmlPdfDownload: 'htmlPdfDownload',
      htmlPrint: 'htmlPrint',
    }),
    detailTableWidth() {
      const totalWidth = "56"
      const itemWidth = totalWidth / this.printItem.items.length 
      return `${itemWidth}%`
    },
  },
  mounted() {
    setTimeout(() => {
      this.download()
    }, 100)
  },
  methods: {
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
      return this.printItem.students.filter(v => v[itemKey] === true).length
    },
    download() {
      this.$nextTick(function() {
        // const formPdfFileName = `출석부${this.year}${this.month}`
        const ele = this.$refs.personnelsPrint

        this.htmlPrint.content = ele.cloneNode(true)
        this.htmlPrint.isOpen = true

        // const pdfContent = ele.cloneNode(true)
        // const pdfContentHeight = pdfContent.offsetHeight

        // console.log("pdfContentHeight", pdfContentHeight)
        // this.htmlPdfDownload.pdfContent = pdfContent
        // this.htmlPdfDownload.pdfContentHeight = pdfContentHeight
        // this.htmlPdfDownload.fileName = formPdfFileName
        // this.htmlPdfDownload.isOpen = true

        //this.$emit('downloadPrintInwon', false)
        setTimeout(() => {
          this.$emit("downloadPrintInwonClose")
        }, 1000)
      })
    }
  }
}
</script>
<style scoped>
.bottom-count td {
  border-top: 1px solid #000;
}
.bottom-count .none {
  background: #F5F6F7;
}
.bottom-count em {
  font-size: 14px;
  font-weight: 700;
}
.bottom-count em.a {
  color: #32c3d7;
}
.bottom-count em.b {
  color: #3987f8;
}
.bottom-count em.c {
  color: #80b939;
}
.bottom-count em.d {
  color: #fcd049;
}
.bottom-count em.e {
  color: #f95f6e;
}
.bottom-count em.score {
  color: #ff8737;
}
</style>