<template>
  <div>
    <div class="survey__heading"><strong class="heading-sub">학부모 상담 일정</strong></div>
    <!-- 내역 없는 경우 -->
    <p class="counsel__text" v-if="!listEmpty">{{ `${list.schoolName} ${list.classGrade}학년 ${list.classBan}반` }}</p>
    <div class="hi-nodata" v-if="listEmpty"><p>신청 내역이 없습니다.</p></div>
    <!-- //내역 없는 경우 -->
    <!-- 내역 있는 경우 -->
    <div class="counsel__details" v-if="!listEmpty">
      <span :class="className">{{ consultType }}</span>
      <div class="info">
        <strong class="schedule">{{ scheduleDate }}</strong>
        <span class="class" v-html="name" />
      </div>
    </div>
  </div>
</template>

<script>
import {mapActions} from "vuex";
import {isEmpty} from "lodash";

export default {
  name: "ConsultationResult",
  data() {
    return {
      list: [],
      className: '',
      consultType: '',
      scheduleDate: '',
      name: ''
    }
  },
  computed: {
    listEmpty() {
      return isEmpty(this.list)
    },
    isSimulation() {
      return this.$store.state.storeSurvey.isSimulation
    }
  },
  async mounted() {
    if(!this.isSimulation) {
      let params = {
        respondentId: this.$store.state.storeSurvey.respondentId,
        questionType: 'consultation-answers'
      }
      if (!params.respondentId) {
        params.respondentId = this.$route.query.respondentId
      }
      this.getCompleteAnswersList(params).then((res)=>{
        this.list = res[0]
        this.list.classGrade = this.list.classGrade.slice(-1)
        this.name = this.respondentNameHtml(this.list)
        const date = this.$moment(this.list.selectedItem.itemDate).format('MM월 DD일')
        const week = ['일', '월', '화', '수', '목', '금', '토']
        const dayOfWeek = week[new Date(this.list.selectedItem.itemDate).getDay()]
        this.scheduleDate = `${date} ${dayOfWeek}요일 ${this.list.selectedItem.itemTimeStart} ~ ${this.list.selectedItem.itemTimeEnd}`
        switch (this.list.consultType){
          case "PHONE":{
            this.className = 'type call'
            this.consultType = '전화'
            return this.$t("chat.invalid.counsel.time");
          }
          case "VISIT":{
            this.className = 'type visit'
            this.consultType = '방문'
            return
          }
          default:{
            this.className = 'type remote'
            this.consultType = '원격'
            return
          }
        }
      })
    }
  },
  methods: {
    ...mapActions('storeSurvey', {
      getCompleteAnswersList: 'getCompleteAnswersList'
    }),
    respondentNameHtml(item) {
      let html = `${item.respondentName}`
      const type = item.classUserType === 'PARENTS' ? '학부모' :
        item.classUserType === 'TEACHER' ? '선생님' :
          item.classUserType === 'STUDENT' ? '학생' : null
      if (item.classUserType === 'TEACHER') {
        html = `${html} ${type}`
        if (item.subjectName) {
          html = `${html} (${item.subjectName})`
        }
      } else {
        html = `${item.subjectName} ${type ? type : ''} (${item.respondentName})`
      }
      return html
    },
  }
}
</script>