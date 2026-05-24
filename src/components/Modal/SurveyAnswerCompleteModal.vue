<template>
  <div class="hi-modal-common modal-survey-fcfs" style="display: block">
    <div class="modal__dim"></div>
    <div class="modal__layer">
      <div class="modal__header">
        <h2 class="heading">{{ popupInfo.questionType === 'CONSULTATION' ? '학부모 상담일정' : '방과후 수업 신청내역' }}</h2>
        <button class="btn-close" @click="closePopup"></button>
      </div>
      <div class="modal__content" v-if="list">
        <div v-if="popupInfo.questionType === 'CONSULTATION'">
          <p class="counsel__text">{{ `${list.schoolName} ${list.classGrade}학년 ${list.classBan}` }}</p>
          <div class="counsel__details">
          <span :class="className">
            {{ consultType }}
          </span>
            <div class="info">
              <strong class="schedule">{{ scheduleDate }}</strong>
              <span class="class" v-html="respondentNameHtml(list)"/>
            </div>
          </div>
        </div>
        <after-school-complete-contents v-if="popupInfo.questionType === 'AFTER_SCHOOL'" :items="list"/>
      </div>
      <div class="modal__content" v-else>
        <div class="hi-nodata">
          <p>신청 내역이 없습니다.</p>
        </div>
      </div>
      <!-- 2022-12-23 버튼 추가 -->
      <div class="modal__footer"
           v-if="answerStatus !== 'REJECT' && $store.state.storeSurvey.surveys.surveyStatus !== 'END' && list">
        <button class="hi-btn btn-md" @click="updateConsultation">
          {{ popupInfo.questionType === 'CONSULTATION' ? '신청 변경' : '신청 변경/취소' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import {isEmpty} from "lodash"
import AfterSchoolCompleteContents
  from '../../apps/surveyResponse/questionType/SurveyAnswerCompleteComponents/AfterSchoolCompleteContents'
import {eventBus} from "@/main";

export default {
  name: "SurveyAnswerCompleteModal",
  components: {
    AfterSchoolCompleteContents,
  },
  props: {
    surveyId: {
      type: String
    }
  },
  mounted() {
    this.setData()
  },
  data() {
    return {
      list: null,
      popupInfo: {},
      className: '',
      consultType: '',
      scheduleDate: '',
      name: '',
      answerStatus: '',
      errorMessage: {
        404: '유효하지 않는 설문입니다.',
        406: '설문 대상자가 아닙니다.',
        428: '종료된 설문입니다.',
        411: '선생님이 응답을 삭제하여 더 이상 진행할 수 없습니다.<br>새로 설문을 진행해주세요.'
      }
    }
  },
  computed: {
    ...mapGetters({
      curClassId: 'curClassId'
    }),
    ...mapState('storeSurvey', {
      surveys: 'surveys'
    }),
    listEmpty() {
      return isEmpty(this.list)
    },
    currentClassId() {
      return this.surveys.clazz ? this.surveys.clazz.classId : this.curClassId
    }
  },
  methods: {
    ...mapMutations('storeSurvey', {
      setSurveyResponseBodyName: 'setSurveyResponseBodyName',
      setCompletePopup: 'setCompletePopup',
      setRespondentId: 'setRespondentId'
    }),
    ...mapGetters('storeSurvey', {
      curSurveyAnswer: 'curSurveyAnswer',
    }),
    ...mapActions('storeSurvey', {
      getSurveys: 'getSurveys',
      getSurveyAnswer: 'getSurveyAnswer',
      getCompleteAnswersList: 'getCompleteAnswersList',
      getSurveysRespondentInfo: 'getSurveysRespondentInfo'
    }),
    async setData() {
      this.popupInfo = this.$store.state.storeSurvey.completePopup
      this.answerStatus = this.popupInfo.item.answerStatus
      if (this.popupInfo.respondentId !== '') {
        const params = {
          respondentId: this.popupInfo.item.respondentId,
          questionType: this.popupInfo.questionType === 'CONSULTATION' ? 'consultation-answers' : 'after-school-answers'
        }
        this.getCompleteAnswersList(params).then((res) => {
          this.list = this.popupInfo.questionType === 'CONSULTATION' ? res[0] : res
          if (this.popupInfo.questionType === 'CONSULTATION') {
            if (!isEmpty(res)) {
              this.list.classGrade = this.list.classGrade.slice(-1)
              this.name = this.respondentNameHtml(this.list)
              const date = this.$moment(this.list.selectedItem.itemDate).format('MM월 DD일')
              const week = ['일', '월', '화', '수', '목', '금', '토']
              const dayOfWeek = week[new Date(this.list.selectedItem.itemDate).getDay()]
              this.scheduleDate = `${date} ${dayOfWeek}요일 ${this.list.selectedItem.itemTimeStart} ~ ${this.list.selectedItem.itemTimeEnd}`
              switch (this.list.consultType) {
                case "PHONE": {
                  this.className = 'type call'
                  this.consultType = '전화'
                  return this.$t("chat.invalid.counsel.time");
                }
                case "VISIT": {
                  this.className = 'type visit'
                  this.consultType = '방문'
                  return
                }
                default: {
                  this.className = 'type remote'
                  this.consultType = '원격'
                  return
                }
              }
            }
          }
        }).catch(err => {
          console.log(err)
          this.closePopup()
        })
      } else {
        this.list = null
      }
    },
    showAlert(msg) {
      this.$hiClass.alert(msg)
          .then(() => {
            this.closePopup()
            window.location.href.includes('/main/clazzes') ?
                eventBus.$emit('do-search-resource', true) :
                this.$router.push(`/main/clazzes/${this.currentClassId}/survey`, () => {})
          })
    },
    async updateConsultation() {
      this.setRespondentId(this.popupInfo.respondentId)
      this.$store.state.storeSurvey.surveys.surveyId = this.surveyId

      await this.getSurveysRespondentInfo()
          .then(res => {
            this.getSurveyAnswer()
                .then(res => {
                  if (!res) {
                    const msg = this.errorMessage[411]
                    this.showAlert(msg)
                  } else {
                    let routeObj = {
                      path: this.$route.path.includes('sru') ? `/sru/${this.surveyId}` : `/survey-response/${this.surveyId}`
                    }
                    routeObj.query = {respondentId: this.popupInfo.respondentId, bodyName: 'ANSWER', mode: 'change'}
                    this.$router.push(routeObj, () => {
                    })
                    this.closePopup()
                    setTimeout(() => {
                      this.setSurveyResponseBodyName('ANSWER')
                    }, 100)
                  }
                })
          })
          .catch(err => {
            this.showAlert(this.errorMessage[err])
          })
    },
    respondentNameHtml(item) {
      let html = `${item.respondentName}`
      const type = item.classUserType === 'PARENTS' ? '학부모' :
        item.classUserType === 'TEACHER' ? '선생님' :
          item.classUserType === 'STUDENT' ? '학생' : null

      if (item.classUserType === 'TEACHER') {
        html = `${html} ${type}`
        if (item.subjectName) {
          html = `${html} (${item.subjectName})`
        }
      } else {
        html = `${item.subjectName} ${type ? type : ''} (${item.respondentName})`
      }
      return html
    },
    closePopup() {
      this.setCompletePopup({
        flag: false,
        alertDisabled: true,
        respondentId: null
      })
    }
  }
}
</script>