<template>
  <div>
    <div v-if="consultationStatus !== 'resultPage' && !appView">
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
          <div :class="['hi-datepicker type-counsel']">
            <DatePicker
              placeholder="상담 날짜 선택"
              v-model="date"
              :default-value="new Date(this.question.consultation.dateStart)"
              :disabled-date="disabledRange"
              format="YYYY년 MM월 DD일 (ddd)"
              :valueType="format"
              :lang="datepickerLang"
              :clearable="false"
              :editable="false"
              popup-class="hi-datepicker type-counsel"
              @change="onChangePicker"
              @pick="onClickPicker"
            />
          </div>
        </div>
      </div>

      <div v-if="date" class="counsel__box">
        <div class="heading-box">2. 상담 시간과 상담유형을 선택하세요.</div>

        <div class="counsel__time">
          <div class="heading-box-sub">상담 시간 선택</div>
          <div class="time__list">
            <div class="time__item" v-for="(item, idx) in items" :key="item.idx">
              <input type="radio" name="time" :id="'time' + idx" :disabled="setItemDisabled(item)" :value="item.itemId"
                     v-model="selectTime">
              <label :for="'time' + idx">
                <span class="time">{{ `${item.itemTimeStart} ~ ${item.itemTimeEnd}` }}</span>
              </label>
            </div>
          </div>
        </div>

        <div class="counsel__type">
          <div class="heading-box-sub">상담 유형 선택</div>
          <div class="type__list">
            <div v-if="question.consultation.isPhone" class="type__item">
              <input type="radio" name="type" id="chk-022" value="PHONE"
                     v-model="consultationType">
              <label for="chk-022"><span>전화</span><span class="m-hide">상담</span>
              </label>
            </div>
            <div v-if="question.consultation.isVisit" class="type__item">
              <input type="radio" name="type" id="chk-033" value="VISIT"
                     v-model="consultationType">
              <label for="chk-033"><span>방문</span><span class="m-hide">상담</span>
              </label>
            </div>
            <div v-if="question.consultation.isRemote" class="type__item">
              <input type="radio" name="type" id="chk-044" value="REMOTE"
                     v-model="consultationType">
              <label for="chk-044"><span>원격</span><span class="m-hide">상담</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      <span v-if="this.index !== this.questions.length-1" class="groupbar"></span>
    </div>
    <consultation-app-view
      v-if="consultationStatus !== 'resultPage' && appView"
      :question="question"
      :format="format"
      :dateList="dateList"
    />
    <result v-if="consultationStatus === 'resultPage'"/>
  </div>
  <!-- //학부모상담 타입 -->
</template>

<script>
import {isEmpty, cloneDeep} from "lodash"
import DatePicker from 'vue2-datepicker'
import 'vue2-datepicker/locale/ko'
import 'vue2-datepicker/index.css'
import {mapGetters, mapMutations} from "vuex";
import Result from "@/apps/surveyResponse/questionType/ConsultationComponents/ConsultationResult";
import ConsultationAppView from "@/apps/surveyResponse/questionType/ConsultationComponents/ConsultationAppView";
import QuestionImg from "@/apps/surveyResponse/questionType/components/QuestionImg";
import QuestionDescription from "@/apps/surveyResponse/questionType/components/Description";


