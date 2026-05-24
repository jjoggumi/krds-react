<template>
  <div>
    <div v-if="!listEmpty" class="fcfs__list fcfs__details">
      <div class="fcfs__item" v-for="item in list" :key="item.id" :class="item.toggleInfo ? 'is-opened' : ''">
        <div class="fcfs__content">
          <span class="label-line deleted" v-if="item.isCanceled">폐강</span>
          <span class="label-line" v-if="!item.isCanceled && item.waitStatus === 'COMPLETE'">신청완료</span>
          <span class="label-line" v-if="!item.isCanceled && item.waitStatus === 'WAIT'">대기자 신청완료</span>
          <div class="fcfs__heading">
            <strong :class="item.isCanceled ? 'heading deleted' : 'heading'">{{ item.itemTitle }}</strong>
          </div>
          <div class="fcfs__infobox">
            <p class="num">정원 <span>{{ item.limitTotalMax ? item.limitTotalMax : item.limit.totalMax }}</span>명</p>
            <p class="schedule" v-html="setAfterSchoolTimetables(item)"/>
          </div>
          <div class="fcfs__info">
            <p><span>대상</span><span>{{ setAfterSchoolTargets(item.targets) }}</span></p>
            <p v-if="item.tuition"><span>수강료</span><span>{{ getItemField1Name(item.tuition) }}</span></p>
            <p v-if="item.instructorName"><span>강사명</span><span>{{ item.instructorName }}</span></p>
          </div>
          <div class="fcfs__desc" v-if="item.itemDescription">
            <p>{{ item.itemDescription }}</p>
          </div>
          <button
            v-if="!item.isCanceled && item.itemDescription"
            class="btn-toggle-fcfs"
            :class="item.toggleInfo ? 'is-active' : ''"
            @click="item.toggleInfo = !item.toggleInfo"><span></span>
          </button>
          <!-- is-active 추가 시 fcfs__item에 is-opened 클래스 추가 -->
        </div>
      </div>
    </div>
    <div v-if="listEmpty" class="hi-nodata">
      <p>신청 내역이 없습니다.</p>
    </div>
  </div>
</template>

<script>
import {mapActions, mapGetters, mapMutations} from "vuex"
import {getAfterSchoolTimetables, getAfterSchoolTargets} from '@/plugins/utils'
import {cloneDeep, isEmpty} from "lodash"

export default {
  name: "AfterSchoolCompleteContents",
  mounted() {
    this.setData()
  },
  props: {
    items: Array
  },
  data() {
    return {
      list: [],
      popupInfo: {}
    }
  },
  watch: {
    items(v){
      this.setData()
    }
  },
  computed: {
    listEmpty() {
      return isEmpty(this.list)
    }
  },
  methods: {
    ...mapMutations('storeSurvey', {
      setSurveyResponseBodyName: 'setSurveyResponseBodyName',
    }),
    ...mapGetters('storeSurvey', {
      curSurveyAnswer: 'curSurveyAnswer',
    }),
    ...mapActions('storeSurvey', {
      getCompleteAnswersList: 'getCompleteAnswersList'
    }),
    async setData() {
      this.list = this.items
      let arr = cloneDeep(this.list)
      arr.forEach(item => {
        item.toggleInfo = false
        if (!isEmpty(this.curSurveyAnswer().answers)) {
          this.curSurveyAnswer().answers.forEach(answer => {
            if (item.respondentId === answer.respondentId && item.itemId === answer.itemId) {
              item.waitStatus = answer.waitStatus
            }
          })
        }
      })
      this.list = arr
    },
    setAfterSchoolTimetables(item) {
      return getAfterSchoolTimetables(item.timetables)
    },
    setAfterSchoolTargets(targets) {
      return getAfterSchoolTargets(targets)
    },
    getItemField1Name(itemField1) {
      const itemField1Name = itemField1
        ? this.$stringUtil.addCommas(itemField1)
        : 0
      return `${itemField1Name} 원`
    }
  }
}
</script>

<style scoped>

</style>