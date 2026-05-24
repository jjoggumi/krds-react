<template>
  <div class="fcfs__item is-opened">
    <div class="fcfs__content">
      <div class="fcfs__heading">
        <strong class="heading">{{ itemTitle }}</strong>
        <div :class="{'group-btn-right': isMobile, 'group-btn': !isMobile}">
          <button
            class="hi-btn btn-md"
            :class="{'btn-line-lgray': !isCanceled}"
            :disabled="isCanceled"
            @click="closeAfterSchool(afterSchoolItem)"
          >
            {{ isCanceled ? '폐강완료' : '폐강' }}
          </button>
        </div>
      </div>
      <div class="fcfs__info">
        <p>
          <span>일정</span>
          <span>
            <template
              v-for="(timeTableGroup, idx) of targetAfterSchoolTimeTables"
            >
              <span
                class="schedule"
                :key="`${afterSchoolItem.itemId}-timeTableGroup-${idx}`"
              >
                {{ timeTableItWeekTime(timeTableGroup) }}
              </span>
            </template>
          </span>
        </p>
        <p><span>인원</span><span>{{ applyCount(afterSchoolItem.limitCount) }}</span></p>
        <p><span>대상</span><span>{{ getTargets(afterSchoolItem.targets) }}</span></p>
        <p v-if="afterSchoolItem.itemField1"><span>수강료</span><span>{{ `${afterSchoolItem.itemField1}원` }}</span></p>
        <p v-if="afterSchoolItem.itemField2"><span>강사명</span><span>{{ afterSchoolItem.itemField2 }}</span></p>
      </div>
      <div class="fcfs__desc"><p>{{ afterSchoolItem.itemDescription }}</p></div>
      <button
        class="hi-btn btn-lg btn-line"
        @click="openApplicantList(afterSchoolItem)"
        v-if="isMobile"
      >
        신청내역
      </button>
    </div>
  </div>
</template>

<script>
import {mapActions, mapMutations} from "vuex";
import { getAfterSchoolTargets } from '@/plugins/utils'

export default {
  name: "after-school-item",
  data() {
    return {
      targetAfterSchoolTimeTables: {}
    }
  },
  props: {
    afterSchoolItem: {
      type: Object
    },
    isMobile: {
      type: Boolean
    },
    question: {
      type: Object
    },
    curSurveyId: {
      type: String
    }
  },
  computed: {
    isCanceled() {
      return this.afterSchoolItem.isCanceled
    },
    isDel() {
      return this.afterSchoolItem.isDel
    },
    isLimitedWait() {
      return this.afterSchoolItem.isLimitedWait
    },
    limitTotalCount() {
      return this.afterSchoolItem.limitCount.limitTotalCount
    },
    limitTotalMax() {
      return this.afterSchoolItem.limitCount.limitTotalMax
    },
    limitWaitCount() {
      return this.afterSchoolItem.limitCount.limitWaitCount
    },
    limitWaitMax() {
      return this.afterSchoolItem.limitCount.limitWaitMax
    },
    // 마감상태
    isApplyMax() {
      if (this.isLimitedWait) {
        // 대기 설정했을때: 대기인원까지 모두 채워졌을때
        return this.limitWaitCount === this.limitWaitMax
      } else {
        // 대기 신청안했을때: 신청인원 모두 채워졌을때
        return this.limitTotalCount === this.limitTotalMax
      }
    },
    itemTitle() {
      const title = this.afterSchoolItem.itemTitle
      if (this.isCanceled) {
        return `(폐강) ${title}`
      } else if (this.isDel) {
        return `(삭제) ${title}`
      } else if (this.isApplyMax) {
        return `(마감) ${title}`
      } else {
        return `(신청중) ${title}`
      }
    },
    applyCount() {
      return (limitCount) => {
        if (limitCount) {
          const applyTotal = limitCount.limitTotalCount + limitCount.limitWaitCount
          const completeCount = limitCount.limitTotalCount
          const completeMax = limitCount.limitTotalMax
          const waitCount = limitCount.limitWaitCount
          const waitMax = limitCount.limitWaitMax

          return `${applyTotal}명 (신청: ${completeCount}/${completeMax} , 대기 : ${waitCount}/${waitMax})`
        } else {
          return ''
        }
      }
    },
    timeTableItWeekTime() {
      return (timetableGroup) => {
        let days = ''

        timetableGroup.forEach((timeTable, idx) => {
          days += this.parseDayOfWeek(timeTable.dayOfWeek)
          if (timetableGroup.length > idx + 1) {
            days += ','
          }
        })

        return `${days} ${timetableGroup[0].timeStart} ~ ${timetableGroup[0].timeEnd}`
      }
    },
  },
  mounted() {
    this.groupByTimeTable(this.afterSchoolItem)
  },
  methods: {
    ...mapActions('storeSurvey', {
      cancelAfterSchool: 'cancelAfterSchool',
    }),
    ...mapMutations('storeSurvey', {
      setReplyPopupSelectedItem: 'setReplyPopupSelectedItem'
    }),
    closeAfterSchool(item) {
      this.$hiClass.confirm('수업을 폐강하면 신청자 또는 대기자 내역이 모두 삭제되며 복구 되지 않습니다. 그래도 폐강하시겠습니까?')
        .then(res => {
          this.cancelAfterSchool(item.itemId)
            .then(res => {
              this.$hiClass.alert('폐강되었습니다.')
                .then(res => item.isCanceled = true)
            })
        })
        .catch(err => {})
    },
    groupByTimeTable(afterSchoolItem) {
      this.targetAfterSchoolTimeTables = _.groupBy(afterSchoolItem.timeTables, (timeTable) => {
        return [timeTable['timeStart'], timeTable['timeEnd']];
      })
    },
    parseDayOfWeek(dayOfWeek) {
      switch (dayOfWeek) {
        case 1:
          return '월'
        case 2:
          return '화'
        case 3:
          return '수'
        case 4:
          return '목'
        case 5:
          return '금'
        case 6:
          return '토'
        case 7:
          return '일'
      }
    },
    openApplicantList(item) {
      this.setReplyPopupSelectedItem(item)
      const mobileUrl = `/mobile/survey-report/${this.curSurveyId}/${this.question.questionId}?itemId=${item.itemId}&type=afterSchool`
      this.$router.push(mobileUrl)
    },
    getTargets(targets) {
      return getAfterSchoolTargets(targets)
    },
  },
  watch: {
    afterSchoolItem: {
      handler: function (newVal) {
        this.groupByTimeTable(newVal)
      }
    },
  }
}
</script>

<style scoped>

</style>