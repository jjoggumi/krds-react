<!--
@File(Method): SurveyCreateBodyQuestionRnb.vue
@Author: -
@Date Created: -
@Description: 설문·투표 > 설문만들기 > 페이지 클릭 > 우측 영역 질문유형
@Modified: 2024-10-18 - #69170 [WEB] 설문 만들기 질문유형 중 미사용 유형(별점, 드롭다운, 첨부파일, 설명) 히든처리
-->

<template>
  <div class="column-right">
    <div class="column__inner">

      <strong class="heading">질문 유형</strong>
      <div class="type__list">
        <div
          v-for="questionTypeItem of questionTypeItems"
          :key="questionTypeItem.code"
          class="type__item"
          :class="[
            questionTypeItem.class,
            {
              'is-active': questionTypeItem.code === surveyEditQuestions.questionType,
              'is-disabled': questionTypeItem.disabled
            }
          ]"
          @click="selectQuestionTypeItem(questionTypeItem)"
        >
          <button>{{ questionTypeItem.title }}</button>
        </div>
      </div>

      <div
        v-if="surveyEditQuestions.questionType === CONSTANTS.QUESTION_TYPE.DESCRIPTION"
        class="text-noticebox"
      >
        <p>설문의 이해를 돕기 위해 콘텐츠로 <br>구성 할 수 있는 설명 페이지 입니다.<br>설명은 통계에 포함되지 않습니다.</p>
      </div>

      <template v-if="surveyEditQuestions.questionType === CONSTANTS.QUESTION_TYPE.CONSULTATION">
        <strong class="heading">상담 유형</strong>

        <div class="option__list">
          <div
            v-if="surveyEditQuestions.consultationSetting"
            class="option__item"
          >
            <hi-check-box
              v-for="(checkbox, index) of consultationSettingCheckboxes"
              :key="`${checkbox.title}-${index}`"
              :model.sync="surveyEditQuestions.consultationSetting[checkbox.modelKey]"
              :item="{
                title: checkbox.title
              }"
              :append-check-box-id="checkbox.appendCheckBoxId"
              :root-element-class-list="checkbox.rootElementClassList"
              :disabled="checkbox.disabled"
            />

          </div>
        </div>

        <strong class="heading">유의 사항</strong>
        <div class="option__list">
          <div class="option__item">
            <ul class="text-notice">
              <li>* 상담 달력에서 상담 가능 시간을 추가, 변경 할 수 있습니다.</li>
              <li>* 학부모의 상담 신청 내역을 상담 달력에서 삭제할 수 있습니다.</li>
              <li>* 각 상담 시간별로 선착순 1명만 신청가능합니다. (동일 시간대 중복 신청 불가)</li>
            </ul>
          </div>
        </div>

      </template>

      <template v-else>
        <template
          v-if="false"
        >
          <strong class="heading">
            {{ curSurveyPage }}P. 다음
            <hi-tooltip :title-html="`현재 페이지 다음으로 이동할 페이지를 <br>지정할 수 있습니다.`" />
          </strong>

          <div class="option__list">
            <div class="option__item">
              <div
                class="hi-selectbox w100"
                :class="{ 'is-opened': isOpen.linkPageId }"
                v-click-outside="closeLinkPageId"
              >
                <button
                  class="selected"
                  @click="toggleLinkPageId"
                >
                  {{ getLinkPageTitle(surveyEditQuestions.linkPageId) }}
                </button>
                <div class="option__layer">
                  <button
                    class="option"
                    :class="{ 'is-selected': surveyEditQuestions.linkPageId === null }"
                    :value="null"
                    @click="selectLinkPage(null)"
                  >
                    다음 페이지로 이동
                  </button>
                  <button
                    v-for="page of surveyEditPagesSimple"
                    :key="page.pageId"
                    class="option"
                    :class="{ 'is-selected': surveyEditQuestions.linkPageId === page.pageId }"
                    :value="page.pageId"
                    @click="selectLinkPage(page.pageId)"
                  >
                    {{ `${page.sortNo}P ${(page.pageName || '')} 이동` }}
                  </button>
                  <button
                    class="option"
                    :class="{ 'is-selected': surveyEditQuestions.linkPageId === '00000000-0000-0000-0000-000000000000' }"
                    :value="'00000000-0000-0000-0000-000000000000'"
                    @click="selectLinkPage('00000000-0000-0000-0000-000000000000')"
                  >
                    설문지 제출
                  </button>
                </div>

              </div>
            </div>
          </div>

        </template>

        <strong class="heading">옵션 설정</strong>
        <div class="option__list">

          <template
            v-if="!immutableQuestionTypes.includes(surveyEditQuestions.questionType)"
          >
            <div class="option__item">
              <div class="checkbox">
                <input
                  type="checkbox"
                  id="question-rnb-chk-is-required"
                  v-model="surveyEditQuestions.isRequired"
                >
                <label for="question-rnb-chk-is-required"><span>필수 응답</span></label>
              </div>
            </div>
          </template>

          <div
            class="option__item"
            v-if="surveyEditQuestions.questionType === CONSTANTS.QUESTION_TYPE.CHOICE
            || surveyEditQuestions.questionType === CONSTANTS.QUESTION_TYPE.AFTER_SCHOOL
          "
          >
            <div
              v-if="surveyEditQuestions.questionType === CONSTANTS.QUESTION_TYPE.CHOICE"
              class="checkbox"
            >
              <input
                type="checkbox"
                id="question-rnb-chk-is-multiple-answer"
                v-model="surveyEditQuestions.isMultipleAnswer"
              >
              <label for="question-rnb-chk-is-multiple-answer">
                <span>복수 응답</span>
              </label>
            </div>

            <strong
              v-if="surveyEditQuestions.questionType === CONSTANTS.QUESTION_TYPE.AFTER_SCHOOL"
              class="option__heading"
            >
              신청 가능한 수업 개수
            </strong>

            <span
              v-if="surveyEditQuestions.questionType === CONSTANTS.QUESTION_TYPE.AFTER_SCHOOL"
              class="text-refer"
            >
              * 최대 신청 가능한 수업 개수를 설정합니다.
            </span>

            <div
              class="hi-selectbox"
              :class="{ 'mt-10': surveyEditQuestions.questionType === CONSTANTS.QUESTION_TYPE.AFTER_SCHOOL }"
              v-click-outside="closeAnswerLimit"
            >
              <button
                class="selected"
                :disabled="!surveyEditQuestions.isMultipleAnswer"
                @click="isOpen.answerLimit = !isOpen.answerLimit"
              >
                {{
                  surveyEditQuestions.answerLimit === null
                    ? '제한없음'
                    : surveyEditQuestions.answerLimit
                }}
              </button>

              <div
                v-if="isOpen.answerLimit"
                class="option__layer"
                style="display: block"
              >
                <button
                  class="option"
                  :class="{ 'is-selected': surveyEditQuestions.answerLimit === null }"
                  :value="null"
                  @click="surveyEditQuestions.answerLimit = null; isOpen.answerLimit = false"
                >
                  제한없음
                </button>
                <button
                  v-if="surveyEditQuestions.questionType === CONSTANTS.QUESTION_TYPE.AFTER_SCHOOL"
                  class="option"
                  :class="{ 'is-selected': surveyEditQuestions.answerLimit === 1 }"
                  :value="1"
                  @click="surveyEditQuestions.answerLimit = 1; isOpen.answerLimit = false"
                >
                  1
                </button>
                <button
                  v-for="(item, index) of existsSortNoQuestionItems"
                  :key="`${item.sortNo}-${index}`"
                  class="option"
                  :class="{
                    'is-selected': surveyEditQuestions.answerLimit === index + 1,
                    'is-hidden': (surveyEditQuestions.questionType === CONSTANTS.QUESTION_TYPE.CHOICE && index + 1 === 1)
                      || (surveyEditQuestions.questionType === CONSTANTS.QUESTION_TYPE.AFTER_SCHOOL && index + 1 === 1)
                      || (surveyEditQuestions.questionType === CONSTANTS.QUESTION_TYPE.AFTER_SCHOOL && index + 1 === existsSortNoQuestionItems.length)
                  }"
                  :value="index + 1"
                  @click="surveyEditQuestions.answerLimit = index + 1; isOpen.answerLimit = false"
                >
                  {{ index + 1 }}
                </button>
              </div>

            </div>

          </div>

          <div
            v-if="surveyEditQuestions.questionType === CONSTANTS.QUESTION_TYPE.CHOICE"
            class="option__item"
          >
            <div class="checkbox">
              <input
                type="checkbox"
                id="question-rnb-chk-is-linked-page"
                v-model="surveyEditQuestions.isLinkedPage"
                :disabled="surveyEditQuestions.isMultipleAnswer"
              >
              <label for="question-rnb-chk-is-linked-page"><span>답변을 기준으로 페이지 이동</span></label>
            </div>
          </div>

        <div
          v-if="surveyEditQuestions.questionType === CONSTANTS.QUESTION_TYPE.AFTER_SCHOOL"
          class="option__item"
        >
          <div class="checkbox mt-20">
            <input
              type="checkbox"
              id="question-rnb-chk-is-allowed-overlap-time"
              :true-value="false"
              :false-value="true"
              :disabled="isCurSurveyPublished"
              v-model="surveyEditQuestions.isAllowedOverlapTime"
            >
            <label for="question-rnb-chk-is-allowed-overlap-time"><span>중복 신청 제한 (수업시간)</span></label>

            </div>
            <span
              class="text-refer"
              :class="{ highlight: !surveyEditQuestions.isAllowedOverlapTime }"
            >
            * 수업 시간이 중복되면 방과후 신청을 제한합니다.
          </span>
            <span
              class="text-refer mt-0"
              :class="{ highlight: !surveyEditQuestions.isAllowedOverlapTime }"
            >
            * 발행 완료 후 변경이 불가합니다.
          </span>
          </div>

        </div>
      </template>
    </div>
  </div>
