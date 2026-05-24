<!--
@File(Method): MainBodyClazzesBodyInvite.vue
@Author: -
@Date Created: -
@Description: 클래스 > 초대하기
@Modified: 2025-01-03 - #70726 클래스 개설시 팝업에 다국어 설치 안내문 추가
-->
<template>
  <div v-if="clazzes.currentId" class="school-class-cont-left-wrap">
    <div class="page-sub-heading">
      <h3 class="heading">초대하기</h3>
    </div>

    <div class="member-code-invite-wrap boundary-box-2">
      <span class="invite-info">클래스 구성원에게 초대코드를 보내주세요.<br>가입 승인 없이 클래스에 바로 가입할 수 있습니다.</span>
      <div class="code-container">
        <div class="code-expired">

          <div class="code" v-if="clazzesData.classInviteCode">{{ clazzesData.classInviteCode }}</div>
          <div class="expired-msg" v-else>초대코드가 만료되었습니다.<br>다시 재발급해주세요.</div>

          <template v-if="clazzesData.classInviteCode && clazzesData.classInviteCodeValidTimestamp">
            <span class="expired-period">
              유효기간: {{ `${$moment(clazzesData.classInviteCodeValidTimestamp).format('YYYY년 MM월 DD일')}` }}까지
            </span>
            <i class="expired-info-tooltip"></i>
            <div class="expired-tooltip-msg">
              <span>초대코드는 발급일로부터 30일간 유효하며 이후 만료됩니다.<br>만료 후 선생님께서 직접 재발급 하셔야 합니다.</span>
            </div>
          </template>

        </div>
        <button class="btn-code-again-2" @click="inviteCodeRefresh">
          <span class="code-refresh">초대코드 다시 받기</span>
        </button>
      </div>
      <div class="btn-wrap">
        <HiButton color="primary" size="md"
          @click="
            triggerAnalyticsLogEvent({ code: 'analytics.class.click.button.invite.sendMessage' });
            toggle('freeSendSms')
          "
        >
          무료 문자로 초대장 보내기
        </HiButton>
        <HiButton color="light-primary" size="md" outline
          @click="
            triggerAnalyticsLogEvent({ code: 'analytics.class.click.button.invite.print' });
            toggle('invitePrint')
          "
        >
          초대장 인쇄하기
        </HiButton>
        <HiButton color="light-primary" size="md" outline
          @click="
            triggerAnalyticsLogEvent({ code: 'analytics.class.click.button.invite.linkCopy' });
            toggle('inviteCodeToast')
          "
        >
          초대장 링크 복사
        </HiButton>
      </div>
      <div
        class="toast-popup copy-invite-code-toast"
        v-if="isInviteCodeToastShow"
      >
        {{ toastMessage }}
      </div>
    </div>

    <!-- 무료 문자 보내기 -->
    <MainBodyClazzesBodyInviteFreeSms
      v-if="isFreeSendSmsShow"
      :clazzes="clazzesData"
      @showToastMessage="showToastMessage"
      @is-close="close"
    ></MainBodyClazzesBodyInviteFreeSms>
    <!-- // 무료 문자 보내기 -->

    <!-- 초대장 인쇄 -->
    <MainBodyClazzesBodyInvitePrintInvitation
      v-if="isInvitePrintShow"
      ref="print"
      :clazzes="clazzesData"
      :isInvitePrintShow="isInvitePrintShow"
    ></MainBodyClazzesBodyInvitePrintInvitation>
    <!-- // 초대장 인쇄 -->
  </div>
</template>

<script>
import MainBodyClazzesBodyInviteFreeSms from './MainBodyClazzesBodyInviteFreeSms.vue'
import MainBodyClazzesBodyInvitePrintInvitation from './MainBodyClazzesBodyInvitePrintInvitation.vue'
import {mapActions} from "vuex";
import {timestampToDateTime} from "@/plugins/utils";

