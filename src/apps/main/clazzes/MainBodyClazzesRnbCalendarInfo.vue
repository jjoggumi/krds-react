<template>
  <div class="calendar-detail-info-wrap" v-if="isShowCalendarInfo">
    <ul>
      <li v-for="item in calendarSchools" :key="item.currentId">
        <div class="title">학사일정</div>
        <p>{{ item.postContent }}</p>
      </li>

      <li v-for="item in calendarClazzes" :key="item.currentId">
        <div class="title">우리반 일정</div>
        <p v-html="getReplacePostContent(item.postContent)"></p>
        <div class="edit-delete-btn-wrap" v-if="isManager && isClassActivated">
          <template v-if="isMyPost(item)">
            <button class="edit-btn" @click="onClickEdit(item)"></button>
          </template>
          <button class="delete-btn" @click="onClickDelete(item)"></button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import {eventBus} from "@/main";

export default {
  name: 'main-body-clazzes-rnb-calendar-info',
  props: {
    user: Object,
    clazzes: Object,
    isManager: Boolean,
    isClassActivated: Boolean,
    selectdDate: String,
    dayPosts: Array,
    monthlyPosts: Array
  },
  data: () => ({
    isChangeMonth: false,
    oldSelectedDate: '',
    postTypes: {
      CALENDAR_SCHOOL: 'CALENDAR_SCHOOL',
      CALENDAR_CLASS: 'CALENDAR_CLASS'
    }
  }),
  components: {},
  watch: {
    selectedDate(val, oldVal) {
      if (oldVal === undefined && oldVal !== null && oldVal !== '') {
        if (this.isDiffMonth(val, oldVal)) {
          this.$log.debug(val + '<>' + oldVal)
          this.isChangeMonth = false
          this.oldSelectedDate = oldVal
        } else this.isChangeMonth = true
      } else this.isChangeMonth = false
    }
  },
  computed: {
    isShowCalendarInfo() {
      if (this.dayPosts.length > 0) return true
      else return false
    },
    calendarSchools() {
      if (this.dayPosts.length > 0) {
        const compareType = this.postTypes.CALENDAR_SCHOOL
        return this.dayPosts.filter(function(item) {
          return item.postType === compareType
        })
      } else return []
    },
    calendarClazzes() {
      if (this.dayPosts.length > 0) {
        const compareType = this.postTypes.CALENDAR_CLASS
        return this.dayPosts.filter(function(item) {
          return item.postType === compareType
        })
      } else return []
    }
  },
  methods: {
    onClickEdit(item) {
      this.$emit('editCalendarClass', item)
    },
    onClickDelete(item) {
      this.$hiClass.confirm('우리반 일정을 삭제하시겠습니까?')
        .then(() => {
          const postUuid = item.currentId

          // 삭제 플래그 사용
          let itemData = item
          itemData.del = true

          // files: null 오류 수정
          if (!Array.isArray(itemData.files)) {
            itemData.files = []
          }

          this.$axios({
            method: 'patch',
            url: '/posts/' + postUuid,
            data: itemData
          })
            .then(result => {
              this.$comn.log(this, 'onClickDelete() result :', result)
              this.$emit('initCalendarClass')

              // `set-clazzes-schedule-dot-${this.isPopupCalendar}`
              eventBus.$emit('set-clazzes-schedule-dot-false', {timestamp: itemData.posted, isPosted: false})
            })
            .catch(error => {
              this.$comn.log(this, 'error', error)
              this.$hiClass.alertError()
            })
        })
    },
    isDiffMonth(newSelectedDate, oldSelectedDate) {
      let newJsons = newSelectedDate.split(',')
      let oldJsons = oldSelectedDate.split(',')

      let newMonthStr = newJsons[0] + '' + newJsons[1] - 1
      let oldMonthStr = oldJsons[0] + '' + oldJsons[1] - 1

      return newMonthStr === oldMonthStr
    },
    isMyPost(item) {
      return item.insertedUser && item.insertedUser.currentId === this.user.currentId
    },
    getReplacePostContent(postContent) {
      return postContent ? postContent.replaceAll('>', '&gt;').replaceAll('<', '&lt;') : postContent
    }
  },
  created: function() {},
  mounted() {}
}
</script>

<style scoped></style>
