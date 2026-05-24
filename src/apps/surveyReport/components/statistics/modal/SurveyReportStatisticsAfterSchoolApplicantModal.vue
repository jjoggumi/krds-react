<!--
@File(Method): SurveyReportStatisticsAfterSchoolApplicantModal.vue
@Author: -
@Date Created: -
@Description: 설문.투표(방가후) > 통계 및 개별조회 > 통계탭 > 푸시알림보내기 모달
@Modified: 2025-01-09 - #69560 구성원 관리 태그 추가 - 검색영역 태그, 필터 추가 / HiModal 컴포넌트로 변경
-->
<template>
  <HiModal type="type01" size="lg" @close="closeAfterSchoolPopup" class="modal-respondent"
    id="modal">
      <template v-slot:heading><em class="highlight">{{ classItemTitle }}</em> 신청 명단</template>
      <template v-slot:content>
        <div class="top-class">
          <div class="group-checkbox">
            <input
              type="checkbox"
              id="completeStatus"
              @click="checkApplicant($event, 'COMPLETE')"
              :checked="isCompleteAllChecked"
              :disabled="applicantList.length === 0 || completeList.length === 0"
            >
            <label for="completeStatus"><span>신청완료</span></label>
            <input
              type="checkbox"
              id="waitStatus"
              @click="checkApplicant($event, 'WAIT')"
              :checked="isWaitAllChecked"
              :disabled="applicantList.length === 0 || waitList.length === 0"
            >
            <label for="waitStatus"><span>대기자</span></label>
          </div>
        </div>
        <div class="area-remind-push">
          <div class="remind-push__left">
                   
            <div class="respondent__head fcfs">
              <span class="th">신청자명</span>
              <span class="th">구분</span>
            </div>
            <div class="respondent__list fcfs">
              <div
                class="respondent__item"
                v-for="applicant of applicantList"
                :key="applicant.respondentId"
              >
                <input
                  type="checkbox"
                  :id="applicant.respondentId"
                  v-model="selectedApplicantList"
                  :value="applicant.userId"
                  :disabled="applicant.userType === 'NONMEMBER'"
                >
                <label :for="applicant.respondentId">
                  <span class="td">
                    {{ respondentName(applicant.respondentName, applicant.userType, applicant.subjectName) }}
                  </span>
                  <span class="td">
                    {{ applicant.waitStatus === 'COMPLETE' ? '신청완료' : '대기자' }}
                  </span>
                </label>
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
            <p class="num">총 <strong>{{ selectedApplicantList.length }}</strong>명</p>
            <button
              class="hi-btn btn-lg"
              @click="sendMessage"
              :disabled="isDisabled"
            >
              푸시 알림 보내기
            </button>
          </div>
        </div>
      </template>
    </HiModal>
</template>

<script>
import {mapActions, mapState} from "vuex";
import {getRespondentNameWithUserType} from "@/plugins/utils";

