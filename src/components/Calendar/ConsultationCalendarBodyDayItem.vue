<template>
  <li class="booking__item">
    <span
      v-if="propItemsDate.isUsedResponse"
      class="label"
    >
      신청
    </span>

    <span
      class="time"
      role="button"
      @click="onClickTimeEdit"
    >
      {{ `${propItemsDate.itemTimeStart} ~${propItemsDate.itemTimeEnd}` }}
    </span>

    <button
      class="btn-delete"
      @click="onClickTimeDelete"
    ></button>

    <div
      v-if="isOpen"
      class="layer"
      v-click-outside="onClickTimeEditCancel"
    >
      <hi-date-picker
        type="time"
        placeholder="시간 선택"
        format="HH:mm"
        value-type="format"
        :class-name="['hi-timepicker']"
        :range="true"
        :minute-step="5"
        :disabled="false"
        v-model="timeStartEnd"
        @change="timeStartEnd = $event"
      />
      <button
        class="hi-btn btn-md btn-line-lgray"
        @click="onClickTimeEditCancel"
      >
        취소
      </button>
      <button
        class="hi-btn btn-sm btn-edit"
        @click="onClickTimeEditSubmit"
      >
        {{ submitButtonTitle }}
      </button>
    </div>

    <div
      v-if="usedResponseModal.isOpen"
      class="hi-modal-common modal-message"
      style="display: block"
    >
      <div
        class="modal__dim"
        @click="closeUsedResponseModal"
      ></div>

      <div class="modal__layer">
        <div class="modal__header">
          <h2 class="heading">학부모 상담 신청 내역이 있습니다.</h2>
          <button
            class="btn-close"
            @click="closeUsedResponseModal"
          ></button>
        </div>

        <div class="modal__content">
          <p class="desc">삭제한 신청내역은 다시 복구 되지 않습니다. <br>그래도 삭제하시겠습니까? </p>
          <div
            v-if="usedResponseModal.data"
            class="textbox"
          >
            <p>
              {{
                $moment(usedResponseModal.data.itemDate).format('YYYY년 M월 D일 dddd')
              }}
              {{
                `${usedResponseModal.data.itemTimeStart}~${usedResponseModal.data.itemTimeEnd}`
              }}
            </p>
            <p>
              {{ usedResponseModal.data.subjectName }}
              {{ getUserTypeNameByCode({ code: usedResponseModal.data.userType }) }}
              {{ `(${usedResponseModal.data.respondentName})` }}
            </p>
          </div>
        </div>

        <div class="modal__footer">
          <button
            class="hi-btn btn-md btn-line"
            @click="closeUsedResponseModal"
          >
            취소
          </button>
          <button
            class="hi-btn btn-md"
            @click="$emit('do-delete-item', propItemsDate)"
          >
            확인
          </button>
        </div>
      </div>
    </div>

  </li>

</template>

<script>
import {mapGetters, mapState} from "vuex";
import { getTimeToMinute } from "@/plugins/utils";
import HiDatePicker from "@/components/DatePicker/HiDatePicker.vue";

