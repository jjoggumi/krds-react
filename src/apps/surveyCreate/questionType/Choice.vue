<!--
@File(Method): Choice.vue
@Author: -
@Date Created: -
@Description: 클래스 > 설문 > 설문만들기 > 객관식 항목 순서 변경
@Modified: 2024-09-30 - #68110 상용이슈 : draggable 순서 변경시 텍스트, 이미지 등 요소들이 함께 선택 드래그 되는 문제 대응
-->
<template>
  <!-- 객관식 타입 -->
  <div class="survey-create__box">

    <survey-create-body-question-tag />
    <survey-create-body-question-title />
    <survey-create-body-question-description />
    <survey-create-body-question-upload />

    <draggable
      class="objective__list"
      tag="div"
      v-model="surveyEditQuestions.items"
      v-bind="dragOptions"
      @start="isDrag = true"
      @end="isDrag = false"
      @change="onChange"
    >
      <transition-group type="transition" :name="!isDrag ? 'flip-list' : null">

        <!-- 일반 응답 영역 -->
        <div
          v-for="(item, itemIndex) of normalAnswerItems"
          :key="`normal-answer-items-${itemIndex}`"
          class="objective__item draggable-area"
        >
          <div class="objective__box">
            <span class="icon-checkbox"></span>

            <!-- DB 컬럼 maxLength: 255 -->
            <textarea
              :ref="`itemTitleTextarea${itemIndex}`"
              :class="{
                'width-narrow': surveyEditQuestions.isLinkedPage
              }"
              maxlength="250"
              placeholder="항목을 입력하세요."
              v-model="item.itemTitle"
              @input="$hiClass.textareaAutoResize($refs[`itemTitleTextarea${itemIndex}`], 24)"
            ></textarea>

            <div class="objective__right">
              <survey-upload
                :key="`surveyUploadItem${itemIndex}`"
                :ref="`surveyUploadItem${itemIndex}`"
                :files.sync="item.files"
                :is-readonly="false"
                :btn-class="'btn-upload-image'"
                :file-category="'IMAGE'"
                :file-target-type="'ITEM'"
                :file-align="'LEFT'"
              />
              <survey-create-page-select-box
                v-if="surveyEditQuestions.isLinkedPage"
                :item="item"
              />
            </div>
            <span class="btn-move"></span>

            <button
              v-if="normalAnswerItems.length > 1"
              class="btn-delete"
              @click="deleteItem(item)"
            ></button>

            <div
              v-for="(file, fileIndex) of item.files"
              :key="`${file.fileOriginalPath}-${fileIndex}`"
              class="alignbox"
              :class="[file.fileAlign ? file.fileAlign.toLowerCase() : '']"
            >
              <div class="image">
                <img :src="file.fileOriginalPath" alt="">

                <survey-attachment-more
                  v-if="file.fileOriginalPath"
                  :file="file"
                  @set-file-align="setFileAlign"
                  @replace-file="replaceFile(`surveyUploadItem${itemIndex}`)"
                  @delete-file="deleteFile(file, item.sortNo)"
                  @edit-image="editImage(file, `survey-upload-file-surveyUploadItem${itemIndex}`)"
                />

              </div>
            </div>
          </div>

        </div>

      </transition-group>
    </draggable>

    <div class="objective__list">

      <!-- 기타 항목 영역 -->
      <div
        v-for="(item, index) of etcAnswerItems"
        :key="`etc-answer-item-${index}`"
        class="objective__item"
      >
        <div class="objective__box">
          <span class="icon-checkbox"></span>

          <!-- DB 컬럼 maxLength: 255 -->
          <textarea
            :ref="`etcAnswerItemTitleTextarea${index}`"
            maxlength="255"
            placeholder="항목을 입력하세요."
            v-model="item.itemTitle"
            @input="$hiClass.textareaAutoResize($refs[`etcAnswerItemTitleTextarea${index}`], 24)"
          ></textarea>

          <button
            class="btn-delete"
            @click="deleteItem(item)"
          ></button>
        </div>

        <!-- 기타 항목일 경우 노출 -->
        <textarea
          class="textareabox"
          placeholder="응답자가 직접 입력하는 영역입니다."
          disabled
        ></textarea>

      </div>

    </div>

    <button
      class="btn-add-etc"
      @click="addItem"
    >
      ‘항목’ 추가
    </button>
    <button
      v-if="existsIsEtcAnswerQuestionItems.length === 0"
      class="btn-add-etc"
      @click="addSurveyEditQuestionsItem({ isEtcAnswer: true })"
    >
      ‘기타 항목’ 추가
    </button>
  </div>

</template>

<script>
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import draggable from 'vuedraggable'

