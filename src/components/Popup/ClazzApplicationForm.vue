<!--
@File(Method): ClazzApplicationForm.vue
@Author: -
@Date Created: -
@Description: 클래스 > 수업관리 > 학교 양식 신청서 > 사용중인 양식 > 작성하기 모달
@Modified: 2024-11-19 - #69550 투약의뢰서 개선(하이클래스 양식 제공)
-->
<template>
  <fragment>
    <div
      v-if="isFormFieldStudy || isFormAbsent || isFormMedicationOrder"
      class="modal view-attached-file-modal has-top-btn-wrap"
      :key="`clazz-application-form-key-${componentKey}`"
    >
      <div class="modal-cont-wrap">
        <div class="modal-cont">
          <div class="modal-cont-inner">
            <div class="modal-top-btn-wrap">
              <div class="right-wrap">
                <div class="modal-close-btn modal-close-icon" @click="cancel"></div>
              </div>
            </div>
            <div
              ref="printDiv"
              class="application-form-wrap"
              :class="{ exper: isFormFieldStudy && option.clickPdf === true }"
            >
              <div class="application-form-btn-wrap">
                <template v-if="isModeView && !option.isPrint">
                  <worksheet-reject
                    :is-manager="isManager"
                    :model="model"
                    :form-mode="mode"
                  />

                  <template v-if="isApplyStatusUpdated">
                    <button
                        type="button"
                        class="btn-bg-w btn-print"
                        @click="cancel"
                    >
                      취소
                    </button>
                    <button
                        type="button"
                        class="btn-bg-c btn-modify"
                        @click="updateApplyStatus"
                    >
                      저장
                    </button>
                  </template>
                  <template v-else>
                    <button
                        type="button"
                        class="btn-bg-w btn-download"
                        @click="onClickButton('pdf')"
                    >
                      PDF 다운로드
                    </button>
                    <button
                        type="button"
                        class="btn-bg-w btn-print"
                        @click="onClickButton('print')"
                    >
                      인쇄하기
                    </button>
                    <button
                        v-if="isShowUpdateButton"
                        type="button"
                        class="btn-bg-c btn-modify"
                        @click="setFormMode('update')"
                    >
                      수정하기
                    </button>
                  </template>

                </template>
                <template v-if="isModeCreate || isModeUpdate">
                  <button type="button" class="btn-bg-w" @click="cancel">취소</button>
                  <button type="button" class="btn-bg-c" @click="save">저장</button>
                </template>
              </div>
              <div class="application-form-top">
                <p class="application-form-title">{{ formTitle }}</p>
                <div class="application-form-confirm">
                  <div class="col">
                    <p class="title">담임 확인</p>
                    <template v-if="option.isPrint">
                      <template v-if="model.applyStatus === 'UNIDENTIFIED'"></template>
                      <template v-else>
                        <hc-select
                            :model.sync="model.applyStatus"
                            selectLabel="name"
                            selectValue="code"
                            :isFocusMode="false"
                            :is-disabled="true"
                            :item="$constants.CLASS_APPLY.applyStatus"
                            :is-click="(e) => console.log(e)"
                        />
                      </template>
                    </template>
                    <template v-else>
                      <hc-select
                        :model.sync="model.applyStatus"
                        selectLabel="name"
                        selectValue="code"
                        :isFocusMode="false"
                        :is-disabled="!isManager || isModeCreate"
                        :item="$constants.CLASS_APPLY.applyStatus"
                        :is-click="(e) => console.log(e)"
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

              <template v-if="isFormMedicationOrder && isManager && model.applyStatus === 'COMPLETE' && isModeUpdate && model.medicationReport">
                <medication-report :medicationReport="model.medicationReport"/>
              </template>

              <component
                  :is="curForm"
                  :isModeView="isModeView"
                  :isModeCreate="isModeCreate"
                  :clazz="clazz"
                  :model="model"
                  :timeStartEnd="timeStartEnd"
                  :option="option"
                  :formParentType="formParentType"
                  :formLeaderType="formLeaderType"
                  :unusedFiles="unusedFiles"
                  :formName="formName"
                  :computedApplyDays="computedApplyDays"
                  :isManager="isManager"
                  @fileUploadAct="fileUploadAct"
                  @updateTimeStartEnd="updateTimeStartEnd"
              ></component>

              <template v-if="isFormMedicationOrder">
                <medication-list
                    v-for="(medication, idx) of model.medications" :key="`medication-${idx}`"
                    :isModeView="isModeView"
                    :medication="medication"
                    :medicationLength="model.medications.length"
                    :idx="idx"
                    @addMedication="addMedication"
                    @deleteMedication="deleteMedication"
                />
              </template>

              <div class="application-form-bottom">
                <p v-html="formBottomText"></p>

                <div class="date-wrap">
                  <div v-if="isModeView || (isFormMedicationOrder && !isManager)" class="text-box-wrap">
                    <span class="date">{{ $moment(model.applyTimestamp).format('YYYY년 MM월 DD일') }}</span>
                  </div>
                  <div v-else class="modify-box-wrap">
                    <div class="input-box-wrap period-wrap" style="width: 180px;">
                      <date-picker
                        :name="isFormAbsent ? '제출일' : '신청일'"
                        key="insertedTimestamp"
                        format="YYYY년 MM월 DD일"
                        valueType="timestamp"
                        v-model="model.applyTimestamp"
                        style="width: inherit;"
                        v-validate="{ required: true }"
                        :editable="false"
                        :clearable="false"
                      >
                      </date-picker>
                    </div>
                  </div>
                </div>

                <div class="info-wrap">
                  <span class="txt-gray">보호자:</span>
                  <span class="name pl-05">{{ model.parentName }}</span>
                  <span>(서명)</span>
                  <span class="sign">
                    <template v-if="isModeCreate">
                      <img :src="userSign" alt="">
                    </template>
                    <template v-else>
                      <template v-if="isDiffApplyUserId">{{ userSignTitle }}</template>
                      <template v-else><img :src="applyUserSign" alt=""></template>
                    </template>
                  </span>
                </div>

                <p class="principal" v-if="!isFormMedicationOrder">{{ clazz.school.schoolName }}장 귀하</p>
              </div>

              <template v-if="isModeView && isFormMedicationOrder && model.applyStatus === 'COMPLETE' && model.medicationReport">
                <medication-report-complete :medicationReport="model.medicationReport"/>
              </template>
            </div>

            <template v-for="(file, index) of model.files">
                <div
                  :key="`${file.fileOriginalPath}-${index}`"
                  class="preview-attaching-file-wrap"
                >
                  <p class="title">{{ file.fileName }}</p>
                  <template v-if="file.fileThumbnailPath">
                    <img :src="file.fileThumbnailPath" alt="" style="max-width: 100%"/>
                  </template>
                  <template v-else-if="file.fileContentType && file.fileContentType.startsWith('image')">
                    <img :src="file.fileOriginalPath" alt="" style="max-width: 100%"/>
                  </template>
                  <template v-else-if="file.fileContentType && file.fileContentType.includes('/pdf') || file.fileConvertPath">
                    <p class="title">{{ file.fileConvertPath || file.fileOriginalPath }}</p>
                  </template>
                  <template v-else-if="!file.fileThumbnailPath && file.fileContentType.startsWith('video')">
                    <img :src="$store.state.videoThumbnailDefault" alt="" style="max-width: 100%"/>
                  </template>
                </div>
            </template>
          </div>
        </div>
      </div>

      <template v-if="isModeCreate">
        <input
          hidden
          type="hidden"
          name="워크시트 아이디"
          v-model="model.sheetId"
          v-validate="{ required: true }"
        />
      </template>
    </div>

    <div v-else></div>
  </fragment>