</template>

<script>
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import HiCheckBox from "@/components/Form/HiCheckBox.vue";
import HiTooltip from "@/components/Tooltip/HiTooltip.vue";

export default {
  name: "survey-create-body-question-rnb",
  components: {HiTooltip, HiCheckBox},
  data() {
    return {
      isOpen: {
        answerLimit: false,
        linkPageId: false
      },
      consultationSettingCheckboxes: [
        {
          modelKey: 'isPhone',
          title: '전화',
          appendCheckBoxId: `consultation-model-isPhone`,
          rootElementClassList: ['mr-20'],
          disabled: false
        },
        {
          modelKey: 'isVisit',
          title: '방문',
          appendCheckBoxId: `consultation-model-isVisit`,
          rootElementClassList: ['mr-20'],
          disabled: false
        },
        {
          modelKey: 'isRemote',
          title: '원격',
          appendCheckBoxId: `consultation-model-isRemote`,
          rootElementClassList: ['mr-20'],
          disabled: false
        },
      ],
      reloadSurveyEditPagesSimpleTimer: null
    }
  },
  computed: {
    ...mapState('storeSurvey', {
      curSurveyEdit: 'curSurveyEdit',
      surveyEditQuestions: 'surveyEditQuestions',
      surveyEditPagesSimple: 'surveyEditPagesSimple',
      publishedQuestionIds: 'publishedQuestionIds',
      surveyEditPagesChangeTimestamps: 'surveyEditPagesChangeTimestamps',
    }),
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
    }),
    ...mapGetters('storeSurvey', {
      existsSortNoQuestionItems: 'existsSortNoQuestionItems',
      curSurveyPage: 'curSurveyPage',
      curSurveyPageQuestionNumber: 'curSurveyPageQuestionNumber',
      surveyEditPagesTotalCount: 'surveyEditPagesTotalCount',
      isFirstSurveyQuestion: 'isFirstSurveyQuestion',
      isLastSurveyQuestion: 'isLastSurveyQuestion',
      isCurSurveyPublished :'isCurSurveyPublished',
    }),
    isEmptyQuestionItems() {
      const question = this.surveyEditQuestions
      const questionType = question.questionType
      const items = question.items
      let isEmpty = false

      switch (questionType) {
        case this.CONSTANTS.QUESTION_TYPE.CHOICE: {
          const noContent = items.length === 4
            && items.filter(item => {
              return (
                item.itemTitle
                || item.files.length > 0
                || item.isEtcAnswer
                || item.linkPageId
              )
            }).length === 0

          if (noContent) {
            isEmpty = true
          }
          break
        }
        case this.CONSTANTS.QUESTION_TYPE.SUBJECTIVE: {
          const noContent = items.length === 0

          if (noContent) {
            isEmpty = true
          }
          break
        }
        case this.CONSTANTS.QUESTION_TYPE.SIGN: {
          const noContent = items.length === 0

          if (noContent) {
            isEmpty = true
          }
          break
        }
        default: {
          isEmpty = true
        }
      }
      return isEmpty
    },
    isChangedQuestionItems() {
      return !this.isEmptyQuestionItems
    },
    questionTypeItems() {
      const surveyType = this.curSurveyEdit.surveyType
      const disabled = this.immutableQuestionTypes.includes(this.surveyEditQuestions.questionType)
      const items = []
      const commonItems1 = [
        {
          class: 'type__obj',
          title: this.CONSTANTS.QUESTION_TYPE_NAME.CHOICE,
          code: this.CONSTANTS.QUESTION_TYPE.CHOICE,
          disabled: disabled,
          unavailable: disabled,
        },
        {
          class: 'type__sbj',
          title: this.CONSTANTS.QUESTION_TYPE_NAME.SUBJECTIVE,
          code: this.CONSTANTS.QUESTION_TYPE.SUBJECTIVE,
          disabled: disabled,
          unavailable: disabled,
        },
        {
          class: 'type__esign',
          title: this.CONSTANTS.QUESTION_TYPE_NAME.SIGN,
          code: this.CONSTANTS.QUESTION_TYPE.SIGN,
          disabled: disabled,
          unavailable: disabled,
        },
      ]
      //#69170 const surveyItems = [
        // {
        //   class: 'type__star',
        //   title: this.CONSTANTS.QUESTION_TYPE_NAME.STAR,
        //   code: this.CONSTANTS.QUESTION_TYPE.STAR,
        //   disabled: true,
        //   unavailable: disabled,
        // },
        // {
        //   class: 'type__dropdown',
        //   title: this.CONSTANTS.QUESTION_TYPE_NAME.DROPDOWN,
        //   code: this.CONSTANTS.QUESTION_TYPE.DROPDOWN,
        //   disabled: true,
        //   unavailable: disabled,
        // },
      //]
      //const commonItems2 = [
        // {
        //   class: 'type__file',
        //   title: this.CONSTANTS.QUESTION_TYPE_NAME.ATTACHMENTS,
        //   code: this.CONSTANTS.QUESTION_TYPE.ATTACHMENTS,
        //   disabled: true,
        //   unavailable: disabled,
        // },
        // {
        //   class: 'type__desc',
        //   title: this.CONSTANTS.QUESTION_TYPE_NAME.DESCRIPTION,
        //   code: this.CONSTANTS.QUESTION_TYPE.DESCRIPTION,
        //   disabled: true,
        //   unavailable: disabled,
        // },
      //]

      if (surveyType === this.CONSTANTS.SURVEY_TYPE.AFTER_SCHOOL) {
        items.push({
          class: 'type__fcfs',
          title: this.CONSTANTS.QUESTION_TYPE_NAME.AFTER_SCHOOL,
          code: this.CONSTANTS.QUESTION_TYPE.AFTER_SCHOOL,
          disabled: this.surveyEditQuestions.questionType !== this.CONSTANTS.QUESTION_TYPE.AFTER_SCHOOL,
          unavailable: this.surveyEditQuestions.questionType !== this.CONSTANTS.QUESTION_TYPE.AFTER_SCHOOL,
        })
      }

      if (surveyType === this.CONSTANTS.SURVEY_TYPE.CONSULTATION) {
        items.push({
          class: 'type__counsel',
          title: this.CONSTANTS.QUESTION_TYPE_NAME.CONSULTATION,
          code: this.CONSTANTS.QUESTION_TYPE.CONSULTATION,
          disabled: this.surveyEditQuestions.questionType !== this.CONSTANTS.QUESTION_TYPE.CONSULTATION,
          unavailable: this.surveyEditQuestions.questionType !== this.CONSTANTS.QUESTION_TYPE.CONSULTATION
        })
      }

      items.push(...commonItems1)

      // #69170 if (surveyType === this.CONSTANTS.SURVEY_TYPE.SURVEY) {
      //   items.push(...surveyItems)
      // }

      // items.push(...commonItems2)

      return items
    },
    immutableQuestionTypes() {
      return [
        this.CONSTANTS.QUESTION_TYPE.AFTER_SCHOOL,
        this.CONSTANTS.QUESTION_TYPE.CONSULTATION,
      ]
    },
  },
  watch: {
    'surveyEditQuestions.isMultipleAnswer'(val) {
      if (val) {
        this.surveyEditQuestions.isLinkedPage = false
        this.$nextTick(() => {
          this.checkSurveyEditQuestionsAnswerLimit()
        })
      }
    },
    'surveyEditQuestions.questionType'(val) {
      if (val) {
        this.setIsChangedSurveyEditQuestions(true)
      }
    },
    'surveyEditQuestions.isLinkedPage'(val) {
      if (val === false) {
        this.clearSurveyEditQuestionsItemsLinkPageId()
      }
    },
    'surveyEditQuestions.consultationSetting': {
      handler() {
        if (this.surveyEditQuestions.consultationSetting) {
          if (!this.surveyEditQuestions.consultationSetting.isPhone
            && !this.surveyEditQuestions.consultationSetting.isVisit
            && !this.surveyEditQuestions.consultationSetting.isRemote
          ) {
            this.$toasted.clear()
            this.$toasted.show('상담 유형을 선택해주세요.')
          }
        }
      },
      deep: true
    }
  },
  created() {
    this.reloadSurveyEditPagesSimpleTimer =
      setInterval(() => {
        if (this.surveyEditPagesChangeTimestamps.length > 0) {
          this.setSurveyEditPagesChangeTimestamps([])
          setTimeout(() => {
            this.reloadSurveyEditPagesSimple()
          }, 1000)
        }
      }, 200)
  },
  mounted() {
    this.$nextTick(() => {
      this.reloadSurveyEditPagesSimple()
    })
  },
  beforeDestroy() {
    clearInterval(this.reloadSurveyEditPagesSimpleTimer)
  },
  methods: {
    ...mapMutations('storeSurvey', {
      setIsChangedSurveyEditQuestions: 'setIsChangedSurveyEditQuestions',
      setSurveyEditPagesChangeTimestamps: 'setSurveyEditPagesChangeTimestamps',
    }),
    ...mapActions('storeSurvey', {
      createSlide: 'createSlide',
      goPrevSurveyQuestion: 'goPrevSurveyQuestion',
      goNextSurveyQuestion: 'goNextSurveyQuestion',
      changeSurveyCreateQuestionType: 'changeSurveyCreateQuestionType',
      getSurveyEditPagesSimple: 'getSurveyEditPagesSimple',
      checkSurveyEditQuestionsAnswerLimit: 'checkSurveyEditQuestionsAnswerLimit',
      temporarilySaveSurvey: 'temporarilySaveSurvey',
    }),
    selectQuestionTypeItem(questionTypeItem) {
      const process = async () => {
        await this.changeSurveyCreateQuestionType({
          questionType: questionTypeItem.code
        })
        await this.temporarilySaveSurvey({})
      }

      if (questionTypeItem.code === this.surveyEditQuestions.questionType) {
        return false
      }
      if (questionTypeItem.unavailable) {
        return false
      }
      if (questionTypeItem.disabled) {
        this.$hiClass.tbdAlert()
        return false
      }
      if (this.publishedQuestionIds.includes(this.surveyEditQuestions.questionId)) {
        this.$hiClass.alert('설문 발행 후에는 유형 변경이 불가합니다.')
        return false
      }
      if (this.isChangedQuestionItems) {
        const confirmMessage = '질문 유형을 변경하시면 작성하신 내용이 삭제됩니다.<br>변경하시겠습니까?'
        const opts = {
          confirmButtonText: '확인',
          reverseButtons: true
        }
        this.$hiClass.confirm(confirmMessage, null, opts)
          .then(() => process())
      } else {
        process()
      }
    },
    closeAnswerLimit() {
      this.isOpen.answerLimit = false
    },
    closeLinkPageId() {
      this.isOpen.linkPageId = false
    },
    toggleLinkPageId() {
      this.isOpen.linkPageId = !this.isOpen.linkPageId
    },
    selectLinkPage(pageId) {
      this.surveyEditQuestions.linkPageId = pageId
      this.closeLinkPageId()
    },
    onClickNextPage() {
      this.isLastSurveyQuestion
        ? this.createSlide()
        : this.goNextSurveyQuestion()
    },
    getLinkPageTitle(linkPageId) {
      let title = ''
      switch (linkPageId) {
        case null: {
          title = '다음 페이지로 이동'
          break
        }
        case '00000000-0000-0000-0000-000000000000': {
          title = '설문지 제출'
          break
        }
        default: {
          const foundPage = this.surveyEditPagesSimple.find(page => page.pageId === linkPageId)
          if (foundPage) {
            title = `${foundPage.sortNo}P ${(foundPage.pageName || '')} 이동`
          } else {
            title = '다음 페이지로 이동'
          }
        }
      }
      return title
    },
    clearSurveyEditQuestionsItemsLinkPageId() {
      this.surveyEditQuestions.items.forEach(item => {
        item.linkPageId = null
      })
    },
    reloadSurveyEditPagesSimple() {
      if (this.surveyEditQuestions.surveyId && this.curSurveyPage > 0) {
        const payload = {
          surveyId: this.surveyEditQuestions.surveyId,
          sortNoGoe: this.curSurveyPage + 1
        }
        this.getSurveyEditPagesSimple(payload)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
button.option.is-hidden {
  display: none !important;
}
</style>