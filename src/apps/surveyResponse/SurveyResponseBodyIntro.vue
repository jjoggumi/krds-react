<!--
@File(Method): SurveyResponseBodyIntro.vue
@Author: -
@Date Created: -
@Description: 클래스 > 수업관리 > 설문·투표 > 설문목록 > 설문하기 > 기본정보
@Modified: 2024-11-07 - #69524 설문 선착순/추첨 추가 : 선착순, 추첨 정보 / 버튼 추가 / 알림 추가
-->
<template>
  <div class="survey__content">
    <div class="column-content">
      <div class="survey-view__content all">
        <div class="survey-create__box">
          <div class="text-noticebox" v-if="isRejectable">
            <p>설문 대상이 아니거나 해당사항이 없는 경우 <strong>{{
                surveys.surveyType === 'AFTER_SCHOOL' || surveys.surveyType === 'CONSULTATION' ? '‘신청안함’' : '‘설문안함’'
              }}</strong>으로 제출 하실 수 있습니다.</p>
          </div>
          <div class="survey__info">
            <div class="info">
              <strong class="heading-term">설문기간</strong>
              <span>{{
                  `${timestampToDateTime(surveys.timestampStart)} ~ ${timestampToDateTime(surveys.timestampEnd)}`
                }}</span>
              <span v-if="isFcfs" class="capacity">
                <small class="pl-10 pr-10 txt-disabled-bg">|</small>
                <strong class="txt-gray">선착순</strong> :
                정원 {{ this.surveys.totalCount || 0 }} / {{ this.surveys.totalMax }}
                <span class="pl-10" v-if="this.surveys.waitMax">대기 {{ this.surveys.waitCount || 0 }} / {{ this.surveys.waitMax || 0 }}</span>
              </span>
            </div>
            <!-- #69524 설문 선착순/추첨 추가 : 선착순, 추첨 정보  미리보기 (다음주 아이콘 추가 예정)-->
            <div v-if="isFcfs" class="info capacity-app">
              <strong class="heading-capacity">선착순</strong>
              <span>정원 {{ this.surveys.totalCount || 0 }} / {{ this.surveys.totalMax }}  
                <span class="pl-10" v-if="this.surveys.waitMax">대기 {{ this.surveys.waitCount || 0 }} / {{ this.surveys.waitMax || 0 }}</span>
              </span>
            </div>            
            <div class="info">
              <strong class="heading-count">문항수</strong>
              <span>{{ `총 ${surveys.questionCount}문항` }}</span>
            </div>
          </div>
          <div class="survey__heading required">
            <strong class="heading">{{ surveys.surveyTitle }}</strong>
          </div>
          <div class="survey__desc" v-html=" surveys.surveyDescription">
          </div>
          <div class="survey__image">
            <div :class="imgClassName">
              <div class="image">
                <img v-if="hasFile" :src="surveyImage" alt="" @click="showOriginalImage">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="column-bottom">
      <div class="group-btn">
        <!--        거절가능한 설문이 진행중이거나 시뮬레이션 상태일때만 노출-->
        <button
          v-if="(isDoing || isSimulation) && isRejectable"
          class="hi-btn btn-lg btn-line"
          @click="onClickReject"
        >
          {{ surveys.surveyType === 'AFTER_SCHOOL' || surveys.surveyType === 'CONSULTATION' ? '신청안함' : '설문안함' }}
        </button>
        <!--        설문이 진행중이 아닌 실제응답일때만 disabled-->
        <button
          v-if="!isFcfs"
          class="hi-btn btn-lg"
          :class="surveys.surveyType === 'AFTER_SCHOOL' || surveys.surveyType === 'CONSULTATION' ? 'btn-add-desc' : ''"
          :disabled="isStartButtonDisabled"
          @click="onClickStartResponse"
        >
          {{ btnTitle }}
        </button>
        <template v-if="isFcfs">
          <template v-if="(isDoing || isSimulation)">
            <HiButton
              v-if="(this.surveys.totalCount || 0) < (this.surveys.totalMax || 0)"
              color="primary" size="lg"
              @click="onClickStartResponse">
              신청하기
            </HiButton>
            <HiButton
              v-else-if="(this.surveys.waitCount || 0) < (this.surveys.waitMax || 0)"
              color="light-primary" size="lg" outline class="btn-line-lgray"
              @click="onClickStartResponse">
              대기신청
            </HiButton>
            <HiButton v-else size="lg" disabled>
              마감
            </HiButton>
          </template>
          <template v-if="isWaiting && !isSimulation">
            <HiButton size="lg" disabled>
              {{ formatedTimestampStart }}부터 가능
            </HiButton>
          </template>
          <template v-if="isReservation && !isSimulation">
            <HiButton size="lg" disabled>
              설문기간이 아닙니다.
            </HiButton>
          </template>
          <template v-if="isEnd">
            <HiButton size="lg" disabled>
              종료된 설문입니다.
            </HiButton>
          </template>
        </template>
        <p class="desc"
           v-if="isEnd && !isSimulation
               &&(surveys.surveyType === 'AFTER_SCHOOL' || surveys.surveyType === 'CONSULTATION')">
          종료된 설문으로 신청내역 조회만 가능합니다.
        </p>
      </div>
    </div>
  </div>