</template>

<script>
import HcSelect from '@/components/Form/HcSelect'
import DatePicker from 'vue2-datepicker'
import 'vue2-datepicker/index.css'
import 'vue2-datepicker/locale/ko.js'
import {mapActions, mapGetters, mapState} from "vuex";
import {mapFields} from "vuex-map-fields";
import {eventBus} from "@/main";
import WorksheetReject from "@/components/Button/WorksheetReject";
import FieldStudy from "@/components/ClazzApplication/form/FieldStudy";
import Absent from "@/components/ClazzApplication/form/Absent";
import MedicationOrder from "@/components/ClazzApplication/form/MedicationOrder";
import MedicationList from "@/components/ClazzApplication/form/MedicationList";
import MedicationReport from "@/components/ClazzApplication/form/MedicationReport";
import MedicationReportComplete from "@/components/ClazzApplication/form/MedicationReportComplete";
import {updateClazzAppliesStatus, updateClazzApplyStatus, updateMedicationOrderStatus} from "@hiclass/core";

export default {
  name: "clazz-appication-form",
  components: {
    MedicationReportComplete,
    MedicationReport,
    MedicationList,
    MedicationOrder,
    Absent,
    FieldStudy,
    WorksheetReject,
    HcSelect,
    DatePicker
  },
  props: {
    isManager: Boolean,
    clazz: Object,
    formName: String,
    mode: {
      type: String,
      default() {
        return 'create'
      }
    },
    clazzApply: Object,
    userId: { // 학부모 userId
      type: String,
      default() {
        return null
      }
    }
  },
  data() {
    return {
      option: {
        init: false,
        isBusy: false,
        isPrint: false,
        clickPdf: false,
        wrongFormat: {
          parentPhone: false,
          leaderPhone: false
        },
        commonInputItems: [
          {
            type: 'input',
            title: '체험장소',
            value: 'studyPlace',
            maxlength: 30,
            required: true
          },
          {
            type: 'input',
            title: '숙박장소',
            value: 'accommodationPlace',
            maxlength: 30,
            required: false
          },
          {
            type: 'textarea',
            title: '체험목적',
            value: 'purpose',
            maxlength: 250,
            required: true
          },
          {
            type: 'textarea',
            title: '학습계획',
            value: 'plan',
            maxlength: 250,
            required: true
          }
        ]
      },
      model: {
        /** apply common model */
        classId: null,
        applyType: this.formName,
        sheetId: null,
        sheetType: 'H',
        studentName: null,
        parentName: null,
        timestampStart: null,
        timestampEnd: null,
        applyTimestamp: this.$moment().format('YYYY년 MM월 DD일'),
        applyStatus: null,
        userId: null,
        files: []
      },
      timeStartEnd: [null, null],
      prevModel: {},
      myClazzSubscribe: {},
      componentKey: 0,
      fileUploadLoading: false,
      unusedFiles: [],
      isApplyStatusUpdated: false,
    }
  },
  computed: {
    ...mapGetters([
      'CONSTANTS',
      'getParentTypeNameByCode',
      'getLeaderTypeNameByCode'
    ]),
    ...mapFields([
      'htmlPdfDownload',
      'htmlPrint',
      'clazzApplyRejectList'
    ]),
    ...mapState([
      'user'
    ]),
    curForm() {
      return {
        'FIELD_STUDY': 'FieldStudy',
        'ABSENT': 'Absent',
        'MEDICATION_ORDER': 'MedicationOrder'
      }[this.formName]
    },
    isModeView() {
      return this.mode === 'view' || this.mode === ''
    },
    isModeCreate() {
      return this.mode === 'create'
    },
    isModeUpdate() {
      return this.mode === 'update'
    },
    isFormFieldStudy() {
      return this.formName === 'FIELD_STUDY'
    },
    isFormAbsent() {
      return this.formName === 'ABSENT'
    },
    isFormMedicationOrder() {
      return this.formName === 'MEDICATION_ORDER'
    },
    isExistUserSign() {
      return this.user.userSignImagePath && this.user.userSignImagePath !== 'null'
    },
    isExistUserApprovalSign() {
      return this.user.userApprovalSignImagePath && this.user.userApprovalSignImagePath !== 'null'
    },
    isDiffApplyUserId() {
      return this.clazzApply.insertedUserId !== this.clazzApply.applyUser.userId
    },
    isCheckRejectReason() {
      return this.model.applyStatus === 'REJECT'
    },
    applyUserSign() {
      return this.clazzApply.applyUser.userSignImagePath || null
    },
    userSign() {
      return this.user.userSignImagePath || null
    },
    userSignTitle() {
      return this.isModeCreate && !this.isExistUserSign ? ' __________' : ' 전자서명완료'
    },
    isShowUpdateButton() {
      return this.isManager || this.model.applyStatus !== 'COMPLETE'
    },
    /**
     * applyStart, applyEnd 는 당일 오전 0시 기준으로 할 것
     * 같은 시간을 등록해도 서버에서 결석일을 계산해서 내려줌
     * @returns {number}
     */
    computedApplyDays() {
      if (!this.model.timestampStart || !this.model.timestampEnd) return 0

      let holidays = null
      let localStorageHolidays = localStorage.getItem('calenderHolidays')
      if (localStorageHolidays) {
        try {
          holidays = JSON.parse(localStorageHolidays)
        } catch (error) {
          return 0
        }
      }

      const applyStart = this.$moment(this.model.timestampStart).clone()
      const applyEnd = this.$moment(this.model.timestampEnd).add(1, 'day').clone()
      let computedApplyDaysExcludeHoliday = 0

      while (applyStart.format('YYYYMMDD') !== applyEnd.format('YYYYMMDD')) {
        const isoWeekday = applyStart.isoWeekday()
        const isHoliday = holidays ? holidays.find(holiday => holiday['yyyymmdd'] === applyStart.format('YYYYMMDD')) : false

        if (!isHoliday && [1,2,3,4,5].includes(isoWeekday)) {
          ++computedApplyDaysExcludeHoliday
        }

        applyStart.add(1, 'day')
      }

      return computedApplyDaysExcludeHoliday
    },
    formTitle() {
      return {
        'FIELD_STUDY': '체험학습신청서',
        'ABSENT': '결석사유서',
        'MEDICATION_ORDER': '투약의뢰서'
      }[this.formName]
    },
    formBottomText() {
      return {
        'FIELD_STUDY': '위와 같이 학교장허가 교외체험학습을 신청합니다.',
        'ABSENT': '위같은 사유로 결석하였기에 결석사유서를 제출합니다.',
        'MEDICATION_ORDER': '위와 같이 자녀의 투약을 선생님께 의뢰합니다.<br><span>*투약으로 인한 책임은 의뢰자 (보호자)에게 있습니다.</span>'
      }[this.formName]
    },
    formParentType() {
      return this.model.parentType === 'ETC'
        ? this.model.parentTypeName
        : this.getParentTypeNameByCode({code: this.model.parentType})
    },
    formLeaderType() {
      return this.model.leaderType === 'ETC'
        ? this.model.leaderTypeName
        : this.getLeaderTypeNameByCode({code: this.model.leaderType})
    }
  },
  watch: {
    'model.timestampStart'(val) {
      if (!this.option.init && val)
        this.model.timestampEnd = val
    },
    'model.leaderType'(val) {
      if (!this.option.init && val) {
        this.model.leaderTypeName = null
      }
    },
    'model.parentType'(val) {
      if (!this.option.init && val) {
        this.model.parentTypeName = null
      }
    },
    // replace(/[^A-Za-z0-9\sㄱ-ㅎㅏ-ㅣ가-힣]/g, '') : 한글, 영대, 영소, 숫자, 공백 \s 가 아닌 경우 replace
    // replace(/[^0-9]/g, '') : 숫자가 아닌 경우 replace
    'model.parentTypeName'() {
      if (!this.model.parentTypeName) return
      this.model.parentTypeName = this.model.parentTypeName.replace(/[^A-Za-z0-9\sㄱ-ㅎㅏ-ㅣ가-힣]/g, '')
    },
    'model.leaderTypeName'() {
      if (!this.model.leaderTypeName) return
      this.model.leaderTypeName = this.model.leaderTypeName.replace(/[^A-Za-z0-9\sㄱ-ㅎㅏ-ㅣ가-힣]/g, '')
    },
    'model.studentName'() {
      if (!this.model.studentName) return
      this.model.studentName = this.model.studentName.replace(/[^A-Za-z0-9\sㄱ-ㅎㅏ-ㅣ가-힣]/g, '')
    },
    'model.parentName'() {
      if (!this.model.parentName) return
      this.model.parentName = this.model.parentName.replace(/[^A-Za-z0-9\sㄱ-ㅎㅏ-ㅣ가-힣]/g, '')
    },
    'model.parentPhone'() {
      if (!this.model.parentPhone) return
      this.model.parentPhone = this.model.parentPhone.replace(/[^0-9]/g, '')
      this.option.wrongFormat.parentPhone = !this.$validation.isRegMobilePhoneNumberWithoutHyphen(this.model.parentPhone)
    },
    'model.leaderName'() {
      if (!this.model.leaderName) return
      this.model.leaderName = this.model.leaderName.replace(/[^A-Za-z0-9\sㄱ-ㅎㅏ-ㅣ가-힣]/g, '')
    },
    'model.leaderPhone'() {
      if (!this.model.leaderPhone) return
      this.model.leaderPhone = this.model.leaderPhone.replace(/[^0-9]/g, '')
      this.option.wrongFormat.leaderPhone = !this.$validation.isRegMobilePhoneNumberWithoutHyphen(this.model.leaderPhone)
    },
    async 'model.applyStatus'(_, oldVal) {
      //this.model.id=null or oldVal=null  무시
      if (!this.model.id || !oldVal ) {
        return
      }

      if (!this.isApplyStatusUpdated) {
        this.isApplyStatusUpdated = true;
      }
    }
  },
  async created() {
    this.setModelByType()
    this.model.classId = this.clazz.currentId
    this.model.sheetId = this.clazzApply.sheetId
    this.option.init = true

    if (this.isModeView || this.isModeUpdate) {
      for (const key of Object.keys(this.clazzApply)) {
        if (key === 'files') Object.assign(this.model[key], this.clazzApply[key])
        else this.model[key] = this.clazzApply[key]
      }

      if (this.model.applyType === 'MEDICATION_ORDER') {
        this.model.medicationDates[0] = this.clazzApply.timestampStart
      }

      // 마스킹된 휴대폰 번호 복원
      let unMaskingUser = {}
      if (this.model.parentPhone && !this.$validation.isRegMobilePhoneNumberWithoutHyphen(this.model.parentPhone)) {
        unMaskingUser = await this.$hiClass.getUnMaskingUser(this.model.userId)
        this.model.parentPhone = unMaskingUser.userMobile
        this.option.wrongFormat.parentPhone = !this.$validation.isRegMobilePhoneNumberWithoutHyphen(this.model.parentPhone)
      }
      if (this.model.leaderPhone && !this.$validation.isRegMobilePhoneNumberWithoutHyphen(this.model.leaderPhone)
        && this.model.parentName === this.model.leaderName
        && this.model.parentType === this.model.leaderType
      ) {
        this.model.leaderPhone = unMaskingUser.userMobile
        this.option.wrongFormat.leaderPhone = !this.$validation.isRegMobilePhoneNumberWithoutHyphen(this.model.leaderPhone)
      }
      
      this.prevModel = Object.assign({}, this.model)
    }

    if (this.isModeCreate) {
      // 학생, 보호자 정보 선입력
      await this.setMyClazzSubscribeByClassId()

      if (!this.model.applyStatus) {
        this.model.applyStatus = 'UNIDENTIFIED'
      }

      if (!this.$validation.isRegMobilePhoneNumberWithoutHyphen(this.model.parentPhone)) {
        const unMaskingUser = await this.$hiClass.getUnMaskingUser(this.model.userId)
        this.model.parentPhone = unMaskingUser.userMobile
      }

      const todayTimestamp = this.$moment().startOf('day').valueOf()
      this.model.applyTimestamp = todayTimestamp

      if (this.isFormFieldStudy) {
        const msg = '학교에서 체험학습 반일 신청 가능을 안내받은<br/>경우에만, 반일 작성이 가능합니다.<br/>안내받은 사항이 없다면 기존처럼<br/>1일 단위로 신청만 가능합니다.'
        this.$hiClass.alert(msg, 'warning')
        return
      }

      this.model.timestampStart = todayTimestamp
      this.model.timestampEnd = todayTimestamp

      if (this.isFormMedicationOrder && !this.isManager) {
        this.getLocalStorageMedicationOrder()
      }
    }
  },
  mounted() {
    eventBus.$on('clazz-application-form-pdf-download-complete', () => {
      this.componentKey++
    })
    eventBus.$on('clazz-application-form-updateProc', () => {
      this.updateProc()
    })

    this.$hiClass.toggleBodyClass('add', 'hidden')

    this.$nextTick(() => {
      this.option.init = false
    })
  },
  beforeDestroy() {
    eventBus.$off('clazz-application-form-pdf-download-complete')
    eventBus.$off('clazz-application-form-updateProc')
  },
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  },
  methods: {
    ...mapActions([
      'openClazzApplyRejectList',
      'callClazzApplyConfirmPush',
    ]),

    setModelByType() {
      const model = {
        'FIELD_STUDY': {
          classGrade: this.clazz.classGradeCode === 'NONE' && this.clazz.classSchoolType !== 'KINDERGARTEN' ? null : this.clazz.classGradeCode,
          leaderName: null,
          leaderType: null,
          leaderTypeName: null,
          leaderPhone: null,
          studyType: 'TRAVEL',
          studyPlace: null,
          accommodationPlace: null,
          purpose: null,
          plan: null,
          halfDayStart: null,
          halfDayEnd: null,
          halfDayHours: null,
          parentPhone: '',
          parentType: null,
          parentTypeName: null,
        },
        'ABSENT': {
          classGrade: this.clazz.classGradeCode === 'NONE' && this.clazz.classSchoolType !== 'KINDERGARTEN' ? null : this.clazz.classGradeCode,
          absentType: 'SICKNESS',
          parentPhone: null,
          reason: null
        },
        'MEDICATION_ORDER': {
          parentType: 'ETC',
          parentTypeName: null,
          medicationDates: [null],
          reason: null,
          medications: [{
            medicationType: 'LIQUID_POWDER',
            medicationDetail: null,
            dosageFrequency: 1,
            dosageTime: null,
            dosageAmount: null,
            isMlCc: false,
            storageCondition: '',
            memo: ''
          }],
          medicationFiles: {}
        }
      }
      this.model = {
        ...this.model,
        ...model[this.formName]
      }
    },

    close() {
      this.$store.commit('setClazzApplicationForm', {
        isOpen: false,
        clazz: {},
        formName: ''
      })
      this.model = null
    },

    async updateApplyStatus() {
      try {
        if (this.isManager && this.isCheckRejectReason) {
          this.checkRejectReason()
          this.isApplyStatusUpdated = false
          return
        }

        if (this.model.sheetType === 'H' && this.model.applyType === 'MEDICATION_ORDER') {
          // 하이클래스 투약의뢰서는 따로 처리
          await updateMedicationOrderStatus(this.model.id, this.model.applyStatus, this.user && this.user.userName || '')
        } else {
          await updateClazzApplyStatus(this.model.id, this.model.applyStatus)
        }

        eventBus.$emit('clazz-apply-search-resource', false)
        this.$toasted.clear()
        this.$toasted.show('저장되었습니다.')
      } catch (e) {
        console.log(e)
        this.$hiClass.alert(`상태 변경에 실패하였습니다. 다시 시도해주세요.`, "error")
      }
      this.isApplyStatusUpdated = false
    },

    async setMyClazzSubscribeByClassId() {
      const res = await this.$hiClass.clazzSubscribes.search({
        _user: this.user.currentId,
        _clazz: `${process.env.VUE_APP_BASE_API_URI}/clazzes/${this.model.classId}`
      })

      if ((res.data._embedded.clazzSubscribes || []).length > 0) {
        this.myClazzSubscribe = res.data._embedded.clazzSubscribes[0]
        this.model.studentName = this.myClazzSubscribe.memberChildName || ''
        this.model.parentName = this.myClazzSubscribe.user.userName || ''
        this.model.parentPhone = this.myClazzSubscribe.user.userMobile || ''
        this.model.userId = this.myClazzSubscribe.user.currentId || null  // 제출자 id (보호자 userId)
      }
    },

    handleLoading(val) {
      this.$store.commit('setIsFileLoading', val)
    },

    setFormMode(value) {
      const clazzApplicationForm = this.$store.state.clazzApplicationForm
      clazzApplicationForm.mode = value

      // 학부모가 확인요청 건 수정 시 담당교사 확인상태 초기화
      !this.isManager && this.model.applyStatus === 'REJECT'
        ? this.model.applyStatus = 'UNIDENTIFIED'
        : false

      if (!this.isFormMedicationOrder && this.model.classGrade !== this.clazz.classGradeCode) {
        this.model.classGrade = this.clazz.classGradeCode === 'NONE' ? this.model.classGrade : this.clazz.classGradeCode
      }

      this.$store.commit('setClazzApplicationForm', clazzApplicationForm)
    },

    cancel() {
      if (this.mode === 'view' && !this.isApplyStatusUpdated) {
        this.close()
        return
      }
      this.$hiClass.confirm(`${this.formTitle} 작성을 취소하시겠습니까?`)
          .then(() => this.close())
          .catch(() => {})
    },

    async save() {
      if (this.fileUploadLoading) {
        this.$hiClass.alert('첨부파일을 등록중입니다. 잠시만 기다려주세요.')
        return
      }
      if (this.option.isBusy) return

      if (this.isModeCreate && !this.isExistUserSign) {
        const msg = '신청서 제출을 위해 전자서명이 필요합니다.<br>전자서명을 등록해주세요.'
        this.$hiClass.alert(msg).then(() => this.$hiClass.changeUserSign())
        return
      }

      if (this.isManager && this.isModeUpdate && this.model.applyStatus === 'COMPLETE' && !this.isExistUserApprovalSign) {
        const msg = '신청서 제출을 위해 전자서명이 필요합니다.<br>결재서명을 등록해주세요.'
        this.$hiClass.alert(msg).then(() => this.$hiClass.changeUserSign(this.CONSTANTS.USER_SIGN.APPROVAL_SIGN))
        return
      }

      this.option.isBusy = true
      this.handleLoading(true)

      try {
        await this.validateRequired()
        await this.validateFieldLength(this.model)
        if (this.isFormFieldStudy) {
          await this.validatePeriod()
        }

        if (this.isFormMedicationOrder) {
          this.model.medications.forEach(medication => {
            if (medication.medicationType !== 'ETC') {
              medication.medicationDetail = ''
            }
          })
        }

        if (this.isModeCreate) {
          if (this.isFormMedicationOrder) {
            const isSuccess = await this.createMedicationProc()
            if (!isSuccess) return
          }
          this.createProc()

        } else if (this.isModeUpdate) {
          if (this.isManager && this.model.applyStatus !== 'COMPLETE') {
            this.model.medicationReport = null
          }

          if (this.isManager && this.isCheckRejectReason) {
            this.checkRejectReason()
            return
          }

          if (this.isFormMedicationOrder) {
           this.model.timestampStart = this.model.medicationDates[0]
           this.model.timestampEnd = this.model.medicationDates[0]
          }

          this.updateProc()
        }
      } catch (err) {
        this.option.isBusy = false
        this.handleLoading(false)
        this.$hiClass.alert(err.message || err, 'warning')
      }
    },

    async createMedicationProc() {
      this.model.medicationDates = this.model.medicationDates
          .map(timestamp => this.$moment(timestamp).format('YYYY-MM-DD'))

      let dateFiles = {}
      this.model.medicationDates.forEach((date, idx) => {
        dateFiles[date] = idx === 0 ? dateFiles[date] = [...this.model.files] : []
      })

      const isSuccess = await this.copyFile(dateFiles)
      if (!isSuccess) {
        this.option.isBusy = false
        this.handleLoading(false)

        this.$hiClass.confirm('네트워크 오류로 게시물 등록에<br>실패하였습니다. 다시 시도하시겠습니까?', null, {
          confirmButtonText: '재시도',
          reverseButtons: true
        }).then(() => { this.save() }).catch(() => {})
        return false
      }
      this.model.medicationFiles = dateFiles
      return true
    },

    createProc() {
      this.$hiClass.clazzApplies.create(this.model)
          .then(() => {
            this.deleteUnusedFiles()
            let msg = '제출하였습니다.'
            if (this.isFormMedicationOrder) {
              if (!this.isManager) {
                this.setLocalStorageMedicationOrder()
              }
              msg = this.model.medicationDates.length > 1 ? `${this.model.medicationDates.length}개의 투약의뢰서를<br>제출하였습니다.` : '투약의뢰서를 제출하였습니다.'
            }
            this.$hiClass.alert(msg)
                .then(() => {
                  this.$router.push(`/main/clazzes/${this.clazz.currentId}/form/applyList`, () => {})
                  this.close()
                })
          })
          .catch(err => {
            if (this.isFormMedicationOrder) {
              Object.entries(this.model.medicationFiles)
                  .filter(([date]) => date !== Object.keys(this.model.medicationFiles)[0])
                  .flatMap(([, files]) => files)
                  .forEach(file => {this.$hiClass.multipart.delete(file)})

              this.model.medicationFiles = {}
            }

            this.$log.debug(err)
            this.$hiClass.alert(`${this.formTitle} 제출이 불가한 클래스입니다. 클래스 선생님께 확인해주세요.`)
                .then(() => {
                  const classUrl = `/main/clazzes/${this.clazz.currentId}`
                  this.$router.replace(classUrl, () => {})
                  eventBus.$emit('do-reload-class')
                })
          })
          .finally(() => {
            this.option.isBusy = false
            this.handleLoading(false)
          })
    },

    updateProc() {
      this.$hiClass.clazzApplies.update(this.model)
        .then(() => {
          this.deleteUnusedFiles()
          eventBus.$emit('clazz-apply-search-resource', false)
          this.$toasted.show('저장되었습니다.')
          this.model.applyDays = this.computedApplyDays
          this.$store.state.clazzApplicationForm.mode = 'view'

          if (this.isCheckRejectReason) {
            this.callClazzApplyConfirmPush({
              applyId: this.model.currentId
            })
          }
        })
        .catch(err => {
          if (err.response.status === 409) {
            this.$hiClass.alert("선생님 결재가 완료되어 수정할 수 없습니다.", "error")
            eventBus.$emit('clazz-apply-search-resource', false)
            this.close()
          } else {
            this.$log.debug(err)
            this.$hiClass.alert(`${this.formTitle} 제출이 불가한 클래스입니다. 클래스 선생님께 확인해주세요.`)
              .then(() => {
                const classUrl = `/main/clazzes/${this.clazz.currentId}`
                this.$router.replace(classUrl, () => {})
                eventBus.$emit('do-reload-class')
              })
          }
        })
        .finally(() => {
          this.option.isBusy = false
          this.handleLoading(false)
        })
    },

    deleteUnusedFiles() {
      let deleteApi = []
      this.unusedFiles.forEach(file => {
        deleteApi.push(this.$hiClass.multipart.delete(file))
      })
      Promise.allSettled(deleteApi)
    },

    checkRejectReason() {
      // 담임 의견 추가 등록
      this.$log.debug(`this.isCheckRejectReason => `, this.isCheckRejectReason)

      const opts = {
        cancelButtonText: '그대로 저장',
        reverseButtons: true
      }
      this.$hiClass.confirm('담임 의견을 추가로 등록하시겠습니까?', null, opts)
        .then(() => {
          this.option.isBusy = false
          this.handleLoading(false)

          this.openClazzApplyRejectListPopup(this.CONSTANTS.CLAZZ_APPLY_REJECT_LIST.CREATE)
        })
        .catch(() => {
          this.updateProc()
        })
    },

    onClickButton(type) {
      if (type === 'pdf') {
        this.option.isPrint = true
        this.option.clickPdf = true

        this.$nextTick(() => {
          const printDiv = document.querySelector('.application-form-wrap')
          const pdfContent = printDiv.cloneNode(true)
          const pdfContentHeight = printDiv.offsetHeight

          if (this.isFormMedicationOrder) {
            let height = 0
            let appendIndex = []
            for (let i = 0; i < printDiv.children.length; i++) {
              const node = printDiv.children[i]
              height += node.offsetHeight

              if (height > 1120) {
                appendIndex.push(i)
                height = 0
              }
            }

            _.sortBy(appendIndex).reverse().forEach(i => {
              const divider = document.createElement('div')
              divider.className = 'html2pdf__page-break'
              pdfContent.insertBefore(divider, pdfContent.children[i])
            })
          }

          this.htmlPdfDownload.pdfContent = pdfContent
          this.htmlPdfDownload.pdfContentHeight = pdfContentHeight
          this.htmlPdfDownload.fileName = `${this.formTitle}_${this.model.studentName}`
          this.htmlPdfDownload.isOpen = true

          this.$store.commit('setIsLoading', true)

          this.option.isPrint = false
          this.option.clickPdf = false
        })

      } else if (type === 'print') {
        this.option.isPrint = true

        this.$nextTick(() => {
          const printDiv = document.querySelector('.application-form-wrap')

          if (!this.isFormMedicationOrder) {
            const pEl = printDiv.querySelector(".principal")
            pEl.style.marginTop = '50px'
          }

          this.$toasted.clear()
          this.htmlPrint.content = printDiv.cloneNode(true)
          this.htmlPrint.isOpen = true

          this.$store.commit('setIsLoading', true)

          this.option.isPrint = false
        })
      }
    },

    validateFieldLength(model) {
      const validateFields = []

      // 결석사유서
      if (this.isFormAbsent) {
        validateFields.push({
          title: '결석사유',
          value: 'reason',
          maxlength: 250
        })
      }

      // 체험학습
      if (this.isFormFieldStudy) {
        validateFields.push(...this.option.commonInputItems)
      }

      return new Promise((resolve, reject) => {
        let rejectTitle = ''

        validateFields.forEach(validateField => {
          const value = validateField.value
          const maxlength = validateField.maxlength || 250

          if (model[value]) {
            model[value] = model[value].trim()
          }

          if (model[value] && model[value].length > maxlength)
            rejectTitle += `- ${validateField.title} (${maxlength}자)<br>`
        })


        rejectTitle ?
            reject(`다음 항목은 최대 30자 또는 250자까지(공백포함) 입력가능합니다.<br><br>${rejectTitle}`) :
            resolve(true)
      })
    },

    validateRequired() {
      const requiredFieldByType = {
        'FIELD_STUDY': {
          classGrade: '학년',
          parentPhone: '보호자 연락처',
          parentType: '보호자 관계',
          leaderName: '인솔자명',
          leaderPhone: '인솔자 연락처',
          leaderType: '인솔자 관계',
          studyPlace: '체험장소',
          purpose: '체험목적',
          plan: '학습계획',
        },
        'ABSENT': {
          classGrade: '학년',
          parentPhone: '보호자 연락처',
          timestampStart: '결석기간(시작일)',
          timestampEnd: '결석기간(종료일)',
          reason: '결석사유'
        },
        'MEDICATION_ORDER': {
          parentType: '보호자 관계',
          medicationDates: '투약일',
          reason: '증상',
          medicationType: '약의종류',
          dosageFrequency: '투약횟수',
          dosageTime: '투약시간',
          dosageAmount: '투약용량',
          storageCondition: '보관방법'
        }
      }

      const required = {
        studentName: this.formName === 'MEDICATION_ORDER' ? '이름' : '학생이름',
        parentName: '보호자명',
        ...requiredFieldByType[this.formName]
      }

      const errorRequired = []
      for (const [key, value] of Object.entries(required)) {
        const modelValue = this.model[key]

        if (['medicationDates'].includes(key)) {
          this.model.medicationDates.some(date => date === null) ? errorRequired.push(value) : null
          continue
        }

        if (['medicationType'].includes(key)) {
          this.model.medications.some(medication => {
            return medication.medicationType === 'ETC' && (!medication.medicationDetail || medication.medicationDetail.toString().trim === '')
          }) ? errorRequired.push(value) : null
          continue
        }

        if (['dosageFrequency', 'dosageTime', 'dosageAmount', 'storageCondition'].includes(key)) {
          this.model.medications.some(medication => !medication[key] || medication[key].toString().trim === '') ?
              errorRequired.push(value) : null
          continue
        }

        if (!modelValue || modelValue.toString().trim() === '') {
          errorRequired.push(value)
          continue
        }

        if (['parentType'].includes(key) && modelValue === 'ETC') {
          if (!this.model.parentTypeName || this.model.parentTypeName.toString().trim() === '') errorRequired.push(value)
        }

        if (['leaderType'].includes(key) && modelValue === 'ETC') {
          if (!this.model.leaderTypeName || this.model.leaderTypeName.toString().trim() === '') errorRequired.push(value)
        }
      }

      return new Promise((resolve, reject) => {
        if (errorRequired.length > 0) {
          let errMsg = '다음 항목의 입력값이 없거나 잘못 되었습니다.<br/>'
          errorRequired.forEach(fieldName => {
            errMsg += `<br/> - ${fieldName}`
          })
          reject(errMsg)
        } else {
          resolve(true)
        }
      })
    },

    validatePeriod() {
      return new Promise((resolve, reject) => {
        let rejectTitle = ''
        if (this.model.timestampStart === null && this.model.timestampEnd !== null) {
          rejectTitle = '[1일 - 시작일] 입력해주세요.'
        } else if (this.model.timestampStart !== null && this.model.timestampEnd === null) {
          rejectTitle = '[1일 - 종료일] 입력해주세요.'
        } else if ((this.model.timestampStart === null && this.model.timestampEnd === null) && this.model.halfDayStart === null) {
          rejectTitle = '[1일 또는 반일 한가지 이상] 입력해주세요.'
        } else if (this.model.halfDayStart !== null) {
          if (this.timeStartEnd[0] === null) {
            rejectTitle = '[반일 - 시작시간~종료시간] 입력해주세요.'
          } else if (this.model.halfDayHours === null || this.model.halfDayHours.trim() === '') {
            rejectTitle = '[반일 - 신청시간 직접입력] 입력해주세요.'
          }
        } else if (this.model.halfDayHours !== null && this.model.halfDayHours.trim() !== '') {
          if(this.model.halfDayStart === null) {
            rejectTitle = '[반일 - 일자] 입력해주세요.'
          } else if (this.timeStartEnd[0] === null) {
            rejectTitle = '[반일 - 시작시간~종료시간] 입력해주세요.'
          }
        }

        rejectTitle ? reject(`신청기간.<br><br>${rejectTitle}`) : resolve(true)
      })
    },

    openClazzApplyRejectListPopup(mode) {
      const payload = {
        isOpen: true,
        isManager: this.isManager,
        mode: mode,
        model: this.model,
      }
      this.openClazzApplyRejectList(payload)
    },

    addMedication() {
      if (this.model.medications.length === 5) {
        this.$hiClass.alert('약은 최대 5개까지 등록 가능합니다.')
        return
      }

      this.model.medications.push({
        medicationType: 'LIQUID_POWDER',
        medicationDetail: null,
        dosageFrequency: 1,
        dosageTime: null,
        dosageAmount: null,
        isMlCc: false,
        storageCondition: '',
        memo: ''
      })
    },

    deleteMedication(idx) {
      this.$hiClass.confirm('선택하신 투약내용을<br>삭제하시겠습니까?', null, {
        confirmButtonText: '삭제',
        reverseButtons: true
      })
        .then(() => {
          this.model.medications.splice(idx, 1)
        }).catch(() => {})
    },

    setLocalStorageMedicationOrder() {
      const field = ['medications', 'parentPhone', 'parentType', 'parentTypeName', 'reason']
      const medicationOrder = {}
      for (let [key, value] of Object.entries(this.model)) {
        if (field.includes(key)) {
          medicationOrder[key] = value
        }
      }
      localStorage.setItem('medicationOrder', JSON.stringify(medicationOrder))
    },

    getLocalStorageMedicationOrder() {
      const storageMedicationOrder = JSON.parse(localStorage.getItem('medicationOrder'))
      if (storageMedicationOrder) {
        const options = {
          confirmButtonText: '불러오기',
          reverseButtons: true
        }
        this.$hiClass.confirm('가장 최근의 투약의뢰서<br>내용을 불러오시겠습니까?', null, options)
            .then(() => {
              this.model.medicationDates = [null]
              for (let [key, value] of Object.entries(storageMedicationOrder)) {
                this.model[key] = value
              }
            }).catch(() => {})
      }
    },

    fileUploadAct() {
      this.fileUploadLoading = !this.fileUploadLoading
    },

    async copyFile(dateFiles) {
      let idx = 0
      for (const date of Object.keys(dateFiles)) {
        // 이미 업로드된 파일 묶음이 있으므로 첫번째는 복사하지않아도됨
        if (idx === 0) {
          idx++
          continue
        }

        for (let file of this.model.files) {
          try {
            const res = await this.$hiClass.multipart.copy({
              fileOriginalPath: file.fileOriginalPath,
              ...(file.fileConvertPath && {fileConvertPath: file.fileConvertPath}),
              ...(file.fileThumbnailPath && {fileThumbnailPath: file.fileThumbnailPath}),
            }, {encode: true})

            dateFiles[date].push({
              fileContentType: file.fileContentType,
              fileName: file.fileName,
              fileSize: file.fileSize,
              ...res.data
            })

          } catch (err) {
            Object.entries(dateFiles)
                .filter(([date]) => date !== Object.keys(dateFiles)[0])
                .flatMap(([, files]) => files)
                .forEach(file => {this.$hiClass.multipart.delete(file)})

            return false
          }
        }
      }

      return true
    },

    updateTimeStartEnd(timeStartEnd) {
      this.timeStartEnd = timeStartEnd
    }
  }
}
</script>

<style scoped>
.modal {
  display: block;
  background: rgba(0, 0, 0, 0.8);
}
</style>
<style lang="scss">
  .mx-datepicker-popup {
    z-index: 10000 !important;
  }
</style>
