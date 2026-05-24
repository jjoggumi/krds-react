<template>
  <div class="modal print-note-modal has-top-btn-wrap" style="display:block;">
    <div class="modal-cont-wrap">
      <div class="modal-cont">
        <div class="modal-cont-inner">
          <div
            class="modal-top-btn-wrap"
            :class="{
              'no-print': isInvitePrintShow
            }"
          >
            <!-- <div class="page-conut-wrap">1 / 4 {{ $t("main.clazzes.invite.freeSms.page") }}</div> -->
            <div class="right-wrap">
              <button class="print-btn" @click.stop="$print($refs.printInvite)">
                <!-- <button class="print-btn" @click.stop="$printjs('printInvite', 'html')"> -->
                <span>{{
                  $t('main.clazzes.invite.freeSms.button.print')
                }}</span>
              </button>
              <div
                class="modal-close-btn modal-close-icon"
                @click="$parent.close('invitePrint')"
              ></div>
            </div>
          </div>
          <div class="print-note-cont" ref="printInvite" id="printInvite">
            <div class="print-cont invite-cont">
              <div class="invite-box" v-click-outside="hidePopup">
                <p class="invite-tit01">{{ clazzes.className }}</p>
                <p class="invite-tit01 mt-10">
                 학급 소식 확인을 위한 하이클래스 APP 설치 안내
                </p>
                <div class="invite-txt-box01">
                  <p>
                    학부모님 가정에 평안과 건강을 기원하며 한가지 안내
                    말씀드립니다.
                  </p>
                  <p>
                    학급 알림장과 학교 소식을 보다 편리하게 전달해 드리고자
                    아래와 같이
                  </p>
                  <p>
                    <span class="ft-bold ft-blue">하이클래스 APP 설치</span>를
                    안내드리오니 많은 참여 부탁드립니다.
                  </p>
                </div>

                <div class="invite-img-box">
                  <p class="invite-tit02">하이클래스 App 설치 및 가입 방법</p>
                  <div>
                    <p>
                      1. 구글 플레이스토어 or 앱스토어에서
                      <span class="ft-bold ft-blue">'하이클래스'</span> 앱 검색
                    </p>
                    <p>
                      2. 앱 설치 완료 후
                      <span class="ft-bold ft-blue">회원가입</span>
                    </p>
                    <p>
                      3. 회원가입이 완료되면 아래 그림과 같이
                      <span class="ft-bold ft-blue">클래스 가입</span>
                    </p>
                  </div>
                  <div id="inviteCodeImg">
                    <img
                      src="@/assets/img/invite/img-guide-code-print.png"
                      alt=""
                    />
                  </div>
                </div>
                <div class="invite-txt-box02">
                  <p>
                    초대 코드:
                    <span class="invite-code">{{
                      clazzes.classInviteCode
                    }}</span>
                  </p>
                  <p class="txt-gray">
                    (우리반 학생, 학부모만 가입할 수 있도록 초대코드는 타인에게
                    공유하지 말아주세요.)
                  </p>
                </div>
                <div class="invite-img-box">
                  <div>
                    <p>
                      4. 가입이 완료되면 알림장은 물론 다양한 서비스를 이용하실
                      수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'mainBodyClazzesBodyInvitePrintInvitation',
  props: ['clazzes', 'isInvitePrintShow'],
  data: () => ({}),
  computed: {
    classBan() {
      let classBan = ''
      if (this.clazzes.classBan.length > 11) {
        classBan = this.clazzes.classBan.substring(0, 11) + '...'
      } else {
        classBan = this.clazzes.classBan
      }
      return classBan
    },
    classOwnerUserName() {
      if (this.clazzes.classOwner !== undefined)
        return this.clazzes.classOwner.userName
      else return ''
    }
  },
  methods: {
    hidePopup() {
      this.$parent.close('invitePrint')
    }
  },
  created() {},
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')
  },
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  }
}
</script>

<style >
.print-note-modal {
  display: block;
}
</style>
<style  lang="scss" scoped>
.ft-bold{font-weight: 800!important;}
.print-cont.invite-cont{
  margin: 0 auto;  
  padding: 40px 5px 10px;
  .invite-box{
    padding:0 15px;
    .invite-txt-box01 > p{    
      font-size: 16px;
      line-height: 1.3;
    }
    .invite-txt-box02{
      margin: 10px 0 20px;     
      .invite-code-text, 
      p{margin-bottom: 5px;}
      p.txt-gray{
        font-size: 14px;
      }
    }
  }
  .invite-code{font-size: 45px;}
  .invite-img-box{
    .invite-tit02{
      padding: 15px 0 18px 0;
     &:before{top: 44px;}
    }
  }
}
</style>
