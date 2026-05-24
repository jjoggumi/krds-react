<!--
@File(Method): WorksheetApplyCreate.vue
@Author: -
@Date Created: -
@Description: 
@Modified: 2025-02-20 - #71977 학교양식신청서 및 설문 > 학반(태그) 추가
-->
<template>
  <div
    v-if="curClazzApply.classInfo && curClazzApply.classInfo.school && curClazzApply.sheetInfo.title && curClazzApply.model.applyType"
    class="worksheet-container"
  >
    <div class="content">
      <div class="worksheet-form-title">
        <strong>정보입력</strong>
      </div>
      <div class="worksheet-form-list">
        <div class="item">
          <strong class="title">유형</strong>
          <div class="text">
            <span>{{ getApplyTypeNameByCode({ code: curClazzApply.model.applyType }) }}</span>
          </div>
        </div>
        <!-- #71977 태그 중복 삭제
        <div class="worksheet-form-list"> -->        
        <div class="item">
          <strong class="title">신청서 제목</strong>
          <div class="text">
            <span>{{ curClazzApply.sheetInfo.title }}</span>
          </div>
        </div>
        <div class="item">
          <strong class="title">학교</strong>
          <div class="text">
            <span>{{ curClazzApply.classInfo.school.schoolName }}</span>
          </div>
        </div>
        <!-- #71977 학반 태그 추가 -->
        <div class="item half">
          <strong class="title required">학년</strong>
          <div class="text">
            <hc-select
              v-if="curClazzApply.classInfo.classGradeCode === 'NONE' && curClazzApply.classInfo.classSchoolType !== 'KINDERGARTEN'"
              :model.sync="curClazzApply.model.classGrade"
              selectLabel="gradeName"
              selectValue="classGradeCode"
              defaultLabel="- 선택 -"
              :isFocusMode="false"
              :item="getClassGrades"
            />
            <span v-else>{{ getClassGradeName }}</span>
          </div>
        </div>
        <div class="item half">
          <strong class="title">클래스</strong>
          <div class="text">
            <span>{{ curClazzApply.classInfo.classBan }}</span>
          </div>
        </div>
        <div class="item">
          <strong class="title required">작성자</strong>
          <div class="text">
            <input type="text" v-model="curClazzApply.model.parentName" maxlength="50">
          </div>
        </div>
        <div class="item">
          <strong class="title required">신청 학생명</strong>
          <div class="text">
            <input type="text" v-model="curClazzApply.model.studentName" maxlength="50">
          </div>
        </div>
          <!-- #71977 태그 중복 삭제
        </div> --> 
        <div class="worksheet-bottom-wrap">
          <button
            type="button"
            class="btn-bg-c"
            :class="{
                dis: !isReadyCreate
              }"
            :disabled="!isReadyCreate"
            @click="nextStep"
          >다음</button>
        </div>
      </div>
    </div>
  </div>

  <main-loading-new-tab-dim v-else />
</template>

<script>
import {mapActions, mapGetters, mapState} from 'vuex'
import {mapFields} from 'vuex-map-fields'
import MainLoadingNewTabDim from '@/apps/main/MainLoadingNewTabDim'
import HcSelect from '@/components/Form/HcSelect'

