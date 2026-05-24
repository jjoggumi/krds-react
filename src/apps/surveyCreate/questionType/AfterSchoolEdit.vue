<template>
  <div class="fcfs__edit">
    <p class="text-highlight mb-10">※ 수업요일, 시간, 수업대상은 설문 발행 후 변경이 불가합니다.</p>

    <div class="option__list">

      <div class="option__item">
        <strong
          class="option__heading"
          :class="['required']"
        >
          수업명
        </strong>
        <div class="option">
          <div class="inputbox w100">
            <input
              ref="itemTitle"
              type="text"
              placeholder="수업명을 입력하세요"
              maxlength="250"
              v-model="cloneItem.itemTitle"
            >
          </div>
        </div>
      </div>

      <survey-create-question-type-after-school-edit-timetables
        ref="afterSchoolTimetables"
        :prop-after-school-timetables="cloneItem.afterSchoolTimetables"
        :prop-is-week-time.sync="cloneItem.isWeekTime"
        :disabled="getDisabledByComponentType('afterSchoolTimetables')"
      />

      <survey-create-question-type-after-school-edit-targets
        ref="afterSchoolTargets"
        :prop-after-school-targets="cloneItem.afterSchoolTargets"
        :disabled="getDisabledByComponentType('afterSchoolTargets')"
      />

      <div class="option__item">
        <strong
          class="option__heading"
          :class="['required']"
        >
          선정방법
        </strong>

        <div class="option">

          <hi-select-box
            :value.sync="cloneItem.selectionType"
            :default-value="'FCFS'"
            :items="selectionTypeItems"
            :disabled="getDisabledByComponentType('hiSelectBoxSelectionType')"
          />

          <span
            class="text-refer"
            v-html="selectionTypeDescription"
          ></span>
        </div>

      </div>

      <div
        class="option__item"
        :class="{ half: cloneItem.selectionType === 'FCFS' }"
      >
        <strong
          class="option__heading"
          :class="['required']"
        >
          정원
        </strong>
        <div class="option">
          <div class="inputbox">
            <input
              ref="limitTotalMax"
              type="text"
              placeholder="0"
              maxlength="250"
              style="width: 100px;"
              v-model="cloneItem.limit.totalMax"
              @input="cloneItem.limit.totalMax = $stringUtil.getSafeIntegerNumberByString($event.target.value)"
            >
            <span class="text">명</span>
          </div>
        </div>
      </div>

      <div
        v-if="cloneItem.selectionType === 'FCFS'"
        class="option__item half"
      >
        <strong class="option__heading">대기자</strong>
        <div class="option">
          <div class="inputbox">
            <input
              ref="limitWaitMax"
              type="text"
              placeholder="0"
              maxlength="250"
              :disabled="!cloneItem.isLimitedWait"
              style="width: 80px;"
              v-model="cloneItem.limit.waitMax"
              @input="cloneItem.limit.waitMax = $stringUtil.getSafeIntegerNumberByString($event.target.value)"
            >
            <span class="text">명</span>
          </div>
          <div class="checkbox brackets">
            <input
              type="checkbox"
              :id="`${componentUUID}-item-is-limited-wait`"
              :true-value="false"
              :false-value="true"
              :disabled="cloneItem.selectionType === 'DRAW'"
              v-model="cloneItem.isLimitedWait"
            >
            <label
              :for="`${componentUUID}-item-is-limited-wait`"
            >
              <span>설정안함</span>
            </label>
          </div>
        </div>
      </div>

      <div class="option__item half">
        <strong class="option__heading">수강료</strong>
        <div class="option">
          <div class="inputbox">
            <input
              ref="itemField1"
              type="text"
              placeholder="0"
              maxlength="250"
              style="width: 100px;"
              @focus="onFocusItemField1"
              @input="onInputItemField1"
              @blur="onBlurItemField1"
              v-model="cloneItem.itemField1"
            >
            <span class="text">원</span>
          </div>
        </div>
      </div>

      <div class="option__item half">
        <strong class="option__heading">강사명</strong>
        <div class="option">
          <div class="inputbox w100">
            <input
              ref="itemField2"
              type="text"
              placeholder="강사명"
              maxlength="250"
              v-model="cloneItem.itemField2"
            >
          </div>
        </div>
      </div>

      <div class="option__item">
        <strong class="option__heading">설명</strong>
        <div class="option">
            <textarea
              ref="itemDescriptionTextarea"
              class="textareabox"
              maxlength="65000"
              placeholder="설명을 입력하세요."
              v-model="cloneItem.itemDescription"
              @input="$hiClass.textareaAutoResize($refs.itemDescriptionTextarea, 100)"
            ></textarea>
        </div>
      </div>
    </div>
    <div class="txt-right">
      <HiButton
        color="line-default"
        size="md"
        @click="onClickCancel"
      >
        취소
      </HiButton>
      <HiButton
        ref="submitButton"
        color="black"
        size="md"
        @click="onClickSubmit"
      >
        완료
      </HiButton>
    </div>

  </div>

