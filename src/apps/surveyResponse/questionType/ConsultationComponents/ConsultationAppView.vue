<template>
  <div>
    <div class="group-label">
      <span class="label required">필수응답</span>
      <span class="label">학부모상담</span>
    </div>
    <div class="survey__heading">
      <strong class="heading-sub">{{ question.questionTitle }}</strong>
    </div>
    <question-description :question="question" />
    <question-img :question="question" />
    <p class="counsel__text">상담기간 : {{ startDate }} ~ {{ endDate }}</p>

    <div class="counsel__box">
      <div class="heading-box">1. 상담 날짜를 선택하세요.</div>
      <div class="counsel__date">
        <!-- 2022-12-23 placeholder 변경, appendToBody 추가 -->
        <HiDatePicker
          ref="hi_picker"
          :className="['hi-datepicker type-counsel']"
          placeholder="상담 날짜를 선택하세요."
          :disabledDate="disabledRange"
          :format="'YYYY년 MMMM D일 (dd)'"
          :appendToBody="false"
          @onClickPicker="onClickPicker"
        />
      </div>
    </div>

    <div class="counsel__box">
      <div class="heading-box">2. 상담 시간과 상담유형을 선택하세요.</div>
      <div class="counsel__time">
        <div class="heading-box-sub">상담 시간 선택</div>

        <!-- 2022-12-23 추가 > m-btn-toggle-counsel -->
        <button class="m-btn-toggle-counsel"
                ref="time_button"
                :class="{ 'is-active' : isActiveTime, 'is-selected' : isSelectedTime }"
                @click="isActiveTime = !isActiveTime"
        >
          <span v-if="!isSelectedTime">상담 시간 선택</span>
          <span v-if="isSelectedTime">{{ timeText }}</span>
        </button>

        <p class="nodata" style="display: none">상담 날짜를 먼저 선택해주세요.</p>
        <!-- 2022-12-23 추가 https://www.figma.com/file/XXt4KjviJ8HWReBdxGhkP8?node-id=6063:31053#328086685 -->

        <div class="time__list" v-if="isActiveTime">
          <div class="time__item" v-for="(item, idx) in items" :key="idx">
            <input type="radio" name="time" :id="'time' + idx" :disabled="setItemDisabled(item)" :value="item" v-model="selectTime">
            <label :for="'time' + idx" @click="isSelectedTime = true">
              <span class="time">{{ `${item.itemTimeStart} ~ ${item.itemTimeEnd}` }}</span>
            </label>
          </div>
        </div>
      </div>

      <div class="counsel__type">
        <div class="heading-box-sub">상담 유형 선택</div>
        <button class="m-btn-toggle-counsel"
                ref="select_type"
                :class="{ 'is-active' : isActiveType, 'is-selected' : isSelectedType !== '상담 유형 선택' }"
                @click="isActiveType = !isActiveType"
        >
          <span>{{isSelectedType}}</span>
        </button>
        <div class="type__list" v-if="isActiveType">
          <div class="type__item" v-if="question.consultation.isPhone">
            <input type="radio" name="type" id="chk-022" @click="isSelectedType = '전화상담'">
            <label for="chk-022"><span>전화상담</span></label>
          </div>
          <div class="type__item" v-if="question.consultation.isVisit">
            <input type="radio" name="type" id="chk-033" @click="isSelectedType = '방문상담'">
            <label for="chk-033"><span>방문상담</span></label>
          </div>
          <div class="type__item" v-if="question.consultation.isRemote">
            <input type="radio" name="type" id="chk-044" @click="isSelectedType = '원격상담'">
            <label for="chk-044"><span>원격상담</span></label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HiDatePicker from "@/components/DatePicker/HiDatePicker.vue";
import {cloneDeep, isEmpty} from "lodash";
import {mapGetters} from "vuex";
import QuestionImg from "@/apps/surveyResponse/questionType/components/QuestionImg";
import QuestionDescription from "@/apps/surveyResponse/questionType/components/Description";

export default {
  name: "ConsultationAppView",
  components: {
    HiDatePicker,
    QuestionDescription,
    QuestionImg
  },
  props: {
    question: {
      type: Object
    },
    dateList: {
      type: Array
    },
    format: {
      type: String
    }
  },
  data() {
    return {
      selectTime: {},
      timeText: '',
      startDate: '',
      endDate: '',
      isActiveDate: false,
      isSelectedDate: false,
      isActiveTime: false,
      isSelectedTime: false,
      isActiveType: false,
      isSelectedType: '상담 유형 선택',
    }
  },
  watch: {
    selectTime(v) {
      this.timeText = `${v.itemTimeStart} ~ ${v.itemTimeEnd}`
      this.$refs.time_button.click()
      this.$refs.select_type.click()
    }
  },
  mounted() {
    this.startDate = this.$moment(this.question.consultation.dateStart).format('MM월 DD일')
    this.endDate = this.$moment(this.question.consultation.dateEnd).format('MM월 DD일')
  },
  methods: {
    ...mapGetters('storeSurvey', {
      curSurveyAnswer: 'curSurveyAnswer'
    }),
    disabledRange(date) {
      let disabled = this.disabledType === 'choice' ? true : false
      if (!isEmpty(this.dateList)) {
        this.dateList.forEach(list => {
          if (list === this.$moment(date).format(this.format)) {
            disabled = this.disabledType === 'choice' ? false : true
          }
        })
      }
      return !disabled
    },
    onClickPicker(v) {
      this.date = ''
      setTimeout(() => {
        this.items = cloneDeep(this.question.consultation.items[this.$moment(v).format(this.format)])
        this.$refs.hi_picker.onClosePicker()
        this.$refs.time_button.click()
      })
    },
    setItemDisabled(item) {
      if (item.isApply) {
        if (isEmpty(this.curSurveyAnswer().answers)) {
          return true
        } else {
          const itemId = this.curSurveyAnswer().answers[this.curSurveyAnswer().answers.length - 1].itemId
          return itemId === item.itemId ? false : true
        }
      } else {
        return false
      }
    },
  }
}
</script>

<style scoped>

</style>