<template>
  <div
    class="note-calendar-popup"
    :class="{
      'note-resev-pop': subComponent === 'NoteBoardCalendarReserve'
    }"
    style="display: block"
    v-click-outside="vcoConfig"
  >
    <main-body-clazzes-rnb-calendar-core
        v-if="parentUri.length > 0"
      :isPopupCalendar="true"
      :isShowCalendar="true"
      :isReserveMode="isReserveMode"
      :prevSelectedDate="prevSelectedDate"
      :monthlyPosts="item.monthPosts"
      :isTimestampEnd="isTimestampEnd"
      :postType="postType"
      :parentUri="parentUri"
      @monthlyPosts="getMonthPosts"
      @selectedDate="setDate"
    />

    <!-- noteCalendar subComponent -->

    <!-- 이전 게시물 목록 및 신규 예약 버튼 -->
    <!-- 예약일 출력 -->
    <component
      :is="subComponent"
      :option="option"
      :optionMode="optionMode"
      :item="item"
      :isSendComplete="isSendComplete"
      :isReserve="isReserve"
      :isTimestampEnd="isTimestampEnd"
      @offVco="offVco"
      @onVco="onVco"
      @setModel="setModel"
      @setSubComponent="setSubComponent"
      @setOptionMode="setOptionMode"
      @closeCalendar="closeCalendar"
    />
  </div>
</template>

<script>
import MainBodyClazzesRnbCalendarCore from '../../../MainBodyClazzesRnbCalendarCore.vue'
import NoteBoardCalendarNoteList from './NoteBoardCalendarNoteList'
import NoteBoardCalendarReserve from './NoteBoardCalendarReserve'

import { eventBus } from '@/main'