export default {
  name: "survey-response-question-type-consultation",
  components: {
    QuestionDescription,
    QuestionImg,
    ConsultationAppView,
    DatePicker,
    Result
  },
  props: {
    question: {
      type: Object,
      required: true
    },
    questions: {
      type: Array,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      date: '',
      startDate: '',
      endDate: '',
      disabledType: '',
      dateList: [],
      format: 'YYYY-MM-DD',
      items: [],
      selectTime: {},
      consultationType: '',
      datepickerLang: {
        yearFormat: "YYYY년",
        monthFormat: "M월",
      },
      list: {
        classGrade: "2",
        schoolName: "서울시공초등분교",
        classBan: "설문투표테스트",
        respondentName: "고양이",
        subjectName: '',
        classUserType: "TEACHER",
        selectedItem: {
          itemDate: "2023-01-23",
          itemTimeEnd: "14:30",
          itemTimeStart: "14:00"
        },
        consultType: "PHONE"
      }
    }
  },
  computed: {
    appView () {
      return this.$store.state.storeSurvey.appView
    },
    consultationStatus() {
      return this.$store.state.storeSurvey.consultationStatus
    },
    surveyAnswer() {
      return this.$store.state.storeSurvey.curSurveyAnswer
    }
  },
  watch: {
    selectTime(v) {
      if (!this.question.consultation.select) {
        this.setSelect()
      }
      this.question.consultation.select.itemId = v
      if (this.consultationType) {
        this.question.consultation.select.type = this.consultationType
      }
    },
    consultationType(v) {
      if (!this.question.consultation.select) {
        this.setSelect()
      }
      this.question.consultation.select.type = v
      if (this.selectTime) {
        this.question.consultation.select.itemId = this.selectTime
      }
    },
    surveyAnswer() {
      this.setAnswerData()
    }
  },
  mounted() {
    //todo: 설문안함 -> 신청안함  설문하기 -> 신청하기
    this.setData(this.question.consultation)
    this.setConsultationStatus('submitPage')
  },
  beforeDestroy() {
    this.setConsultationStatus('')
  },
  methods: {
    ...mapMutations('storeSurvey', {
      setConsultationStatus: 'setConsultationStatus',
    }),
    ...mapGetters('storeSurvey', {
      curAnswerPageQuestionNumber: 'curAnswerPageQuestionNumber',
      curSurveyAnswer: 'curSurveyAnswer',
      curQuestionsByPageId: 'curQuestionsByPageId'
    }),
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
    setSelect() {
      this.question.consultation.select = {itemId: '', type: ''}
    },
    setData(v) {
      let dates = []
      this.question.consultation.select = {itemId: '', type: ''}
      this.startDate = this.$moment(v.dateStart).format('MM월 DD일 (ddd)')
      this.endDate = this.$moment(v.dateEnd).format('MM월 DD일 (ddd)')
      for (const item in v.items) {
        v.items[item].forEach(date => {
          if(!date.isApply) {
            dates.push(item)
          }
        })
      }
      dates = [...new Set(dates)]
      this.dateList = dates
      this.disabledType = 'choice'
      this.setAnswerData()
    },
    setAnswerData() {
      const questionItems = this.question.consultation.items
      if (!isEmpty(this.curSurveyAnswer().answers)) {
        for (let item in questionItems) {
          for (let v = 0; v < questionItems[item].length; v++) {
            if (this.curSurveyAnswer().answers[this.curSurveyAnswer().answers.length - 1].itemId === questionItems[item][v].itemId) {
              this.date = item
              this.selectTime = this.curSurveyAnswer().answers[this.curSurveyAnswer().answers.length - 1].itemId
              this.onClickPicker(item)
              this.consultationType = this.curSurveyAnswer().answers[this.curSurveyAnswer().answers.length - 1].consultType
            }
          }
        }
      }
    },
    disabledRange(date) {
      let disabled = this.disabledType === 'choice' ? true : false
      if (!isEmpty(this.dateList)) {
        this.dateList.forEach(list => {
          if (list === this.$moment(date).format(this.format)) {
            disabled = this.disabledType === 'choice' ? false : true
          }
        })
      }
      return disabled
    },
    onChangePicker() {
      if (this.question.consultation.select) {
        this.question.consultation.select.itemId = ''
        this.question.consultation.select.type = ''
      }
      this.selectTime = ''
      this.consultationType = ''
    },
    onClickPicker(date) {
      this.date = ''
      setTimeout(() => {
        this.items = cloneDeep(this.question.consultation.items[this.$moment(date).format(this.format)])
        this.date = this.$moment(date).format(this.format)
      })
    }
  }
}
</script>

<style scoped>
</style>