<!--
@File(Method): MainBodyClazzesRnbCalendarSchedule.vue
@Author: -
@Date Created: -
@Description: 우리반 일정 등록하기 모달
@Modified: 2024-08-29 - #68110 해당 페이지에만 적용된 css라 글로벌 css 에서 scoped css 로 변경처리
-->
<template>
  <div class="modal normal-modal add-class-schedule-modal">
    <div class="modal-cont-wrap" ref="modal" :style="modalStyleObj">
      <div class="modal-cont boundary-box">
        <div class="modal-cont-inner">
          <div class="modal-title-wrap">
            <div class="title">{{ titleStr }}</div>
          </div>
          <div class="add-schedule-wrap">
            <div class="date-wrap">
              <div class="date" @click="showCalendar">
                <span v-if="isLoadCompete">{{ curTimesStr }}</span>
              </div>
              <MainBodyClazzesRnbCalendarCore
                v-show="isShowCalendar"
                :isPopupCalendar="true"
                :isShowCalendar="isShowCalendar"
                :prevSelectedDate="selectedDate"
                :postType="['CALENDAR_CLASS']"
                :parentUri="[currentUri]"
                @selectedDate="setSelectedDate"
                v-click-outside="hideCalendar"
              ></MainBodyClazzesRnbCalendarCore>
            </div>
            <div
              class="input-box-wrap"
              :class="{
                focus: isFocus.content
              }"
            >
              <div class="textarea-wrap">
                <textarea
                  placeholder="학부모, 학생에게 공유할 일정을 입력해주세요."
                  ref="content"
                  v-html="content"
                  @input="inputContent($event)"
                  @focus="isFocus.content = true"
                  @blur="isFocus.content = false"
                ></textarea>
              </div>
            </div>
          </div>
          <div class="confirm-btn-wrap">
            <button
              class="btn-bg-c"
              @click="submitPosts"
              :class="{
                dis: !isReadySubmit
              }"
              :disabled="!isReadySubmit"
            >
              저장
            </button>
          </div>
        </div>
        <div class="modal-close-btn modal-close-icon" @click="hidePopup"></div>
      </div>
    </div>
  </div>
</template>

<script>
import MainBodyClazzesRnbCalendarCore from './MainBodyClazzesRnbCalendarCore.vue'
import {eventBus} from "@/main";

export default {
  name: 'MainBodyClazzesRnbCalendarSchedule',
  props: {
    clazzes: Object,
    curItem: Object,
    selectedDate: String
  },
  data: () => ({
    m_height: 0,
    m_width: 0,
    isShowCalendar: false,
    isLoadCompete: false,
    isFocus: {
      content: false
    },
    tmpDateFormat: '',
    curTimes: '',
    curTimesStr: '',
    content: '',
    editedItem: {},
    isLoading: false,
    prevTextAreaContent: ''
  }),
  components: {
    MainBodyClazzesRnbCalendarCore
  },
  computed: {
    modalStyleObj() {
      return {
        'margin-top': -this.m_height + 'px',
        'margin-left': -this.m_width + 'px'
      }
    },
    isEdited() {
      // because Object.keys(new Date()).length === 0;
      // we have to do some additional check
      return !(Object.keys(this.curItem).length === 0 &&
        this.curItem.constructor === Object);
    },
    titleStr() {
      if (this.isEdited) return '우리반 일정 수정하기'
      else return '우리반 일정 등록하기'
    },
    isReadySubmit() {
      return this.content.trim() !== '';
    },
    currentUri() {
      return `${process.env.VUE_APP_BASE_API_URI}/clazzes/${this.clazzes.currentId}`
    }
  },
  watch: {
    tmpDateFormat(val) {
      this.setDay(val)
      this.hideCalendar()
    }
  },
  methods: {
    hidePopup() {
      this.$store.commit('setClazzCalendarSchedule', { isOpen: false })
    },
    showCalendar() {
      this.isShowCalendar = true
    },
    hideCalendar() {
      this.isShowCalendar = false
    },
    submitPosts() {
      if (this.isLoading) return false
      this.isLoading = true
      if (this.isEdited) this.updatePosts()
      else this.createPosts()
    },
    createPosts() {
      if (this.content === '') {
        alert('일정을 입력해주세요.')
        this.$refs.content.focus()
        this.isLoading = false
        return false
      }

      let postStatus = 'COMPLETE'
      let clazzUrl = `${process.env.VUE_APP_BASE_API_URI}/clazzes/${this.clazzes.currentId}`
      let postType = 'CALENDAR_CLASS'

      if (clazzUrl === undefined) {
        alert('class uri를 찾을 수 없습니다.')
        this.isLoading = false
        return false
      }

      let params = {
        parentUri: clazzUrl, // clazzUrl
        postType: postType,
        postStatus: postStatus,
        postTitle: this.curTimesStr,
        postContent: this.content,
        posted: this.curTimes,
        // files: null 오류 수정
        files: []
      }

      this.$hiClass.posts.create(params)
        .then(result => {
          this.$log.debug(
            this.$options.name + ' createPosts() result: ',
            result
          )
          eventBus.$emit('clazzes-rnb-init-calendar-class')

          // `set-clazzes-schedule-dot-${this.isPopupCalendar}`
          eventBus.$emit('set-clazzes-schedule-dot-false', {timestamp: params.posted, isPosted: true})

          this.hidePopup()
          this.isLoading = false
        })
        .catch(error => {
          this.$log.debug(this.$options.name + ' createPosts() result: ', error)
          this.$hiClass.alertError()
          this.isLoading = false
        })
    },
    updatePosts() {
      if (this.content === '') {
        alert('일정을 입력해주세요.')
        this.$refs.content.focus()
        this.isLoading = false
        return false
      }
      const postUuid = this.editedItem.currentId

      if (postUuid === undefined) {
        alert('post uuid를 찾을 수 없습니다.')
        this.isLoading = false
        return false
      }

      this.editedItem.postTitle = this.curTimesStr
      this.editedItem.postContent = this.content
      this.editedItem.posted = this.curTimes

      // files: null 오류 수정
      if (!Array.isArray(this.editedItem.files)) {
        this.editedItem.files = []
      }

      const url = '/posts/' + this.editedItem.currentId
      this.$hiClass.posts.update(this.editedItem, url)
        .then(result => {
          this.$log.debug(
            this.$options.name + ' updatePosts() result: ',
            result
          )
          eventBus.$emit('clazzes-rnb-init-calendar-class')
          this.hidePopup()
          this.isLoading = false
        })
        .catch(error => {
          this.$log.debug(
            this.$options.name + ' updatePosts() result: ',
            error
          )
          this.$hiClass.alertError()
          this.isLoading = false
        })
    },
    setSelectedDate(dateJson) {
      const newDate = `${dateJson.year},${dateJson.month + 1},${dateJson.date}`
      this.tmpDateFormat = newDate
      if (newDate === this.selectedDate) {
        // this.tmpDateFormat 변경되지 않았을 경우 처리
        this.hideCalendar()
      }
    },
    setDay(dateFormat) {
      const curTimes = new Date(
        this.$comn.toJSONLocal(dateFormat).replace(/-/g, '/')
      ).getTime()
      this.curTimes = curTimes
      this.curTimesStr = this.$comn.date_ko(curTimes)
    },
    inputContent(e) {
      let value = e.target.value
      if ([...e.target.value].length > 100) {
        value = this.prevTextAreaContent
      }

      e.target.value = value
      this.content = value
      this.prevTextAreaContent = value
    }
  },
  created() {
    if (this.isEdited) {
      this.editedItem = this.curItem
      this.content = this.curItem.postContent
      this.prevTextAreaContent = this.curItem.postContent
    }
  },
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')

    const modal = this.$refs.modal
    const positionObj = this.$comn.getModalPosition(modal)
    this.m_height = positionObj.m_height
    this.m_width = positionObj.m_width

    this.$nextTick(() => {
      setTimeout(() => {
        // let lastChar = this.selectedDate.substr(this.selectedDate.length - 2);
        // if (lastChar === ",0") {
        //   let newDate = this.selectedDate.substring(
        //     0,
        //     this.selectedDate.length - 1
        //   );
        //   newDate = newDate + "1";
        //   this.tmpDateFormat = newDate;
        // } else this.tmpDateFormat = this.selectedDate;
        this.tmpDateFormat = this.selectedDate
        this.isLoadCompete = true
      }, 100)
    })
  },
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')

    eventBus.$emit('clazzes-rnb-clear-cur-item')
    this.editedItem = {}
  }
}
</script>