export default {
  name: "consultation-calendar-body-day-item",
  components: {HiDatePicker},
  props: {
    propItemsDate: {
      type: Object
    },
    propItemsDates: {
      type: Array
    }
  },
  data() {
    return {
      isOpen: false,
      isChangeCurrentItem: false,
      timeStartEnd: ['14:00', '17:00'],

      usedResponseModal: {
        isOpen: false,
        data: {}
      },
      propItemsDateCopy: {}
    }
  },
  computed: {
    ...mapState('storeSurvey', {
      apiRequestUrl: 'apiRequestUrl',
      surveyEditQuestions: 'surveyEditQuestions',
    }),
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
      getUserTypeNameByCode: 'getUserTypeNameByCode',
    }),
    ...mapGetters('storeSurvey', {
      curSurveyId: 'curSurveyId',
    }),
    curQuestionId() {
      return this.surveyEditQuestions.questionId
    },
    isAddItem() {
      return this.propItemsDate.isAddItem
    },
    submitButtonTitle() {
      return this.isAddItem ? '추가' : '수정'
    }
  },
  mounted() {
    if (this.propItemsDate.isAddItem) {
      this.openLayer()
    }

    this.propItemsDateCopy = JSON.parse(JSON.stringify(this.propItemsDate))
  },
  beforeDestroy() {
    this.propItemsDate.isAddItem = false
    this.isChangeCurrentItem = false
  },
  methods: {
    openLayer() {
      this.timeStartEnd.splice(0)
      this.timeStartEnd.push(this.propItemsDate.itemTimeStart)
      this.timeStartEnd.push(this.propItemsDate.itemTimeEnd)
      this.isOpen = true
    },
    closeLayer() {
      this.timeStartEnd.splice(0)
      this.timeStartEnd.push('')
      this.timeStartEnd.push('')
      this.isOpen = false
      this.isChangeCurrentItem = false
    },
    openUsedResponseModal() {
      this.usedResponseModal.isOpen = true
    },
    closeUsedResponseModal() {
      this.usedResponseModal.isOpen = false
      this.usedResponseModal.data = {}
    },
    onClickTimeEdit() {
      if (this.propItemsDate.isUsedResponse) {
        const message = `신청내역이 있는 시간은 수정이 불가합니다.`
        this.$toasted.clear()
        this.$toasted.show(message)
      } else {
        this.openLayer()
        this.isChangeCurrentItem = true
      }
    },
    onClickTimeEditCancel(event) {
      // 타임 픽커를 클릭한 경우 픽커 닫지 않음
      const timePickerSelector = [
        'div.mx-datepicker-header',
        'div.mx-scrollbar-track',
        'div.mx-scrollbar-thumb',
        'div.mx-scrollbar.mx-time-column',
        'ul.mx-time-list',
        'li.mx-time-item',
      ]
      const clickedTimePicker = event.target.matches(timePickerSelector)
      if (clickedTimePicker) {
        return false
      }

      if (this.isAddItem) {
        this.$emit('do-delete-item', this.propItemsDate)
      }
      this.closeLayer()
    },
    onClickTimeDelete() {
      if (this.propItemsDate.isUsedResponse) {
        // TODO: 응답 데이터 상세 요청
        this.usedResponseModal.data = {}

        const surveyId = this.curSurveyId
        const questionId = this.curQuestionId
        const date = this.propItemsDate.itemDate

        this.$axios({
          method: 'GET',
          url: `${this.apiRequestUrl.surveyReport}/${surveyId}/consultation/${questionId}/${date}`
        })
          .then(res => {
            const answerItems = res.data
            const foundItem = answerItems.find(answerItem => answerItem.itemTimeStart === this.propItemsDate.itemTimeStart)
            this.usedResponseModal.data = foundItem
              ? foundItem
              : {}

            this.openUsedResponseModal()
          })
          .catch(err => {
            this.$log.warn(this.$options.name, `onClickTimeDelete() err`, err)
          })

      } else {
        this.$emit('do-delete-item', this.propItemsDate)
      }
    },
    async onClickTimeEditSubmit() {
      // try {
      //   await this.$refs.timeSelectBoxes.validateTimeSelectBoxes()
      // } catch (e) {
      //   this.$log.warn(e)
      //   return false
      // }

      const tempTimeStart = this.timeStartEnd[0]
      const tempTimeEnd = this.timeStartEnd[1]
      const tempTimeStartMinute = getTimeToMinute(tempTimeStart)
      const tempTimeEndMinute = getTimeToMinute(tempTimeEnd)

      if (tempTimeStartMinute >= tempTimeEndMinute) {
        const dateTime = `${tempTimeStart} ~ ${tempTimeEnd} `
        const message = `상담 시간을 다시 확인해주세요. ${dateTime}`
        this.$toasted.clear()
        this.$toasted.show(message)
        return false
      }

      const includesTempTime = this.propItemsDates.find(date => {
        const currentDate = !!(date.itemTimeStart === this.propItemsDate.itemTimeStart
          && date.itemTimeEnd === this.propItemsDate.itemTimeEnd
          && (date.isAddItem || this.isChangeCurrentItem)
          // 신규로 추가하거나 현재 시간 범위 수정 시, 변경 전 시간 범위와 동일하면 skip 처리
        )
        if (currentDate) {
          return false
        }

        const itemTimeStartMinute = getTimeToMinute(date.itemTimeStart)
        const itemTimeEndMinute = getTimeToMinute(date.itemTimeEnd)

        // 시작 시간 5분씩 증가시키며 between 체크
        let addTempTimeStartMinute = tempTimeStartMinute
        while (addTempTimeStartMinute <= tempTimeEndMinute) {
          if (addTempTimeStartMinute > itemTimeStartMinute
            && addTempTimeStartMinute < itemTimeEndMinute
          ) {
            return true
          }
          addTempTimeStartMinute += 4
        }
      })

      if (includesTempTime) {
        const dateTime = `${includesTempTime.itemTimeStart} ~ ${includesTempTime.itemTimeEnd} `
        const message = `상담 시간이 중복됩니다. ${dateTime}`
        this.$toasted.clear()
        this.$toasted.show(message)
      } else {
        this.propItemsDate.itemTimeStart = tempTimeStart
        this.propItemsDate.itemTimeEnd = tempTimeEnd
        this.propItemsDate.isAddItem = false
        this.$emit('do-update-item', this.propItemsDate, this.propItemsDateCopy)
        this.closeLayer()
      }
    },
  }
}
</script>

<style scoped>

</style>