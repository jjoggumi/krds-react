<!--
@File(Method): SurveyRespondentModal.vue
@Author: -
@Date Created: -
@Description: 설문 투표 > 리스트 > 응담자 조회 클릭 > 응답자 명단 모달
@Modified: 2025-01-09 - #69560 구성원 관리 태그 추가 - 검색영역 태그, 필터 추가 / HiModal 컴포넌트로 변경
-->
<template>
  <HiModal type="type01" size="lg" @close="closeSurveyRespondentModalFlag()" class="modal-respondent"
    id="modal">
      <template v-slot:heading>응답자 명단</template>
      <template v-slot:content> 
                
        <div class="text-noticebox mb-05" v-if="isAnonymous">
          <p>익명설문은 응답자의 읽음 및 제출여부를 제공하지 않습니다.</p>
        </div> 
        <div class="area-remind-push">
          <div class="remind-push__left select-target-wrap">            
            <MemberSearch :clazzTags="clazzTags" @search="search" :class="{'full' : isAnonymous}">
              <template v-slot:check-box>
                <div class="group-checkbox" v-if="!isAnonymous">
                  <input
                    type="checkbox"
                    id="unRead"
                    @click="checkGroup('unRead')"
                    :checked="isReadAllChecked"
                    :disabled="filterCheckBoxDisabled"
                  >
                  <label for="unRead"><span>미확인</span></label>
                  <input
                    type="checkbox"
                    id="unAnswered"
                    @click="checkGroup('unAnswered')"
                    :checked="isUnAnsweredAllChecked"
                    :disabled="filterCheckBoxDisabled"
                  >
                  <label for="unAnswered"><span>미제출</span></label>
                </div>                
              </template>
            </MemberSearch>     
            <div class="respondent__head">
              <span class="th">응답자</span>
              <span class="th">확인일시</span>
              <span class="th">제출일시</span>
            </div>
            <div class="respondent__list">
              <div
                class="respondent__item"
                v-for="(respondent, idx) of respondentList"
                :key="`respondentModal-${idx}-${respondent.respondentId}`"
              >
                <input
                  type="checkbox"
                  :id="respondent.respondentId"
                  :value="respondent.userId"
                  v-model="selectedUserList"
                  :disabled="memberCheckBoxDisabled(respondent)"
                >
                <label :for="respondent.respondentId">
                  <span class="td">{{ respondentName(respondent) }}</span>
                  <span :class="checkSpanStyle(respondent, 'readTimestamp')">
                    {{ replyTime(respondent, 'readTimestamp') }}
                  </span>
                  <span :class="checkSpanStyle(respondent, 'answeredTimestamp')">
                    {{ replyTime(respondent, 'answeredTimestamp') }}
                  </span>
                </label>
              </div>              
              <div class="hi-nodata" v-if="respondentList.length === 0">
                <p>
                검색결과가 없습니다.
                </p>
              </div>
            </div>
          </div>

          <div class="remind-push__right">
            <div class="remind-push__textarea">
              <strong class="heading">푸시 내용 입력</strong>
              <textarea
                placeholder="내용을 입력해주세요."
                class="count-textarea"
                maxlength="100"
                v-model="pushMessage"
                @keyup="checkTextLength($event)"
              >
              </textarea>
              <div class="count-word">
                <span class="count">{{ pushMessageLength }}</span><span>/100자</span>
              </div>
            </div>
            <p class="num">총 <strong>{{ selectedUserList.length }}</strong>명</p>
            <HiButton color="primary" size="lg" :disabled="pushButtonDisabled" @click="sendMessage">푸시 알림 보내기</HiButton>
          </div>
        </div>
      </template>
    </HiModal> 
</template>

<script>
import {mapActions, mapState} from "vuex";
import {getRespondentNameWithUserType, timestampToDateTime} from "@/plugins/utils";
import MemberSearch from "@/components/Search/MemberSearch";

