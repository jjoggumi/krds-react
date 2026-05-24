<!-- [모달] 나의 신청 내역 - 디테일 -->
<template>
  <div>
    <!-- 방과후 교실 -->
    <div v-if="myApplyHistory.isAfterSchool">
      <div class="modal__content">
        <!-- <strong class="heading">최종 제출 완료한 신청내역은 <span class="ft-blue">확인 및 변경이 가능</span>합니다. </strong> -->
        <template v-if="surveySearchQuery.surveyStatus === 'DOING'">          
          <strong class="heading">설문 기간 내에는 최종 제출 완료한 신청 내역도 <span class="ft-blue">확인 및 변경이 가능</span>합니다.</strong>
          <p class="desc">신청내역 삭제 (취소)를 원하시면 응답 삭제 후 다시 설문을
              진행해주세요.</p>
        </template>
        <p v-if="surveySearchQuery.surveyStatus === 'END'" class="desc">
          설문 종료 이후에는 신청내역 확인만 가능합니다.
        </p>
        <p class="counsel__text">
          <span class="name">{{ myApplyHistory.mySubjectName }} 학생</span>
          {{ className }}
        </p>

        <loading v-if="isLoading" />

        <!-- 신청 내역이 있는 경우 -->
        <div v-if="!isLoading && myApplyHistoryDetail.length > 0" class="fcfs__list fcfs__details">
          <div
            class="fcfs__item"
            :class="item.isToggle ? 'is-opened' : ''"
            v-for="(item, index) in myApplyHistoryDetail"
            :key="'myApplyHistoryDetail' + index"
          >
            <div class="fcfs__content">
              <span class="label-line deleted" v-if="item.isCanceled">폐강</span>
              <span class="label-line" v-if="!item.isCanceled && item.waitStatus === 'COMPLETE'">신청완료</span>
              <span class="label-line" v-if="!item.isCanceled && item.waitStatus === 'WAIT'">대기자 신청완료</span>
              <div class="fcfs__heading">
                <strong class="heading" :class="item.isCanceled ? deleted : ''">{{ item.itemTitle }}</strong>
              </div>
              <div class="fcfs__infobox">
                <p class="num">
                  정원
                  <span> {{ item.limitTotalMax }} </span>
                  명
                </p>
                <p class="schedule">
                  <span v-html="bindAfterSchoolTimetables(item)"></span>
                </p>
              </div>
              <div class="fcfs__info">
                <p>
                  <span>대상</span><span>{{ changeAfterSchoolTargets(item.targets) }}</span>
                </p>
                <p v-if="!isEmpty(item.tuition)">
                  <span>수강료</span><span>{{ item.tuition }}</span>
                </p>
                <p v-if="!isEmpty(item.instructorName)">
                  <span>강사명</span><span>{{ item.instructorName }}</span>
                </p>
              </div>
              <transition name="fade">
                <div v-if="item.isToggle" class="fcfs__desc">
                  <p>{{ item.itemDescription }}</p>
                </div>
              </transition>

              <button
                v-if="!isEmpty(item.itemDescription)"
                class="btn-toggle-fcfs"
                :class="item.isToggle ? 'is-active' : ''"
                @click="onToggle(index)"
              >
                <span></span>
              </button>
            </div>
          </div>
        </div>

        <!-- 신청 내역이 없는 경우 -->
        <div v-if="!isLoading && myApplyHistoryDetail.length == 0" class="donot__details">
          <p>신청하신 수업내역이 없습니다.</p>
        </div>
      </div>

      <div v-if="surveySearchQuery.surveyStatus === 'DOING'" class="modal__footer">
        <button class="hi-btn btn-md btn-gray" @click="deleteAnswer()">응답 삭제</button>
        <button class="hi-btn btn-md" @click="changeAnswer()">수강신청 변경</button>
      </div>
    </div>
    <!-- 학부모 상담 -->
    <div v-if="myApplyHistory.isConsultation">
      <div class="modal__content">
        <!-- <strong class="heading">최종 제출 완료한 신청내역은 <span class="ft-blue">확인 및 변경이 가능</span>합니다. </strong> -->
        <p class="desc">
          <template v-if="surveySearchQuery.surveyStatus === 'END'">
            설문 종료 이후에는 신청내역 확인만 가능합니다.
          </template>

          <template v-else>
            
            <strong class="heading">설문 기간 내에는 최종 제출 완료한 신청 내역도 <span class="ft-blue">확인 및 변경이 가능</span>합니다.</strong>
            <p class="desc">신청내역 삭제 (취소)를 원하시면 응답 삭제 후 다시 설문을
            진행해주세요.</p>
          </template>
        </p>
        <p class="counsel__text">
          <span class="name">{{ myApplyHistory.mySubjectName }} 학생</span>
          {{ className }}
        </p>

        <loading v-if="isLoading" />

        <!-- 신청 내역이 있는 경우 -->
        <div v-if="!isLoading && myApplyHistoryDetail.length > 0">
          <div class="counsel__details" v-for="(item, index) in myApplyHistoryDetail" :key="'myApplyHistoryDetail' + index">
            <span v-if="item.consultType === 'VISIT'" class="type visit">방문</span>
            <span v-if="item.consultType === 'REMOTE'" class="type remote">원격</span>
            <span v-if="item.consultType === 'PHONE'" class="type call">전화</span>
            <div class="info">
              <span v-if="item.consultType === 'VISIT'" class="counsel">방문상담</span>
              <span v-if="item.consultType === 'REMOTE'" class="counsel">원격상담</span>
              <span v-if="item.consultType === 'PHONE'" class="counsel">전화상담</span>
              <strong
                class="schedule"
                v-html="bindCounselDate(item.selectedItem.itemDate, item.selectedItem.itemTimeStart, item.selectedItem.itemTimeEnd)"
              ></strong>
              <span class="class">{{ item.respondentName }} 학부모 ({{ item.subjectName ? item.subjectName : '익명' }})</span>
            </div>
          </div>
        </div>

        <!-- 신청 내역이 없는 경우 -->
        <div v-if="!isLoading && myApplyHistoryDetail.length == 0" class="donot__details">
          <p>신청 내역이 없습니다.</p>
        </div>
      </div>

      <div v-if="surveySearchQuery.surveyStatus === 'DOING'" class="modal__footer">
        <button class="hi-btn btn-md btn-gray" @click="deleteAnswer()">응답 삭제</button>
        <button class="hi-btn btn-md" @click="changeAnswer()">상담일정 변경</button>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import _ from 'lodash';
