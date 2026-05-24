<!--
@File(Method): Absent.vue
@Author: -
@Date Created: -
@Description: 
@Modified: 2025-02-20 - #71977 학교양식신청서 및 설문 > 학반(태그) 추가
-->
<template>
  <ul class="application-form-list">
    <li>
      <div class="title">학교</div>
      <div class="text">
        <div v-if="isModeView" class="text-box-wrap">
          <span>{{ clazz.school.schoolName }}</span>
        </div>
        <div v-else class="modify-box-wrap">
          <div class="input-box-wrap readonly">
            <input
                type="text"
                disabled="disabled"
                name="학교"
                v-model="clazz.school.schoolName"
            />
          </div>
        </div>
      </div>
    </li>
    <!-- #71977 학반(태그) 추가 -->
    <li class="half">
      <div class="title">학년</div>
      <div class="text">
        <div v-if="isModeView" class="text-box-wrap">
          <span>{{ getClassGradeName }}</span>
        </div>
        <div v-else class="modify-box-wrap">
          <hc-select
            v-if="clazz.classGradeCode === 'NONE' && clazz.classSchoolType !== 'KINDERGARTEN'"
            :model.sync="model.classGrade"
            selectLabel="gradeName"
            selectValue="classGradeCode"
            defaultLabel="- 선택 -"
            :isFocusMode="false"
            :item="getClassGrades"
          />
          <div v-else class="input-box-wrap readonly">
            <input
                type="text"
                disabled="disabled"
                name="학년"
                :value="getClassGradeName"
            />
          </div>
        </div>
      </div>
    </li>
    <li class="half">
      <div class="title">클래스</div>
      <div class="text">
        <div v-if="isModeView" class="text-box-wrap">
          <span>{{ clazz.classBan }}</span>
        </div>
        <div v-else class="modify-box-wrap">
          <div class="input-box-wrap readonly">
            <input
                type="text"
                disabled="disabled"
                name="학반"
                v-model="clazz.classBan"
            />
          </div>
        </div>
      </div>
    </li>

    <li>
      <div class="title">학생이름</div>
      <div class="text">
        <div v-if="isModeView" class="text-box-wrap">
          <span>{{ model.studentName }}</span>
        </div>
        <div v-else class="modify-box-wrap">
          <div class="input-box-wrap">
            <input
                type="text"
                name="학생이름"
                maxlength="50"
                v-model="model.studentName"
            />
          </div>
        </div>
      </div>
    </li>

    <li class="half">
      <div class="title">보호자명</div>
      <div class="text">
        <div v-if="isModeView" class="text-box-wrap">
          <span>{{ model.parentName }}</span>
        </div>
        <div v-else class="modify-box-wrap">
          <div class="input-box-wrap">
            <input
                type="text"
                name="보호자명"
                maxlength="50"
                v-model="model.parentName"
            />
          </div>
        </div>
      </div>
    </li>

    <li class="half">
      <div class="title">보호자 연락처</div>
      <div class="text">
        <div v-if="isModeView" class="text-box-wrap">
          <span :class="{ 'ft-orange': option.wrongFormat.parentPhone }">{{ $stringUtil.phoneFormatter(model.parentPhone, null) }}</span>
        </div>
        <div v-else class="modify-box-wrap">
          <div class="input-box-wrap">
            <input
                type="text"
                name="보호자 연락처"
                maxlength="11"
                v-model="model.parentPhone"
            />
          </div>
        </div>
      </div>
    </li>

    <li>
      <div class="title">결석기간</div>
      <div class="text">
        <div v-if="isModeView" class="text-box-wrap">
          <span>{{ timestampStr }}</span>
        </div>
        <div v-else class="modify-box-wrap">
          <div class="input-box-wrap period-wrap">
            <date-picker
                name="결석기간(시작일)"
                valueType="timestamp"
                v-model="model.timestampStart"
                style="width: inherit"
                :editable="false"
            ></date-picker>
          </div>
          <span class="wave">~</span>
          <div class="input-box-wrap period-wrap">
            <date-picker
                name="결석기간(종료일)"
                valueType="timestamp"
                :disabled-date="disabledBeforeApplyStartDayAndAfterAWeek"
                v-model="model.timestampEnd"
                style="width: inherit"
                :editable="false"
            ></date-picker>
          </div>
          <span class="period">( {{ computedApplyDays }} )일간</span>
        </div>
      </div>
    </li>

    <li>
      <div class="title">결석구분</div>
      <div class="text">
        <div class="checkbox-wrap">
          <template v-for="(item, index) of absentTypes">
            <input
                :key="`input-formck${index}-${item.code}`"
                type="radio"
                :id="`formck${index}-${model.currentId}`"
                :name="`formck${index}-${model.currentId}`"
                :class="{ dis: option.isPrint ? false : isModeView }"
                :value="item.code"
                :disabled="isModeView"
                v-model="model.absentType"
            >
            <label :key="`label-formck${index}-${item.code}`" :for="`formck${index}-${model.currentId}`">
              <span>{{ item.name }}</span>
            </label>
          </template>
        </div>
      </div>
    </li>
    <li>
      <div class="title">결석사유</div>
      <div class="text">
        <div v-if="isModeView" class="text-box-wrap">
          <span>{{ model.reason }}</span>
        </div>
        <div v-else class="modify-box-wrap">
          <div class="input-box-wrap">
            <div class="textarea-wrap">
              <textarea
                  name="결석사유"
                  placeholder="내용을 입력해주세요"
                  v-model="model.reason"
                  maxlength="250"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </li>

    <clazz-application-form-upload
        title="증빙서류"
        key="clazz-application-form-upload"
        :files.sync="model.files"
        :param="{
          size: $store.state.upload.help.size,
          limit: $store.state.upload.help.limit
        }"
        :readonly="isModeView"
        :unusedFiles="unusedFiles"
        :formName="formName"
        @fileUploadAct="fileUploadAct"
    ></clazz-application-form-upload>
  </ul>
