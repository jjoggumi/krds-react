<!--
@File(Method): SurveyResponseBodyRespondentInfoDefault.vue
@Author: -
@Date Created: -
@Description: 클래스 > 수업관리 > 설문·투표 > 설문하기 > 응답자 정보 확인
@Modified: 2025-02-20 - #71977 학교양식신청서 및 설문 > 학반(태그) 추가 : 학년/반  >> 학년 , 클래스 로 구분
-->
<template>
  <div class="option__list">
    <div class="option__item">
      <strong class="option__heading">학교</strong>
      <div class="option">
        <p class="text">{{ surveysRespondentInfo.schoolName }}</p>
      </div>
    </div>
    <div class="option__item half" v-if="surveysRespondentInfo.schoolType !== 'KINDERGARTEN'">
      <strong class="option__heading required">학년</strong>
      <hi-select-box
        v-if="isAnyGraded"
        :value.sync="gradeValue"
        :disabled="surveysRespondentInfo.schoolType === 'KINDERGARTEN'"
        :items="items"
      />
      <div class="option" v-else>
        <p class="text">{{ `${surveysRespondentInfo.classGrade}학년` }}</p>
      </div>
    </div>
    <div class="option__item half" v-if="surveysRespondentInfo.schoolType !== 'KINDERGARTEN'">
      <strong class="option__heading required">클래스</strong>
      <div class="option">
        <p class="text">{{ `${surveysRespondentInfo.classBan}` }}</p>
      </div>
    </div>
    <div class="option__item" v-if="(surveysRespondentInfo.classGrade === 'NONE' || surveysRespondentInfo.classGrade === 'ANY') && surveysRespondentInfo.schoolType === 'KINDERGARTEN'">
      <strong class="option__heading required">학반(학년/반)</strong>
      <div class="option">
        <p class="text">{{ `${surveysRespondentInfo.classBan}` }}</p>
      </div>
    </div>
    <div class="option__item half" v-if="surveysRespondentInfo.classGrade === 'NONE'">
      <strong class="option__heading">반 (클래스 이름)</strong>
      <div class="option">
        <p class="text">{{ `${surveysRespondentInfo.classBan}반` }}</p>
      </div>
    </div>
    <div class="option__item">
      <strong class="option__heading required">응답자명</strong>
      <div class="option">
        <div class="inputbox">
          <input
              type="text"
              placeholder="응답자명"
              v-model="surveysRespondentInfo.respondentName"
              @input="inputLengthCheck($event, 'respondentName')"
          >
        </div>
      </div>
    </div>
    <div class="option__item">
      <strong :class="'option__heading'" class="required" >학생명</strong>
      <div class="option">
        <div class="inputbox">
          <input
              type="text"
              placeholder="학생명"
              v-model="surveysRespondentInfo.subjectName"
              @input="inputLengthCheck($event, 'subjectName')"
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import HiSelectBox from "@/components/Form/HiSelectBox.vue";
import router from "@/plugins/router";

export default {
  name: "survey-response-body-respondent-info-default",
  components: {HiSelectBox},
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
    }),
    ...mapState('storeSurvey', {
      isSimulation: 'isSimulation',
      surveys: 'surveys',
      surveysRespondentInfo: 'surveysRespondentInfo'
    }),
    hasSurveysRespondentInfo() {
      return Object.keys(this.surveysRespondentInfo).length > 0
    },
    schoolName() {
      return this.hasSurveysRespondentInfo ? this.surveysRespondentInfo.schoolName : ''
    },
    classGrade() {
      return this.hasSurveysRespondentInfo ? this.surveysRespondentInfo.classGrade : ''
    },
    classBan() {
      return this.hasSurveysRespondentInfo ? this.surveysRespondentInfo.classBan : ''
    },
    respondentName() {
      return this.hasSurveysRespondentInfo ? this.surveysRespondentInfo.respondentName : ''
    },
    userType() {
      return this.hasSurveysRespondentInfo ? this.surveysRespondentInfo.userType : ''
    },
    isAnyGraded() {
      return ['ANY', 'NONE'].includes(this.classGrade)
    },
  },
  data() {
    return {
      respondentInfo: {},
      items: [
        {
          value: '',
          title: ''
        }
      ],
      gradeValue: '',
      inputPrev: {
        respondentName: '',
        subjectName: ''
      }
    }
  },
  watch: {
    gradeValue(v) {
      if((this.surveysRespondentInfo.classGrade === 'NONE' || this.surveysRespondentInfo.classGrade === 'ANY')
        && this.surveysRespondentInfo.schoolType !== 'KINDERGARTEN') {
        this.surveysRespondentInfo.classGradeCode = v
      }
    }
  },
  async mounted() {
    if(this.isSimulation) {
      const memberRole = this.$store.state.storeSurvey.surveys.clazz.memberRole
      // 관리자 시뮬레이션 위한 정보입력
      const respondentInfo = {
        schoolName: this.$store.state.storeSurvey.surveys.school.schoolName,
        classGrade: this.$store.state.storeSurvey.surveys.clazz.classGrade,
        classBan: this.$store.state.storeSurvey.surveys.clazz.classBan,
        respondentName: this.$store.state.user.userName,
        subjectName: '',
        memberRole
      }
      this.setSurveysRespondentInfo(respondentInfo)
    } else {
      try {
        await this.getSurveysRespondentInfo().then(res => {
          if(res === 406) {
            this.goRouteSurveyList()
          }
          this.inputPrev.respondentName = res.respondentName ? res.respondentName : ''
          this.inputPrev.subjectName = res.subjectName ? res.subjectName : ''
        })
      } catch (error) {
        this.$log.debug(error)
      }
    }
    this.setItems()
  },
  methods: {
    ...mapActions('storeSurvey', {
      getSurveysRespondentInfo: 'getSurveysRespondentInfo',
      goRouteSurveyList: 'goRouteSurveyList'
    }),
    ...mapMutations('storeSurvey', {
      setSurveysRespondentInfo: 'setSurveysRespondentInfo'
    }),
    setItems() {
      if(this.isSimulation) {
        this.surveysRespondentInfo.schoolType = this.surveys.school.schoolType
      }
      const schoolType = this.surveysRespondentInfo.schoolType ? this.surveysRespondentInfo.schoolType : this.surveys.school.schoolType
      let arr = []
      let count = schoolType === 'UNIVERSITY' ? 4 : schoolType === 'HIGH' || schoolType === 'MIDDLE' ? 3 : 6
      let grade = schoolType === 'UNIVERSITY' ? 'U' : schoolType === 'HIGH' ? 'H' : schoolType === 'MIDDLE' ? 'M' : 'E'
      for (let i=1; i <= count; i++) {
        arr.push({value: `${grade}${i}`, title: `${i}학년`})
      }
      this.items = arr
      this.gradeValue = this.items[0].value
    },
    inputLengthCheck(e, field) {
      let value = e.target.value

      value = value.replace(/[^A-Za-z0-9\sㄱ-ㅎㅏ-ㅣ가-힣]/g, '')

      if ([...value].length > 50) {
        value = this.inputPrev[field]
      }

      this.surveysRespondentInfo[field] = value
      this.inputPrev[field] = value
    }
  }
}
</script>

<style scoped>

</style>