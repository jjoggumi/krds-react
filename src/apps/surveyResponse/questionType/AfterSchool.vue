<template>
  <div>
    <!-- 방과후신청 타입 -->
    <div v-if="afterSchoolStatus !== 'finish'">
      <div class="group-label" v-if="items.length > 0">
        <span class="label" v-if="question.isMultipleAnswer && question.answerLimit">
        방과후 신청 {{ question.answerLimit }}개 선택
        </span>
        <span class="label" v-else>
        방과후 신청
        </span>
      </div>
      <div class="survey__heading">
        <strong class="heading-sub">신청하실 방과후 프로그램을 선택해주세요.</strong>
      </div>
      <question-description :question="question" />
      <question-img :question="question" />
      <div class="hi-nodata" v-if="items.length === 0"><p>신청 가능한 수업이 없습니다.</p></div>
      <p class="text-notice" v-if="items.length > 0">
        {{ textNotice }}
      </p>
      <div class="fcfs__list">
        <div class="fcfs__item" v-for="(item, idx) in items" :key="item.id" :class="item.toggleInfo ? 'is-opened' : ''">
          <div class="fcfs__content">
            <span class="label" v-if="item.waitStatus === 'COMPLETE'">신청완료</span>
            <span class="label" v-if="item.waitStatus === 'WAIT'">대기자 신청완료</span>
            <div class="fcfs__heading">
              <strong class="heading" :class="{ 'deleted': item.isCanceled }">{{ item.itemTitle }}</strong>
              <div class="group-btn" v-if="item.buttonType === 'closed'">
                <button disabled class="hi-btn btn-md">폐강</button>
              </div>
              <div class="group-btn" v-else-if="item.waitStatus">
                <button class="hi-btn btn-md btn-line"
                        v-if="item.buttonType === 'cancel'"
                        @click="onDelete(item, 'submitCancel')">신청취소
                </button>
                <button class="hi-btn btn-md btn-line"
                        v-if="item.buttonType === 'waitCancel'"
                        @click="onDelete(item, 'submitWaitCancel')">대기자 신청취소
                </button>
              </div>
              <div class="group-btn" v-else>
                <button class="hi-btn btn-md" v-if="item.buttonType === 'submit'"
                        @click="onSubmit(item, 'submit')">신청
                </button>
                <button class="hi-btn btn-md btn-line-lgray"
                        v-if="item.buttonType === 'submitWait'"
                        @click="onSubmit(item, 'submitWait')">대기자 신청
                </button>
                <button disabled class="hi-btn btn-md" v-if="item.buttonType === 'submitEnd'">
                  신청마감
                </button>
              </div>
            </div>
            <div class="fcfs__infobox">
              <p class="num">정원
                <span>{{ item.limit.totalMax }}</span>명
                <span v-if="item.selectionType">{{ item.selectionType === 'FCFS' ? '(선착순)' : '(추첨)' }}</span>
              </p>
              <p class="schedule" v-html="setAfterSchoolTimetables(item)"/>
            </div>
            <div class="fcfs__info">
              <p><span>대상</span><span v-html="setAfterSchoolTargets(item.targets)" /></p>
              <p v-if="item.tuition"><span>수강료</span><span>{{ getItemField1Name(item.tuition) }}</span></p>
              <p v-if="item.instructorName"><span>강사명</span><span>{{ item.instructorName }}</span></p>
            </div>
            <div class="fcfs__desc">
              <p>{{ item.itemDescription }}</p>
            </div>
            <button v-if="!item.isCanceled && item.itemDescription" class="btn-toggle-fcfs"
                    :class="item.toggleInfo ? 'is-active' : ''"
                    @click="onClickInfo(idx)"><span></span></button>
          </div>
        </div>
      </div>
    </div>
    <finish v-if="afterSchoolStatus === 'finish'" :completeList="completeList" />
  </div>
</template>