export default {
  name: 'MainBodyClazzesBodyInvite',
  props: {
    clazzes: {
      type: Object
    },
    isManager: {
      type: Boolean
    },
  },
  data: () => ({
    isFreeSendSmsShow: false,
    isInvitePrintShow: false,
    isInviteCodeToastShow: false,
    isShowClassInviteCode: true,
    classInviteCode: '',
    inviteMessage: '',
    toastMessage: '',
    clazzesData: {},
    isInviteCodeRefresh: false
  }),
  components: {
    MainBodyClazzesBodyInviteFreeSms,
    MainBodyClazzesBodyInvitePrintInvitation
  },
  computed: {
    schoolName() {
      return this.clazzes.school ? this.clazzes.school.schoolName : ''
    }
  },
  watch: {
    schoolName: function(value) {
      if (value !== undefined) this.init()
    },
    $route() {
      this.checkQueryPrint()
    }
  },
  beforeMount() {
    this.checkClassMenuEntryPermission({
      isManager: this.isManager
    })
  },
  mounted() {
    this.init()
  },
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    ...mapActions('storeBoard', {
      checkClassMenuEntryPermission: 'checkClassMenuEntryPermission',
    }),
    init() {
      if (this.clazzes.currentId) {
        this.$hiClass.clazzes
          .read(`/clazzes/${this.clazzes.currentId}`)
          .then(res => {
            this.clazzesData = res.data
            this.$nextTick(() => {
              let classGrade = ''
              if (this.clazzesData.classGrade !== 'ANY')
                classGrade = this.clazzesData.classGrade + '학년 '

              this.inviteMessage =
                this.schoolName +
                ' ' +
                classGrade +
                this.clazzesData.classBan +
                '(로)으로 초대합니다.\n'
              this.inviteMessage += '초대코드를 입력하여 바로 가입하세요!\n'
              this.inviteMessage +=
                '초대코드 : ' + this.clazzesData.classInviteCode + '\n'
              this.inviteMessage +=
                '링크 : ' +
                process.env.VUE_APP_BASE_UI_URI +
                '/mobile/invite/clazzInviteCard?classId=' +
                this.clazzesData.currentId +
                  '&inviteCode=' +
                  this.clazzesData.classInviteCode
            })
            this.checkQueryPrint()
          })
          .catch(err => {
            this.$log.debug(this.$options.name, ' init() error => ', err)
          })
      }
    },
    initRefreshCode(data) {
      this.clazzesData = data
      this.clazzes.classInviteCode = data.classInviteCode

      let classGrade = ''
      if (this.clazzesData.classGrade !== 'ANY')
        classGrade = this.clazzesData.classGrade + '학년 '

      this.inviteMessage =
        this.schoolName +
        ' ' +
        classGrade +
        this.clazzesData.classBan +
        '(로)으로 초대합니다.\n'
      this.inviteMessage += '초대코드를 입력하여 바로 가입하세요!\n'
      this.inviteMessage +=
        '초대코드 : ' + this.clazzesData.classInviteCode + '\n'
      this.inviteMessage +=
        '링크 : ' +
        process.env.VUE_APP_BASE_UI_URI +
        '/mobile/invite/clazzInviteCard?classId=' +
        this.clazzesData.currentId +
          '&inviteCode=' +
          this.clazzesData.classInviteCode
    },
    toggle(el) {
      if(!this.clazzesData.classInviteCode) {
        this.$hiClass.alert('초대코드가 만료되었습니다. 다시 재발급해주세요.', 'info')
        return
      }
      if (el === 'freeSendSms') this.isFreeSendSmsShow = !this.isFreeSendSmsShow
      else if (el === 'invitePrint')
        this.isInvitePrintShow = !this.isInvitePrintShow
      else if (el === 'inviteCodeToast') this.onCopyMsg()
    },
    close(el) {
      if (el === 'freeSendSms') this.isFreeSendSmsShow = false
      else if (el === 'invitePrint') this.isInvitePrintShow = false
    },
    showToastMessage(msg) {
      this.toastMessage = msg
      this.isInviteCodeToastShow = true
      setTimeout(() => {
        this.isInviteCodeToastShow = false
      }, 3000)
    },
    onCopyMsg() {
      this.copyToClipboard()
      this.showToastMessage('초대문구가 복사되었습니다.')
    },
    copyToClipboard() {
      var dummy = document.createElement('textarea')
      document.body.appendChild(dummy)
      dummy.value = this.inviteMessage
      dummy.select()
      document.execCommand('copy')
      document.body.removeChild(dummy)
    },
    inviteCodeRefresh() {
      if (this.clazzesData.classInviteCode !== undefined) {
        if (this.clazzesData.classInviteCode) {
          if (
            !confirm('새 초대코드를 받으시면 이전에 사용하던 초대코드는 사용하실 수 없습니다.\n계속 진행하시겠습니까?\n\n※ 초대 코드를 다시 받기 시, 기존 구성원에게는 영향이 없습니다.')
          ) {
            return false
          }
          this.refreshCode()
        } else {
          this.refreshCode()
        }
      } else {
        alert('이전 초대코드를 정상적으로 가져오지 못했습니다.\n페이지를 새로고침 합니다.')
        this.$router.go(0)
      }
    },
    refreshCode() {
      if (this.isInviteCodeRefresh) return

      this.isInviteCodeRefresh = true
      const oldInviteCode = this.clazzesData.classInviteCode
      const clazzUuid = this.clazzesData.currentId
      const requestBody = { classInviteCode: 'INVITE' }

      this.isShowClassInviteCode = false
      this.$hiClass.clazzes.update(requestBody, `/clazzes/${clazzUuid}`)
          .then(result => {
            this.$log.debug(
                this.$options.name + ' inviteCodeRefresh() result: ',
                result
            )
            // this.clazzesData.classInviteCode = result.data.classInviteCode
            this.isShowClassInviteCode = true
            // this.init()
            this.initRefreshCode(result.data)
          })
          .catch(error => {
            this.$log.debug(
                this.$options.name + ' inviteCodeRefresh() error: ',
                error
            )
            this.clazzesData.classInviteCode = oldInviteCode
            this.isShowClassInviteCode = true
          })
          .finally(() => this.isInviteCodeRefresh = false)
    },
    checkQueryPrint() {
      const print = this.$route.query.print
      if (print !== undefined && print === 'show' && this.isInviteCodeRefresh === false) this.isInvitePrintShow = true
    }
  },
}
</script>

