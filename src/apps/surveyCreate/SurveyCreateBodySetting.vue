<!--
@File(Method): SurveyCreateBodySetting.vue
@Author: -
@Date Created: -
@Description: 클래스 > 수업관리 > 설문만들기
@Modified: 2024-11-07 - #69524 설문 선착순/추첨 추가 : 선정방법, 정원 대기자 추가 / 알림 추가
-->
<template>
  <div class="column-content">
    <consultation-guide-popup v-if="isConsultation"/>
    <div class="survey-create__box">
      <div class="survey__heading">
        <textarea
          ref="surveyTitleTextarea"
          :placeholder="placeholderDefaultInfoTitle"
          v-model="curSurveyEdit.surveyTitle"
          @input="inputSurveyTitle($event)"
        ></textarea>
        <span class="bar"></span>
      </div>
      <div class="survey__froala">
        <hc-survey-editor
          placeholder="설명을 입력하세요."
          :prop-value.sync="curSurveyEdit.surveyDescription"
          @inputDescription="inputDescription"
          ref="surveyDescriptionTextarea"
        />
      </div>

      <survey-create-body-setting-upload
        v-if="Array.isArray(curSurveyEdit.files)"
      />

    </div>

    <div class="survey-create__box">
      <div class="option__list">
        <div class="option__item">
          <strong class="option__heading">게시 일시</strong>
          <div class="option">
            <div class="checkbox">
              <input
                type="radio"
                id="survey-edit-setting-is-reservation-01"
                name="isReservation"
                :value="false"
                :disabled="disabled.surveyPosted"
                v-model="curSurveyEdit.isReservation"
              >
              <label for="survey-edit-setting-is-reservation-01"><span>즉시</span></label>
            </div>

            <div
              v-if="!curSurveyEdit.isReservation && isCurSurveyPosted"
              class="inputbox calendar"
              id="survey-edit-setting-is-reservation-01-show"
            >
              <input
                type="text"
                :value="getSurveyPostedStr(curSurveyEdit.surveyPosted)"
                disabled
              >
              <button class="btn-calendar"></button>
            </div>
            <span class="line-break"></span>
            <div class="checkbox">
              <input
                type="radio"
                id="survey-edit-setting-is-reservation-01-show-02"
                name="isReservation"
                :value="true"
                :disabled="disabled.surveyPosted"
                v-model="curSurveyEdit.isReservation"
                @click="initReserveSurveyPosted"
              >
              <label for="survey-edit-setting-is-reservation-01-show-02"><span>예약</span></label>
            </div>

            <calendar
              v-if="curSurveyEdit.isReservation"
              :key="`surveyPosted-${curSurveyEdit.surveyId}`"
              :value.sync="curSurveyEdit.surveyPosted"
              :value-goe="reservationGoe"
              :default-select="false"
              :message-goe="'현재 시간 이후로 선택해주세요.'"
              :init-prop="'surveyPosted'"
              :disabled="disabled.surveyPosted"
            />
          </div>
        </div>

        <div class="option__item">
          <strong class="option__heading">설문 기간</strong>
          <div class="option">

            <calendar
              :key="`timestampStart-${curSurveyEdit.surveyId}`"
              :value.sync="curSurveyEdit.timestampStart"
              :default-select="false"
              :should-set-value="curSurveyEdit.timestampStart !== null"
              :init-prop="'timestampStart'"
              :disabled="!isTemporaryStatus"
            />

            <span class="wave">~</span>
            <span class="line-break"></span>

            <calendar
              :key="`timestampEnd-${curSurveyEdit.surveyId}`"
              :value.sync="curSurveyEdit.timestampEnd"
              :default-select="false"
              :should-set-value="curSurveyEdit.timestampEnd !== null"
              :init-manipulate="{
                method: 'add',
                amount: 7,
                unit: 'days'
              }"
              :init-prop="'timestampEnd'"
            />
          </div>
        </div>

        <div class="option__item">
          <strong class="option__heading">
            설문 대상
          </strong>
          <div class="option">
            <button
              class="hi-btn btn-line btn-md"
              @click="openSurveyCreateTargetModal"
            >
              구성원 선택 <span>({{ surveyEditTargetCount }}명)</span>
            </button>
            <span
              v-if="surveyEditTargetCount === 0 && !curSurveyEdit.isUsedUrl"
              class="text-refer highlight"
            >
              * 설문 대상을 선택해주세요.
            </span>
          </div>
        </div>
        <!--  #69524 설문 선착순/추첨 추가 : 선정 방법 추가 -->
        <div v-if="isFcfsOrDrawType" class="option__item">
          <strong class="option__heading">
            선정 방법
          </strong>
          <div class="option">
            <hi-select-box 
              :value="curSurveyEdit.surveyType" 
              @update:value="onUpdateFsfsOrDrawType" 
              :items="SelectionOpt"
              :disabled="!isTemporaryStatus"
            />            
            <span
              v-if="isDrawType"
              class="text-refer"
            >
              * 추첨은 접수 기능만 제공됩니다.<br>신청 종료 후 접수된 명단을 참고하여 직접 추첨해서 발표해 주세요.  
            </span>
          </div>
        </div>
        <template v-if="isFcfsType">     
          <div class="option__item half">
            <strong class="option__heading">정원</strong>
            <div class="option">
              <div class="inputbox">
                <input v-model="curSurveyEdit.totalMax"
                  type="number" min="1" max="9999"
                  @input="validateMaxValue('totalMax', 9999)"
                  @keypress="isNumber($event)"
                  placeholder="1~9999" maxlength="250" style="width: 105px;">
                <span class="text">명</span>
              </div>
            </div>
          </div>
          <div class="option__item half">
            <strong class="option__heading">대기자</strong>
            <div class="option">
              <div class="inputbox">
                <input v-model="curSurveyEdit.waitMax"
                  type="number" min="0" max="9999"
                  @input="validateMaxValue('waitMax', 9999)"
                  @keypress="isNumber($event)"
                  placeholder="0" maxlength="250" :disabled="isLimitedWait" style="width: 105px;">
                <span class="text">명</span>
              </div>
              <div class="checkbox brackets">
                <input type="checkbox" id="id" v-model="isLimitedWait">
                <label for="id"><span>설정안함</span></label>
              </div>
            </div>
          </div>
        </template>
      </div>
      <div class="box__list">
        <div
          v-if="visibleIsAnonymous"
          class="box__item"
        >
          <div class="checkbox">
            <input
              type="checkbox"
              id="survey-edit-setting-is-anonymous"
              :disabled="disabledIsAnonymous"
              v-model="curSurveyEdit.isAnonymous"
            >
            <label
              for="survey-edit-setting-is-anonymous"
            >
              <span>
                익명 설문
                <hi-tooltip :title-html="'익명 설문으로 발행한 설문은 변경이 불가합니다.'" />
              </span>
            </label>

          </div>
        </div>
        <div class="box__item" v-if='!isFcfsOrDrawType'>
          <div class="checkbox">
            <input
              type="checkbox"
              id="survey-edit-setting-is-rejectable"
              :disabled="disabledIsRejectable"
              v-model="curSurveyEdit.isRejectable"
            >
            <label
              for="survey-edit-setting-is-rejectable"
            >
              <span>
                응답 거절 기능
                <hi-tooltip :title-html="`응답자가 '참여 안함'으로 응답할 수 있으며, '참여 안함'으로 응답한 사람들은 통계결과에 포함되지 않습니다.`" />
              </span>
            </label>
          </div>
        </div>
        <div class="box__item">
          <div class="checkbox">
            <input
              type="checkbox"
              id="survey-edit-setting-is-auto-remind"
              v-model="curSurveyEdit.isAutoRemind"
            >
            <label
              for="survey-edit-setting-is-auto-remind"
            >
              <span>
                미응답자 자동 독촉 기능
                <hi-tooltip :title-html="`미 응답자를 대상으로 매일 오전 9시부터 순차적으로 푸시를 발송합니다.`" />
              </span>
            </label>
          </div>
        </div>
        <div class="box__item line" v-if="isShowUsedUrl">
          <div class="checkbox">
            <input
              type="checkbox"
              id="survey-edit-setting-is-used-url"
              :checked="curSurveyEdit.isUsedUrl"
              :disabled="disabledIsUsedUrl"
              @click.prevent.stop="onClickIsUsedUrl"
            >
            <label
              for="survey-edit-setting-is-used-url"
              @click.prevent.stop="onClickIsUsedUrl"
            >
              <span>하이클래스 <span class="highlight">비회원 전용</span> 설문 참여 주소(URL)</span>
            </label>
            <p class="text-refer mt-10"><strong>* 주의사항</strong></p>
            <ul class="text-refer">
              <li>- 비회원을 위한 설문 주소입니다. 구성원만 대상인 설문에서는 이용하지 말아주세요.</li>
              <li>- 구성원에게 URL 공유 시 중복으로 응답될 수 있으며, 설문/투표 메뉴에서는 미응답 설문으로 표시될 수 있습니다.</li>
            </ul>
          </div>

          <div class="inputbox url" v-if="curSurveyEdit.isUsedUrl">
            <input
              type="text"
              readonly
              :disabled="!curSurveyEdit.isUsedUrl"
              :value="urlCode"
            >
            <button
              class="hi-btn"
              :disabled="!curSurveyEdit.isUsedUrl"
              @click="$hiClass.copyToClipboard(urlCode, '주소가 복사되었습니다.')"
            >
              주소복사
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";

