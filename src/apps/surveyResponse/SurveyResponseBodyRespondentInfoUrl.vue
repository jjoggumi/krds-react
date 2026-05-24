<template>
  <div>
    <div class="option__list">
      <div class="option__item">
        <strong class="option__heading required">학교구분</strong>
        <div class="option">
          <div class="hi-selectbox" id="schoolTypeSelectBox">
            <button
              class="selected"
              ref="schoolType"
              @click="openSelectOption('schoolTypeSelectBox')"
            >
              {{ this.selectedSchoolType.typeName }}
            </button>
            <div class="option__layer">
              <button
                :class="schoolTypeClass(item)"
                v-for="item in $constants.SCHOOL_TYPE.all"
                :key="item.schoolType"
                @click="selectSchoolType(item)"
              >
                {{ item.typeName }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="option__item half">
        <strong class="option__heading required">학년</strong>
        <div class="option">
          <div class="hi-selectbox" id="gradeSelectBox">
            <button
              class="selected"
              ref="gradeSelect"
              @click="openSelectOption('gradeSelectBox')"
              :disabled="isKindergarten"
            >
              {{ this.selectedGrade.grade }}
            </button>
            <div class="option__layer">
              <button
                :class="gradeClass(gradeItem)"
                v-for="gradeItem in currentGradeList"
                :key="gradeItem.gradeCode"
                @click="selectGrade(gradeItem)"
              >
                {{ gradeItem.grade }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="option__item half">
        <strong class="option__heading">반 (클래스 이름)</strong>
        <div class="option">
          <div class="inputbox">
            <input
              type="text"
              placeholder="반, 클래스 이름"
              v-model="surveysRespondentInfo.classBan"
            >
          </div>
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
            >
          </div>
        </div>
      </div>
      <div class="option__item half">
        <strong class="option__heading required">학생명</strong>
        <div class="option">
          <div class="inputbox">
            <input
              type="text"
              placeholder="학생명"
              v-model="surveysRespondentInfo.subjectName"
            >
          </div>
        </div>
      </div>
      <div class="option__item half">
        <strong class="option__heading">반 번호</strong>
        <div class="option">
          <div class="inputbox">
            <input
              ref="classNumberRef"
              type="text"
              @input="onInputClassNumber"
              :value="classNumber"
              placeholder="숫자"
              maxlength="2"
            >
          </div>
        </div>
      </div>
      <div class="option__item">
        <strong class="option__heading required">전화번호</strong>
        <div class="option">
          <div class="inputbox">
            <input
              ref="phoneNumberRef"
              type="text"
              placeholder="01000000000"
              @input="onInputPhoneNumber"
              :value="phoneNumber"
              maxlength="11"
            >
            <span class="text-error" v-if="respondentPhoneLength < 10 && phoneNumber.length > 0">숫자 10~11자리를 입력해주세요.</span>
          </div>
        </div>
      </div>
      <div class="option__item">
        <strong class="option__heading required">비밀번호</strong>
        <div class="option">
          <div class="inputbox">
            <input
              ref="passwordRef"
              type="text"
              placeholder="숫자 4자리"
              :value="password"
              @input="onInputPassword"
              maxlength="4"
            >
            <span class="text-refer">* 제출을 완료하지 않은 응답중인 설문 확인 및 수정을 위해 비밀번호를 입력해주세요.</span>
          </div>
        </div>
      </div>
    </div>

    <div class="agreebox">
      <div class="checkbox">
        <input type="checkbox" id="chk2-01" v-model="agreeVal" @click="setAgreeVal">
        <label for="chk2-01"><span><strong>[필수]</strong> 설문 응답을 위해 필요한 개인정보 수집 및 이용 제공에 동의합니다.</span></label>
      </div>

      <ul class="text__list">
        <li class="text__item">- 개인정보 : 응답자명, 전화번호</li>
        <li class="text__item">- 개인정보는 클래스 운영기간 동안 제공되며 클래스 운영 종료 시 일정기간 보관 후 파기됩니다</li>
      </ul>
    </div>
  </div>
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";

export default {
  name: "survey-response-body-respondent-info-url",
  props: {
    agreeVal: Boolean
  },
  computed: {
    ...mapState('storeSurvey', {
      surveys: 'surveys',
      surveysRespondentInfo: 'surveysRespondentInfo'
    }),
    schoolTypeClass() {
        return (item) => item.schoolType === this.selectedSchoolType.schoolType ? 'option is-selected' : 'option'
    },
    gradeClass() {
      return (item) => item.gradeCode === this.selectedGrade.gradeCode ? 'option is-selected' : 'option'
    },
    currentGradeList() {
      return this.$constants.SCHOOL_TYPE.allWithGrade[this.selectedSchoolType.schoolType]
    },
    isKindergarten() {
      return this.selectedSchoolType.schoolType === 'KINDERGARTEN'
    },
    respondentPhoneLength() {
      return this.surveysRespondentInfo.respondentPhone ? this.surveysRespondentInfo.respondentPhone.length : ''
    }
  },
  created () {
    document.addEventListener('click', this.closeSelectBox)
  },
  destroyed () {
    // important to clean up!!
    document.removeEventListener('click', this.closeSelectBox)
  },
  watch:{
    surveysRespondentInfo(v) {},
    phoneNumber(v) {
      this.phoneNumber = this.setNumber(v)
      this.surveysRespondentInfo.respondentPhone = this.phoneNumber
      this.setSurveysRespondentInfoRespondentPhone(this.phoneNumber)
    },
    classNumber(v) {
      this.classNumber = this.setNumber(v)
      this.surveysRespondentInfo.classNumber = this.classNumber
    },
    password(v) {
      this.password = this.setNumber(v)
      this.surveysRespondentInfo.respondentPassword = this.password
    }
  },
  data() {
    return {
      selectedSchoolType: {
        schoolType: '',
        typeName: ''
      },
      selectedGrade: {
        grade: '',
        gradeCode: ''
      },
      password: '',
      phoneNumber: '',
      classNumber: '',
      displayValue: ''
    }
  },
  methods: {
    ...mapActions('storeSurvey', {
      initUrlSurveysRespondentInfo: 'initUrlSurveysRespondentInfo',
      updateSchoolTypeAndClassGrade: 'updateSchoolTypeAndClassGrade',
    }),
    ...mapMutations('storeSurvey', {
      setSurveysRespondentInfoRespondentPhone: 'setSurveysRespondentInfoRespondentPhone'
    }),
    setNumber(v) {
      v = (v + '').replace(/[^0-9]/g, '') + ''
      return v
    },
    onInputPassword() {
      this.password = this.$refs.passwordRef.value
    },
    onInputPhoneNumber() {
      this.phoneNumber = this.$refs.phoneNumberRef.value
    },
    onInputClassNumber() {
      this.classNumber = this.$refs.classNumberRef.value
    },
    closeSelectBox(e) {
      //gradeSelect, schoolType
      if(this.$refs.schoolType && this.$refs.gradeSelect) {
        if (this.$refs.schoolType.contains(e.target)) {
          this.closeSelectOption('gradeSelectBox')
        } else if (this.$refs.gradeSelect.contains(e.target)) {
          this.closeSelectOption('schoolTypeSelectBox')
        } else {
          this.closeSelectOption('gradeSelectBox')
          this.closeSelectOption('schoolTypeSelectBox')
        }
      }
    },
    openSelectOption(selector) {
      let target = document.querySelector(`#${selector}`)
      target.className.includes('is-opened') ?
        target.className = 'hi-selectbox' :
        target.className = 'hi-selectbox is-opened'
    },
    closeSelectOption(selector){
      let target = document.querySelector(`#${selector}`)
      target.className = 'hi-selectbox'
    },
    selectSchoolType(option) {
      //기타일때 초등학교와 동일하게 학년셋팅
      //특수학교는 학년 확인후 수정
      this.selectedSchoolType = option
      this.selectedGrade = this.currentGradeList[0]
      this.updateSchoolTypeAndClassGrade({
        schoolType: this.selectedSchoolType.schoolType,
        classGrade: this.selectedGrade.gradeCode
      })
      this.openSelectOption('schoolTypeSelectBox')
    },
    selectGrade(option) {
      this.selectedGrade = option
      this.updateSchoolTypeAndClassGrade({
        schoolType: this.selectedSchoolType.schoolType,
        classGrade: this.selectedGrade.gradeCode
      })
      this.openSelectOption('gradeSelectBox')
    },
    setSelectedSchoolTypeAndGrade() {
      this.selectedSchoolType = this.$constants.SCHOOL_TYPE.all
        .find(schoolType => schoolType.schoolType === this.surveysRespondentInfo.schoolType)
      this.selectedGrade = this.$constants.SCHOOL_TYPE.allWithGrade[this.selectedSchoolType.schoolType]
        .find(grade => grade.gradeCode === this.surveysRespondentInfo.classGrade)
    },
    setAgreeVal() {
      this.$emit('setAgreeVal')
    }
  },
  mounted() {
    this.initUrlSurveysRespondentInfo()
    this.setSelectedSchoolTypeAndGrade()
  }
}
</script>

<style scoped>
/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}
</style>