<style>
.copy-invite-code-toast {
  display: block;
}

.member-code-invite-wrap .code {
  height: 34px;
  position: relative;
}

.expired {
  font-size: 16px;
  font-weight: 500;
  color: #a0a0a0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.member-code-invite-wrap {padding:40px 26px;text-align:center;border: 1px solid #e0e0e0;}
.member-code-invite-wrap:not(.boundary-box-2) {padding:40px 0 40px 0;text-align:center;border: 1px solid #e0e0e0;}
.member-code-invite-wrap p {line-height: 1.3;font-size: 16px;color: #2e2e2e;}
.member-code-invite-wrap:not(.boundary-box-2) .code {margin:30px 0 0 0;font-size: 34px;font-weight:500;}
.member-code-invite-wrap .invite-info {
    color: #222;
    display: block;
    text-align: center;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 24px;
    letter-spacing: -0.2px;
    margin-bottom: 20px;
}

.member-code-invite-wrap .btn-wrap {margin:30px 0 0 0;}
.member-code-invite-wrap:not(.boundary-box-2) .btn-wrap {margin:48px 0 0 0;}
.member-code-invite-wrap .btn-wrap button {display:block;width:248px;margin:0 auto;}
.member-code-invite-wrap .btn-wrap button.btn-line-light-primary {color: var(--primary);}
.member-code-invite-wrap .btn-wrap button + button {margin-top:8px;}
.member-code-invite-wrap .code-container {
    width: 100%;
    height: auto;
    display: inline-flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    background: #FAFAFA;
    padding: 30px 0;
}
.member-code-invite-wrap .code-container .code-expired {
    margin-bottom: 18px;
}
.member-code-invite-wrap .code-container .code-expired .code {
    color: #2B509B;
    text-align: center;
    font-size: 40px;
    font-style: normal;
    font-weight: 500;
    line-height: 40px;
    letter-spacing: -0.2px;
    margin-bottom: 10px;
}
.member-code-invite-wrap .code-container .code-expired .expired-period {
    color: #9E9E9E;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 21px; 
    letter-spacing: -0.2px;
    margin-right: 10px;
}
.member-code-invite-wrap .code-container .code-expired .expired-info-tooltip {
    margin: 3px 0 0 -5px;
    width: 16px;
    height: 16px;
    position: absolute;
    display: inline-block;
    content: url(~@/assets/img/icon/ic_info_grey.svg);
}
.member-code-invite-wrap .code-container .code-expired .expired-info-tooltip:hover {
    content: url(~@/assets/img/icon/ic_info_dark_grey.svg);
}
.member-code-invite-wrap .code-container .code-expired .expired-tooltip-msg {
    display: none;
    position: absolute;
    width: 344px;
    height: 56px;
    border-radius: 4px;
    background: url(~@/assets/img/invite_code_info_tooltip_box.svg);
    padding: 10px 15px;
    right: 205px;
    z-index: 1;
}
.member-code-invite-wrap .code-container .code-expired .expired-tooltip-msg span{
    color: #FFF;
    font-size: 13px;
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
    letter-spacing: -0.2px;
}
.member-code-invite-wrap .code-container .code-expired .expired-info-tooltip:hover ~ .expired-tooltip-msg {
    display: block;
}
.member-code-invite-wrap .code-container .code-expired .expired-msg {
    color: #9E9E9E;
    text-align: center;
    font-size: 18px;
    font-style: normal;
    font-weight: 500;
    line-height: 27px; 
    letter-spacing: -0.2px;
} 

.btn-code-again-2 {
    width: 160px;
    padding: 8.5px 16px;
    border-radius: 4px;
    border: 1px solid #D6D6D6;
    background: url(~@/assets/img/btn-refresh.png) no-repeat 14px 12px #FFF;
}
.btn-code-again-2 .code-refresh {
    color: #222;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 21px;
    letter-spacing: -0.2px;
    padding-left: 16px;
    margin-top: -1px;
    display: block;
}

</style>


