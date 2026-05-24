<template>
  <div
    v-if="!addStudentTermsPop.isSkip"
    class="modal normal-modal confirm-add-student-modal"
    :style="{
      display: 'block'
    }"
  >
    <div class="modal-cont-wrap" ref="modal" :style="modalStyleObj">
      >
      <div class="modal-cont boundary-box">
        <div class="modal-cont-inner">
          <div class="modal-title-wrap">
            <div class="title">
              '임시 학생 계정 생성'을 위한 동의 사항 <br>
            </div>
            <div class="download01">
              <p>
                1. 선생님 회원이 직접 '만 14세 미만' 학생의 임시 계정을 생성할
                때 <br>
                해당 학생의 '법정 대리인(보호자)'의 동의가 필요합니다.
              </p>
              <p class="mb-20">
                <a
                  href="javascript:void(0)"
                  class="tit-btn underline"
                  @click="
                  $comn.download(
                    $store.state.childPrivacyDoc,
                    '하이클래스_만 14세 미만 아동의 개인정보 수집·이용에 관한 법정대리인 동의서.hwp'
                  )
                  "
                >
                만 14세 미만 아동의 개인정보 수집·이용에 관한 법정대리인 동의서
                </a>
              </p>
              <p>
                2. 따라서 학생 계정 생성 시 선생님 회원이 각 학생의 ‘법정
                대리인(보호자)’으로부터<br>
                서비스 이용 동의를 받은 것으로 간주하며, 하이클래스에서는 학생
                회원의<br>
                개인 정보 및 서비스 동의를 별도로 받지 않습니다. <br>
                해당 학생의 '법정 대리인(보호자)'의 동의가 필요합니다.
              </p>
              <p>
                <a
                  href="javascript:void(0)"
                  class="tit-btn underline"
                  @click="openTermsView({ layerType: 'termsByUnderAge' })"
                >
                  [임시 학생 계정 생성을 위한 만 14세 미만 서비스 이용약관]</a
                >에 동의하며,<br>
                학생을 추가하시겠습니까?
              </p>
            </div>
          </div>
          <div class="btn-wrap">
            <div class="btn-group">
              <HiButton color="line-light-primary" size="md" @click="hideAddStudent">
                취소
              </HiButton>
              <HiButton
                color="primary" size="md" 
                @click="setTempStudentConsent()"
              >
                네, 동의합니다
              </HiButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapActions} from "vuex";

export default {
  name: 'main-body-clazzes-body-member-body-student-add-student-terms',
  props: {
    addStudentTermsPop: Object,
    clazzId: String,
    addType: String
  },
  data: () => ({
    m_height: 0,
    m_width: 0,
    isBusy: false,
  }),
  components: {},
  computed: {
    modalStyleObj() {
      return {
        'margin-top': -this.m_height + 'px',
        'margin-left': -this.m_width + 'px'
      }
    },
    userUrl() {
      return this.$store.state.user._links.self.href
    }
  },
  methods: {
    ...mapActions({
      openTermsView: "openTermsView"
    }),
    hideAddStudent() {
      this.addStudentTermsPop.isShow = false
    },
    onClickConfirm() {
      this.addStudentTermsPop.isSkip = true
      this.hideAddStudent()
      this.$emit('openAddStudent', this.addType)
    },
    setOnceChecks(flag) {
      if (!this.isBusy) {
        this.isBusy = true
        if (this.userUrl === undefined) {
          this.isBusy = false
          return false
        }

        this.$hiClass.onceChecks
          .search({
            _user: this.userUrl,
            _flag: flag
          })
          .then(result => {
            this.$log.debug(
              this.$options.name + ' setOnceChecks() result : ',
              result
            )

            if (result.data.page.totalElements === 0) {
              // post onceChecks
              this.$hiClass.onceChecks
                .create({
                  user: this.userUrl,
                  flag: flag
                })
                .then(result => {
                  this.$log.debug(
                    this.$options.name + ' postOnceChecks() result : ',
                    result
                  )
                  // 학생 계정 생성 이용약관 승인 토스트 메시지
                  let toDay = this.$moment().format('YYYY.MM.DD')
                  this.$toasted.show(
                    `${toDay} 임시 학생 계정 생성을 위한 만 14세 미만 서비스 이용약관에 동의하셨습니다`
                  )
                })
                .catch(error => {
                  this.$log.debug(
                    this.$options.name + ' postOnceChecks() error : ',
                    error
                  )
                })
                .finally(() => {
                  this.onClickConfirm()
                  this.isBusy = false
                })
              // end post onceChecks
            } else {
              this.onClickConfirm()
              this.isBusy = false
            }
          })
          .catch(error => {
            this.$log.debug(
              this.$options.name + ' setOnceChecks() error : ',
              error
            )
            this.onClickConfirm()
            this.isBusy = false
          })
      }
    },
    async setTempStudentConsent() {
      const requestItem = {
        consentType: 'tempStudent',
        classId: this.clazzId,
        userId: this.$store.state.user.currentId
      }

      try {
        const res = await this.$axios({
          method: 'POST',
          url: `/clazzes/${this.clazzId}/consents`,
          data: requestItem
        })

        // 학생 계정 생성 이용약관 승인 토스트 메시지
        let toDay = this.$moment().format('YYYY.MM.DD')
        this.$toasted.show(`${toDay} 임시 학생 계정 생성을 위한 만 14세 미만 서비스 이용약관에 동의하셨습니다`)
        this.onClickConfirm()
      } catch (e) {
        this.$log.debug(this.$options.name + ' setTempStudentConsent() error : ', e)
      }
    }
  },
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')

    const modal = this.$refs.modal
    const positionObj = this.$comn.getModalPosition(modal)
    this.m_height = positionObj.m_height
    this.m_width = positionObj.m_width
  },
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  }
}
</script>

<style lang="scss" scoped>
.confirm-add-student-modal{
  .title {line-height:23px;}
  .btn-wrap {margin:35px 0 0 0;padding:0 0 36px 0;
    button {width:180px;margin:0 4px;} 
  }
  a{
    font-size: 18px !important;
    letter-spacing: -1px;
    color: #3867c6;
    text-decoration: underline;
  }
}
</style>