</template>

<script>
import {mapGetters, mapState} from "vuex"

import HiSelectBox from "@/components/Form/HiSelectBox.vue";
import SurveyCreateQuestionTypeAfterSchoolEditTargets
  from "@/apps/surveyCreate/questionType/AfterSchoolEditTargets.vue";
import SurveyCreateQuestionTypeAfterSchoolEditTimetables
  from "@/apps/surveyCreate/questionType/AfterSchoolEditTimetables.vue";
import {v4 as uuidv4} from "uuid";

export default {
  name: "survey-create-question-type-after-school-edit",
  components: {
    SurveyCreateQuestionTypeAfterSchoolEditTimetables,
    SurveyCreateQuestionTypeAfterSchoolEditTargets,
    HiSelectBox,
  },
  props: {
    propItem: {
      type: Object,
      required: true
    },
    propItemIndex: {
      type: Number
    },
    mode: {
      type: String
    }
  },
  data() {
    return {
      selectionTypeItems: [],
      // 편집용
      cloneItem: {},
      // 복원용
      prevItem: {},
      componentUUID: null
    }
  },
  computed: {
    ...mapState('storeSurvey', {
      publishedQuestionItemIds: 'publishedQuestionItemIds',
      surveyEditQuestions: 'surveyEditQuestions'
    }),
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    }),
    ...mapGetters('storeSurvey', {
      isCurSurveyPublished: 'isCurSurveyPublished',
    }),
    selectionTypeDescription() {
      let description = ''
      switch (this.cloneItem.selectionType) {
        case 'FCFS': {
          description = ''
          break
        }
        case 'DRAW': {
          description = '* 추첨은 접수 기능만 제공됩니다.<br>신청 종료 후 접수된 명단을 참고하여 직접 추첨해서 발표해주세요.'
          break
        }
        default:
      }
      return description
    }
  },
  watch: {
    'cloneItem.selectionType'(val) {
      if (val === 'DRAW') {
        this.initLimitedWait(this.cloneItem)
      }
    }
  },
  beforeMount() {
    this.selectionTypeItems = Object.freeze(this.$store.state.storeSurvey.selectionType)

    // 편집용 아이템 복사
    this.cloneItem = _.cloneDeep(this.propItem)

    // 복원용 아이템 복사
    this.prevItem = _.cloneDeep(this.propItem)

    if (this.cloneItem.selectionType === 'DRAW') {
      this.initLimitedWait(this.cloneItem)
    }

    this.componentUUID = uuidv4()
  },
  mounted() {
    setTimeout(() => {
      if (this.$refs.itemDescriptionTextarea)
        this.$hiClass.textareaAutoResize(this.$refs.itemDescriptionTextarea, 100)

      if (this.mode === 'CREATE') {
        // 페이지 최하단으로 이동
        this.$nextTick(() => {
          window.scrollTo(0, document.body.scrollHeight)
        })
      }
      this.$nextTick(() => {
        if (this.$refs.itemTitle) {
          this.$refs.itemTitle.focus()
        }
      })

    }, 50)
  },
  methods: {
    onClickCancel() {
      this.$emit('is-cancel', this.cloneItem.itemId)
    },
    async onClickSubmit() {
      this.$toasted.clear()

      const cloneItemId = this.cloneItem.itemId || null
      const afterSchoolTargets = this.$refs.afterSchoolTargets.getAfterSchoolTargets()
      const afterSchoolTimetables = this.$refs.afterSchoolTimetables.getAfterSchoolTimetables()

      // (선착순) 정원수 제한여부 저장
      this.cloneItem.isLimitedTotal = !!(this.cloneItem.limit.totalMax && this.cloneItem.selectionType === 'FCFS')
      // (선착순) 대기자 설정안함 저장
      if (this.cloneItem.selectionType === 'DRAW') {
        this.initLimitedWait(this.cloneItem)
      }

      this.cloneItem.afterSchoolTargets = afterSchoolTargets
      this.cloneItem.afterSchoolTimetables = afterSchoolTimetables

      // try {
      //   if (this.$refs.afterSchoolTimetables.$refs.timeSelectBoxes) {
      //     await this.$refs.afterSchoolTimetables
      //       .$refs.timeSelectBoxes.validateTimeSelectBoxes()
      //   } else {
      //     for (const afterSchoolTimetable of this.cloneItem.afterSchoolTimetables) {
      //       const ref = this.$refs.afterSchoolTimetables
      //         .$refs[`timeSelectBoxes${afterSchoolTimetable.dayOfWeek}`][0]
      //       if (ref) {
      //         await ref.validateTimeSelectBoxes()
      //       }
      //     }
      //   }
      // } catch (e) {
      //   this.$log.warn(e)
      //   return false
      // }

      /**
       * 필수 항목 유효성 검사
       */
      if (!this.cloneItem.itemTitle
        || this.cloneItem.itemTitle && this.cloneItem.itemTitle.trim().length === 0
      ) {
        this.cloneItem.itemTitle = null
        this.$toasted.show('수업명을 입력해주세요.')
        if (this.$refs.itemTitle) {
          this.$refs.itemTitle.focus()
        }
        return false
      }
      if (this.cloneItem.afterSchoolTimetables.length === 0) {
        this.$toasted.show('수업요일을 선택해주세요.')
        return false
      }
      if (this.cloneItem.afterSchoolTargets.length === 0) {
        this.$toasted.show('수업대상을 선택해주세요.')
        return false
      }
      if (!this.cloneItem.limit.totalMax
        || parseInt(this.cloneItem.limit.totalMax, 10) === 0
        || parseInt(this.cloneItem.limit.totalMax, 10) > 1000000
        || Number.isNaN(parseInt(this.cloneItem.limit.totalMax, 10))
      ) {
        this.cloneItem.limit.totalMax = null
        this.$toasted.show('정원을 입력해주세요.')
        if (this.$refs.limitTotalMax) {
          this.$refs.limitTotalMax.focus()
        }
        return false
      }

      const existsTempItems = this.surveyEditQuestions.items.find(item => item.isTempItem)
      if (existsTempItems && !this.cloneItem.isTempItem) {
        this.$toasted.show('등록중인 수업을 먼저 완료해주세요.')
        return false
      }

      /**
       * 선택 항목 유효성 검사
       */
      // if (this.cloneItem.itemField1
      //   && (
      //     parseInt(this.cloneItem.itemField1, 10) < 0
      //     || Number.isNaN(parseInt(this.cloneItem.itemField1, 10))
      //   )
      // ) {
      //   this.cloneItem.itemField1 = null
      //   this.$toasted.show('수강료를 숫자로 입력해주세요.')
      //   if (this.$refs.itemField1) {
      //     this.$refs.itemField1.focus()
      //   }
      //   return false
      // }

      // if (this.cloneItem.limit.waitMax
      //   && (
      //     parseInt(this.cloneItem.limit.waitMax, 10) < 0
      //     || parseInt(this.cloneItem.limit.waitMax, 10) > 1000000
      //     || Number.isNaN(parseInt(this.cloneItem.limit.waitMax, 10))
      //   )
      // ) {
      //   this.cloneItem.limit.waitMax = null
      //   this.$toasted.show('대기자를 숫자로 입력해주세요.')
      //   if (this.$refs.limitWaitMax) {
      //     this.$refs.limitWaitMax.focus()
      //   }
      //   return false
      // }

      this.$emit('is-submit', cloneItemId, this.propItemIndex, this.cloneItem)
    },
    getDisabledByComponentType(componentType) {
      let disabled = false
      // 미저장 된 신규 작성 item
      const isTempItem = this.cloneItem.isTempItem
      // 서비스에 발행 완료된 item (편집 중 X)
      const includePublishedQuestionItem = this.publishedQuestionItemIds.includes(this.cloneItem.itemId)

      switch (componentType) {
        case 'afterSchoolTimetables':
        case 'afterSchoolTargets': {
          disabled = !isTempItem && includePublishedQuestionItem
          break
        }
        case 'hiSelectBoxSelectionType': {
          disabled = !isTempItem && includePublishedQuestionItem
            // 발행 완료 후 추첨 -> 선착순으로 변경 불가
            && this.isCurSurveyPublished && this.propItem.selectionType === 'DRAW'
          break
        }
        default:
      }
      return disabled
    },
    // 대기자 설정 초기화
    initLimitedWait(item) {
      item.isLimitedWait = false
      item.limit.waitMax = 0
    },
    onFocusItemField1(event) {
      this.cloneItem.itemField1 = this.$stringUtil.replaceAll(event.target.value, ',', '')
    },
    onInputItemField1(event) {
      try {
        const commaRemovedValue = this.$stringUtil.replaceAll(event.target.value, ',', '')
        const parsedNumber = parseInt(commaRemovedValue, 10)
        if (!Number.isNaN(parsedNumber)) {
          this.cloneItem.itemField1 = parsedNumber
        }
      } catch (e) {
        this.$log.debug(e)
      }
    },
    onBlurItemField1(event) {
      try {
        const commaRemovedValue = this.$stringUtil.replaceAll(event.target.value, ',', '')
        const parsedNumber = parseInt(commaRemovedValue, 10)
        if (!Number.isNaN(parsedNumber)) {
          this.cloneItem.itemField1 = this.$stringUtil.addCommas(parsedNumber)
        }
      } catch (e) {
        this.$log.debug(e)
      }
    },

  }
}
</script>

<style scoped lang="scss">
.fcfs__edit {
  .txt-right {
    margin-top:14px;
    button{
      width:140px;
      + button{margin-left:8px;}
    }
  }
}
</style>