export default {
  name: "survey-respondent-modal",
  data() {
    return {
      pushMessage: '',
      pushMessageLength: 0,
      selectedUserList: [],
      currentTimestamp: this.$moment().valueOf(),
      memberSearchItem: {
        searchType: 'NONE',
        searchValue: ''
      }
    }
  },
  components: {
    MemberSearch
  },
  computed: {
    ...mapState({
      user: 'user'
    }),
    ...mapState('storeSurvey', {
      selectedSurvey: 'selectedSurvey',
      curSurveyRespondent: 'curSurveyRespondent'
    }),
    ...mapState('storeClazzTag', [
      'clazzTags'
    ]),
    survey() {
      return this.selectedSurvey
    },
    isAnonymous() {
      return this.selectedSurvey.isAnonymous
    },
    respondentList() {
      if (this.memberSearchItem.searchType === 'KEYWORD') {
        return this.curSurveyRespondent.filter(u =>
            u.respondentName.includes(this.memberSearchItem.searchValue) || (u.subjectName || '').includes(this.memberSearchItem.searchValue)
        )

      } else if (this.memberSearchItem.searchType === 'TAG') {
        return this.curSurveyRespondent.filter(u => (u.tags || []).map(t => t.tagId).includes(this.memberSearchItem.searchValue))

      } else if (this.memberSearchItem.searchType === 'TAG_MULTI') {
        return this.memberSearchItem.searchValue.length > 0 ?
            this.curSurveyRespondent.filter(u => this.memberSearchItem.searchValue
                .some(tagId => (u.tags || []).map(t => t.tagId).includes(tagId))
            ) :
            this.curSurveyRespondent

      } else {
        return this.curSurveyRespondent
      }
    },
    respondentName() {
      return (respondent) => {
        if (this.isAnonymous && !respondent.respondentName) {
          return '익명'
        }
        if (respondent.subjectName) {
          return `${getRespondentNameWithUserType(respondent.respondentName, respondent.userType)} (${respondent.subjectName})`
        } else {
          return getRespondentNameWithUserType(respondent.respondentName, respondent.userType)
        }
      }
    },
    replyTime() {
      return (respondent, flag) => {
        if (this.isAnonymous) {
          return '-'
        } else {
          if (respondent[flag] === null || respondent[flag] === '') {
            return flag === 'readTimestamp' ? '읽지않음' : '미제출'
          } else {
            return timestampToDateTime(respondent[flag])
          }
        }
      }
    },
    checkSpanStyle() {
      return (respondent, flag) => {
        if (this.isAnonymous) {
          return 'td'
        }
        if (respondent[flag] === null || respondent[flag] === '') {
          return 'td nodata'
        } else {
          return 'td'
        }
      }
    },
    // 미제출 리스트
    unAnsweredList() {
      return this.respondentList.length > 0 ?
        this.respondentList.filter(respondent => {
          return respondent.answeredTimestamp === null && !this.isNonMember(respondent)
        }) : []
    },
    // 미확인 리스트
    unReadList() {
      return this.respondentList.length > 0 ?
        this.respondentList.filter(respondent => {
          return respondent.readTimestamp === null && !this.isNonMember(respondent)
        }) : []
    },
    isUnAnsweredAllChecked() {
      return this.unAnsweredList.every(unAnsweredUser => {
        return this.selectedUserList.includes(unAnsweredUser.userId)
      })
    },
    isReadAllChecked() {
      return this.unReadList.every(unReadUser => {
        return this.selectedUserList.includes(unReadUser.userId)
      })
    },
    isNonMember() {
      return (respondent) => {
        return respondent.userType === 'NONMEMBER'
      }
    },
    filterCheckBoxDisabled() {
      return this.isEnd || this.isReservation || !this.respondentList.length > 0
    },
    memberCheckBoxDisabled() {
      return (respondent) => {
        // 설문 상태가 종료, 예약이거나 비회원이거나 탈퇴회원일때
        return this.isEnd || this.isReservation || this.isNonMember(respondent) || respondent.isWithdrawal === true
      }
    },
    pushButtonDisabled() {
      return this.isEnd || this.isReservation || !this.selectedUserList.length > 0 || this.pushMessage.length === 0
    },
    isEnd() {
      return this.currentTimestamp > this.survey.timestampEnd
    },
    isReservation() {
      return this.survey.surveyStatus === 'RESERVATION'
    }
  },
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    ...mapActions('storeSurvey', {
      getCurSurveyRespondent: 'getCurSurveyRespondent',
      sendSurveyRespondentPushMessage: 'sendSurveyRespondentPushMessage',
      closeSurveyRespondentModalFlag: 'closeSurveyRespondentModalFlag',
      clearCurSurveyRespondent: 'clearCurSurveyRespondent'
    }),
    ...mapActions('storeClazzTag', [
      'fetchTags'
    ]),
    checkTextLength(event) {
      if (event.target.value.length > event.target.maxLength) {
        event.target.value = event.target.value.slice(0, event.target.maxLength)
      }
      this.pushMessageLength = event.target.value.length
    },
    checkGroup(groupType) {
      const isChecked = document.querySelector(`#${groupType}`).checked
      this[`${groupType}List`].forEach(user => {
        const targetCheckBox = document.getElementById(`${user.respondentId}`)

        if (isChecked) {
          targetCheckBox.checked = true
          if (!this.selectedUserList.includes(targetCheckBox._value)) {
            this.selectedUserList.push(targetCheckBox._value)
          }
        } else {
          targetCheckBox.checked = false
          const deleteIdx = this.selectedUserList.findIndex(selectedUserId => selectedUserId === targetCheckBox._value)
          this.selectedUserList.splice(deleteIdx, 1)
        }
      })
    },
    setCurrentTimestamp() {
      this.currentTimestamp = this.$moment().valueOf()
    },
    sendMessage() {
      if (this.pushButtonDisabled) {
        return false
      }

      const requestField = {
        surveyId: this.survey.surveyId,
        userId: this.user.currentId,
        userIds: this.selectedUserList,
      }
      if (this.pushMessage.length > 0) {
        requestField.message = this.pushMessage
      }
      this.sendSurveyRespondentPushMessage(requestField).then(res => {
        const surveyType = this.survey.surveyType.toLowerCase()
        // 설문 GA 적용 응답자 푸시 발송
        this.triggerAnalyticsLogEvent({ code: `analytics.survey.${surveyType}.sendPush` })
        this.$hiClass.alert('푸시 발송을 완료하였습니다.', 'success').then(() => this.closeSurveyRespondentModalFlag())
      }).catch(err => {
        this.$hiClass.alert('푸시 발송에 실패했습니다.', 'warning')
        this.$log.error(err)
      })
    },
    search({ searchType, searchValue }) {
      this.memberSearchItem = { searchType, searchValue }
    }
  },
  created() {
    this.getCurSurveyRespondent(this.survey.surveyId)
    this.fetchTags(this.selectedSurvey.clazz.classId)
  },
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')

    // 설문종료가 안됐으면 1초마다 현재시간 update
    if (this.currentTimestamp < this.survey.timestampEnd) {
      let timer = setInterval(() => {
        this.setCurrentTimestamp()
        // 설문이 종료되면 시간 update 중지
        if(this.isEnd){
          clearInterval(timer)
        }
      }, 1000)
    }

    this.pushMessage = `${this.survey.surveyTitle}을 확인해주세요!`
    this.pushMessageLength = this.pushMessage.length
  },
  beforeDestroy() {
    this.closeSurveyRespondentModalFlag()
    this.clearCurSurveyRespondent()
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  },
  watch: {
    isEnd: {
      handler: function (newVal, oldVal) {
        // 설문종료이면 선택된 리스트 초기화
        if (newVal || oldVal) {
          this.selectedUserList = []
        }
      }
    },
    $route() {
      this.closeSurveyRespondentModalFlag()
    }
  }
}
</script>

<style lang="scss" scoped>
.member-search{
  .group-checkbox{
    display: flex;
    align-items: center;
    border:0;
    margin: 0;
    padding: 0;
    label span{    
      font-size: 15px;
      font-weight: 400;
    }
  }
  ::v-deep .search-box{max-width:235px;} // #73148 설문 응답자 조회 팝업 > 태그 검색 시 미확인,미제출 체크박스 ui 깨짐
  &.full ::v-deep .search-box{max-width:100%;}
}
.hi-nodata{padding:135px 0;}
</style>