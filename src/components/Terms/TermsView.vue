<template>
  <div class="modal normal-modal safety-num-modal">
    <div v-click-outside="close">
      <div :class="['modal-cont-wrap', 'modal-agree', modalClass]">
        <div class="modal-cont boundary-box privacy-modal">
          <div class="modal-cont-inner">
            <div class="modal-title-wrap">
              <div class="title" v-html="title"></div>
            </div>

            <div v-html="parsingContent" @click="handleClick($event);" class="gray-box02 white"></div>
            
            <!-- mobile에서만 보임 -->
            <HiButton class="back-btn" color="link" size="lg" @click="close">
              <HiIcon name="ico-prev" color="black" size="20" />
            </HiButton>

            <!-- pc에서만 보임 -->
            <HiButton class="close-btn" color="link" size="lg" @click="close">
              <HiIcon name="ico-close" color="black" size="24"/>
            </HiButton>
          </div>
        </div>
      </div>

      <TermsDetailModal v-if="isShowDetail" :targetMonth="targetMonth" @close="isShowDetail = false"/>
    </div>
  </div>
</template>

<script>
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import TermsDetailModal from "@/components/Terms/TermsDetailModal.vue";
import HiButton from "../Button/HiButton.vue";

export default {
  name: 'terms-view',
  components: {TermsDetailModal},
  props: {
    layerType: String,
    userType: { type: String, required: false},
    modalClass: { type: String, required: false },
    modalWidth: { type: [String, Number], required: false }
  },
  data: () => ({
    title: '',
    top: '',
    contents: [],
    parsingContent: '',
    parsingDetailContent: '',
    isShowDetail: false,
    targetMonth: ''
  }),
  computed: {
    ...mapState({
      termsRecord: 'termsRecord'
    }),
    ...mapGetters(['getRecentPrivacyRecord', 'getRecentPrivacyUseDetailRecord']),
    currentPrivacyIndex() {
      return this.termsRecord.currentPrivacyIndex
    }
    ,
    computedModalStyle() {
      if (!this.modalWidth) return null
      const value = typeof this.modalWidth === 'number' ? `${this.modalWidth}px` : this.modalWidth
      return { maxWidth: value }
    }
  },
  created() {
    this.$terms.getTermsRecord().then(res => {
      this.setTermsRecord(res.data.termsRecord)
      this.setTerms(this.layerType)
    })
  },
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')
  },
  destroyed() {
    // 참고:
    // $hiClass.toggleBodyClass('remove','hidden')는 특정 경로(예: '/main/alarmplus')에서 guard가 걸려서
    // 모달이 닫혀도 hidden 클래스가 제거되지 않을 수 있습니다.
    // 원래 호출은 유지하고, 모달이 모두 사라진 경우에만 강제로 hidden 클래스를 제거합니다.
    this.$hiClass.toggleBodyClass('remove', 'hidden')

    setTimeout(() => {
      const hasAnyModal = document.getElementsByClassName('modal').length > 0
      if (!hasAnyModal) {
        document.body.classList.remove('hidden')
      }
    }, 0)
  },
  methods: {
    ...mapMutations({
      setTermsRecord: 'setTermsRecord',
      setInitCurrentPrivacyIndex: "setInitCurrentPrivacyIndex",
      setTermsPrevPrivacyIndex: "setTermsPrevPrivacyIndex"
    }),
    ...mapActions({
      closeTermsView: "closeTermsView"
    }),
    async handleClick(e) {
      const handleImages = [ 'a' ]
      const selector = handleImages.join(',')
      if (e.target.matches(selector)) {
        switch (e.target.id) {
          case 'go-to-privacy': {
            e.preventDefault()
            e.stopPropagation()
            this.setTerms('privacyPolicy')
            break
          }
          case 'go-to-old-privacy': {
            e.preventDefault()
            e.stopPropagation()
            this.setTerms('prevPrivacy')
            break
          }
          case 'go-terms-use-detail': {
            e.preventDefault()
            e.stopPropagation()
            // 항상 최신 약관을 보여줌
            this.targetMonth = this.termsRecord.privacyUseDetailRecord[this.termsRecord.privacyUseDetailRecord.length - 1].toString()
            this.isShowDetail = true
          }
        }
      }
    },
    close(e) {
      if (e && e.target) {
        if (
          e.target.className.includes('detail-modal-close-btn') ||
          e.target.className.includes('btn-prev') ||
          e.target.className.includes('btn-next')
        ) return
      }

      this.closeTermsView()
      this.$emit('closeLayer')

      // 일부 경로(예: alarmplus)에서는 $hiClass.toggleBodyClass('remove','hidden')가 guard로 인해 동작하지 않을 수 있습니다.
      // 모달이 닫힌 후 body의 hidden 잠금이 꼭 해제되도록 처리합니다.
      const tryRemoveHidden = () => {
        const hasAnyModal = document.getElementsByClassName('modal').length > 0
        if (!hasAnyModal) {
          document.body.classList.remove('hidden')
        }
      }
      setTimeout(tryRemoveHidden, 0)
      setTimeout(tryRemoveHidden, 50)
    },
    async setTerms(str) {
      if (str === 'terms' || str === 'serviceRecord') {
        this.top = ''
        this.$terms.getService().then(res => {
          this.title = '서비스 이용약관'
          this.parsingContent = this.$terms.parsingHtml(res.data)
        }).catch(err => {
          this.$log.warn(`service load error `, err)
        })

      } else if (str === 'collectionPersonalInfoPreview') {
        try {
          const res = ['TEACHER', 'PARENTS', 'STUDENT'].includes(this.userType) ?
              await this.$terms.getPrivacyPreviewByUserType(this.userType) :
              await this.$terms.getPrivacyPreview()
          this.title = '개인정보 수집 및 이용 동의'
          this.parsingContent = this.$terms.parsingHtml(res.data)
        } catch (err) {
          this.$log.warn(`privacy preview load error `, err)
        }

      } else if (str === 'privacyPolicy' || str === 'collectionPersonalInfo' || str === 'privacyRecord') {
        this.setInitCurrentPrivacyIndex()
        const currentRecord = this.getRecentPrivacyRecord
        this.$terms.getPrivacy(currentRecord).then(res => {
          this.title = '개인정보 처리 방침(필수)'
          this.parsingContent = this.$terms.parsingHtml(res.data)
        })
      } else if (str === 'medicationRecord') {
        this.setInitCurrentPrivacyIndex()
        this.$terms.getSensitive('medication').then(res => {
          this.title = '민감정보 수집 및 이용 동의'
          this.parsingContent = this.$terms.parsingHtml(res.data)
        })
      } else if (str === 'allergyRecord') {
        this.setInitCurrentPrivacyIndex()
        this.$terms.getSensitive('allergy').then(res => {
          this.title = '민감정보 수집 및 이용 동의'
          this.parsingContent = this.$terms.parsingHtml(res.data)
        })
      } else if (str === 'prevPrivacy') {
        this.setTermsPrevPrivacyIndex()
        let oldRecordDate = this.termsRecord.privacyRecord[this.currentPrivacyIndex]
        this.$terms.getPrivacy(oldRecordDate).then(res => {
          this.parsingContent = ''
          setTimeout(() => {
            this.title = '개인정보 처리 방침(필수)'
            this.parsingContent = this.$terms.parsingHtml(res.data)
          }, 50)
        })

      } else if (str === 'textPolicy') {
        const currentIndex = this.termsRecord.textRecord.length - 1
        const recentRecord = this.termsRecord.textRecord[currentIndex]
        this.$terms.getTextPolicy(recentRecord).then(res => {
          this.title = '하이클래스 문자 서비스 이용 약관(필수)'
          this.parsingContent = this.$terms.parsingHtml(res.data)
        })

      } else if (str === 'termsByUnderAge') {
        this.title = `하이클래스 임시 학생 계정 생성을 위한 <br/>만 14세 미만 서비스 이용 약관`
        this.top = ''
        const data = `
            <p>본 학급에선 원활한 학급 운영을 위해 하이클래스 임시학생 계정 생성을 통한 하이클래스 서비스를 이용하고자 합니다. <br/> <br/>
                                하이클래스는 학급 알림장, 학교 가정통신문, 교육정보 등 다양한 정보를 제공하며 선생님, 학생, 학부모의 소통을 돕는 서비스입니다.
                            </p>
                            <p class="mt-10">
                                해당 서비스 이용에 동의는 필수 사항이 아니므로 개인정보 수집,이용,제공을 원하지 않으시는 경우 동의하지 않으실 수 있습니다.
                            </p>
                            <p class="mt-20">1. 개인정보 수집·이용 목적</p>
                            <table>
                                <colgroup>
                                    <col width="40%">
                                    <col width="60%">
                                </colgroup>
                                <tr>
                                    <th scope="col">구분</th>
                                    <th scope="col">수집 및 이용 목적</th>
                                </tr>
                                <tr>
                                    <td>회원 관리</td>
                                    <td>
                                        - 회원제 서비스 이용에 따른 회원식별<br/>
                                        - 비인가 회원 사용 방지, 중복 가입 방지<br/>
                                        - 미성년자의 확인<br/>
                                        - 고객상담, 고객 불만 접수 및 처리, 분쟁조정을 위한 기록보존<br/>
                                        - 고지사항 전달
                                    </td>
                                </tr>
                                <tr>
                                    <td>마케팅 및 광고에 활용</td>
                                    <td>
                                        - 웹페이지 접속 빈도 파악<br/>
                                        - 회원별 콘텐츠 및 서비스 이용현황 파악<br/>
                                        - 이벤트 등 광고성 정보 전달 또는 회원 참여 공간 운영<br/>
                                        - 회원 대상 설문조사<br/>
                                    </td>
                                </tr>
                                <tr>
                                    <td>서비스 제공에 관한 계약의 이행</td>
                                    <td>- 콘텐츠 제공, 이벤트 결과 안내 및 상품 배송</td>
                                </tr>
                            </table>
                            <p class="mt-10">
                                ※ 개인정보는 위 목적 이외에 다른 목적으로 사용하지 않으며 이용 기간 이후에는 파기됩니다.
                            </p>
                            <p class="mt-20">2. 수집·이용하는 개인정보 항목</p>
                            <p class="ml-10">
                                아이디, 이름, 비밀번호, 사용자 역할, 단말기 정보, 학교명, 학년, 반, 번호, 사진, 이용자 고유식별자
                            </p>
                            <p class="mt-20">3. 자동 수집하는 개인정보 항목</p>
                            <p class="ml-10">
                                쿠키, 서비스 이용 기록(방문일시, IP, 로그인 시간, 국가, 도시 등), 단말기 정보(OS, 화면사이즈, 폰기종, 단말기 모델명,
                                앱버전 등), CPU 정보 등 운영 체제 및 하드웨어 환경 정보
                            </p>
                            <p class="mt-20">4. 개인정보 제 3자 제공 동의</p>
                            <p class="ml-10">
                                ㈜아이스크림미디어
                            </p>
                            <p class="mt-20">5. 개인정보 보유기간</p>
                            <p class="ml-10">
                                다음 해 2월 28일(29일)까지
                            </p>
                            <p class="mt-20">6. 개인정보 수집 동의 거부에 관한 권리</p>
                            <p class="ml-10">
                                이용자는 임시 학생 계정 생성 및 이용을 위한 개인정보 수집을 거부할 수 있습니다. 수집 거부 시 서비스 이용이 제한됩니다.
                            </p>
          `
        this.parsingContent = this.$terms.parsingHtml(data)
        // this.contents.push({
        //   content: `
        //     <p>본 학급에선 원활한 학급 운영을 위해 하이클래스 임시학생 계정 생성을 통한 하이클래스 서비스를 이용하고자 합니다. <br/> <br/>
        //         하이클래스는 학급 알림장, 학교 가정통신문, 교육정보 등 다양한 정보를 제공하며 선생님, 학생, 학부모의 소통을 돕는 서비스입니다.
        //     </p>
        //     <p class="mt-10">
        //         해당 서비스 이용에 동의는 필수 사항이 아니므로 개인정보 수집,이용,제공을 원하지 않으시는 경우 동의하지 않으실 수 있습니다.
        //     </p>
        //     <table>
        //         <colgroup>
        //             <col width="30%">
        //             <col width="30%">
        //             <col width="40%*">
        //         </colgroup>
        //         <tr>
        //             <th scope="col">수집 항목</th>
        //             <th scope="col">수집 목적</th>
        //             <th scope="col">보유/이용 기간</th>
        //         </tr>
        //         <tr>
        //             <td>학생 이름, 반 번호, 사진</td>
        //             <td>하이클래스 서비스 이용</td>
        //             <td>다음 해 2월 28일(29)일 까지</td>
        //         </tr>

        //     </table>
        //     <p class="mt-10">
        //         ※ 수집한 개인정보는 정보주체의 동의 없이 수집한 목적 외로 사용하거나 제3자에게 제공되지 않습니다.

        //     </p>
        //   `
        // })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
#wrap {
  /*
    모바일 > min-width: 100%;
    PC > min-width: 1280px;
  */
  min-width: 1280px;
}
.safety-num-modal {
  display: block;
  .modal-cont-wrap {
    &.modal-agree {
      /* 전역 음수 마진 무력화 후 transform으로 중앙 정렬 */
      margin: 0 !important;
      position: fixed !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      .boundary-box {
        width: 980px;
        max-width: calc(100vw - 40px);
        box-sizing: border-box;
        max-height: calc(100vh - 80px);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
    }
  }
  .modal-cont-inner {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    overflow: hidden;
  }
  .modal-title-wrap { 
    flex: 0 0 auto; 
    margin:0;
  }
  .gray-box02 {
    flex: 1 1 auto;
    overflow-y: auto;
    max-height: calc(100dvh - 64px);
    &.white {
      font-size: 14px;
      background: #fff;
      &::-webkit-scrollbar {
        width: 14px;
        height: 14px;
      }
      &::-webkit-scrollbar-thumb {
        background: #C1C1C1;
        border-radius: 7px;
        border: 3px solid transparent;
        background-clip: padding-box;
      }
      &::-webkit-scrollbar-track {
        background-color: transparent;
      }  
    }
  }
  .close-btn{
    position: absolute;
    right: 5px;
    top: 11px;
    width: 52px;
    height: 52px;
    z-index: 10003;
  }
  .back-btn{
    position: absolute;
    top: 0;
    left: 0;
    width: 52px;
    height: 52px;
    display: none;
    z-index: 10003;
  }
}

@media screen and (max-width: 640px) {
  /* 640px 이하: wrap 최소폭 해제 + 모달 풀스크린 */
  #wrap {
    min-width: 0 !important;
  }
  .safety-num-modal {
    .modal-cont-wrap {
      &.modal-agree {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        transform: none !important;
        margin: 0 !important;
        z-index: 20020 !important;
        .modal-cont{
          &.boundary-box {
            &.privacy-modal {
              width: 100vw !important;
              max-width: none !important;
              height: 100vh !important;
              max-height: none !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              padding-right: 3px;
              padding-top: 62px;
            }
          }
          .modal-cont-inner{
            .modal-title-wrap {
              display: block;
              position: fixed;
              background: #fff;
              left: 0;
              top: 0;
              right: 0;
              height: 52px;
              padding: 13px;
              z-index: 10002;
              .title{
                color: #000;
                font-size: 18px;
                font-weight: 600;
                line-height: 160%;                
                margin-left: 32px;
              }
            }                
            .close-btn{
              display: none;
            }            
            .back-btn{
              display: block;
              position: fixed;
            }
            .gray-box02 {
              width: 100% !important;
              box-sizing: border-box !important;
              &.white {
                padding-right: 16px;
              }
            }
          }
        }        
      }
    }
  }
  // 웹뷰(m-body)
  .m-body .safety-num-modal .modal-cont-wrap.modal-agree .modal-cont.boundary-box.privacy-modal{
    padding-top:10px; 
    .modal-cont-inner{
      .modal-title-wrap,
      .back-btn{
        display: none;
      }
    }
  }
  // 민감정보 수집 및 이용동의 (sensitive-info-modal)
  .modal .modal-cont-wrap.modal-agree.sensitive-info-modal .modal-cont.boundary-box.privacy-modal{
    padding-top:60px;
    .modal-cont-inner{
      .modal-title-wrap{
        display: block;
        .title{
          text-align: left;
        }
      }
      .back-btn{
        display: block;
      }
    }
  }
}
</style>
