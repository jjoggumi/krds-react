<template>
  <draggable
    :key="lnbPageComponentKey"
    class="question__list"
    :class="{ 'is-dragging-item' : isPageDrag }"
    :list="surveyEditPages"
    :move="checkPageMove"
    v-bind="pageDragOptions"
    @start="onPageDragStart"
    @end="onPageDragEnd"
    @change="onPageChange"
    handle=".btn-toggle"
  >
    <div
      v-for="(editPage, editPageIndex) of surveyEditPages"
      :key="`edit-page-${editPageIndex}`"
      class="question__item"
    >
      <div class="question__group">

        <div
          class="btn-toggle"
          :class="{
            'is-opened': !hidePageIdArr.includes(editPage.pageId),
            'is-active': isSelectedSurveyEditQuestions
              && editPage.questions.find(question => question.questionId === surveyEditQuestions.questionId)
          }"
          role="button"
          @click="togglePage(editPage.pageId)"
        >
          <span class="num">{{ editPage.sortNo }}P</span>
          <span class="heading">{{ editPage.pageName || '' }}</span>

          <!-- 부모 요소의 클릭 차단 -->
          <div
            class="right"
            :class="{
              // editPage['isOpenedMore'] 속성은 더보기 영역 제어를 위한 커스텀 값 (DB에 저장안함)
              'is-opened-more': editPage['isOpenedMore']
            }"
            @click.stop
          >
            <button
              v-if="isShowCreateQuestionButton(editPage)"
              class="btn-qadd"
              title="질문 추가"
              @click="onClickAddQuestion(editPage.pageId, editPageIndex, editPage.questions.length)"
            ></button>

            <survey-create-lnb-page-more
              :page="editPage"
              @rename-page="renamePage"
              @separate-page="separatePage"
              @delete-page="deletePage"
              @enlarge-page="enlargePage"
              @collapse-page="collapsePage"
            />

          </div>

        </div>

        <div
          v-show="isEditable"
          class="editable"
        >
          <input
            type="checkbox"
            :id="`survey-create-lnb-page-chk-${editPage.sortNo}`"
            :value="editPage"
            :disabled="isDisabledEditModeCheckbox(editPage)"
            v-model="mergeReadyPages"
          >
          <label :for="`survey-create-lnb-page-chk-${editPage.sortNo}`">
            <span class="num">{{ editPage.sortNo }}P</span>
            <span class="heading">{{ editPage.pageName || '' }}</span>
          </label>
        </div>

        <div
          v-show="!hidePageIdArr.includes(editPage.pageId)"
          class="group"
        >
          <draggable
            class="list-group"
            :list="editPage.questions"
            :move="checkQuestionMove"
            v-bind="dragOptions"
            @start="onQuestionDragStart"
            @end="onQuestionDragEnd"
            @change="onQuestionChange"
          >
            <transition-group type="transition" :name="!isQuestionDrag ? 'flip-list' : null">

              <div
                v-for="(question, questionIndex) of editPage.questions"
                :key="`question-${questionIndex}`"
                class="question__box"
                :class="{
                  'is-active': isSelectedSurveyEditQuestions
                    && question.questionId === surveyEditQuestions.questionId
                }"
                role="button"
                :data-questionId="question.questionId"
                :data-pageId="editPage.pageId"
                :data-pageQuestionTotalElements="editPage.questions.length"
                :tabindex="-1"
                @click="selectQuestion(question)"
              >
                <span class="page-count">
                  {{ editPage.questions.length }}
                </span>
                <span
                  class="type"
                  :class="[ getQuestionTypeClass(question.questionType) ]"
                >
                  <span class="page">{{ getSurveyPageQuestionNumberByQuestionId(question.questionId) }}</span>
                  {{ CONSTANTS.QUESTION_TYPE_NAME[question.questionType] || '?' }}
                </span>
                <span class="heading">{{ question.questionTitle }}</span>
                <span
                  v-if="editPage.linkPage || question.isLinkedPage"
                  :key="`question-${questionIndex}-link-page-${(editPage.linkPage || question.isLinkedPage)}`"
                  class="next"
                >
                  {{ getLinkPageTitle(editPage.linkPage, question.isLinkedPage) }}
                </span>

                <div class="group-btn">
                  <button
                    v-if="isShowCopyQuestionByQuestionType(question.questionType)"
                    class="btn-copy"
                    title="질문 복사"
                    @click.stop="onClickCopyQuestion(question, editPage.pageId, editPageIndex, questionIndex)"
                  ></button>
                  <button
                    v-if="isShowDeleteQuestionByQuestionType(question.questionType)"
                    class="btn-delete"
                    title="질문 삭제"
                    @click.stop="onClickDeleteQuestion(question, editPage.pageId, editPageIndex, questionIndex)"
                  ></button>
                </div>

                <span
                  v-if="!question.isValidated"
                  class="icon-error"
                ></span>
              </div>

            </transition-group>
          </draggable>

        </div>
      </div>
    </div>

  </draggable>