</template>

<script>
import ClazzApplicationFormUpload from '@/components/Upload/Clazzes/ClazzApplicationFormUpload'
import DatePicker from 'vue2-datepicker'
import HcSelect from '@/components/Form/HcSelect'
import {mapState} from "vuex";

export default {
  name: "absent",
  components: {
    ClazzApplicationFormUpload,
    DatePicker,
    HcSelect
  },
  data() {
    return {
      absentTypes: [
        { code: 'SICKNESS', name: '병결' },
        { code: 'RECOGNITION', name: '출석인정' },
        { code: 'UNRECOGNIZED', name: '미인정 결석' },
        { code: 'ETC', name: '기타' }
      ]
    }
  },
  props: {
    isModeView: {
      type: Boolean,
    },
    clazz: {
      type: Object,
    },
    model: {
      type: Object,
    },
    option: {
      type: Object,
    },
    unusedFiles: {
      type: Array,
    },
    formName: {
      type: String,
    },
    computedApplyDays: {
      type: Number,
    }
  },
  computed: {
    ...mapState(['classSchoolGradeType']),
    timestampStr() {
      const start = this.$moment(this.model.timestampStart).format('YYYY-MM-DD') || ''
      const end = this.$moment(this.model.timestampEnd).format('YYYY-MM-DD') || ''
      const applyDays = `(${this.model.applyDays || 0}일간)`
      return `${start} ~ ${end} ${applyDays}`
    },
    isEtcClassSchoolType() {
      return !['KINDERGARTEN', 'ELEMENTARY', 'MIDDLE', 'HIGH', 'UNIVERSITY'].includes(this.clazz.classSchoolType)
    },
    getClassGrades() {
      const classSchoolType = this.isEtcClassSchoolType ? 'ELEMENTARY' : this.clazz.classSchoolType
      return this.classSchoolGradeType[classSchoolType].filter(g => g.classGradeCode !== 'NONE')
    },
    getClassGradeName() {
      const classSchoolType = this.isEtcClassSchoolType ? 'ELEMENTARY' : this.clazz.classSchoolType
      if (classSchoolType === 'KINDERGARTEN' && this.model.classGrade === 'NONE') return '학년 무관'
      return (this.classSchoolGradeType[classSchoolType].find(g => g.classGradeCode === this.model.classGrade) || {}).gradeName
    }
  },
  methods: {
    fileUploadAct() {
      this.$emit('fileUploadAct')
    },
    disabledBeforeApplyStartDayAndAfterAWeek(date) {
      const applyStartDay = this.model.timestampStart
      return date < applyStartDay
    }
  }
}
</script>

<style scoped>

</style>