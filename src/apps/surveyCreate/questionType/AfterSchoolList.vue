<!--
@File(Method): AfterSchoolList.vue
@Author: -
@Date Created: -
@Description: 클래스 > 설문 > 방과후신청 만들기 > 수업순서 리스트
@Modified: 2024-09-30 - #68110 상용이슈 : draggable 순서 변경시 텍스트, 이미지 등 요소들이 함께 선택 드래그 되는 문제 대응
-->
<template>
  <draggable
    :key="componentKey"
    class="fcfs__list"
    tag="div"
    :list="surveyEditQuestions.items"
    v-bind="dragOptions"
    @start="isDrag = true"
    @end="isDrag = false"
    @change="onChange"
  >
    <transition-group type="transition" :name="!isDrag ? 'flip-list' : null">
      <div
        v-for="(item, itemIndex) of surveyEditQuestions.items"
        :key="`item-${itemIndex}`"
        class="fcfs__item draggable-area"
      >
        <template
          v-if="item.itemId && !editedItemIds.includes(item.itemId)"
        >
          <div class="fcfs__hover">
          <span
            v-show="!isEdited"
            class="btn-move"
          ></span>
            <button
              class="btn-delete"
              title="삭제"
              @click="onClickDeleteItem(item)"
            ></button>
          </div>

          <div class="fcfs__content">

            <div class="fcfs__heading">
              <strong
                class="heading"
                :class="{
                  // 필수 값을 모두 입력받고 저장하므로 목록 아이템에 필수값은 항상 있음
                  error: false,
                  deleted: item.isCanceled
                }"
              >
                {{ getItemTitleName(item) }}
              </strong>

              <div class="group-btn">
                <button
                  class="hi-btn btn-sm btn-line-lgray"
                  @click="onClickCopyItem(item)"
                >
                  복사
                </button>
                <button
                  class="hi-btn btn-sm btn-line-lgray"
                  @click="onClickEditItem(item.itemId)"
                >수정</button>
              </div>

            </div>

            <div class="fcfs__infobox">
              <p class="num"> {{ getItemLimitTitle(item) }}</p>
              <p class="schedule" v-html="setTimeTables(item)"></p>
            </div>
            <div class="fcfs__info">
              <p><span>대상</span><span>{{ setAfterSchoolTargets(item) }}</span></p>
              <p v-if="item.itemField1">
                <span>수강료</span><span>{{ getItemField1Name(item.itemField1) }}</span>
              </p>
              <p v-if="item.itemField2">
                <span>강사명</span><span>{{ getItemField2Name(item.itemField2) }}</span>
              </p>
            </div>
            <div class="fcfs__desc"><p>{{ item.itemDescription }}</p></div>
          </div>

        </template>

        <survey-create-question-type-after-school-edit
          v-if="editedItemIds.includes(item.itemId)"
          :prop-item="item"
          :prop-item-index="itemIndex"
          :mode="'UPDATE'"
          @is-close="closeEditItem"
          @is-cancel="closeEditItem"
          @is-submit="submitEditItem"
        />

      </div>
    </transition-group>

  </draggable>

</template>

<script>
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import draggable from 'vuedraggable'
import { getAfterSchoolTimetables, getAfterSchoolTargets } from '@/plugins/utils'
import SurveyCreateQuestionTypeAfterSchoolEdit from "@/apps/surveyCreate/questionType/AfterSchoolEdit.vue";

