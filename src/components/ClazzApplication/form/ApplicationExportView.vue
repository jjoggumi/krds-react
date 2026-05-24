<!--
@File(Method): ApplicationExportView.vue
@Date Created: 2025-06-04
@Description: 학교양식신청서 일괄 인쇄/다운로드 생성
@Modified:
-->
<template>
  <fragment>
      <div class="print-div" :data-apply-id="clazzApply.currentId">
        <div
            :id="`application-form-wrap-${clazzApply.currentId}`"
            class="application-form-wrap"
            :class="{ exper: clazzApply.applyType === 'FIELD_STUDY' && option.clickPdf === true }"
        >
          <div class="application-form-top">
            <p class="application-form-title">{{ getFormTitle(clazzApply) }}</p>
            <div class="application-form-confirm">
              <div class="col">
                <p class="title">담임 확인</p>
                <template v-if="clazzApply.applyStatus === 'UNIDENTIFIED'"></template>
                <template v-else>
                  <hc-select
                      :model.sync="clazzApply.applyStatus"
                      selectLabel="name"
                      selectValue="code"
                      :isFocusMode="false"
                      :is-disabled="true"
                      :item="$constants.CLASS_APPLY.applyStatus"
                  />
                </template>
              </div>
              <div class="col">
                <p class="title"></p>
                <div class="blank"></div>
              </div>
              <div class="col">
                <p class="title"></p>
                <div class="blank"></div>
              </div>
            </div>
          </div>

          <absent
              v-if="clazzApply.applyType === 'ABSENT'"
              :isModeView="true"
              :clazz="clazz"
              :model="clazzApply"
              :option="option"
              :formName="clazzApply.applyType"
              :computedApplyDays="getApplyDays(clazzApply)"
          />

          <field-study
              v-else-if="clazzApply.applyType === 'FIELD_STUDY'"
              :isModeView="true"
              :clazz="clazz"
              :model="clazzApply"
              :timeStartEnd="timeStartEnd"
              :option="option"
              :formParentType="getParentType(clazzApply)"
              :formLeaderType="getLeaderType(clazzApply)"
              :formName="clazzApply.applyType"
              :computedApplyDays="getApplyDays(clazzApply)"
              :isManager="isManager"
          />

          <medication-order
              v-else-if="clazzApply.applyType === 'MEDICATION_ORDER'"
              :isModeView="true"
              :isModeCreate="false"
              :clazz="clazz"
              :model="clazzApply"
              :formName="clazzApply.applyType"
              :isManager="isManager"
          />

          <template v-if="clazzApply.applyType === 'MEDICATION_ORDER'">
            <medication-list
                v-for="(medication, idx) of clazzApply.medications" :key="`medication-${idx}`"
                :isModeView="true"
                :medication="medication"
                :medicationLength="clazzApply.medications.length"
                :idx="idx"
            />
          </template>

          <div class="application-form-bottom">
            <p v-html="getFormBottomText(clazzApply)"></p>

            <div class="date-wrap">
              <div class="text-box-wrap">
                <span class="date">{{ $moment(clazzApply.applyTimestamp).format('YYYY년 MM월 DD일') }}</span>
              </div>
            </div>

            <div class="info-wrap">
              <span class="txt-gray">보호자:</span>
              <span class="name pl-05">{{ clazzApply.parentName }}</span>
              <span>(서명)</span>
              <span class="sign">
                <template v-if="isDiffApplyUserId(clazzApply)"> 전자서명완료</template>
                <template v-else><img :src="applyUserSign(clazzApply)" alt=""></template>
              </span>
            </div>

            <p class="principal" v-if="clazzApply.applyType !== 'MEDICATION_ORDER'">{{ clazz.school.schoolName }}장 귀하</p>
          </div>

          <template v-if="clazzApply.applyType === 'MEDICATION_ORDER' && clazzApply.applyStatus === 'COMPLETE' && clazzApply.medicationReport">
            <medication-report-complete :medicationReport="clazzApply.medicationReport"/>
          </template>
        </div>
      </div>
  </fragment>