export default {
  name: "worksheet-apply-create",
  components: {MainLoadingNewTabDim, HcSelect},
  props: {},
  data() {
    return {
      option: {
        required: [
          {
            key: 'parentName',
            type: String,
          },
          {
            key: 'studentName',
            type: String,
          },
          {
            key: 'userId',
            type: String,
          },
          {
            key: 'classId',
            type: String,
          },
          {
            key: 'classGrade',
            type: String,
          },
        ],
        isVisible: false,
      },
      classGrade: null
    }
  },
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
      getApplyTypeNameByCode: "getApplyTypeNameByCode",
    }),
    ...mapGetters('storeWorksheet', {
      clazzApplyComponentsByCode: 'clazzApplyComponentsByCode',
      curClazzApplyCode: 'curClazzApplyCode',
    }),
    ...mapFields({
      isDimLoading: 'isDimLoading',
      notSupportedBrowser: 'notSupportedBrowser'
    }),
    ...mapFields('storeWorksheet', {
      curClazzApply: 'curClazzApply'
    }),
    ...mapState(['classSchoolGradeType']),
    isReadyCreate() {
      let result = true

      this.option.required.forEach(item => {
        switch (item.type) {
          case String:
            if (!this.curClazzApply.model[item.key]) result = false
            else if (this.curClazzApply.model[item.key].trim().length === 0) result = false
            break

          case Array:
            if (this.curClazzApply.model[item.key].length === 0) result = false
            break
        }
      })

      return result
    },
    classGradeBan() {
      if (this.curClazzApply && this.curClazzApply.classInfo) {
        const classInfo = this.curClazzApply.classInfo
        const classGrade = classInfo.classGrade !== 'ANY'
          ? `${classInfo.classGrade || '?'}학년`
          : ''
        const classBan = `${classInfo.classBan || '?'}`
        return classGrade ? classGrade + ' ' + classBan : classBan

      } else {
        return ''
      }
    },
    isEtcClassSchoolType() {
      return !['KINDERGARTEN', 'ELEMENTARY', 'MIDDLE', 'HIGH', 'UNIVERSITY'].includes(this.curClazzApply.classInfo.classSchoolType)
    },
    getClassGrades() {
      const classSchoolType = this.isEtcClassSchoolType ? 'ELEMENTARY' : this.curClazzApply.classInfo.classSchoolType
      return this.classSchoolGradeType[classSchoolType].filter(g => g.classGradeCode !== 'NONE')
    },
    getClassGradeName() {
      const classSchoolType = this.isEtcClassSchoolType ? 'ELEMENTARY' : this.curClazzApply.classInfo.classSchoolType
      if (classSchoolType === 'KINDERGARTEN' && this.curClazzApply.model.classGrade === 'NONE') return '학년 무관'
      return (this.classSchoolGradeType[classSchoolType].find(g => g.classGradeCode === this.curClazzApply.model.classGrade) || {}).gradeName
    }
  },

  /*beforeRouteEnter(to, from, next) {
  },*/

  created() {
    if (this.$comn.isIE()) {
      this.notSupportedBrowser.isOpen = true
      this.notSupportedBrowser.pageName = 'worksheetCreate'

    } else {
      /**
       * 이전 페이지에서 신청서 데이터를 가져온 경우
       * (서버에 데이터 요청 하지 않음)
       */
      if (this.curClazzApply.model.sheetId) {
        this.initModel(this.curClazzApply.sheetInfo)

        this.initCurClazzApplyClassSubscribe({
          userId: this.curClazzApply.model.userId,
          classId: this.curClazzApply.model.classId,
        })

      } else {
        this.$hiClass.alert('정상적인 접근이 아닙니다.')
          .then(() => {
            this.$router.back()
          })
      }

    }
  },

  methods: {
    ...mapActions('storeWorksheet', {
      initCurClazzApplyClassSubscribe: 'initCurClazzApplyClassSubscribe'
    }),
    initModel(data) {
      this.curClazzApply.model.sheetId = data.sheetId
      this.curClazzApply.model.sheetType =  data.sheetType
      this.curClazzApply.model.applyType = data.applyType
      this.curClazzApply.model.classId = data.parentId
      this.$set(this.curClazzApply.model, 'classGrade',
          this.curClazzApply.classInfo.classGradeCode === 'NONE' && this.curClazzApply.classInfo.classSchoolType !== 'KINDERGARTEN' ? '' : this.curClazzApply.classInfo.classGradeCode
      )
    },

    // 신청서 정보 임시 등록 (페이지 재 진입시 초기화)
    nextStep() {
      this.isDimLoading = true
      this.curClazzApply.componentName =
        this.clazzApplyComponentsByCode({code: this.CONSTANTS.WORKSHEET_APPLY.MODIFY}).name

      setTimeout(() => {
        this.isDimLoading = false
      }, 200)
    },

  },

  watch: {
    'curClazzApply.model.parentName'(newVal, oldVal) {
      const regexpEmojiPresentation = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
      if (newVal && newVal.match(regexpEmojiPresentation)) {
        this.curClazzApply.model.parentName = oldVal
      }
    },
    'curClazzApply.model.studentName'(newVal, oldVal) {
      const regexpEmojiPresentation = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
      if (newVal && newVal.match(regexpEmojiPresentation)) {
        this.curClazzApply.model.studentName = oldVal
      }
    }
  }
}
</script>

<style scoped>

</style>