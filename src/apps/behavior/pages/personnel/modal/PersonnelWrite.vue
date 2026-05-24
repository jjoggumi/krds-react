<!--
@File(Method): PersonnelWrite.vue
@Description: 학급기록 > 인원체크 > 새로 만들기 > 새로 만들기 팝업
@Modified: 2025-05-20 - #74547 학급기록 > 인원체크 평가판 기능, 메모, 평가 검색 결과 추가
@Modified: 2025-05-22 - #74548 중복된 radio 코드 for문으로 수정
-->
<template>
  <div
      class="modal normal-modal slick-modal view-main-detail-modal ofy"
      id="personnelWriteModal"
      style="display: block"
  >
    <div class="modal-cont-wrap" ref="scrollArea">
      <div class="modal-cont">
          <div class="modal-cont-inner">
          <div class="behavior-modal-inwon-write">
            <div class="title-wrap">
              <h2>새로 만들기</h2>
            </div>

            <div class="input-wrap">
              <div class="input">
                <p class="title">일자</p>
                <label class="input" @click="openPopupCalendar">
                  <input type="text" class="calendar" readonly v-model="selectedDateString" />
                  <i class="input-btn-calendar bh-icon-calendar-24 cursor-pointer"></i>
                </label>

                <calendar-monthly
                  v-if="isPopupCalendar"
                  :timestamp="calendarDateTimestamp"
                  :value-goe="null"
                  :isBoardUse="true"
                  :calendarType="calendarType"
                  v-click-outside="closePopupCalendar"
                  @selectedDate="setCalendarDateTimestamp"
                  @close="closePopupCalendar"
                />
              </div>

              <div class="input">
                <p class="title">제목</p>
                <label class="input">
                  <input type="text" placeholder="제목 입력" maxlength="50" :value="write.checklistTitle" @input="inputCheckListTitle" />
                </label>
              </div>

              <div class="input" v-if="mode === 'CHECK' || mode === 'SCORE' || mode === 'LEVEL_COMMENT'">
                <p class="title">
                  <template v-if="mode === 'CHECK'">
                    체크박스 개수
                  </template>

                  <template v-else-if="mode === 'SCORE'">
                    평가단계
                  </template>
                  <!-- #74547 학급기록 > 인원체크 평가판 기능, 메모, 평가 검색 결과 추가 -->
                  <template v-else-if="mode === 'LEVEL_COMMENT'">
                    평가개수 <span class="desc">(원하는 점수로 입력)</span>
                  </template>
                </p>
                <div class="check-list" :class="{
                  score: mode === 'SCORE'
                }">

                  <!-- #74547 학급기록 > 인원체크 평가판 기능, 메모, 평가 검색 결과 추가 -->
                  <template v-if="mode === 'CHECK' || mode === 'LEVEL_COMMENT'">
                    <p v-for="n in 5" :key="n">
                      <input
                        type="radio"
                        name="list-count"
                        :id="`personel-chk0${n}`"
                        :value="String(n)"
                        v-model="write.checklistCount"
                      />
                      <label :for="`personel-chk0${n}`">
                        <span>{{ n }}{{ mode === 'CHECK' ? '개' : '열' }}</span>
                      </label>
                    </p>
                  </template>

                  <template v-else-if="mode === 'SCORE'">
                    <p v-for="n in [2, 3, 4, 5]" :key="n">
                      <input
                        type="radio"
                        name="list-count"
                        :id="`personel-chk0${n - 1}`"
                        :value="String(n)"
                        v-model="write.checklistCount"
                      />
                      <label :for="`personel-chk0${n - 1}`">
                        <span>{{ n }}단</span>
                      </label>
                    </p>
                  </template>
                </div>
              </div>
            </div>
          
            <div class="btn">
              <button class="esc" @click="close">취소</button>
              <button class="reg" 
                :class="{ dis: !isSubmit }"
                :disabled="!isSubmit"
                @click="submit">만들기</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CalendarMonthly from "@/components/Calendar/CalendarMonthly";
import { mapState } from 'vuex';

export default {
  name: 'personnel-check-write',
  components: {
    CalendarMonthly
  },
  props: {
    mode: String
  },
  data() {
    return {
      isPopupCalendar: false,
      calendarType: 'type03',
      calendarDateTimestamp: null,
      write: {
        userId: null,
        checklistDate: null,
        checklistTitle: "",
        checklistType: "",
        checklistCount: 0
      }
    }
  },
  computed: {
    ...mapState('storeBehavior', {
        curClassroom: 'curClassroom',
    }),
    selectedDateString: function() {
      const curDate = this.$moment().format('YYYY년 M월 D일')
      const date = this.$moment(new Date(this.calendarDateTimestamp)) 
      return `${date.format('YY년 M월 D일')} ${this.getDayName(date.day())+'요일'} ${date.format('YYYY년 M월 D일') === curDate ? '(오늘)' : ''}`
    },
    checklistDateConvert: function() {
      const date = this.$moment(new Date(this.calendarDateTimestamp))
      return date.format('YYYY-MM-DD')
    },
    isSubmit: function() {
      return this.write.checklistTitle.trim().length > 0
    }
  },
  methods: {
    submit: async function() {
      this.write.checklistDate = this.checklistDateConvert

      const res = await this.$axios({
        method: 'POST',
        url: `/classroom/${this.curClassroom.classroomId}/checklists`,
        data: this.write
      })

      this.$emit('update', 0, 'writeFinish', res.data)
      // this.$emit('writeFinish', res.data)
      this.close()
    },
    close: function() {
      this.$emit('close')
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
    setCalendarDateTimestamp: function(dateTimeJson) {
      const tmpYear = dateTimeJson.year
      let tmpMonth = dateTimeJson.month + 1
      if (tmpMonth.toString().length === 1) {
          tmpMonth = '0' + tmpMonth
      }
      let tmpDate = dateTimeJson.date
      if (tmpDate.toString().length === 1) {
          tmpDate = '0' + tmpDate
      }
      const dateTime = `${tmpYear}/${tmpMonth}/${tmpDate}`
      this.calendarDateTimestamp = this.$moment(dateTime, 'YYYY/MM/DD', true).valueOf()
    },
    initMode: function() {
      if(this.mode === 'CHECK') {
        this.write.checklistCount = 3
      } else if(this.mode === 'SCORE' || this.mode === 'LEVEL_COMMENT') {
        this.write.checklistCount = 3
      } else {
        this.write.checklistCount = 0
      }
    },
    inputValidateCheck: function(e) {
      e.target.value = e.target.value.replace(/[^A-Za-z0-9ㄱ-힣\s]/gi, '')
    },
    openPopupCalendar: function() {
      this.isPopupCalendar = true
    },
    closePopupCalendar: function() {
      this.isPopupCalendar = false
    },
    inputCheckListTitle: function(e) {
      this.write.checklistTitle = e.target.value
    }
  },
  mounted() {
    this.write.userId = localStorage.uuid
    this.write.checklistType = this.mode 

    this.initMode()

    this.calendarDateTimestamp = this.$moment().valueOf()
  },
}
</script>