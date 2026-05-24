<template>
  <div
    v-if="consultationSetting"
    class="fcfs__edit"
  >
    <div class="option__list">
      <div class="option__item">
        <strong class="option__heading required">상담 기간</strong>
        <div class="option">
          <hi-date-picker
            placeholder="시작일 선택"
            :disabledDate="notBeforeTodayOrWeekend"
            :format="'YYYY년 M월 D일'"
            :valueType="'YYYY-MM-DD'"
            :disabled="isCurSurveyPublished"
            v-model="dateStart"
            @change="onChangeDateStart"
          />
          <span class="wave">~</span>
          <hi-date-picker
            placeholder="종료일 선택"
            :disabledDate="notBeforeDateStartOrWeekend"
            :format="'YYYY년 M월 D일'"
            :valueType="'YYYY-MM-DD'"
            v-model="dateEnd"
            @change="onChangeDateEnd"
          />
        </div>
      </div>

      <div class="option__item">
        <strong class="option__heading required">상담 시간</strong>
        <div class="option">
          <hi-date-picker
            type="time"
            placeholder="시간 선택"
            format="HH:mm"
            value-type="format"
            :class-name="['hi-timepicker']"
            :range="true"
            :minute-step="5"
            :disabled="isCurSurveyPublished"
            v-model="model.timeStartEnd"
            @change="setConsultationSettingTime"
          />
        </div>
      </div>

      <div class="option__item">
        <strong class="option__heading required">상담 소요 시간</strong>
        <div class="option">
          <hi-select-box
            :value.sync="model.timeConsultation"
            :default-value="30"
            :items="timeConsultationItems"
            :disabled="isCurSurveyPublished"
          />
          <span class="text">분</span>
        </div>
      </div>

      <div class="option__item">
        <strong class="option__heading required">선생님 휴식시간</strong>
        <div class="option">
          <hi-select-box
            :value.sync="model.timeRecess"
            :default-value="5"
            :items="timeRecessItems"
            :disabled="isCurSurveyPublished"
          />
          <span class="text">분</span>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import {mapGetters, mapState} from "vuex";

import HiDatePicker from "@/components/DatePicker/HiDatePicker.vue";
import HiSelectBox from "@/components/Form/HiSelectBox.vue";

export default {
  name: "survey-create-question-type-consultation-edit",
  components: {
    HiSelectBox,
    HiDatePicker,
  },
  data() {
    return {
      datePickerFormat: 'YYYY-MM-DD',
      dateStart: null,
      dateEnd: null,
      model: {
        timeStartEnd: [],
        timeConsultation: 30,
        timeRecess: 5
      }
    }
  },
  computed: {
    ...mapState('storeSurvey', {
      surveyEditQuestions: 'surveyEditQuestions',
    }),
    ...mapGetters('storeSurvey', {
      isCurSurveyPublished: 'isCurSurveyPublished'
    }),
    consultationSetting() {
      return this.surveyEditQuestions.consultationSetting
    },
    timeConsultationItems() {
      return [
        { title:  '5', value:  5 },
        { title: '10', value: 10 },
        { title: '15', value: 15 },
        { title: '20', value: 20 },
        { title: '25', value: 25 },
        { title: '30', value: 30 },

        { title: '35', value: 35 },
        { title: '40', value: 40 },
        { title: '45', value: 45 },
        { title: '50', value: 50 },
        { title: '55', value: 55 },
        { title: '60', value: 60 },
      ]
    },
    timeRecessItems() {
      const timeRecessItems = [
        { title:  '0', value:  0 }
      ]
      timeRecessItems.push(...this.timeConsultationItems)
      return timeRecessItems
    }
  },
  // watch: {
  //   // 'model.timeStartEnd'() {
  //   //   this.setConsultationSettingTime()
  //   // },
  //   // 'model.timeConsultation'(v){
  //   //   this.consultationSetting.timeConsultation = v
  //   // },
  //   // 'model.timeRecess'(v){
  //   //   this.consultationSetting.timeRecess = v
  //   // }
  // },
  beforeMount() {
    this.initModelTime()
  },
  mounted() {
    // if (!this.consultationSetting.dateStart || !this.consultationSetting.dateEnd) {
    //   this.initConsultationSettingDate()
    // }
    this.initConsultationSettingDate()
  },
  // updated() {
  //   if (!this.consultationSetting.dateStart || !this.consultationSetting.dateEnd) {
  //     this.initConsultationSettingDate()
  //   }
  //   this.setConsultationSettingTime()
  // },
  methods: {
    initConsultationSettingDate() {
      // const startObj = this.$moment().add(7, 'day')
      // this.consultationSetting.dateStart = startObj.format(this.datePickerFormat)

      // const endObj = this.$moment(this.consultationSetting.dateStart).add(7, 'day')
      // this.consultationSetting.dateEnd = endObj.format(this.datePickerFormat)

      if(this.consultationSetting.dateStart) {
        this.dateStart = this.consultationSetting.dateStart
      } else {
        const startObj = this.$moment().add(7, 'day')
        this.dateStart = startObj.format(this.datePickerFormat)
      }

      if(this.consultationSetting.dateEnd) {
        this.dateEnd = this.consultationSetting.dateEnd
      } else{
        const endObj = this.$moment(this.dateStart).add(7, 'day')
        this.dateEnd = endObj.format(this.datePickerFormat)
      }

      if(this.consultationSetting.timeConsultation) {
        this.model.timeConsultation = this.consultationSetting.timeConsultation
      }

      if(this.consultationSetting.timeRecess) {
        this.model.timeRecess = this.consultationSetting.timeRecess
      }
    },
    initModelTime() {
      const timeStart = this.consultationSetting['timeStart'] || '14:00'
      const timeEnd = this.consultationSetting['timeEnd'] || '17:00'

      this.model.timeStartEnd.splice(0)
      this.model.timeStartEnd.push(timeStart)
      this.model.timeStartEnd.push(timeEnd)
    },
    // setConsultationSettingTime() {
    //   const timeStart = this.model.timeStartEnd[0]
    //   const timeEnd = this.model.timeStartEnd[1]
    //   this.consultationSetting.timeStart = timeStart
    //   this.consultationSetting.timeEnd = timeEnd
    // },
    setConsultationSettingTime(value) {
      this.model.timeStartEnd = value
      // const timeStart = value[0]
      // const timeEnd = value[1]
      // this.consultationSetting.timeStart = timeStart
      // this.consultationSetting.timeEnd = timeEnd
    }, 
    onChangeDateStart(value) {
      this.dateStart = value
      //this.consultationSetting.dateStart = value
    },
    onChangeDateEnd(value) {
      this.dateEnd = value
      //this.consultationSetting.dateEnd = value
    },
    notBeforeTodayOrWeekend(date) {
      return date < new Date(new Date().setHours(0, 0, 0, 0))
        || this.isWeekend(date)
    },
    notBeforeDateStartOrWeekend(date) {
      const dateStartTimestamp = this.$moment().valueOf() > this.$moment(this.dateStart).valueOf() ? this.$moment().valueOf() : this.$moment(this.dateStart).valueOf()
      return date < new Date(new Date(dateStartTimestamp).setHours(0, 0, 0, 0))
        || this.isWeekend(date)
    },
    isWeekend(date) {
      const dayOfWeek = date.getDay()
      return (dayOfWeek === 6) || (dayOfWeek === 0)
    }
  }
}
</script>

<style scoped>

</style>