import SurveyUpload from "@/components/Upload/Survey/SurveyUpload";
import SurveyAttachmentMore from "@/components/MorePopup/SurveyAttachmentMore";
import SurveyCreateBodyQuestionTitle from "@/apps/surveyCreate/SurveyCreateBodyQuestionTitle";
import SurveyCreateBodyQuestionUpload from "@/apps/surveyCreate/SurveyCreateBodyQuestionUpload";
import SurveyCreatePageSelectBox from "@/apps/surveyCreate/components/PageSelectBox.vue";
import SurveyCreateBodyQuestionDescription from "@/apps/surveyCreate/SurveyCreateBodyQuestionDescription.vue";
import SurveyCreateBodyQuestionTag from "@/apps/surveyCreate/SurveyCreateBodyQuestionTag.vue";

export default {
  name: "survey-create-question-type-choice",
  components: {
    SurveyCreateBodyQuestionTag,
    SurveyCreateBodyQuestionDescription,
    SurveyCreatePageSelectBox,
    draggable,
    SurveyCreateBodyQuestionUpload,
    SurveyCreateBodyQuestionTitle,
    SurveyAttachmentMore,
    SurveyUpload,
  },
  data() {
    return {
      isDrag: false,
      pageModel: {
        linkPage: {
          pageId: undefined,
          pageName: undefined,
          sortNo: undefined
        }
      },
      questionModel: {
        isValidated: undefined,
        isLinkedPage: undefined,
        questionType: undefined,
        questionTitle: undefined,
      }
    };
  },
  computed: {
    ...mapState({
      draggableDefaultOption: 'draggableDefaultOption'
    }),
    ...mapState('storeSurvey', {
      surveyEditQuestions: 'surveyEditQuestions',
      surveyEditPages: 'surveyEditPages',
      surveyEditPagesSimple: 'surveyEditPagesSimple',
    }),
    ...mapGetters('storeSurvey', {
      existsIsEtcAnswerQuestionItems: 'existsIsEtcAnswerQuestionItems'
    }),
    normalAnswerItems() {
      return this.surveyEditQuestions.items.filter(d => !d.isEtcAnswer)
    },
    etcAnswerItems() {
      return this.surveyEditQuestions.items.filter(d => d.isEtcAnswer)
    },
    dragOptions() {
      const option = {}
      Object.entries(this.draggableDefaultOption).forEach(([key, value]) => {
        option[key] = value
      })
      option.group = 'choice'
      option.handle = '.btn-move'
      return option
    }
  },
  watch: {
    'surveyEditQuestions.questionId'() {
      setTimeout(() => {
        this.normalAnswerItems.forEach((item, index) => {
          if (this.$refs[`itemTitleTextarea${index}`])
            this.$hiClass.textareaAutoResize(this.$refs[`itemTitleTextarea${index}`], 24)
        })
        this.etcAnswerItems.forEach((item, index) => {
          if (this.$refs[`etcAnswerItemTitleTextarea${index}`])
            this.$hiClass.textareaAutoResize(this.$refs[`etcAnswerItemTitleTextarea${index}`], 24)
        })
      }, 50)
    },
    'surveyEditQuestions.isLinkedPage'() {
      setTimeout(() => {
        this.normalAnswerItems.forEach((item, index) => {
          if (this.$refs[`itemTitleTextarea${index}`])
            this.$hiClass.textareaAutoResize(this.$refs[`itemTitleTextarea${index}`], 24)
        })
        this.etcAnswerItems.forEach((item, index) => {
          if (this.$refs[`etcAnswerItemTitleTextarea${index}`])
            this.$hiClass.textareaAutoResize(this.$refs[`etcAnswerItemTitleTextarea${index}`], 24)
        })
      }, 50)
    },
    surveyEditQuestions: {
      async handler() {
        this.setIsChangedSurveyEditQuestions(true)

        const surveyEditQuestions = this.surveyEditQuestions
        this.questionModel.isValidated = await this.getIsValidatedByStateSurveyEditQuestions()
        this.questionModel.isLinkedPage = surveyEditQuestions.isLinkedPage
        this.questionModel.questionType = surveyEditQuestions.questionType
        this.questionModel.questionTitle = surveyEditQuestions.questionTitle

        this.pageModel.linkPage.pageId = surveyEditQuestions.linkPageId
      },
      deep: true
    },
    questionModel: {
      handler() {
        const pageId = this.surveyEditQuestions.pageId
        const questionId = this.surveyEditQuestions.questionId
        // lnbPages.question 매핑 후 수정
        const curPage = this.surveyEditPages.find(page => page.pageId === pageId)
        if (curPage) {
          const curQuestion = curPage.questions.find(question => question.questionId === questionId)
          if (curQuestion) {
            curQuestion.isValidated = this.questionModel.isValidated
            curQuestion.isLinkedPage = this.questionModel.isLinkedPage
            curQuestion.questionType = this.questionModel.questionType
            curQuestion.questionTitle = this.questionModel.questionTitle
          }
        }
      },
      deep: true
    },
    pageModel: {
      handler() {
        const pageId = this.surveyEditQuestions.pageId
        // lnbPages 매핑 후 수정
        const curPage = this.surveyEditPages.find(page => page.pageId === pageId)
        if (curPage) {
          if (curPage.linkPage) {
            curPage.linkPage.pageId = this.pageModel.linkPage.pageId
          } else {
            this.$set(curPage, 'linkPage', this.pageModel.linkPage)
          }
        }
      },
      deep: true
    },
  },
  mounted() {
    setTimeout(() => {
      this.normalAnswerItems.forEach((item, index) => {
        if (this.$refs[`itemTitleTextarea${index}`])
          this.$hiClass.textareaAutoResize(this.$refs[`itemTitleTextarea${index}`], 24)
      })
      this.etcAnswerItems.forEach((item, index) => {
        if (this.$refs[`etcAnswerItemTitleTextarea${index}`])
          this.$hiClass.textareaAutoResize(this.$refs[`etcAnswerItemTitleTextarea${index}`], 24)
      })
      this.setIsChangedSurveyEditQuestions(false)
    }, 50)
  },
  methods: {
    ...mapMutations('storeSurvey', {
      setIsChangedSurveyEditQuestions: 'setIsChangedSurveyEditQuestions'
    }),
    ...mapActions('storeSurvey', {
      addSurveyEditQuestionsItem: 'addSurveyEditQuestionsItem',
      deleteSurveyEditQuestionsItem: 'deleteSurveyEditQuestionsItem',
      changeSurveyQuestionItemSort: 'changeSurveyQuestionItemSort',
      getIsValidatedByStateSurveyEditQuestions: 'getIsValidatedByStateSurveyEditQuestions',
      checkSurveyEditQuestionsAnswerLimit: 'checkSurveyEditQuestionsAnswerLimit',
    }),
    ...mapActions('storeImageEditor', {
      openImageEditor: 'openImageEditor'
    }),
    async deleteItem(selectItem) {
      await this.deleteSurveyEditQuestionsItem(selectItem)
      await this.checkSurveyEditQuestionsAnswerLimit()
    },
    setFileAlign(file, value) {
      file.fileAlign = value
    },
    replaceFile(uploadRef) {
      // ref 대상이 복수의 vue component 인 경우 0번 index 확인
      this.$log.debug(this.$options.name, `replaceFile() this.$refs[uploadRef][0]`, this.$refs[uploadRef][0])
      if (this.$refs[uploadRef][0]) {
        this.$refs[uploadRef][0].changeFile()
      }
    },
    deleteFile(file, itemSortNo) {
      switch (file.fileTargetType) {
        case 'SURVEY':
          break
        case 'QUESTION': {
          this.surveyEditQuestions.files = this.surveyEditQuestions.files.filter(item => {
            return item.fileOriginalPath !== file.fileOriginalPath
          })
          break
        }
        case 'ITEM': {
          let targetItemIndex = this.surveyEditQuestions.items.findIndex(item => {
            return item.sortNo === itemSortNo
          })
          if (targetItemIndex > -1) {
            this.surveyEditQuestions.items[targetItemIndex].files =
              this.surveyEditQuestions.items[targetItemIndex].files.filter(item => {
                return item.fileOriginalPath !== file.fileOriginalPath
              })
          }
          break
        }
        case 'ANSWER':
          break
      }
    },
    async editImage(file, key = this.$vnode.key) {
      await this.openImageEditor({
        uploadedFiles: [file],
        inputFiles: null,
        imageLimitCount: 1,
        componentKey: key,
        targetIdx: 0,
        parentComponent: 'surveyChoice'
      })
    },
    async onChange(e) {
      this.$log.debug(this.$options.name, 'draggable log', e)
      await this.changeSurveyQuestionItemSort()

      this.normalAnswerItems.forEach((item, index) => {
        if (this.$refs[`itemTitleTextarea${index}`])
          this.$hiClass.textareaAutoResize(this.$refs[`itemTitleTextarea${index}`], 24)
      })
      this.etcAnswerItems.forEach((item, index) => {
        if (this.$refs[`etcAnswerItemTitleTextarea${index}`])
          this.$hiClass.textareaAutoResize(this.$refs[`etcAnswerItemTitleTextarea${index}`], 24)
      })
    },
    async addItem() {
      await this.addSurveyEditQuestionsItem({})

      this.$nextTick(() => {
        const lastItemIndex = this.normalAnswerItems.length - 1
        if (lastItemIndex >= 0) {
          const elements = this.$refs[`itemTitleTextarea${lastItemIndex}`]
          if (elements && elements[0]) {
            elements[0].focus()
          }
        }
      })
    },
  }
}
</script>

<style lang="scss">
.objective__item {
  &.hidden-ghost {
    visibility: hidden;
  }
  &.sortable-chosen {
    opacity: 1 !important;
  }
}
</style>