import { mapMutations, mapState } from 'vuex';
import { getAfterSchoolTimetables, getAfterSchoolTargets } from '@/plugins/utils';
import Loading from '@/components/Loading/Loading.vue';
import { getClassGradeBan } from '@/plugins/utils';

export default {
  components: { Loading },
  props: {},
  data() {
    return {
      myApplyHistoryDetail: [],
      afterSchoolTimeTables: '',
      isToggle: false,
      isLoading: false,
      counselScheduleDate: '',
    };
  },
  computed: {
    ...mapState({
      curClassItem: 'curClassItem',
    }),
    ...mapState('storeSurvey', {
      surveySearchQuery: 'surveySearchQuery', // 설문조사 검색 쿼리
      myApplyHistory: 'myApplyHistory', // 나의신청내역 STATE
    }),
    changeAfterSchoolTargets(targets) {
      return getAfterSchoolTargets;
    },
    className() {
      const gradeAndClass = ({classGrade, classBan}) => getClassGradeBan(classGrade, classBan);
      return this.myApplyHistoryDetail.length > 0 
        ? `${this.curClassItem.school.schoolName} ${gradeAndClass(this.myApplyHistoryDetail[0])}`
        : this.curClassItem.className;
    },
  },
  async created() {
    await this.getApplyDetail();
  },
  mounted() {},
  beforeDestroy() {},
  methods: {
    ...mapMutations('storeSurvey', {
      setSurveyResponseBodyName: 'setSurveyResponseBodyName',
      setMyApplyHistoryIsListRespondent: 'setMyApplyHistoryIsListRespondent',
      setMyApplyHistoryIsDetail: 'setMyApplyHistoryIsDetail',
    }),
    async getApplyDetail() {
      const respondentId = this.myApplyHistory.myRespondentId;

      //방과후 설문 내용 조회
      if (this.myApplyHistory.isAfterSchool) {
        this.isLoading = true;
        //[POST] http://{domain}:{port}/{basePath}/surveys/respondents/{respondentId}/after-school-answers
        await this.$axios
          .post(`/surveys/respondents/${respondentId}/after-school-answers`)
          .then(res => {
            // 받아온 res를 data에 삽입
            this.myApplyHistoryDetail = res.data;

            // 받아온 res에 isToggle 추가
            _.forEach(this.myApplyHistoryDetail, function(item) {
              // _.assign(item, { isToggle: false });
              Vue.set(item, 'isToggle', false);
            });
          })
          .catch();
        this.isLoading = false;
      }

      if (this.myApplyHistory.isConsultation) {
        this.isLoading = true;
        //[POST] http://{domain}:{port}/{basePath}/surveys/respondents/{respondentId}/after-school-answers
        await this.$axios
          .post(`/surveys/respondents/${respondentId}/consultation-answers`)
          .then(res => {
            // 받아온 res를 data에 삽입
            this.myApplyHistoryDetail = res.data;
          })
          .catch();
        this.isLoading = false;
      }
    },
    bindAfterSchoolTimetables(itemList) {
      return getAfterSchoolTimetables(itemList.timetables);
    },
    onToggle(listItem) {
      this.myApplyHistoryDetail[listItem].isToggle = !this.myApplyHistoryDetail[listItem].isToggle;
    },
    isEmpty(content) {
      return _.isEmpty(content);
    },
    deleteAnswer() {
      const respondentId = this.myApplyHistory.myRespondentId;
      this.$hiClass
        .confirm('응답을 삭제하시겠습니까?<br>삭제된 응답은 복원이 불가능합니다.')
        .then(() => {
          this.$axios
            .delete(`/surveys/respondents/${respondentId}`)
            .then(res => {
              /**
               * ApplyHistoryList 의 respondentList 재조회
               * @description 코드 가이드상 props와 emit을 사용하지 않기로 했으나 해당 경우 action보다 가독성이 좋다고 판단하여 사용함.
               * @param updateMyApplyHistoryList - 나의 신청내역 리스트 재조회
               **/
              this.$emit('refreshMyApplyHistoryList', respondentId);
              this.myApplyHistoryDetail = [];
              this.setMyApplyHistoryIsListRespondent(false);
              this.setMyApplyHistoryIsDetail(false);
              this.$toasted.show('응답이 삭제되었습니다.', { duration: 1000 });
              
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(() => {
          return;
        });
    },
    async changeAnswer() {
      const respondentId = this.myApplyHistory.myRespondentId;
      const surveyId = this.myApplyHistory.mySurveyId;

      let routeObj = {
        path: `/survey-response/${surveyId}`,
        query: { respondentId: respondentId, bodyName: 'ANSWER', mode: 'change' },
      };
      this.$router.push(routeObj, () => {});
      this.setMyApplyHistoryIsDetail(false);
      this.myApplyHistory.isModalOpen = false;
      setTimeout(() => {
        this.setSurveyResponseBodyName('ANSWER');
      }, 100);
    },
    bindCounselDate(ItemDate, itemTimeStart, itemTimeEnd) {
      const date = this.$moment(ItemDate).format('M월 DD일');
      const week = ['일', '월', '화', '수', '목', '금', '토'];
      const dayOfWeek = week[new Date(ItemDate).getDay()];
      return `${date} ${dayOfWeek}요일 ${itemTimeStart} ~ ${itemTimeEnd}`;
    },
  },
};
</script>
<style scoped>
.counsel__text {
  padding: 18px 8px 16px;
  border-top: 2px solid #222;
  border-bottom: 1px solid #dedede;
  margin: 30px 0 15px;
}
.fcfs__list .fcfs__content .btn-toggle-fcfs {
  display: block;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