<script>
import {getAfterSchoolTimetables, getAfterSchoolTargets} from '@/plugins/utils'
import {cloneDeep, isEmpty} from "lodash"
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import Finish from "@/apps/surveyResponse/questionType/SurveyAnswerCompleteComponents/AfterSchoolFinish";
import router from "@/plugins/router";
import QuestionDescription from "@/apps/surveyResponse/questionType/components/Description";
import QuestionImg from "@/apps/surveyResponse/questionType/components/QuestionImg";

export default {
  name: "survey-response-question-type-after",
  components: {
    QuestionDescription,
    QuestionImg,
    Finish
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
  computed: {
    ...mapState('storeSurvey', {
      afterSchoolStatus: 'afterSchoolStatus',
      isSimulation: 'isSimulation'
    }),
    isEnteringBySurveyUrl() {
      const metaClass = this.$route.meta.class || []
      return metaClass.includes('response-type-external')
    },
    textNotice() {
      if (this.isSimulation) {
        return '미리보기시에는 모든 수업 목록이 표시됩니다.'
      } else {
        return this.gradeNumber === 'NONE' ? `※ 유치원생이 신청할 수 있는 수업만 표시됩니다.` : `※ ${this.gradeNumber}학년이 신청할 수 있는 수업만 표시됩니다.`
      }
    }
  },
  beforeDestroy() {
    this.setAfterSchoolStatus('')
  },
  mounted() {
    //todo: 디스크립션 없을때  클래스명:fcfs__desc v-if
    this.setAfterSchoolStatus('next')
    this.setData()
  },
  data() {
    return {
      items: [],
      completeList: [],
      submitButtonType: '',
      gradeText: '',
      gradeNumber: ''
    };
  },
  methods: {
    ...mapMutations('storeSurvey', {
      setRespondentId: 'setRespondentId',
      setAfterSchoolStatus: 'setAfterSchoolStatus'
    }),
    ...mapGetters('storeSurvey', {
      curSurveyAnswer: 'curSurveyAnswer',
    }),
    ...mapActions('storeSurvey', {
      updateServed: 'updateServed',
      getSurveysRespondentInfo: 'getSurveysRespondentInfo',
      getSurveyAnswer: 'getSurveyAnswer',
      deleteSurveyAnswerServed: 'deleteSurveyAnswerServed',
      getSurveyContents: 'getSurveyContents'
    }),
    async setData() {
      if(this.$route.query.respondentId){
        this.setRespondentId(this.$route.query.respondentId)
      }
      if(!this.isSimulation) {
        await this.getSurveysRespondentInfo(this.isEnteringBySurveyUrl)
      }
      let params = {}
      if (this.$route.query.isEditData) {
        // 설문 편집 데이터 요청
        params.isEditData = this.$route.query.isEditData
      }
      await this.getSurveyContents(params)
      if(!this.isSimulation) {
        await this.getSurveyAnswer()
      }
      setTimeout(() => {
        this.items = this.question.items
        if(!isEmpty(this.items)){
          const surveysRespondentInfo = this.$store.state.storeSurvey.surveysRespondentInfo
          const classGrade = surveysRespondentInfo.classGradeCode

          this.gradeNumber = !classGrade ? this.$store.state.storeSurvey.surveys.clazz.classGrade
            : classGrade === 'NONE' ? classGrade : classGrade.substring(1, classGrade.length)
          let arr = []
          let complete = []
          if(this.isSimulation) {
            arr = cloneDeep(this.items)
          } else {
            this.items.forEach(item => {
              item.targets.forEach(target => {
                //target.classGrade === 'NONE'  classGrade === 'K'
                if (target.classGrade === classGrade || target.classGrade === 'NONE') {
                  arr.push(item)
                }
              })
            })
          }
          arr.forEach(item => {
            item.toggleInfo = false
            if (!isEmpty(this.curSurveyAnswer().answers)) {
              this.curSurveyAnswer().answers.forEach(answer => {
                if (item.itemId === answer.itemId) {
                  item.waitStatus = answer.waitStatus
                  complete.push(item)
                }
              })
            }
            item.buttonType = this.setButtonType(item)
          })
          this.items = arr
          this.completeList = complete
        }
      })
    },
    onClickInfo(idx) {
      let obj = cloneDeep(this.items)
      obj[idx].toggleInfo = !obj[idx].toggleInfo
      this.items = obj
    },
    setButtonType(item) {
      if (item.isCanceled) {
        //1.폐강여부 체크(폐강)
        return 'closed'
      } else if (item.waitStatus) {
        //2.현재신청상태 체크
        if (item.waitStatus === 'COMPLETE') {
          //2-1 COMPLETE(신청취소)
          return 'cancel'
        } else {
          //2-2 WAIT(대기자 신청취소)
          return 'waitCancel'
        }
      } else {
        if (item.selectionType === 'FCFS') {
          //3.선착순
          if (item.isLimitedWait) {
            //3-1.대기자 사용여부체크
            if (item.limit.totalMax <= item.limit.totalCount) {
              //3-2.정원과 신청자수 체크
              return item.limit.waitMax > item.limit.waitCount ? 'submitWait' : 'submitEnd'
              //3-3.대기정원과 대기신청자수 체크(대기자 신청, 신청마감)
            }
          } else {
            if (item.limit.totalMax <= item.limit.totalCount) {
              //4.대기자 사용 false 일때 정원과 신청자수 체크(신청마감)
              return 'submitEnd'
            }
          }
        }
      }

      //5.위의 조건에 없을시(신청)
      return 'submit'
    },
    setAfterSchoolTargets(targets) {
      return getAfterSchoolTargets(targets)
    },
    setAfterSchoolTimetables(item) {
      return getAfterSchoolTimetables(item.timetables)
    },
    getItemField1Name(itemField1) {
      const itemField1Name = itemField1
        ? this.$stringUtil.addCommas(itemField1)
        : 0
      return `${itemField1Name} 원`
    },
    onSubmit(item, submitType) {
      if(!this.isSimulation){
        item.questionId = this.question.questionId
        item.submitType = submitType === 'submitWait' ? 'WAIT' : 'APPLY'
        item.type = 'AFTER_SCHOOL'
        this.updateServed(item).then((res) => {
          this.$toasted.clear()
          this.setData()
          if (res.data.status === 'success') {
            this.$toasted.show('신청완료되었습니다')
          } else {
            switch (res.data.errorCode) {
              case "already_applied": {
                return this.$toasted.show('이미 신청한 수업입니다.')
              }
              case "count_exceeded": {
                return this.$toasted.show('정원이 마감되었습니다.')
              }
              case "closed_class": {
                return this.$toasted.show('폐강된 수업입니다.')
              }
              case "overlap_time": {
                let itemTitles = ''
                res.data.errorInfo.overlapItems.forEach((item, idx) => {
                  itemTitles = idx === 0 ? item.itemTitle : `${itemTitles}, ${item.itemTitle}`
                })
                return this.$toasted.show(`${itemTitles} 과 요일/시간이 중복됩니다.`)
              }
              case "answer_limit_exceeded": {
                return this.$toasted.show(`${res.data.errorInfo.answerLimit}개까지 신청 가능합니다.`)
              }
              default: {
                return this.$toasted.show('신청실패')
              }
            }
          }
        })
      }
    },
    onDelete(item, submitType) {
      if(!this.isSimulation){
        item.questionId = this.question.questionId
        item.submitType = submitType === 'submitWaitCancel' ? 'WAIT' : 'APPLY'
        item.type = 'AFTER_SCHOOL'
        this.deleteSurveyAnswerServed(item).then((res) => {
          this.$toasted.clear()
          if (res.data.status === 'success') {
            this.setData()
            this.$toasted.show(submitType === 'submitWaitCancel' ? '신청취소완료되었습니다.' : '신청취소되었습니다.')
          } else {
            this.$toasted.show('신청취소를 실패하였습니다.')
          }
        })
      }
    }
  }
}
</script>