export default {
  name: "survey-report-statistics-after-school-applicant-modal",
  data() {
    return {
      pushMessage: '',
      pushMessageLength: 0,
      selectedApplicantList: []
    }
  },
  computed: {
    ...mapState({
      user: 'user'
    }),
    ...mapState('storeSurvey', {
      surveyReport: 'surveyReport'
    }),
    ...mapState('storeClazzTag', ['clazzTags']),
    tagIdNameList() {
      return this.clazzTags.map(tag => ({ value: tag.tagId, title: tag.tagName }))
    },
    selectedItem() {
      return this.surveyReport.statistics.replyPopup.selectedItem
    },
    classItemTitle() {
      return this.surveyReport.statistics.replyPopup.selectedItem.itemTitle
    },
    activeTagIds() {
      return this.surveyReport.statistics.activeTagIds
    },
    applicantList() {
      if (this.surveyReport.statistics.replyPopup.answerList.length === 0) return []
      return this.activeTagIds.length > 0 ?
          this.surveyReport.statistics.replyPopup.answerList.filter(a => a.tags && a.tags.some(tag => this.activeTagIds.includes(tag.tagId))) :
          this.surveyReport.statistics.replyPopup.answerList
    },
    respondentName() {
      return (respondentName, userType, subjectName) => {
        if (subjectName) {
          return `${getRespondentNameWithUserType(respondentName, userType)} (${subjectName})`
        } else {
          return getRespondentNameWithUserType(respondentName, userType)
        }
      }
    },
    completeList() {
      return this.applicantList.filter(applicant => {
        return applicant.waitStatus === 'COMPLETE' && applicant.userType !== 'NONMEMBER'
      })
    },
    waitList() {
      return this.applicantList.filter(applicant => {
        return applicant.waitStatus === 'WAIT' && applicant.userType !== 'NONMEMBER'
      })
    },
    isCompleteAllChecked() {
      return this.completeList.length > 0 && this.completeList.every(item => {
        return this.selectedApplicantList.filter(userId => this.applicantList.map(item => item.userId).includes(userId)).includes(item.userId)
      })
    },
    isWaitAllChecked() {
      return this.waitList.length > 0 && this.waitList.every(item => {
        return this.selectedApplicantList.filter(userId => this.applicantList.map(item => item.userId).includes(userId)).includes(item.userId)
      })
    },
    isDisabled() {
      return this.selectedApplicantList.length === 0 ||
        this.pushMessage.length === 0 ||
        this.applicantList.length === 0
    }
  },
  methods: {
    ...mapActions('storeSurvey', {
      closeAfterSchoolPopup: 'closeAfterSchoolPopup',
      sendPushMessageToAfterSchoolApplicant: 'sendPushMessageToAfterSchoolApplicant',
    }),
    checkTextLength(event) {
      if (event.target.value.length > event.target.maxLength) {
        event.target.value = event.target.value.slice(0, event.target.maxLength)
      }
      this.pushMessageLength = event.target.value.length
    },
    checkApplicant(event, status) {
      this[`${status.toLowerCase()}List`].forEach(applicant => {
        const targetCheckBox = document.getElementById(`${applicant.respondentId}`)

        if (event.target.checked) {
          targetCheckBox.checked = true
          this.selectedApplicantList.push(applicant.userId)
        } else {
          targetCheckBox.checked = false
          const deleteIdx = this.selectedApplicantList.findIndex(selectedUserId => selectedUserId === applicant.userId)
          this.selectedApplicantList.splice(deleteIdx, 1)
        }
      })
    },
    sendMessage() {
      if (this.pushMessage.length === 0) {
        return false
      }

      const requestBody = {
        userIds: this.selectedApplicantList,
        message: this.pushMessage
      }

      this.sendPushMessageToAfterSchoolApplicant(requestBody)
        .then(res => {
          this.$hiClass.alert('푸시 발송을 완료하였습니다.', 'success')
            .then(() => this.closeAfterSchoolPopup())
        })
        .catch(err => {
          this.$hiClass.alert('푸시 발송에 실패했습니다.', 'warning')
          this.$log.error(err)
        })
    }
  },
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')
    this.applicantList.forEach(applicant => {
      if (applicant.userType !== 'NONMEMBER') {
        this.selectedApplicantList.push(applicant.userId)
      }
    })
  },
  beforeDestroy() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  },
  $route() {
    this.closeAfterSchoolPopup()
  },
  watch: {
    applicantList: {
      handler: function (newVal) {
        newVal.forEach(applicant => {
          if (!this.selectedApplicantList.includes(applicant.userId) && applicant.userType !== 'NONMEMBER') {
            this.selectedApplicantList.push(applicant.userId)
          }
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.top-class {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  .group-checkbox{
    text-align: left;
    label {
      &:last-child {
        margin-left: 10px;
      }
    }
  }
  .filter-box {
    display: flex;
    align-items: center;
    gap: 16px;
     label {
      .select-txt {
        display: inline-block;
        font-size: 15px;
        font-weight: 700;
        line-height: 23px;
        color: #222;
      }
    }
    .hi-selectbox {
      width: 200px;
      margin-right: 0;
      &.is-opened {
        ::v-deep .selected {
          border-color: #4267B2;
        }
      }
      ::v-deep .selected {
        color: #222;
        padding-left: 10px;
      }
      ::v-deep .option__layer{
        width: 200px;
        right: 0;
        left:auto;
        .hi-btn.btn-link{
          font-size: 14px;
          font-weight: 600;
          padding: 10px 15px;          
        }
      }
      ::v-deep.is-active .selected {
        border: solid 1px var(--primary);
      }
      .hi-btn {
        &.btn-link {
          text-align: left;
          width: 100%;
        }
      }
    }
  }
}
.modal-respondent {
  .respondent__head {
    border-radius: 8px 8px 0 0;
  }
}
.remind-push__right {
  .remind-push__textarea {
    .heading {
      padding: 8px 20px;
    }
  }
}
</style>