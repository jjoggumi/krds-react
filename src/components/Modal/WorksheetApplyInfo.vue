<!--
@File(Method): WorksheetApplyInfo.vue
@Author: -
@Date Created: -
@Description: 
@Modified: 2025-02-20 - #71977 학교양식신청서 및 설문 > 학반(태그) 추가
-->
<template>
  <!-- POPUP 신청서 정보 변경 -->
  <modal
    :modal-name="'worksheetApplyInfo'"
    :class-list="{
      modal: ['common-modal'],
      modalContWrap: [],
      modalCont: ['boundary-box'],
    }"
    @modal-close="close"
  >
    <template v-slot:modalContInner>
      <div class="modal-cont-inner">
        <div class="modal-title-wrap">
          <div class="title">신청서 정보 변경</div>
        </div>
        <div class="worksheet-form-list">
          <div class="item">
            <strong class="title">유형</strong>
            <div class="text">
              <span>{{ getApplyTypeNameByCode({ code: curClazzApply.model.applyType }) }}</span>
            </div>
          </div>
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
          <!-- #71977 학반(태그) 추가 -->
          <div class="item">
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
          <div class="item">
            <strong class="title">클래스</strong>
            <div class="text">
              <span>{{ curClazzApply.classInfo.classBan }}</span>
            </div>
          </div>          
          <div class="item">
            <strong class="title required">작성자</strong>
            <div class="text">
              <input
                type="text"
                name="parentName"
                v-model="parentName"
              >
            </div>
          </div>
          <div class="item">
            <strong class="title required">신청 학생명</strong>
            <div class="text">
              <input
                type="text"
                name="studentName"
                v-model="studentName"
                @keyup.enter="doSubmit"
              >
            </div>
          </div>
        </div>
        <div class="text-wrap">
          <p class="text-lg">신청서 수정화면에서 최종 저장해주세요.</p>
        </div>
        <div class="btn-wrap">
          <button
            class="btn-bg-c"
            :class="{
                dis: !isReadySubmit
              }"
            :disabled="!isReadySubmit"
            @click="doSubmit"
          >
            {{ $t('button.ok') }}
          </button>
        </div>
      </div>
    </template>
  </modal>
</template>

<script>
import {mapFields} from "vuex-map-fields";
import {mapGetters, mapState} from "vuex";
import Modal from "@/components/Modal/ModalLayout";
import HcSelect from '@/components/Form/HcSelect'

export default {
  name: "worksheet-apply-info",
  components: {Modal,HcSelect},
  data() {
    return {
      parentName: null,
      studentName: null,
    }
  },
  computed: {
    ...mapGetters({
      getApplyTypeNameByCode: "getApplyTypeNameByCode",
    }),
    ...mapFields('storeWorksheet', {
      curClazzApply: 'curClazzApply',
      worksheetApplyInfo: 'worksheetApplyInfo',
    }),
    ...mapState(['classSchoolGradeType']),
    isReadySubmit() {
      return this.parentName && this.studentName
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
  created() {
    this.parentName = this.curClazzApply.model.parentName
    this.studentName = this.curClazzApply.model.studentName
  },
  methods: {
    close() {
      this.worksheetApplyInfo.isOpen = false
    },
    doSubmit() {
      this.curClazzApply.model.parentName = this.parentName
      this.curClazzApply.model.studentName = this.studentName

      this.close()
    },

  }
}
</script>