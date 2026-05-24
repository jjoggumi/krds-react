<template>
  <div
    v-if="clazzes !== null && clazzes.currentId"
    id="wrap"
    class="page-share"
  >
    <div id="cont-wrap">
        <div class="logo-wrap">
          <img src="@/assets/img/logo_login.png" alt />
        </div>
        <div class="school-class-cont-item boundary-box">
          <div class="invite-cont">
            <div class="invite-box">
              <p class="invite-tit01">초대합니다~</p>
              <div class="invite-txt-box01">
                <img src="@/assets/img/invite/img-invite01.png" alt />
                <div>
                  <p>
                    <span>{{ clazzes.className }}</span>
                  </p>
                  <p>
                    <span>{{ clazzes.classOwner.userName }} 선생님</span>이
                  </p>
                  <p>회원님을 클래스에 초대했습니다.</p>
                </div>
              </div>
              <div class="invite-txt-box02">
                <p class="invite-school">{{ clazzes.className }}</p>
                <div class="invite-code-container">
                  <span class="invite-code-expired-msg" v-if="isExpiredCode">초대코드가 만료되었습니다.<br>선생님께 다시 문의해주세요.</span>
                  <span class="invite-code-expired-msg" v-else-if="isIncorrentCode">만료된 초대장입니다.<br>선생님께 다시 문의해주세요.</span>
                  <span class="invite-code-text" v-else>초대코드는 <span class="invite-code">{{ clazzes.classInviteCode }}</span> 입니다.</span>
                </div>
                <p>클래스에 가입하시면 각종 학교 소식들을 편하게 열람하고<br>선생님과 쉽게 소통하실 수 있습니다.</p>
              </div>
              <div class="invite-img-box">
                <p class="invite-tit02">클래스 참여 방법</p>
                <div>
                  <img src="@/assets/img/invite/txt_invite01.png" alt />
                  <img src="@/assets/img/invite/txt_invite02.png" alt />
                  <img src="@/assets/img/invite/txt_invite03.png" alt />
                  <img src="@/assets/img/invite/txt_invite04.png" alt />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="more-educatioin-btn-wrap" v-if="!isPreview">
          <a href="javascript:" @click="link" class="btn-bg-c">
            {{ $t('mobile.invite.clazz.inviteCard.button.text') }}
          </a>
        </div>
    </div>
  </div>
  <div v-else></div>
</template>

<script>
import MobileDetect from 'mobile-detect'

let timer = null;

window.onblur = () => {
  if (timer != null) clearTimeout(timer);
}

export default {
  name: 'MobileInviteClazzInviteCard',
  components: {},
  data: () => ({
    clazzes: null,
    isPreview: null,
    queryCode: '',
    isExpiredCode: false,
    isIncorrentCode: false
  }),
  methods: {
    link() {
      const userAgent = navigator.userAgent
      const md = new MobileDetect(userAgent)

      if (md.mobile()) {
        let mobileType = md.os()
        const downloadUrl = this.$store.state.mobileAppDownloadUri[mobileType === 'AndroidOS' ? 'android' : 'ios']
        if (md.is('iPhone') && userAgent.includes('Safari')) {
          location.href = downloadUrl
        } else {
          location.href = `${this.$store.state.mobileIntentUri.ios}/joinInviteCode?code=${(this.clazzes || {}).classInviteCode}`
        }

        timer = setTimeout(() => {
          if (document.visibilityState !== 'visible') return;
          location.href = downloadUrl 
        }, 1500);
      } else {
        this.$router.replace('/', () => {
          window.location.reload()
        })
      }
    },
    checkInviteCard() {
      if (this.$route.query.classId !== undefined) {
        const classId = this.$route.query.classId
        this.isPreview = this.$route.query.preview === 'true'
        // if (this.$route.query.preview !== undefined)

        this.getClazzes(classId)
      } else {
        alert('초대장 주소가 유효하지 않습니다.')
        this.$router.push('/')
      }
    },
    getClazzes(classUuid) {
      this.$axios({
        method: 'get',
        url: '/clazzes/' + classUuid
      })
        .then(result => {
          this.$log.debug(
            this.$options.name + ' getClazzes() result : ',
            result
          )
          this.clazzes = result.data
          if (!this.clazzes.classInviteCode) {
            this.isExpiredCode = true
          } else if (this.clazzes.classInviteCode !== this.queryCode) {
            this.isIncorrentCode = true
          }
        })
        .catch(error => {
          this.$log.debug(this.$options.name + ' getClazzes() error : ', error)
          this.onError()
        })
    },
    onError() {
      alert('초대장 주소가 유효하지 않습니다.')
      this.$router.push('/')
    },
    setScrollBar() {
      const userAgent = navigator.userAgent
      const md = new MobileDetect(userAgent)

      if (md.mobile())
        document.body.className = ''
      else
        document.body.className = 'body'
    }
  },
  created() {
    this.queryCode = this.$route.query.inviteCode;
    this.checkInviteCard()
  },
  mounted() {
    this.$nextTick(() => {
      this.setScrollBar()
    })
  }
}
</script>

<style scoped></style>
