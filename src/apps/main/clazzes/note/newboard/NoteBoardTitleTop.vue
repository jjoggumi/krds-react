<template>
  <div class="title-top-wrap">
    <div class="left-wrap">
      <!-- 클래스 선택 selectbox -->
      <hc-select
        :model.sync="items.clazz.currentId"
        selectLabel="text"
        selectValue="value"
        :isTextMode="true"
        :item="items.clazz.item"
        :isDisabled="isNoteOptionReadOnly || isNoteSaved"
        @is-click="changeClass"
      />

      <!-- 알림장 푸시 발송 대상 checkbox  -->
      <div class="checkbox-wrap" v-if="!option.isZoom">
        <input
          type="checkbox"
          id="target-parent-check"
          :disabled="disabledParents"
          v-model="option.isPushParents"
        />
        <label for="target-parent-check"><span>학부모</span></label>

        <input
          type="checkbox"
          id="target-student-check"
          :disabled="disabledStudent"
          v-model="option.isPushStudent"
        />
        <label for="target-student-check"><span>학생</span></label>
      </div>
    </div>

    <div class="center-wrap">
      <div class="date-cont-wrap">
        <!-- 캘린더 아이콘 -->
        <button class="calendar-icon-btn" @click="openCalendarComponent" />

        <!-- posted or 캘린더 선택일 -->
        <div class="date-wrap">
          <div
            :key="date_ko"
            class="date"
            @click="openCalendarComponent"
          >
            {{ date_ko }}
          </div>
        </div>

        <!-- 예약하기 버튼 -->
        <button
            v-if="isSendComplete === false && !isShowReserveCancelButton"
            class="today-btn-cancel btn-bg-w2 date-edit"
            @click="openCalendarByReserveMode"
        >
          예약하기
        </button>

        <!-- 예약취소 버튼 -->
        <button
          v-if="isShowReserveCancelButton"
          class="today-btn-cancel btn-bg-w2"
          @click="cancelReserve"
        >
          예약취소
        </button>
      </div>

      <!-- 캘린더 레이어 -->
      <component
        :is="editMode('calendarComponent')"
        :classId="items.clazz.currentId"
        :toDay="model.posted"
        :mode.sync="option.mode"
        :isSendComplete="isSendComplete"
        :isReserve="isReserve"
        @setModel="setModel"
        @openCalendarComponent="openCalendarComponent"
        @closeCalendarComponent="closeCalendarComponent"
        @openCalendarByReserveMode="openCalendarByReserveMode"
      />
    </div>

    <div class="right-wrap">
      <!-- 내 클래스 바로가기 -->
      <button
        class="btn-bg-w go-my-class-btn"
        v-if="!option.isZoom"
        @click="moveClass"
      >
        내 클래스 바로가기
      </button>

      <!-- toggle 전체화면 -->
      <button
        class="zoom-btn"
        :class="{ on: option.isZoom }"
        @click="toggleZoom"
      >
        <span class="guide-text"><span>화면(글자) 확대</span></span>
        <span class="tooltip zoom-in"><span>화면 확대</span></span>
        <span class="tooltip zoom-out"><span>화면 축소</span></span>
      </button>
    </div>
  </div>
</template>

<script>
import HcSelect from '@/components/Form/HcSelect'

import { eventBus } from '@/main'
import {mapFields} from "vuex-map-fields";

import ErrorLoadFailAsyncComponent from "@/apps/error/ErrorLoadFailAsyncComponent";
import {mapActions} from "vuex";
import {isEmpty} from "lodash";

const NoteBoardCalendar = () => ({
  component: import('./subcomponents/NoteBoardCalendar'),
  error: ErrorLoadFailAsyncComponent,
})