export default {
  name: 'note-board-calendar',
  components: {
    MainBodyClazzesRnbCalendarCore,
    NoteBoardCalendarNoteList,
    NoteBoardCalendarReserve
  },
  props: {
    toDay: {
      required: true,
      default() {
        return this.$moment().valueOf()
      }
    },
    classId: {
      type: String,
      required: false
    },
    mode: {
      type: String,
      required: false
    },
    isSendComplete: {
      type: Boolean,
      required: false
    },
    isReserve: {
      type: Boolean,
      required: false
    },
    isTimestampEnd: {
      type: Boolean
    }
  },
  data() {
    return {
      subComponent: '',
      option: {
        // YYYY-M-D
        curDate: '',
        // H:m
        selectedTime: {
          hour: 0,
          minute: 0
        }
      },
      item: {
        monthPosts: [],
        dayPosts: []
      },
      vcoConfig: {
        handler: this.handler,
        middleware: this.middleware,
        events: ['click'],
        // Note: The default value is true, but in case you want to activate / deactivate
        //       this directive dynamically use this attribute.
        isActive: true
      },
      postType: ['NOTE'],
      parentUri: []
    }
  },
  computed: {
    prevSelectedDate() {
      return this.$moment(this.toDay).format('YYYY,MM,DD')
    },
    isReserveMode() {
      return this.optionMode !== undefined && this.optionMode === 'RESERVE'
    },
    isShowNoteList() {
      return this.subComponent === 'NoteBoardCalendarNoteList'
    },
    optionMode: {
      get() {
        return this.mode
      },
      set(val) {
        this.$emit('update:mode', val)
      }
    }
  },
  watch: {},
  created() {
    this.setDefaultDate()
    this.setPostedTime()

    if (this.isReserveMode || this.isTimestampEnd) {
      this.setSubComponent('NoteBoardCalendarReserve')
    } else {
      this.setSubComponent('NoteBoardCalendarNoteList')
    }

    eventBus.$on('note-board-calendar-set-sub-component', calendarComponent => {
      this.setSubComponent(calendarComponent)
    })
  },
  mounted() {
    this.parentUri.push(`${process.env.VUE_APP_BASE_API_URI}/clazzes/${this.classId}`)
  },
  beforeDestroy() {
    this.subComponent = ''
    this.optionMode = ''

    eventBus.$off('note-board-calendar-set-sub-component')
  },
  methods: {
    setDefaultDate() {
      const curTime = this.$moment()

      let year = curTime.year()
      let month = curTime.month()
      let date = curTime.date()

      this.option.curDate = {
        year,
        month,
        date
      }
    },
    setPostedTime() {
      const postedTime = this.$moment(this.toDay)

      let hour = postedTime.hour()
      let minute = postedTime.minute()

      this.option.selectedTime = {
        hour,
        minute
      }
    },
    setDate(date) {
      this.option.curDate = date
      this.getDayPosts(date)
    },
    getDayPosts(date) {
      if (!this.isReserveMode) {
        this.item.dayPosts = []
        this.getPosts(this.getSearchTerm(date, false)).then(res => {
          this.item.dayPosts = res
        })
      }
    },
    getMonthPosts(date) {
      if (!this.isReserveMode) {
        this.item.monthPosts = []
        this.getPosts(this.getSearchTerm(date, true)).then(res => {
          this.item.monthPosts = res
        })
      }
    },
    getPosts(posted) {
      return new Promise((resolve, reject) => {
        this.$hiClass.posts
          .search({
            _parentUri: `${process.env.VUE_APP_BASE_API_URI}/clazzes/${this.classId}`,
            _postType: 'NOTE',
            _posted: posted,
            sort: 'posted,asc',
            size: 200
          })
          .then(res => {
            resolve(res.data._embedded.posts || [])
          })
          .catch(err => {
            this.$log.debug(this.$options.name, ' getPosts() error => ', err)

            reject(err)
          })
      })
    },
    getSearchTerm(date, isMonth) {
      let startDate = ''
      let endDate = ''

      if (isMonth) {
        // 한달간
        startDate = this.$moment(
          `${date.year}-${date.month + 1}-1`,
          'YYYY-MM-DD'
        )
          .startOf('month')
          .valueOf()
        endDate = this.$moment(startDate)
          .endOf('month')
          .valueOf()
      } else {
        // 하루
        startDate = this.$moment(
          `${date.year}-${date.month + 1}-${date.date}`,
          'YYYY-MM-DD'
        )
          .startOf('day')
          .valueOf()
        endDate = this.$moment(startDate)
          .endOf('day')
          .valueOf()
      }

      return [startDate, endDate]
    },
    setSubComponent(componentName) {
      this.subComponent = componentName
    },
    setModel(model) {
      this.$emit('setModel', model)
    },
    setOptionMode(optionMode) {
      this.optionMode = optionMode
    },
    closeCalendar() {
      this.$emit('closeCalendarComponent')
    },
    // v-click-outside
    // onClickOutside(event) {
    //   // this.$log.debug('Clicked outside. Event: ', event)
    // },
    handler() {
      // this.$log.debug(
      //   'Clicked outside (Using config), middleware returned true :)'
      // )
      // this.$log.debug('handler event: ', event)
      this.$log.debug(
        `handler this.vcoConfig.isActive => `,
        this.vcoConfig.isActive
      )
      if (this.vcoConfig.isActive) this.closeCalendar()
    },
    // Note: The middleware will be executed if the event was fired outside the element.
    //       It should have only sync functionality and it should return a boolean to
    //       define if the handler should be fire or not
    middleware(event) {
      // this.$log.debug('middleware event: ', event)
      this.$log.debug(
        `middleware this.vcoConfig.isActive => `,
        this.vcoConfig.isActive
      )
      this.$log.debug(
        `event.target.className !== 'note-calendar-popup' => ${event.target
          .className !== 'note-calendar-popup'}`
      )
      return event.target.className !== 'note-calendar-popup'
    },
    onVco() {
      this.vcoConfig.isActive = true
    },
    offVco() {
      this.vcoConfig.isActive = false
    }
    // -- v-click-outside
  }
}
</script>
<style lang="scss" scoped>
.border-selectbox-wrap {
  &.custom-select-box-wrap {
    margin-left: 3px;
  }
}

.note-calendar-popup {
  overflow: visible !important;
  ::v-deep .note-resev-opt {
    padding-bottom: 0;
    .input-box-wrap {
      width: 50%;
      height: 36px;
      overflow: hidden;
      &.readonly {
        border-radius: 4px;
        border: 1px solid rgba(0, 0, 0, 0.14);
      }
    }
    
    .border-selectbox-wrap {
      width: calc(25% - 4px);
      margin-left: 4px;
    }
  }
}
</style>