import Calendar from "@/components/Calendar/Calendar";
import SurveyCreateBodySettingUpload from "@/apps/surveyCreate/SurveyCreateBodySettingUpload.vue";
import HiTooltip from "@/components/Tooltip/HiTooltip.vue";
import ConsultationGuidePopup from "@/apps/surveyCreate/questionType/ConsultationGuidePopup";
import HcSurveyEditor from "@/components/Editor/HcSurveyEditor.vue";
import HiSelectBox from "@/components/Form/HiSelectBox.vue";

export default {
  name: "survey-create-body-setting",
  components: {HiTooltip, SurveyCreateBodySettingUpload, Calendar, ConsultationGuidePopup, HcSurveyEditor, HiSelectBox},
  data() {
    return {
      disabled: {
        surveyPosted: false
      },
      reservationGoe: null,
      beforeSurveyPosted: null,
      prevSurveyTitle: '',
      
      SelectionOpt: [
        { value: "FCFS", title: "선착순" },
        { value: "DRAW", title: "추첨" },
      ],
    }
  },
  computed: {
    ...mapState('storeSurvey', [
      'placeholderDefault', 'curSurveyEdit',
      'currentTimestamp', 'curSurveyEditDescription',
      'beforeCurSurveyEdit'
    ]),
    ...mapGetters(['CONSTANTS']),
    ...mapGetters('storeSurvey', [
      'curSurveyId', 'surveyEditTargetCount',
      'isCurSurveyPosted', 'isCurSurveyPublished',
      'isLimitedWait'
    ]),
    placeholderDefaultInfoTitle() {
      return this.placeholderDefault.surveyInfoTitle
    },
    placeholderDefaultInfoDesc() {
      return this.placeholderDefault.surveyInfoDesc
    },
    urlCode() {
      return this.curSurveyId
        ? `${this.$webUrl}/sru/${this.curSurveyId}`
        : 'https://'
    },
    disabledIsAnonymous() {
      return this.isCurSurveyPublished
        || this.curSurveyEdit.isRejectable
        || this.curSurveyEdit.isUsedUrl
        || this.curSurveyEdit.surveyType === this.CONSTANTS.SURVEY_TYPE.AFTER_SCHOOL
        || this.curSurveyEdit.surveyType === this.CONSTANTS.SURVEY_TYPE.CONSULTATION
    },
    disabledIsRejectable() {
      return this.curSurveyEdit.isAnonymous
    },
    disabledIsUsedUrl() {
      return this.curSurveyEdit.isAnonymous
    },
    visibleIsAnonymous() {
      console.warn(`this.curSurveyEdit.surveyType => `, this.curSurveyEdit.surveyType)

      const hideSurveyTypes = [
        undefined,
        null,
        this.CONSTANTS.SURVEY_TYPE.AFTER_SCHOOL,
        this.CONSTANTS.SURVEY_TYPE.CONSULTATION,
        this.CONSTANTS.SURVEY_TYPE.FCFS,
        this.CONSTANTS.SURVEY_TYPE.DRAW
      ]
      return !hideSurveyTypes.includes(this.curSurveyEdit.surveyType)
    },
    isConsultation() {
      return this.curSurveyEdit.surveyType === this.CONSTANTS.SURVEY_TYPE.CONSULTATION
    },
    isShowUsedUrl() {
      return this.curSurveyEdit.completeTimestamp && this.curSurveyEdit.completeTimestamp < 1680172800000
    },
    isFcfsOrDrawType() {
      return [this.CONSTANTS.SURVEY_TYPE.FCFS,
        this.CONSTANTS.SURVEY_TYPE.DRAW].includes(this.curSurveyEdit.surveyType)
    },
    isFcfsType() {
      return this.curSurveyEdit.surveyType === this.CONSTANTS.SURVEY_TYPE.FCFS
    },
    isDrawType() {
      return this.curSurveyEdit.surveyType === this.CONSTANTS.SURVEY_TYPE.DRAW
    },
    isTemporaryStatus () {
      return this.curSurveyEdit.surveyStatus === this.CONSTANTS.SURVEY_STATUS.TEMPORARY
    },
    isLimitedWait: {
      get() {
        return this.$store.getters['storeSurvey/isLimitedWait'];
      },
      set(value) {
        this.setIsLimitedWait(value);
      }
    }
  },
  watch: {
    async 'curSurveyEdit.isUsedUrl'(val) {
      if (val && !this.curSurveyId) {
        await this.temporarilySaveSurvey({})
      }
      this.$nextTick(() => {
        if (val && this.curSurveyEdit.isAnonymous) {
          this.$toasted.clear()
          this.$toasted.show('익명 설문과 설문 주소(URL) 사용은 동시에 적용할 수 없습니다.')
          this.curSurveyEdit.isAnonymous = false
        }
      })
    },
    'curSurveyEdit.isAnonymous'(val) {
      this.$nextTick(() => {
        if (val && this.curSurveyEdit.isRejectable) {
          this.$toasted.clear()
          this.$toasted.show('익명 설문과 응답 거절 기능은 동시에 적용할 수 없습니다.')
          this.curSurveyEdit.isAnonymous = false
        }
        if (val && this.curSurveyEdit.isUsedUrl) {
          this.$toasted.clear()
          this.$toasted.show('익명 설문과 설문 주소(URL) 사용은 동시에 적용할 수 없습니다.')
          this.curSurveyEdit.isAnonymous = false
        }
      })
    },
    'curSurveyEdit.isRejectable'(val) {
      this.$nextTick(() => {
        if (val && this.curSurveyEdit.isAnonymous) {
          this.$toasted.clear()
          this.$toasted.show('익명 설문과 응답 거절 기능은 동시에 적용할 수 없습니다.')
          this.curSurveyEdit.isRejectable = false
        }
      })
    },
    currentTimestamp(val) {
      if (!this.isCurSurveyPosted) {
        this.reservationGoe = val
      }
    },
    'curSurveyEdit.surveyPosted'(v) {
      if(v) {
        this.beforeSurveyPosted = v
      } else {
        this.curSurveyEdit.surveyPosted = this.beforeSurveyPosted
      }
    },
    isLimitedWait(val) {
      this.setIsLimitedWait(val);
      if(val) {
        this.curSurveyEdit.waitMax = 0
      }
    }
  },
  created() {

  },
  async mounted() {
    this.setIsDimLoading(true)
    this.setIsLimitedWait(false)
    // 편집 중인 설정 정보 세팅
    await this.setupCurSurveyEdit()
      .then(async surveyId => {
        if (surveyId && this.$refs.surveyTitleTextarea) {
          this.$hiClass.textareaAutoResize(this.$refs.surveyTitleTextarea, 30)
        }
        if (surveyId && this.$refs.surveyDescriptionTextarea) {
          this.$hiClass.textareaAutoResize(this.$refs.surveyDescriptionTextarea, 24)
        }
        if (surveyId) {
          this.prevSurveyTitle = this.curSurveyEdit.surveyTitle
        }
        this.disabled.surveyPosted = this.isCurSurveyPosted
        if (!this.isCurSurveyPosted) {
          this.reservationGoe = this.currentTimestamp
        }
        this.setIsChangedSurveyEditQuestions(false)

        // 초기화 시 익명 설문, 응답 거절 기능 동시 선택 예외 처리
        if (this.curSurveyEdit.isAnonymous && this.curSurveyEdit.isRejectable) {
          this.$toasted.clear()
          this.$toasted.show('익명 설문과 응답 거절 기능은 동시에 적용할 수 없습니다.')
          this.curSurveyEdit.isRejectable = false
        }

        // 최초 실행 시 방과후 신청 or 학부모 상담 기본 질문 추가
        if (!surveyId) {
          await this.createDefaultQuestion({})

          // 설문 기본 제목이 없는 경우 기본값 지정
          const isEmptySurveyTitle = !this.curSurveyEdit.surveyTitle
            || (this.curSurveyEdit.surveyTitle && this.curSurveyEdit.surveyTitle.trim().length === 0)
          if (isEmptySurveyTitle) {
            this.curSurveyEdit.surveyTitle = ''
          }
        }

        this.setCurSurveyEditDescription(this.curSurveyEdit.surveyDescription)
        this.setIsDimLoading(false)

        this.setIsLimitedWait((this.curSurveyEdit.waitMax || 0) < 1)
      })
      .catch(() => {
        this.setIsDimLoading(false)
      })
  },
  beforeDestroy() {
    this.curSurveyEdit.surveyDescription = this.curSurveyEditDescription
    this.setCurSurveyEditDescription(null)
  },
  methods: {
    ...mapMutations({
      setIsDimLoading: 'setIsDimLoading'
    }),
    ...mapMutations('storeSurvey', {
      setIsChangedSurveyEditQuestions: 'setIsChangedSurveyEditQuestions',
      setCurSurveyEditDescription: 'setCurSurveyEditDescription',
      setIsLimitedWait: 'setIsLimitedWait'
    }),
    ...mapActions('storeSurvey', {
      setupCurSurveyEdit: 'setupCurSurveyEdit',
      temporarilySaveSurvey: 'temporarilySaveSurvey',
      openSurveyCreateTargetModal: 'openSurveyCreateTargetModal',
      createDefaultQuestion: 'createDefaultQuestion',
    }),
    fileDelete(file) {
      this.curSurveyEdit.files = this.curSurveyEdit.files.filter(item => {
        return item.fileOriginalPath !== file.fileOriginalPath
      })
    },
    onClickIsUsedUrl() {
      if (this.disabledIsUsedUrl) {
        return false
      }

      if (this.curSurveyEdit.isUsedUrl) {
        const confirmMessage = `설문 주소를 '사용안함'으로 변경하시면 이전 주소는 사용할 수 없습니다.<br><br>'사용안함'으로 변경하시겠습니까?`
        const opts = {
          reverseButtons: true
        }
        this.$hiClass.confirm(confirmMessage, null, opts)
          .then(() => {
            this.curSurveyEdit.isUsedUrl = !this.curSurveyEdit.isUsedUrl
          })
      } else {
        this.curSurveyEdit.isUsedUrl = true
      }
    },
    getSurveyPostedStr(surveyPosted) {
      surveyPosted = surveyPosted || this.$moment().valueOf()
      return this.$moment(surveyPosted).format('YYYY년 M월 D일')
    },
    initReserveSurveyPosted() {
      // 게시 일시를 즉시에서 예약으로 변경할 때 현재 시간 기준으로 초기화
      if (!this.curSurveyEdit.isReservation) {
        this.curSurveyEdit.surveyPosted = this.$moment().valueOf()
        this.reservationGoe = null

        setTimeout(() => {
          this.reservationGoe = this.curSurveyEdit.surveyPosted
        }, 200)
      }
    },
    inputSurveyTitle(e) {
      let value = e.target.value
      if ([...value].length > 100) {
        value = this.prevSurveyTitle
      }

      this.curSurveyEdit.surveyTitle = value
      this.prevSurveyTitle = value
      this.$hiClass.textareaAutoResize(this.$refs.surveyTitleTextarea, 30)
    },
    inputDescription(v) {
      this.setCurSurveyEditDescription(v)
    },

    // #69524 설문 선착순/추첨 추가 : 알림 추가
    noti(){
      this.$hiClass.alert('정원을 입력해 주세요', 'info')
      .then(() => {
        console.log("확인");
      })

      this.$hiClass.alert('대기자 인원을 입력해 주세요', 'info')
      .then(() => {
        console.log("확인");
      })
      
      this.$hiClass.alert('정원수를 기존에 등록한 숫자보다 <br> 작게 입력할 수 없습니다.', 'info')
      .then(() => {
        console.log("확인");
      })

      this.$hiClass.alert('대기수를 기존에 등록한 숫자보다 <br> 작게 입력할 수 없습니다.', 'info')
      .then(() => {
        console.log("확인");
      })

    },
    onUpdateFsfsOrDrawType(value) {
      this.curSurveyEdit.surveyType = value
    },
    validateMaxValue(field, maxValue) {
      let value = this.curSurveyEdit[field].toString();
      const maxRadix = maxValue.toString().length;
      
      // 숫자가 아닌 문자를 제거
      value = value.replace(/\D/g, '');
      
      // 숫자로 변환 후 최대값 체크
      let numericValue = parseInt(value, 10);
      if (numericValue > maxValue) {
        numericValue = parseInt(numericValue.toString().substring(0, maxRadix), 10);
      }
      
      // 최종 값을 다시 할당
      this.curSurveyEdit[field] = numericValue;
    },
    isNumber(event) {
      const charCode = event.which ? event.which : event.keyCode;
      console.log(charCode);
      if (charCode < 48 || charCode > 57) {
        event.preventDefault();
      }
    }
  }
}
</script>