</template>

<script>
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import draggable from 'vuedraggable'
import SurveyCreateLnbPageMore from "@/apps/surveyCreate/SurveyCreateLnbPageMore.vue";

export default {
  name: "survey-create-lnb-page",
  props: {
    isEditable: {
      type: Boolean
    }
  },
  components: {
    SurveyCreateLnbPageMore,
    draggable
  },
  data() {
    return {
      isQuestionDrag: false,
      isPageDrag: false,
      isFocusBusy: false,
      isReadyCreatePageByLastQuestion: false,
      dragStartTimestamp: null,
      dragEndTimestamp: null,
      dragStartQuestionTotalElements: null,
      hidePageIdArr: [],
      mergeReadyPages: [],
      lnbPageComponentKey: 0,
      isDeleting: []
    }
  },
  computed: {
    ...mapState({
      draggableDefaultOption: 'draggableDefaultOption'
    }),
    ...mapState('storeSurvey', {
      isChangedSurveyEditQuestions: 'isChangedSurveyEditQuestions',
      curSurveyEdit: 'curSurveyEdit',
      surveyEditPages: 'surveyEditPages',
      surveyEditQuestions: 'surveyEditQuestions',
      surveyCreateBodyComponentName: 'surveyCreateBodyComponentName',
    }),
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    }),
    ...mapGetters('storeSurvey', {
      getSurveyPageQuestionNumberByQuestionId: 'getSurveyPageQuestionNumberByQuestionId',
      surveyEditPagesQuestions: 'surveyEditPagesQuestions',
      surveyEditPagesQuestionsTotalCount: 'surveyEditPagesQuestionsTotalCount',
      isSelectedSurveySetting: 'isSelectedSurveySetting',
      isSelectedSurveyEditQuestions: 'isSelectedSurveyEditQuestions',
      isCurSurveyStarted: 'isCurSurveyStarted'
    }),
    dragOptions() {
      const option = {}
      Object.entries(this.draggableDefaultOption).forEach(([key, value]) => {
        option[key] = value
      })
      option.group = 'lnbPageQuestion'
      option.disabled = this.isEditable
      option.filter = 'button.btn-copy, button.btn-delete'
      // option.touchStartThreshold = 20 // px, how many pixels the point should move before cancelling a delayed drag event
      return option
    },
    pageDragOptions() {
      const option = {}
      Object.entries(this.draggableDefaultOption).forEach(([key, value]) => {
        option[key] = value
      })
      option.ghostClass = 'sortable-ghost'
      option.group = 'lnbPage'
      option.disabled = this.isEditable
      // option.swapThreshold = 0.8
      option.filter = 'button.btn-copy, button.btn-delete, button.btn-qadd, button.btn-kebab'
      // option.touchStartThreshold = 20 // px, how many pixels the point should move before cancelling a delayed drag event
      return option
    },
    immutableQuestionTypes() {
      return [
        this.CONSTANTS.QUESTION_TYPE.AFTER_SCHOOL,
        this.CONSTANTS.QUESTION_TYPE.CONSULTATION,
      ]
    }
  },
  watch: {
    'surveyEditQuestions.questionId'(val) {
      this.$log.debug(this.$options.name, 'watch surveyEditQuestions.questionId val => ', val)
      this.doFocusQuestion()
    },
    'surveyEditPagesQuestionsTotalCount'(val) {
      this.$log.debug(this.$options.name, 'watch surveyEditPagesQuestionsTotalCount val => ', val)
      this.doFocusQuestion()
      // 슬라이드 개수가 변경될 때 hidePageIdArr 의 null 삭제
      this.hidePageIdArr = this.hidePageIdArr.filter(pageId => pageId)
    },
    mergeReadyPages() {
      this.$emit('set-merge-ready-pages-count', this.mergeReadyPages.length)
    }
  },
  mounted() {
    this.$log.debug(this.$options.name, 'mounted !', 'this.curSurveyEdit.surveyId', this.curSurveyEdit.surveyId)
  },
  methods: {
    ...mapMutations({
      setIsLoading: 'setIsLoading'
    }),
    ...mapMutations('storeSurvey', {
      setIsChangedSurveyEditQuestions: 'setIsChangedSurveyEditQuestions',
      setSurveyCreateBodyComponentName: 'setSurveyCreateBodyComponentName',
    }),
    ...mapActions('storeSurvey', {
      getSurveyEditPages: 'getSurveyEditPages',
      getSurveyEditQuestions: 'getSurveyEditQuestions',
      deleteSurveyEditQuestions: 'deleteSurveyEditQuestions',
      deleteSurveyEditPage: 'deleteSurveyEditPage',
      deleteSurveyEditPageByPageIds: 'deleteSurveyEditPageByPageIds',
      mergeSurveyEditPage: 'mergeSurveyEditPage',
      separateSurveyEditPage: 'separateSurveyEditPage',
      temporarilySaveSurvey: 'temporarilySaveSurvey',
      sortingSurveyEditPage: 'sortingSurveyEditPage',
      sortingSurveyEditQuestion: 'sortingSurveyEditQuestion',
      openSurveyCreateLnbPageRenameModal: 'openSurveyCreateLnbPageRenameModal',
      copySlide: 'copySlide',
      copyQuestion: 'copyQuestion',
      createQuestion: 'createQuestion',
      saveChangedSurveyEditQuestions: 'saveChangedSurveyEditQuestions',
    }),
    getQuestionTypeClass(questionType) {
      let questionTypeClass
      switch (questionType) {
        case this.CONSTANTS.QUESTION_TYPE.CHOICE: {
          questionTypeClass = 'type-obj'
          break
        }
        case this.CONSTANTS.QUESTION_TYPE.SUBJECTIVE: {
          questionTypeClass = 'type-sbj'
          break
        }
        case this.CONSTANTS.QUESTION_TYPE.AFTER_SCHOOL: {
          questionTypeClass = 'type-fcfs'
          break
        }
        case this.CONSTANTS.QUESTION_TYPE.CONSULTATION: {
          questionTypeClass = 'type-counsel'
          break
        }
        case this.CONSTANTS.QUESTION_TYPE.DROPDOWN: {
          questionTypeClass = 'type-dropdown'
          break
        }
        case this.CONSTANTS.QUESTION_TYPE.ATTACHMENTS: {
          questionTypeClass = 'type-file'
          break
        }
        case this.CONSTANTS.QUESTION_TYPE.STAR: {
          questionTypeClass = 'type-star'
          break
        }
        case this.CONSTANTS.QUESTION_TYPE.SIGN: {
          questionTypeClass = 'type-esign'
          break
        }
        case this.CONSTANTS.QUESTION_TYPE.DESCRIPTION: {
          questionTypeClass = 'type-desc'
          break
        }
      }
      return questionTypeClass
    },
    async selectQuestion(question) {
      if(this.isDeleting.includes(question.questionId)) return;

      if (question.questionId && question.questionId !== this.surveyEditQuestions.questionId) {
        await this.saveChangedSurveyEditQuestions()
        await this.getSurveyEditQuestions(question.questionId)
      }
      if (!this.isSelectedSurveyEditQuestions) {
        this.setSurveyCreateBodyComponentName('QUESTION')
      }
    },
    onQuestionDragStart(e) {
      this.$log.debug(this.$options.name, 'draggable onQuestionDragStart log', e)
      this.dragStartTimestamp = this.$moment().valueOf()
      this.dragStartQuestionTotalElements = 0

      this.$log.debug(this.$options.name, 'draggable onQuestionDragStart log e.item.dataset', e.item.dataset)
      const curPageQuestionTotalElements = e.item.dataset.pagequestiontotalelements
      this.dragStartQuestionTotalElements = parseInt(curPageQuestionTotalElements, 10)

      this.isQuestionDrag = true
    },
    async onQuestionDragEnd(e) {
      this.$log.debug(this.$options.name, 'draggable onQuestionDragEnd log', e)
      this.dragEndTimestamp = this.$moment().valueOf()
      this.isQuestionDrag = false

      // 200ms 이내에 드래그가 끝나면 클릭 처리
      const dragTimestamp = this.dragEndTimestamp - this.dragStartTimestamp
      if (dragTimestamp < 200) {
        this.$log.warn(this.$options.name, `e.item => `, e.item)
        // e.item === <div role="button" class="question__box"></div>
        const element = e.item
        if (element) {
          setTimeout(() => { element.click() }, 10)
        }
      }

      // 질문 이동 취소 시 페이지 마지막에 위치하면 새 페이지 생성
      if (this.isReadyCreatePageByLastQuestion
        && e.oldIndex === e.newIndex
        && this.dragStartQuestionTotalElements === e.newIndex + 1
      ) {
        const message = '선택한 질문이 페이지로 추가되었습니다.'
        this.$toasted.clear()
        this.$toasted.show(message)

        this.setIsLoading(true)

        const curQuestionId = e.item.dataset.questionid
        const curPageId = e.item.dataset.pageid
        const payload = {
          questionId: curQuestionId,
          pageId: null,
          beforeQuestionId: null,
          beforePageId: curPageId
        }
        this.$log.debug(this.$options.name, 'onQuestionDragEnd() sortingSurveyEditQuestion() payload => ', payload)

        try {
          await this.sortingSurveyEditQuestion(payload)
        } catch (e) {
          if (e.response.status === 400) {
            this.$hiClass.alert(`error code: ${e.response.status}<br>${e.response.data.cause}`)
          }
          this.setIsLoading(false)
        }

        this.setIsLoading(false)

        setTimeout(() => {
          const tmpGhost = document.querySelector(`.question__list .hidden-ghost, .question__list .sortable-ghost`)
          if (tmpGhost && tmpGhost.length > 0) {
            tmpGhost.remove()
          }

          // LNB 페이지 렌더링 갱신
          this.lnbPageComponentKey++
        }, 100)
      }
      // -- 질문 이동 취소 시 페이지 마지막에 위치하면 새 페이지 생성

      setTimeout(() => {
        const tmpGhost = document.querySelector(`.sortable-ghost`)
        if (tmpGhost) {
          tmpGhost.classList.remove('sortable-ghost')
        }
      }, 100)

      this.dragStartTimestamp = null
      this.dragEndTimestamp = null
      this.isReadyCreatePageByLastQuestion = false
      this.dragStartQuestionTotalElements = 0
    },
    checkQuestionMove(e) {
      // this.$log.debug(this.$options.name, 'draggable checkQuestionMove log', e)
      // this.$log.debug(this.$options.name, 'draggable checkQuestionMove log e.draggedContext.element', e.draggedContext.element)
      // this.$log.debug(this.$options.name, 'draggable checkQuestionMove log e.relatedContext.element', e.relatedContext.element)

      const dragElement = e.draggedContext.element
      const relateElement = e.relatedContext.element

      // ghost style 변경 전 questionType 체크
      if (dragElement) {
        const questionId = dragElement.questionId
        const questionType = dragElement.questionType

        if (!questionId) {
          const toasted = document.querySelector('.toasted-container .toasted')
          if (!toasted) {
            this.$toasted.show('저장된 질문만 이동 가능합니다.')
          }
          // stop draggable
          return false
        }
        if (this.immutableQuestionTypes.includes(questionType)) {
          const toasted = document.querySelector('.toasted-container .toasted')
          if (!toasted) {
            const questionTypeName = this.CONSTANTS.QUESTION_TYPE_NAME[questionType] || '?'
            this.$toasted.show(`${questionTypeName} 유형은 다른 설문 유형보다 앞으로 이동할 수 없습니다.`)
          }
          // stop draggable
          return false
        }
      }
      if (relateElement && relateElement.questionType) {
        const questionType = relateElement.questionType
        if (this.immutableQuestionTypes.includes(questionType)) {
          const toasted = document.querySelector('.toasted-container .toasted')
          if (!toasted) {
            const questionTypeName = this.CONSTANTS.QUESTION_TYPE_NAME[questionType] || '?'
            this.$toasted.show(`${questionTypeName} 유형의 페이지로 이동할 수 없습니다.`)
          }
          // stop draggable
          return false
        }
      }
      // -- ghost style 변경 전 questionType 체크

      // 질문 이동 시 페이지 마지막에 위치하는 경우 ghost style 변경
      this.$log.warn(this.$options.name, `e.draggedContext =>`, e.draggedContext)

      const dragFutureIndex = e.draggedContext.futureIndex
      const dragOldIndex = e.draggedContext.index

      let dragElementPageId = null
      let relateElementPageId = null

      // 이동 중인 페이지의 질문 총 개수
      let relatePageTotalLength = 0

      // 이동 중인 질문의 이전 pageId 구하기
      if (dragElement.questionId) {
        this.surveyEditPages.find(page => {
          for (const q of page.questions) {
            if (q.questionId === dragElement.questionId) {
              dragElementPageId = page.pageId
              return true
            }
          }
        })
      }

      if (relateElement && relateElement.questionId) {
        this.surveyEditPages.find(page => {
          for (const q of page.questions) {
            if (q.questionId === relateElement.questionId) {
              // 이동 중인 질문이 위치할 새 pageId 구하기
              relateElementPageId = page.pageId
              relatePageTotalLength = page.questions.length

              // 동일한 페이지 내에서 이동이 발생
              if (relateElementPageId === dragElementPageId) {
                relatePageTotalLength--

                // 질문의 최초 위치로 다시 이동함 (이동 취소됨)
                this.isReadyCreatePageByLastQuestion = (dragFutureIndex === dragOldIndex)
              } else {
                this.isReadyCreatePageByLastQuestion = false
              }
              return true
            }
          }
        })
      }

      this.$log.warn(this.$options.name, `relatePageTotalLength =>`, relatePageTotalLength)
      this.$log.warn(this.$options.name, `dragFutureIndex =>`, dragFutureIndex)

      if (relatePageTotalLength === dragFutureIndex) {
        const tmpGhost = document.querySelector(`.hidden-ghost`)
        if (tmpGhost) {
          tmpGhost.classList.add('sortable-ghost')
          tmpGhost.classList.remove('hidden-ghost')
        }
      } else {
        const tmpGhost = document.querySelector(`.sortable-ghost`)
        if (tmpGhost) {
          tmpGhost.classList.add('hidden-ghost')
          tmpGhost.classList.remove('sortable-ghost')
        }
      }
    },
    async onQuestionChange(e) {
      this.setIsLoading(true)

      this.$log.debug(
        this.$options.name,
        'draggable onQuestionChange',
        'e:',
        e,
        'e.moved:',
        e.moved,
        'e.added:',
        e.added,
        'e.removed:',
        e.removed,
      )

      if (e.moved || e.added) {
        const changed = e.moved || e.added
        const changedQuestion = changed.element
        const changedNewIndex = changed.newIndex
        const changedQuestionId = changedQuestion.questionId
        let pageId = null
        let beforeQuestionId = null
        let beforePageId = null

        const changedPage = this.surveyEditPages.find(page => {
          for (const q of page.questions) {
            if (q.questionId === changedQuestionId) {
              return true
            }
          }
        })
        if (changedPage) {
          pageId = changedPage.pageId
          beforeQuestionId = changedNewIndex - 1 >= 0 && changedPage.questions[changedNewIndex - 1]
            ? changedPage.questions[changedNewIndex - 1].questionId
            : null

          // 질문 이동 시 페이지 마지막에 위치하면 새 페이지 생성
          if (changedPage.questions.length === (changedNewIndex + 1)) {
            const message = '선택한 질문이 페이지로 추가되었습니다.'
            this.$toasted.clear()
            this.$toasted.show(message)

            beforePageId = pageId
            pageId = null
            beforeQuestionId = null
          }
        }

        const payload = {
          questionId: changedQuestionId,
          pageId: pageId,
          beforeQuestionId: beforeQuestionId
        }
        if (beforePageId) {
          payload.beforePageId = beforePageId
        }
        this.$log.debug(this.$options.name, 'onQuestionChange() payload => ', payload)

        try {
          await this.sortingSurveyEditQuestion(payload)
        } catch (e) {
          if (e.response.status === 400) {
            this.$hiClass.alert(`error code: ${e.response.status}<br>${e.response.data.cause}`)
          }
          this.setIsLoading(false)
        }

        this.setIsLoading(false)

        setTimeout(() => {
          const tmpGhost = document.querySelector(`.question__list .hidden-ghost, .question__list .sortable-ghost`)
          if (tmpGhost && tmpGhost.length > 0) {
            tmpGhost.remove()
          }

          // LNB 페이지 렌더링 갱신
          this.lnbPageComponentKey++
        }, 100)
      }
    },

    onPageDragStart(e) {
      this.$log.debug(this.$options.name, 'draggable onPageDragStart log', e)
      this.dragStartTimestamp = this.$moment().valueOf()
      this.isPageDrag = true
    },
    onPageDragEnd(e) {
      this.$log.debug(this.$options.name, 'draggable onPageDragEnd log', e)
      this.dragEndTimestamp = this.$moment().valueOf()
      this.isPageDrag = false

      // 200ms 이내에 드래그가 끝나면 클릭 처리
      const dragTimestamp = this.dragEndTimestamp - this.dragStartTimestamp
      if (dragTimestamp < 200) {
        this.$log.warn(this.$options.name, `e => `, e)
        this.$log.warn(this.$options.name, `e.item.querySelector('.question__group > div.btn-toggle') => `, e.item.querySelector('.question__group > div.btn-toggle'))
        const element = e.item.querySelector('.question__group > div.btn-toggle')
        if (element) {
          setTimeout(() => { element.click() }, 10)
        }
      }
      this.dragStartTimestamp = null
      this.dragEndTimestamp = null
    },
    checkPageMove(e) {
      // this.$log.debug(this.$options.name, 'draggable checkPageMove log', e)
      // this.$log.debug(this.$options.name, 'draggable checkPageMove log e.draggedContext.element', e.draggedContext.element)
      // this.$log.debug(this.$options.name, 'draggable checkPageMove log e.relatedContext.element', e.relatedContext.element)

      const dragElement = e.draggedContext.element
      const relateElement = e.relatedContext.element

      if (dragElement) {
        const questions = dragElement.questions
        if (questions) {
          const questionTypes = questions.map(q => q.questionType)

          for (const questionType of questionTypes) {
            if (this.immutableQuestionTypes.includes(questionType)) {
              const toasted = document.querySelector('.toasted-container .toasted')
              if (!toasted) {
                const questionTypeName = this.CONSTANTS.QUESTION_TYPE_NAME[questionType] || '?'
                this.$toasted.show(`${questionTypeName} 유형은 다른 설문 유형보다 앞으로 이동할 수 없습니다.`)
              }
              // stop draggable
              return false
            }
          }
        }
      }
      if (relateElement && relateElement.questions) {
        const questions = relateElement.questions
        const questionTypes = questions.map(q => q.questionType)

        for (const questionType of questionTypes) {
          if (this.immutableQuestionTypes.includes(questionType)) {
            const toasted = document.querySelector('.toasted-container .toasted')
            if (!toasted) {
              const questionTypeName = this.CONSTANTS.QUESTION_TYPE_NAME[questionType] || '?'
              this.$toasted.show(`${questionTypeName} 유형의 페이지로 이동할 수 없습니다.`)
            }
            // stop draggable
            return false
          }
        }
      }
    },
    async onPageChange(e) {
      this.setIsLoading(true)

      this.$log.debug(
        this.$options.name,
        'draggable onPageChange',
        'e:',
        e,
        'e.moved:',
        e.moved,
        'e.added:',
        e.added,
        'e.removed:',
        e.removed,
      )

      if (e.moved || e.added) {
        const changed = e.moved || e.added
        const changedNewIndex = changed.newIndex

        const pageId = changed.element.pageId
        const beforePageId = changedNewIndex - 1 >= 0 && this.surveyEditPages[changedNewIndex - 1]
          ? this.surveyEditPages[changedNewIndex - 1].pageId
          : null

        const payload = {
          pageId: pageId,
          beforePageId: beforePageId
        }
        this.$log.debug(this.$options.name, 'onPageChange() payload => ', payload)

        await this.sortingSurveyEditPage(payload)

        this.setIsLoading(false)
      }

      const tmpGhost = document.querySelector(`.question__list .hidden-ghost, .question__list .sortable-ghost`)
      if (tmpGhost) {
        tmpGhost.remove()
      }
    },
    getLinkPageTitle(linkPage, existsLinkPages) {
      if (existsLinkPages) {
        return '선택지 이동'
      }

      const pageId = linkPage.pageId
      const pageName = linkPage.pageName
      let sortNo = linkPage.sortNo

      let title = ''
      switch (pageId) {
        case null: {
          title = ''
          break
        }
        case '00000000-0000-0000-0000-000000000000': {
          title = '설문지 제출'
          break
        }
        default: {
          sortNo = sortNo || this.surveyEditPages.find(page => page.pageId === pageId).sortNo
          title = `${sortNo}P ${(pageName || '')} 이동`
        }
      }
      return title
    },
    togglePage(pageId) {
      const isOpenedPage = this.hidePageIdArr.includes(pageId)
      if (isOpenedPage) {
        const foundIndex = this.hidePageIdArr.findIndex(item => item === pageId)
        this.hidePageIdArr.splice(foundIndex, 1)
      } else {
        this.hidePageIdArr.push(pageId)
      }
    },
    async onClickAddQuestion(pageId, pageIndex, questionTotalCount) {
      if (!this.$store.state.isLoading) {
        this.setIsLoading(true)

        let isAlreadySaved = false
        // 현재 편집 중인 페이지 질문이 저장되지 않은 경우 선 저장
        if (!this.surveyEditQuestions.questionId) {
          await this.temporarilySaveSurvey({})
          isAlreadySaved = true
        }

        // 저장 완료 후 이전 질문 ID 계산
        try {
          const beforeQuestionId = this.surveyEditPages[pageIndex].questions[questionTotalCount -1]
            ? this.surveyEditPages[pageIndex].questions[questionTotalCount -1].questionId
            : null
          const payload = {
            pageId: pageId || null,
            beforePageId: null,
            beforeQuestionId: beforeQuestionId,
            isAlreadySaved: isAlreadySaved
          }
          this.$log.debug(this.$options.name, `onClickAddQuestion() payload => `, payload)
          await this.createQuestion(payload)

          this.setIsLoading(false)
        } catch (e) {
          this.setIsLoading(false)
        }
      } else {
        this.setIsLoading(false)
      }
    },
    async onClickCopyQuestion(question, pageId, pageIndex, questionIndex) {
      if(this.isDeleting.includes(question.questionId)) return;

      await this.saveChangedSurveyEditQuestions()

      const beforePageId = this.surveyEditPages[pageIndex -1]
        ? this.surveyEditPages[pageIndex -1].pageId
        : null
      const beforeQuestionId = this.surveyEditPages[pageIndex].questions[questionIndex -1]
        ? this.surveyEditPages[pageIndex].questions[questionIndex -1].questionId
        : null
      const payload = {
        question: question,
        pageId: pageId || null,
        beforePageId: beforePageId,
        beforeQuestionId: beforeQuestionId
      }
      this.$log.debug(this.$options.name, `onClickCopyQuestion() payload => `, payload)
      await this.copyQuestion(payload)
    },
    async onClickDeleteQuestion(question, pageId, pageIndex, questionIndex) {
      if(this.isDeleting.includes(question.questionId)) return;

      this.isDeleting.push(question.questionId)

      try{
        await this.saveChangedSurveyEditQuestions()

        const isSelectedQuestionDelete = question.questionId === this.surveyEditQuestions.questionId
        const beforePageId = this.surveyEditPages[pageIndex -1]
          ? this.surveyEditPages[pageIndex -1].pageId
          : null
        const beforeQuestionId = this.surveyEditPages[pageIndex].questions[questionIndex -1]
          ? this.surveyEditPages[pageIndex].questions[questionIndex -1].questionId
          : null

        const selectedQuestionIndex = this.surveyEditPagesQuestions.findIndex(q => q.questionId === question.questionId)
        const prevQuestionId = this.surveyEditPagesQuestions[selectedQuestionIndex -1]
          ? this.surveyEditPagesQuestions[selectedQuestionIndex -1].questionId
          : null

        const payload = {
          question: question,
          pageId: pageId || null,
          beforePageId: beforePageId,
          beforeQuestionId: beforeQuestionId
        }
        this.$log.debug(this.$options.name, `onClickDeleteQuestion() payload => `, payload)
        const deleteProc = async () => {
          // 삭제 요청 페이지 질문 개수 확인
          const curPage = this.surveyEditPages.find(page => page.pageId === pageId)
          if (curPage
            && Array.isArray(curPage.questions)
            && curPage.questions.length < 2
          ) {
            // 페이지 삭제 (삭제 후 페이지 목록 갱신)
            await this.deleteSurveyEditPage(pageId)
          } else {
            // 질문 삭제 (삭제 후 페이지 목록 갱신)
            await this.deleteSurveyEditQuestions(payload)
          }

          // 선택한 질문을 삭제하는 경우에만 질문 포커스 변경
          if (isSelectedQuestionDelete) {
            // 현재 페이지의 이전 질문
            if (beforeQuestionId) {
              await this.getSurveyEditQuestions(beforeQuestionId)
              // (페이지 관계없이) 이전 질문
            } else if (prevQuestionId) {
              await this.getSurveyEditQuestions(prevQuestionId)
            } else {
              await this.setSurveyCreateBodyComponentName('SETTING')
            }
          }
          this.isDeleting = this.isDeleting.filter(r => r !== question.questionId)
        }

        if (!question.questionId) {
          await deleteProc()
          return false
        }

        if (this.isCurSurveyStarted) {
          const confirmMessage = `질문을 삭제하면 응답 내용도 모두 삭제되어 복구 불가능합니다.<br><br>그래도 삭제하시겠습니까?`
          const opts = {
            confirmButtonText: '질문 삭제',
            reverseButtons: true
          }
          this.$hiClass.confirm(confirmMessage, null, opts)
            .then(async () => {
              await deleteProc()
            })
            .catch(() => {
              this.isDeleting = this.isDeleting.filter(r => r !== question.questionId)
            })
        } else {
          await deleteProc()
        }
      } catch(error) {
        this.isDeleting = this.isDeleting.filter(r => r !== question.questionId)
      }
    },
    doFocusQuestion() {
      if (!this.isFocusBusy) {
        this.isFocusBusy = true
        const focusElement = element => element ? element.focus() : false
        setTimeout(() => {
          const element = document.querySelector('.question__box.is-active')
          element
            ? element.focus()
            : setTimeout(() => focusElement(element), 500)
          this.isFocusBusy = false
        }, 30)
      }
    },
    doFocusSetting() {
      if (!this.isFocusBusy) {
        this.isFocusBusy = true
        const focusElement = element => element ? element.focus() : false
        setTimeout(() => {
          const element = document.querySelector('.setting__box.is-active')
          element
            ? element.focus()
            : setTimeout(() => focusElement(element), 500)
          this.isFocusBusy = false
        }, 30)
      }
    },

    async renamePage(page) {
      try {
        let pageId = page.pageId
        const sortNo = page.sortNo

        // 서버에 저장되지 않은 신규 생성 페이지명 변경 시 편집 중인 질문 저장
        if (!pageId) {
          this.setIsLoading(true)

          await this.temporarilySaveSurvey({})
          const foundPage = this.surveyEditPages.find(page => page.sortNo === sortNo)
          if (foundPage) {
            pageId = foundPage.pageId
          }
        }

        const payload = {
          pageId: pageId,
          pageName: page.pageName,
          submitCallback: () => this.getSurveyEditPages(this.curSurveyEdit.surveyId)
        }
        await this.openSurveyCreateLnbPageRenameModal(payload)
        this.setIsLoading(false)

      } catch (e) {
        this.$hiClass.alert('페이지명 변경이 정상 처리되지 않았습니다.', 'warning')
        this.setIsLoading(false)
      }
    },
    async separatePage(page) {
      let pageId = page.pageId
      const sortNo = page.sortNo
      const surveyId = this.curSurveyEdit.surveyId
      const isSelectedPageDelete = pageId === this.surveyEditQuestions.pageId

      if (page.questions.length < 2) {
        this.$hiClass.alert('페이지 해제는 질문이 2개 이상인 경우에만 가능합니다.', 'info')
        return false
      }

      // 서버에 저장되지 않은 신규 생성 페이지 해제 시 편집 중인 질문 저장
      if (!pageId) {
        this.setIsLoading(true)

        await this.temporarilySaveSurvey({})
        const foundPage = this.surveyEditPages.find(page => page.sortNo === sortNo)
        if (foundPage) {
          pageId = foundPage.pageId
        }
      }

      try {
        await this.separateSurveyEditPage(pageId)

        // TODO: 선택 중인 페이지 해제 후 이동 처리 확인
        if (isSelectedPageDelete) {
          await this.setSurveyCreateBodyComponentName('SETTING')
          setTimeout(() => {
            this.doFocusSetting()
          }, 100)
        }
        this.setIsLoading(false)

      } catch (e) {
        this.$hiClass.alert('페이지 해제가 정상 처리되지 않았습니다.', 'warning')
        this.setIsLoading(false)
      }

    },
    async deletePage(page) {
      let pageId = page.pageId
      const sortNo = page.sortNo
      const surveyId = this.curSurveyEdit.surveyId
      const isSelectedPageDelete = pageId === this.surveyEditQuestions.pageId
      const existsLinkPage = (page.linkPage && page.linkPage.pageId)
        || page.questions.find(q => q.isLinkedPage)

      const deletePageProc = async () => {
        // 서버에 저장되지 않은 신규 생성 페이지 삭제 시 편집 중인 질문 저장
        if (!pageId) {
          this.setIsLoading(true)

          await this.temporarilySaveSurvey({})
          const foundPage = this.surveyEditPages.find(page => page.sortNo === sortNo)
          if (foundPage) {
            pageId = foundPage.pageId
          }
        }

        try {
          await this.deleteSurveyEditPage(pageId)

          // TODO: 선택 중인 페이지 삭제 후 이동 처리 확인
          if (isSelectedPageDelete) {
            await this.setSurveyCreateBodyComponentName('SETTING')
            setTimeout(() => {
              this.doFocusSetting()
            }, 100)
          }
          this.setIsLoading(false)

        } catch (e) {
          this.$hiClass.alert('페이지 삭제가 정상 처리되지 않았습니다.', 'warning')
          this.setIsLoading(false)
        }
      }

      if (existsLinkPage) {
        const confirmMessage = `페이지를 삭제하면 연결된 질문과 페이지 설정이 초기화됩니다.<br><br>`
          + `${page.sortNo}P ${page.pageName || ''}<br><br>`
          + `삭제하시겠습니까?`
        const opts = {
          confirmButtonText: '확인',
          reverseButtons: true
        }
        this.$hiClass.confirm(confirmMessage, null, opts)
          .then(async () => {
            await deletePageProc()
          })

      } else {
        await deletePageProc()
      }
    },
    enlargePage() {
      this.hidePageIdArr.splice(0)
    },
    collapsePage() {
      this.hidePageIdArr.splice(0)
      this.surveyEditPages.forEach(page => {
        this.hidePageIdArr.push(page.pageId)
      })
    },
    /**
     * 페이지 병합 미사용
     * @returns {Promise<void>}
     */
    async mergePage() {
      if (this.mergeReadyPages.length > 1 && !this.mergeReadyPages.every(page => page.pageId)) {
        this.$hiClass.alert('병합이 불가능한 페이지가 포함되어 있습니다.', 'warning')

        // 서버에 저장되지 않은 신규 생성 페이지 병합 시 편집 중인 질문 저장
        await this.temporarilySaveSurvey({})

        return false
      }
      this.setIsLoading(true)

      const surveyId = this.curSurveyEdit.surveyId
      const isSelectedPageDelete = this.mergeReadyPages.includes(this.surveyEditQuestions.pageId)

      try {
        // 병합 전 선택한 페이지 sortNo 로 정렬
        this.mergeReadyPages.sort((a, b) => a.sortNo - b.sortNo)
        let mergePageIds = this.mergeReadyPages.map(page => page.pageId)

        // 페이지 병합 후 LNB 페이지 갱신
        await this.mergeSurveyEditPage(mergePageIds)

        await this.clearMergeReadyPages()

        // TODO: 선택 중인 페이지 병합 후 이동 처리 확인
        if (isSelectedPageDelete) {
          await this.setSurveyCreateBodyComponentName('SETTING')
          setTimeout(() => {
            this.doFocusSetting()
          }, 100)
        }
        this.setIsLoading(false)

      } catch (e) {
        this.$log.error(e)
        this.$hiClass.alert('페이지 병합이 정상 처리되지 않았습니다.', 'warning')
        this.setIsLoading(false)
      }

    },
    clearMergeReadyPages() {
      this.mergeReadyPages.splice(0)
    },
    isDisabledEditModeCheckbox(page) {
      try {
        const existsHideQuestionType = page.questions.find(q => {
          return q.questionType === this.CONSTANTS.QUESTION_TYPE.AFTER_SCHOOL
            || q.questionType === this.CONSTANTS.QUESTION_TYPE.CONSULTATION
        })
        return page.questions.length === 0 || existsHideQuestionType
      } catch (e) {
        return true
      }
    },
    isShowCopyQuestionByQuestionType(questionType) {
      return !this.immutableQuestionTypes.includes(questionType)
    },
    isShowDeleteQuestionByQuestionType(questionType) {
      return !this.immutableQuestionTypes.includes(questionType)
    },
    isShowCreateQuestionButton(editPage) {
      const existsHideQuestionType = editPage.questions.find(q => {
        return q.questionType === this.CONSTANTS.QUESTION_TYPE.AFTER_SCHOOL
          || q.questionType === this.CONSTANTS.QUESTION_TYPE.CONSULTATION
      })
      return !existsHideQuestionType
    }
  }
}
</script>

<style lang="scss">
</style>