<style lang="scss" scoped>
.normal-modal {
  display: block;
}
.add-class-schedule-modal {
  .modal-cont-wrap {
    overflow: visible;
  }
  .add-schedule-wrap {
    padding: 0 48px;
    .date-wrap {
      position: relative;
      margin: 0 0 10px 0;
      text-align: left;
      .date {
        display: inline-block;
        font-size: 0;
        cursor: pointer;
        &:before {
          content: "";
          display: inline-block;
          width: 24px;
          height: 24px;
          margin: 0 3px 0 0;
          background: url("~@/assets/img/icon_calendar_24.png");
          vertical-align: middle;
        }
        span {
          display: inline-block;
          font-size: 14px;
          vertical-align: middle;
          transform: skew(0.2deg);
          text-decoration: underline;
        }
        &:hover:before {
          opacity: 0.8;
        }
        &:hover span {
          text-decoration: underline;
        }
      }
      .popup-calendar-wrap {
        display: none;
        position: absolute;
        top: 28px;
        left: 0;
        overflow: visible;
      }
      &.tc {
        margin-top: -20px;
      }
    }
    .middle-checkbox-wrap {
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-pack: justify;
      -ms-flex-pack: justify;
      justify-content: space-between;
      .checkbox-wrap {
        flex: none;
      }
      p {
        font-size: 15px;
        line-height: 1.4;
        text-align: left;
        transform: skew(0.2deg);
        margin: 10px 0;
      }
    }
    .checkbox-wrap {
      text-align: left;
      label {
        margin: 10px 0;
      }
      label:not(:last-of-type) {
        margin-right: 10px;
      }
    }
    .input-box-wrap textarea {
      height: 148px;
      line-height: 1.43;
      overflow: auto;
    }
  }
  .confirm-btn-wrap {
    padding: 28px 0 36px;
    button {
      width: 260px;
      height: 36px;
      border-radius: 18px;
    }
  }
  .view-schedule-wrap{
    .info-wrap {
      padding: 20px 20px 10px;
      text-align: left;
      span {
        display: inline-block;
        transform: skew(0.2deg);
        -webkit-transform: skew(0.2deg);
      }
      .date {
        display: block;
        color: #000;
        font-size: 18px;
        margin: 0 0 5px;
      }
      .class {
        font-size: 15px;
      }
      .teacher {
        color: #3867c6;
        font-size: 15px;
      }
      .target {
        display: block;
        color: #888;
        margin-top: 25px;
      }
    }
    .text-wrap {
      overflow-y: auto;
      max-height: 200px;
      padding: 15px 20px 0;
      border-top: 1px solid #ccc;
      p {
        font-size: 15px;
        text-align: left;
        line-height: 1.4;
        white-space: pre-wrap;
        transform: skew(0.2deg);
        -webkit-transform: skew(0.2deg);
      }
    }
  }
}
</style>