export default {
  name: 'note-board-title-top',
  components: {
    HcSelect,
    NoteBoardCalendar,
  },
  props: {
    board: {
      type: Object,
      required: true
    },
    option: {
      type: Object,
      required: true
    },
    items: {
      type: Object,
      required: true
    },
    model: {
      type: Object,
      required: true
    },
    subComponent: {
      type: Object,
      required: true
    },
    isSendComplete: {
      type: Boolean,
      required: true
    },
    isReserve: {
      type: Boolean,
      required: true
    },
    isNoteOptionReadOnly: {
      type: Boolean,
      required: true
    },
    isSelectedReserve: {
      type: Boolean,
      default: false
    },
    clazzSettingPushTarget: {
      type: String
    }
  },
  computed: {
    ...mapFields({
      currentTimestamp: 'currentTimestamp'
    }),
    editMode() {
      return mode => {
        return this.subComponent[mode] || ''
      }
    },
    date_ko() {
      let format = 'M월 D일 (ddd) H시 m분'
      return this.$moment(this.model.posted).format(format)
    },
    isShowReserveButton() {
      return this.isSendComplete === false || this.model.postStatus === ''
    },
    isNoteSaved() {
      return this.model.updatedTimestamp !== null
    },
    isUpdate() {
      return this.option.postURI || false
    },
    isCreate() {
      return !this.option.postURI
    },
    isShowReserveCancelButton() {
      return this.isSelectedReserve || this.model.postStatus === 'RESERVE' && this.currentTimestamp < this.model.posted
    },
  },
  data() {
    return {
      disabledParents: false,
      disabledStudent: false
    }
  },
  watch: {
    board(v) {
      this.disabledParents = !v.isReadParents
      this.disabledStudent = !v.isReadStudent
      if(this.option.type !== 'BLACKBOARD_UPDATE') {
        this.option.isPushParents = v.isReadParents
        this.option.isPushStudent = v.isReadStudent
      }
    },
    'model.pushTarget'(val) {
      switch (val) {
        case 'ALL': {
          this.option.isPushParents = true
          this.option.isPushStudent = true
          break
        }
        case 'TEACHER': {
          this.option.isPushParents = false
          this.option.isPushStudent = false
          break
        }
        case 'PARENTS': {
          this.option.isPushParents = true
          this.option.isPushStudent = false
          break
        }
        case 'STUDENT': {
          this.option.isPushParents = false
          this.option.isPushStudent = true
          break
        }
      }
    },
    'clazzSettingPushTarget'(val) {
      switch (val) {
        case 'ALL': {
          this.option.disabled.isPushParents = false
          this.option.disabled.isPushStudent = false
          break
        }
        case 'TEACHER': {
          this.option.disabled.isPushParents = true
          this.option.disabled.isPushStudent = true
          break
        }
        case 'PARENTS': {
          this.option.disabled.isPushParents = false
          this.option.disabled.isPushStudent = true
          break
        }
        case 'STUDENT': {
          this.option.disabled.isPushParents = true
          this.option.disabled.isPushStudent = false
          break
        }
      }

      if (this.isCreate) {
        this.model.pushTarget = val
      }

    }
  },
  created() {},
  mounted() {},
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    changeClass() {
      // 기획 변경 => 클래스 변경 시 입력 값 유지
      //this.initPage(this.model.posted)
      eventBus.$emit('note-board-change-class')
    },
    moveClass() {
      this.triggerAnalyticsLogEvent({ code: `analytics.class.click.button.note.blackboard.moveClass` })

      eventBus.$emit('note-board-move-class')
    },
    toggleZoom() {
      this.triggerAnalyticsLogEvent({ code: `analytics.class.click.button.note.blackboard.zoom` })

      this.option.isZoom = !this.option.isZoom
      this.option.isZoom ? this.openZoom() : this.closeZoom()

      eventBus.$emit('editor-toggle-toolbar', !this.option.isZoom)
    },
    openZoom() {
      // eventBus.$emit('editor-set-style', { 'overflow-y': 'hidden' })
      // eventBus.$emit('editor-resize', 'auto')
    },
    closeZoom() {
      eventBus.$emit('editor-set-slider-value', 100)

      const initZoomValue = this.$store.state.storeEditor.edit[`initZoomValue${this.model.version}`] || 1
      eventBus.$emit('editor-set-content-zoom', { zoom: initZoomValue })
    },
    openCalendarComponent() {
      this.subComponent.calendarComponent = ''
      this.$nextTick(() => {
        this.subComponent.calendarComponent = 'NoteBoardCalendar'
      })
    },
    closeCalendarComponent() {
      this.subComponent.calendarComponent = ''
    },
    openCalendarByReserveMode() {
      this.option.mode = 'RESERVE'
      this.openCalendarComponent()
    },
    setModel(params) {
      for (const [key, value] of Object.entries(params)) {
        this.model[key] = value
      }
    },
    cancelReserve() {
      this.model.posted = this.$moment().valueOf()
      this.model.postStatus = ''
      eventBus.$emit('note-board-set-is-selected-reserve', false)
    },
    onClickReserveButton() {
      this.isReserve ? this.cancelReserve() : this.openCalendarByReserveMode()
    }
  }
}
</script>

<style scoped></style>