</template>

<script>
import {mapGetters} from "vuex";
import HcSelect from '@/components/Form/HcSelect'
import FieldStudy from "@/components/ClazzApplication/form/FieldStudy";
import Absent from "@/components/ClazzApplication/form/Absent";
import MedicationOrder from "@/components/ClazzApplication/form/MedicationOrder";
import MedicationList from "@/components/ClazzApplication/form/MedicationList";
import MedicationReportComplete from "@/components/ClazzApplication/form/MedicationReportComplete";
import html2canvas from "html2canvas";

export default {
  name: "application-export-view",
  components: {
    MedicationReportComplete,
    MedicationList,
    MedicationOrder,
    Absent,
    FieldStudy,
    HcSelect
  },
  props: {
    isManager: {
      type: Boolean
    },
    clazz: {
      type: Object
    },
    clazzApply: {
      type: Object
    },
  },
  data() {
    return {
      option: {
        init: false,
        isBusy: false,
        isPrint: true,
        clickPdf: false,
        wrongFormat: {
          parentPhone: false,
          leaderPhone: false
        }
      },
      timeStartEnd: [null, null]
    }
  },
  computed: {
    ...mapGetters(['getParentTypeNameByCode', 'getLeaderTypeNameByCode'])
  },
  async mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')
  },
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  },
  methods: {
    getFormTitle(clazzApply) {
      return {
        'FIELD_STUDY': '체험학습신청서',
        'ABSENT': '결석사유서',
        'MEDICATION_ORDER': '투약의뢰서'
      }[clazzApply.applyType]
    },
    getFormBottomText(clazzApply) {
      return {
        'FIELD_STUDY': '위와 같이 학교장허가 교외체험학습을 신청합니다.',
        'ABSENT': '위같은 사유로 결석하였기에 결석사유서를 제출합니다.',
        'MEDICATION_ORDER': '위와 같이 자녀의 투약을 선생님께 의뢰합니다.<br><span>*투약으로 인한 책임은 의뢰자 (보호자)에게 있습니다.</span>'
      }[clazzApply.applyType]
    },
    getParentType(clazzApply) {
      return clazzApply.parentType === 'ETC'
          ? clazzApply.parentTypeName
          : this.getParentTypeNameByCode({code: clazzApply.parentType})
    },
    getLeaderType(clazzApply) {
      return clazzApply.leaderType === 'ETC'
          ? clazzApply.leaderTypeName
          : this.getLeaderTypeNameByCode({code: clazzApply.leaderType})
    },
    getApplyDays(clazzApply) {
      if (!clazzApply.timestampStart || !clazzApply.timestampEnd) return 0

      let holidays = null
      let localStorageHolidays = localStorage.getItem('calenderHolidays')
      if (localStorageHolidays) {
        try {
          holidays = JSON.parse(localStorageHolidays)
        } catch (error) {
          return 0
        }
      }

      const applyStart = this.$moment(clazzApply.timestampStart).clone()
      const applyEnd = this.$moment(clazzApply.timestampEnd).add(1, 'day').clone()
      let computedApplyDaysExcludeHoliday = 0

      while (applyStart.format('YYYYMMDD') !== applyEnd.format('YYYYMMDD')) {
        const isoWeekday = applyStart.isoWeekday()
        const isHoliday = holidays ? holidays.find(holiday => holiday['yyyymmdd'] === applyStart.format('YYYYMMDD')) : false

        if (!isHoliday && [1, 2, 3, 4, 5].includes(isoWeekday)) {
          ++computedApplyDaysExcludeHoliday
        }

        applyStart.add(1, 'day')
      }

      return computedApplyDaysExcludeHoliday
    },
    isDiffApplyUserId(clazzApply) {
      return clazzApply.insertedUserId !== clazzApply.applyUser.userId
    },
    applyUserSign(clazzApply) {
      return clazzApply.applyUser.userSignImagePath || null
    }
  }
}
</script>

<style scoped>
.print-div {
  width: fit-content;
}
</style>