export default {
  name: "survey-create-question-type-after-school-list",
  components: {
    draggable,
    SurveyCreateQuestionTypeAfterSchoolEdit,
  },
  data() {
    return {
      isDrag: false,
      componentKey: 0,
      editedItemIds: []
    }
  },
  computed: {
    ...mapState({
      draggableDefaultOption: 'draggableDefaultOption'
    }),
    ...mapState('storeSurvey', {
      surveyEditQuestions: 'surveyEditQuestions',
      publishedQuestionItemIds: 'publishedQuestionItemIds',
    }),
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    }),
    ...mapGetters('storeSurvey', {
      isCurSurveyPublished: 'isCurSurveyPublished',
    }),
    dragOptions() {
      const option = {}
      Object.entries(this.draggableDefaultOption).forEach(([key, value]) => {
        option[key] = value
      })
      option.group = 'after-school'
      option.handle = '.btn-move'
      option.disabled = this.isEdited
      return option
    },
    isEdited() {
      return this.editedItemIds.length > 0
        || this.surveyEditQuestions.items.find(item => !item.itemId)
    }
  },
  watch: {
    isEdited() {
      ++this.componentKey
    },
  },
  methods: {
    ...mapMutations('storeSurvey', {
      setIsChangedSurveyEditQuestions: 'setIsChangedSurveyEditQuestions'
    }),
    ...mapActions('storeSurvey', {
      deleteSurveyEditQuestionsItem: 'deleteSurveyEditQuestionsItem',
      temporarilySaveSurvey: 'temporarilySaveSurvey',
      changeSurveyQuestionItemSort: 'changeSurveyQuestionItemSort',
      copyQuestionItem: 'copyQuestionItem',
      getSurveyEditQuestions: 'getSurveyEditQuestions',
      checkSurveyEditQuestionsAnswerLimit: 'checkSurveyEditQuestionsAnswerLimit',
    }),
    setTimeTables(item) {
      return getAfterSchoolTimetables(item.afterSchoolTimetables)
    },
    async onClickDeleteItem(selectItem) {
      if (this.isCurSurveyPublished
        && !selectItem.isCanceled
        && this.publishedQuestionItemIds.includes(selectItem.itemId)
      ) {
        this.$hiClass.alert('이미 발행된 설문은 수업 삭제가 불가합니다.<br>통계에서 폐강 처리 후 삭제 해주세요.', 'info')
        return false
      }
      await this.deleteSurveyEditQuestionsItem(selectItem)
      await this.checkSurveyEditQuestionsAnswerLimit()
    },
    async onClickCopyItem(selectItem) {
      this.setIsChangedSurveyEditQuestions(true)

      const lastSortNo = this.surveyEditQuestions.items[this.surveyEditQuestions.items.length -1]
        ? this.surveyEditQuestions.items[this.surveyEditQuestions.items.length -1].sortNo
        : 1
      const payload = {
        item: selectItem,
        lastSortNo: lastSortNo,
        destinationItems: this.surveyEditQuestions.items,
      }
      await this.copyQuestionItem(payload)

      // 수업 목록 갱신
      await this.getSurveyEditQuestions()

      // 페이지 최하단으로 이동
      this.$nextTick(() => {
        window.scrollTo(0, document.body.scrollHeight)
      })

      this.setIsChangedSurveyEditQuestions(false)
    },
    onClickEditItem(itemId) {
      if (!this.editedItemIds.includes(itemId)) {
        this.editedItemIds.push(itemId)
      }
    },
    closeEditItem(itemId) {
      this.editedItemIds = this.editedItemIds.filter(id => id !== itemId)
    },
    async submitEditItem(itemId, itemIndex, item) {
      this.setIsChangedSurveyEditQuestions(true)

      this.surveyEditQuestions.items[itemIndex] = item

      // 질문 저장
      await this.temporarilySaveSurvey({})

      this.closeEditItem(itemId)
      this.setIsChangedSurveyEditQuestions(false)
    },
    getItemTitleName(item) {
     let prefix = item.isCanceled ? '(폐강) ' : ''
     return prefix + (item.itemTitle || '')
    },
    getItemLimitTitle(item) {
      const totalMax = item.limit.totalMax || 0
      const selectionType = item.selectionType
      let selectionTypeName = '?'

      const selectionTypeItems = Object.freeze(this.$store.state.storeSurvey.selectionType)
      const foundSelectionType = selectionTypeItems.find(d => d.value === selectionType)
      if (selectionTypeName) {
        selectionTypeName = foundSelectionType.title
      }
      return `정원 ${totalMax}명 (${selectionTypeName})`
    },
    setAfterSchoolTargets(item) {
      return getAfterSchoolTargets(item.afterSchoolTargets)
    },
    getItemField1Name(itemField1) {
      const itemField1Name = itemField1
        ? this.$stringUtil.addCommas(itemField1)
        : 0
      return `${itemField1Name}원`
    },
    getItemField2Name(itemField2) {
      return itemField2 ? `${itemField2 || ''} 선생님` : ''
    },

    async onChange(e) {
      this.$log.debug(this.$options.name, 'draggable log', e)
      await this.changeSurveyQuestionItemSort()
      await this.temporarilySaveSurvey({})
    },

  }
}
</script>

<style scoped>
.fcfs__item.edit-mode {
  display: none;
}
</style>
<style lang="scss">
.fcfs__item {
  &.hidden-ghost {
    visibility: hidden;
  }
  &.sortable-chosen {
    opacity: 1 !important;
  }
}
</style>