</template>

<script>
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import {isEmpty} from "lodash";
import HiButton from '@/components/Button/HiButton.vue';

export default {
  name: "survey-response-body-intro",  
  components: {HiButton},
  computed: {
    ...mapState('storeSurvey', ['surveys', 'isSimulation']),
    isFcfs() { return this.surveys.surveyType === 'FCFS' },
    isDraw() { return this.surveys.surveyType === 'DRAW' },
    getSurveys() {
      return this.$store.state.storeSurvey.surveys
    },
    getSurveyContents() {
      return this.$store.state.storeSurvey.surveyContents
    },
    isRejectable() {
      return this.surveys.isRejectable
    },
    surveyStatus() {
      return this.surveys.surveyStatus
    },
    isWaiting() {
      return this.surveyStatus === 'WAITING'
    },
    isReservation() {
      return this.surveyStatus === 'RESERVATION'
    },
    isDoing() {
      return this.surveyStatus === 'DOING'
    },
    isEnd() {
      return this.surveyStatus === 'END'
    },
    isStartButtonDisabled() {
      if(['AFTER_SCHOOL', 'CONSULTATION'].includes(this.surveys.surveyType)) {
        return !this.isSimulation && (this.isWaiting || this.isReservation)
      }
      return !this.isDoing && !this.isSimulation
    },
    btnTitle() {
      if (this.isPreview || this.isSimulation) {
        return ['AFTER_SCHOOL', 'CONSULTATION', 'FCFS', 'DRAW'].includes(this.surveys.surveyType) ? '신청하기' : '설문하기'
      }
      switch (this.surveyStatus) {
        case 'WAITING': {
          const dateFormat = this.$moment(this.surveys.timestampStart).format('MM월 DD일 HH:mm분')
          return `${dateFormat}부터 가능`
        }
        // RESERVATION: 실제로는 게시 예약상태이므로 사용자에게는 발행이 안된 상태
        case 'RESERVATION':
          return '설문기간이 아닙니다.'
        case 'DOING':
        return ['AFTER_SCHOOL', 'CONSULTATION', 'FCFS', 'DRAW'].includes(this.surveys.surveyType) ? '신청하기' : '설문하기'
        case 'END':
          return this.surveys.surveyType === 'AFTER_SCHOOL' || this.surveys.surveyType === 'CONSULTATION' ? '신청내역 조회' : '종료된 설문입니다.'
        default:
          return ''
      }
    },
    hasFile() {
      return this.surveys.files ? this.surveys.files.length > 0 : false
    },
    surveyImage() {
      return this.hasFile ? this.surveys.files[0].fileOriginalPath : ''
    },
    isPreview() {
      return this.$route.query.preview === 'true'
    },
    /**
     * 설문 URL 로 설문 시작
     * @returns {boolean}
     */
    isEnteringBySurveyUrl() {
      const metaClass = this.$route.meta.class || []
      return metaClass.includes('response-type-external')
    },
    formatedTimestampStart() {
      return this.$moment(this.surveys.timestampStart).format('MM월 DD일 HH:mm분')
    },
  },
  data() {
    return {
      imgClassName: 'alignbox'
    }
  },
  mounted() {
    if (!isEmpty(this.surveys.files) && this.surveys.files[0].fileAlign) {
      this.imgClassName = `alignbox ${this.surveys.files[0].fileAlign.toLowerCase()}`
    }
    //todo: 방과후신청시 설문하기 버튼 신청하기로 변경
    if (!this.isEnteringBySurveyUrl) {
      this.checkIsSimulation(this.isSimulation || this.isPreview)
    }
    if (!this.isSimulation) { // 실제 응답일때
      if (this.$store.state.storeSurvey.surveys.respondentId && this.$route.query.isAlarmPush) { // 알림함에서 설문진입시
        const routeObj = {
          path: this.$route.path
        }
        routeObj.query = {respondentId: this.$store.state.storeSurvey.surveys.respondentId}
        this.$router.replace(routeObj, () => {
        })
      }
      this.setPage()
      this.setRespondentId(this.$route.query.respondentId)
    }
  },
  methods: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
    }),
    ...mapActions({
      openAttachFilesViewer: 'openAttachFilesViewer'
    }),
    ...mapActions('storeSurvey', {
      checkIsSimulation: 'checkIsSimulation',
      clickSurveyStartBtn: 'clickSurveyStartBtn',
      clickSurveyRejectBtn: 'clickSurveyRejectBtn',
      setReadUser: 'setReadUser',
      setReadCount: 'setReadCount',
      initSurveyResponse: 'initSurveyResponse',
      doSubmitAnswer: 'doSubmitAnswer',
      goRouteSurveyList: 'goRouteSurveyList'
    }),
    ...mapMutations('storeSurvey', {
      setRespondentId: 'setRespondentId',
      setAppView: 'setAppView'
    }),
    setPage() {
      //삭제된 설문인지 확인 getSurvey에 isDel 넘어오기로 함
      if (this.getSurveys.isDel) {
        this.$hiClass.alert('삭제되거나 유효하지 않은 설문입니다.', 'warning')
          .then(() => this.$router.go(-1))
      } else if (this.isEnteringBySurveyUrl && !this.getSurveys.isUsedUrl) {
        // 1. 설문 URL 로 접근했지만 isUsedUrl 값이 false 인 경우
        // 2. alert 노출 후 하이클래스 메인으로 이동
        this.$hiClass.alert('삭제되거나 유효하지 않은 설문입니다.', 'warning')
          .then(() => this.$router.push('/main', () => {
          }))
      } else if (!this.isEnteringBySurveyUrl) {
        //설문 대상자이거나 관리자인지 확인
        // this.doSubmitAnswer()
        if (this.onCheckQualification()) {
          //설문 상태(진행, 종료) 확인
          if (this.getSurveys.answerStatus === this.CONSTANTS().ANSWER_STATUS.COMPLETE) {
            this.doSubmitAnswer()
          } else {
            // 설문 읽음처리 최초 1번
            if (!this.getSurveys.isRead) {
              this.setReadUser(this.getSurveys.surveyId)
            }
            // 설문 조회수 증가
            this.setReadCount(this.getSurveys.surveyId)
          }
        } else if (!this.getSurveys.isUsedUrl) {
          this.$hiClass.alert('설문 대상자가 아닙니다.', 'warning')
            .then(() => this.$router.go(-1))
        }
      }
    },
    onClickReject() {
      this.clickSurveyRejectBtn()
      // if(this.isSimulation){
      //   if(this.$store.state.storeSurvey.appView){
      //     this.initSurveyResponse()
      //     this.setAppView()
      //   } else {
      //     this.goRouteSurveyList()
      //   }
      //
      // } else {
      //   this.clickSurveyRejectBtn()
      // }
    },
    onCheckQualification() {
      return this.getSurveys.isTarget || this.getSurveys.clazz.memberRole === 'OWNER' || this.getSurveys.clazz.memberRole === 'MANAGER'
    },
    timestampToDateTime(timestamp) {
      return this.$moment(timestamp).format('yy.MM.DD HH:mm')
    },
    showOriginalImage() {
      const payload = {
        items: {fileItem: this.surveys.files[0]},
        contentType: this.surveys.files[0].fileContentType
      }

      this.openAttachFilesViewer(payload)
    },
    onClickStartResponse() {
      if(!this.isStartButtonDisabled) {
        this.clickSurveyStartBtn(this.isEnteringBySurveyUrl)
      }
    },
    
    // #69524 설문 선착순/추첨 추가 : 알림 추가
    noti(){
      this.$hiClass.alert('선착순 마감되었습니다. <br> 다시 확인해 주세요.', 'warning')
      .then(() => {
        console.log("확인");
      })
    }
  }
}
</script>

<style scoped>

</style>