<template>
  <div class="privacy-info-box boundary-box login-info">
    <div class="left-wrap">
      <div class="box-title">로그인 계정 정보</div>
      <div class="profile-thumbnail">
        <div class="circle"></div>
      </div>
    </div>
    <div class="right-wrap">
      <!-- <div class="info-category" v-if="user.userType === 'TEACHER'">
        <div class="category-title">아이스크림 계정 연동</div>
        <div class="info-cont">
          <div class="input-box-wrap readonly">
            <input type="text" placeholder="이름" value="sigong1234" readonly />
          </div>
          <div class="btn-wrap">
            <button class="btn-bg-c" @click="doSubscribe">연동 하기</button>
          </div>
        </div>
      </div>-->
      <div class="info-category">
        <div class="info-cont">
          <div class="info-cont-wrap">
            <div class="input-box-wrap readonly2">
              <input type="text" placeholder :value="setAccountInfo()" readonly />
            </div>
            <div class="btn-wrap logout-wrap">
              <HiButton color="primary"  bitrounded @click="logout">로그아웃</HiButton>
              <HiButton color="line-primary"  bitrounded @click="openAllLogoutConfirm">모든 기기에서 로그아웃</HiButton>
            </div>
          </div>
          
          <!-- <div class=1"btn-wrap">
            <button class="btn-bg-w2" @click="doUnsubscribe">연동 해제</button>
          </div>-->
          <div
            class="category-title"
            style="margin: 13px;"
            v-if="userSns === 'HICLASS'"
          >
            * 계정 만료일 : {{ expiredDate }}
          </div>
        </div>
      </div>
    </div>
    <confirm-dialog 
      v-if="confirmDialog.isShow" 
      :isOtherUse="true"
      :title="confirmDialog.title" 
      :description="confirmDialog.description"
      :confirmButtonName="confirmDialog.confirmButtonName"
      @closeConfirmDialog="allLogout"
    />
  </div>
</template>

<script>
import {mapActions} from "vuex";
import ConfirmDialog from '@/apps/hitalk/components/popup/ConfirmDialog'
export default {
  name: 'MainBodyMypageInfoBodyAccount',
  components: {ConfirmDialog},
  props: {
    user: Object
  },
  data: () => ({
    isLogouting: false,
    confirmDialog : {
      isShow: false,
      title: '',
      description: '',
      confirmButtonName: ''
    },
    loginClass: {
      KAKAO: '카카오',
      NAVER: '네이버',
      GOOGLE: '구글',
      APPLE: '애플',
      GNE: '경남교육청',
      ISCREAM: '아이스크림',
      HICLASS: '하이클래스'
    }
  }),
  computed: {
    userSns() {
      if (this.user.userSns !== undefined && this.user.userSns !== null)
        return this.user.userSns.toUpperCase()
      else return ''
    },
    expiredDate() {
      if (this.user.expiredTimestamp !== undefined)
        return this.$moment(this.user.expiredTimestamp).format('YYYY.MM.DD')
      else return '미등록'
    }
  },
  methods: {
    ...mapActions({
      allDeviceLogout: 'allDeviceLogout',
    }),
    ...mapActions("storeHitalk",{
      callChatWebToken: "callChatWebToken"
    }),
    async logout() {
      if(!this.isLogouting) {
        this.isLogouting = true
        await this.callChatWebToken({
          token : "",
          method : "delete"
        });
        
        this.$router.push("/logout", () => {
          this.isLogouting = false
        });
      }
    },
    openAllLogoutConfirm() {
      this.$hiClass.toggleBodyClass('add', 'hidden')
      this.confirmDialog = {
        isShow: true,
        title: '안전한 사용을 위해\n<span style="color: #4778DE;">로그인된 모든 기기</span>에서\n로그아웃합니다.',
        description: '',
        confirmButtonName: '로그아웃'
      }
    },
    async allLogout(isConfirm) {
      if(isConfirm) {
        if(!this.isLogouting) {
          this.isLogouting = true
          await this.allDeviceLogout();
          this.$router.push("/logout", () => {
            this.isLogouting = false
          });
        }
      }
      this.$hiClass.toggleBodyClass('remove', 'hidden')
      this.confirmDialog = {
        isShow: false,
        title: '',
        description: ''
      }
    },
    doUnsubscribe() {
      alert('TBD')
    },
    doSubscribe() {
      alert('TBD')
    },
    setAccountInfo() {
      let rtnValue = ''
      const user = this.user

      if (this.userSns === 'HICLASS' || this.userSns === 'ISCREAM') {
        rtnValue += user.loginId
      } else {
        rtnValue += this.loginClass[this.userSns]
      }
      rtnValue +=
        ' (' +
        this.$comn.convertTimestamp2DateByFormat(user.insertedTimestamp, '.') +
        ' 등록)'
      return rtnValue
    }
  }
}
</script>
<style scoped>
.info-cont .info-cont-wrap {
  display: flex !important;
  align-items: center;
}
.info-cont .info-cont-wrap .logout-wrap {
  display: flex;
  align-items: center;
}
.info-cont .info-cont-wrap .logout-wrap button{
  margin-left: 10px;
  font-size: 15px;
  font-weight: 500;
  line-height: 23px;
  letter-spacing: -0.2px;
  border-radius: 23px;
  border: 1px solid var(--primary);
  color: #fff;
  background: var(--primary);
  width: 110px;
  height: 40px;
}
.info-cont .info-cont-wrap .logout-wrap button:last-child{
  color: var(--primary);
  background: #fff;
  width: 175px;
}
.btn-bg-w3 {
  border: 1px solid var(--primary);
  background: #fff;
  color: var(--primary);
}
.btn-bg-w3:hover {
  background: #ebeef4;
}
.btn-bg-w3.dis {
  background: #fff;
  cursor: default;
  opacity: 0.5;
}
</style>
