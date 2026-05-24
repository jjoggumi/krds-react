<!--
@File(Method): LockScreen.vue
@Description: 잠금모드 화면
@Modified: 2025-04-16 - #72806 하이톡웹뷰 잠금모드 디자안 반영
-->
<template>
  <div id="wrap" class="page-login lock-screen">    
    <div id="cont-wrap">    
      <div class="logo-wrap">
        <a href="#"><img src="/img/logo_login.png" alt="하이클래스" /></a>
      </div>
      <div class="login-box-wrap boundary-box">
        <HiAvatar         
          type="profile"
          size="xl" 
          :img="userPhoto ? userPhoto : null"
          >         
        </HiAvatar>   
        <h2>잠금모드 상태입니다.</h2>
        <div class="input-wrap" :class="{wrong: isWrongPassword}">
          <input type="password" v-model='password' @keydown="onKeydownInput" maxlength="4">
          <div class="underbars">
            <div v-for="i in [...new Array(4).keys()]" :key="i"
              class="bar" :class="{hide: password.length > i}"></div>
          </div>
          <span class="messages">잠금모드 암호가 일치하지 않습니다.</span>
        </div>
        <div class="logout-wrap">
          <span class="or"></span>
          <HiButton size="lg" bitrounded block @click="onClickLogout">로그아웃</HiButton>
        </div>
      </div>
      <HiButton color="link" class="forgot" @click="showLogoutConfirm">
        잠금모드 암호를 잊었어요
      </HiButton>
    </div>    
  </div>  
</template>

<script>
import { mapState } from 'vuex';

const MAXIMUM_TRY = 10;
const isDigit = n => /^\d$/.test(n);  

export default {
  props: {
    tryUnlock: {
      type: Function,
      required: true
    },
    logout: {
      type: Function,
      required: true
    },
    resetPassword: {
      type: Function,
      required: true
    }
  },
  computed: {
    ...mapState('storeHitalk', [ 'loginUser' ]),
  },
  data: () => ({
    password: '',
    userPhoto: '',
    isWrongPassword: false,
    wrongAttempts: 0
  }),
  methods: {
    onClickLogout() {
      this.logout();
    },
    async onKeydownInput(event) {
      event.preventDefault();
      const key = event.key;
      if (!(isDigit(key) || ['Backspace'].includes(key))) {
        return;
      }
      ({
        Backspace: () => {
          if (this.password.length === 0) return;
          const { selectionStart, selectionEnd } = event.target;
          this.password = (selectionStart !== selectionEnd)
            ? this.password.substring(0, selectionStart) + this.password.substring(selectionEnd)
            : this.password.substring(0, this.password.length - 1);
        }
      }[key] || (() => {
        this.password = (this.password + key).replace(/\D/g, '').substring(0, 4);
      }))()
      if (this.password.length < 4) {
        this.isWrongPassword = false;
        return;
      }
      this.isWrongPassword = !(await this.tryUnlock(this.password));
      if (!this.isWrongPassword) return this.$el.querySelector('input').blur();
      if ((++this.wrongAttempts) >= MAXIMUM_TRY) {
        await this.$hiClass.alert(
          '하이톡 잠금 모드 암호 입력 횟수를 초과하였습니다.<br>다시 로그인해 주세요.');
        return this.logout();
      }
      this.password = '';
      this.$el.querySelector('input').focus();
    },
    async loadUsers() {
      const {data: { userPhoto }} = await this.$axios.get(`/users/${localStorage.uuid}`)
      this.userPhoto = userPhoto;
    },
    async showLogoutConfirm() {
      const { isConfirmed } = await this.$hiClass.confirm(
        `하이톡 로그아웃 후  잠금모드 암호를 초기화합니다.<br>
        다시 로그인하여 암호를 새롭게 설정해주세요.`, null, {
        customClass:{popup:'hc-confirm'}, 
        title:'잠금모드 암호 초기화', 
        reverseButtons: true
      }).catch(() => ({ isConfirmed: false }));
      if ( isConfirmed ) this.resetPassword();
    }
  },
  async mounted () {
    this.loadUsers();
    await this.$nextTick();
    this.$el.querySelector('input').focus();
  }
}
</script>

<style scoped lang="scss">
.lock-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: white;
  z-index: 1000;
  background: #f6f6f6;

  #cont-wrap {
    padding-top: 0px !important;
  }

  .login-box-wrap {
    position: relative;
    text-align: center;

    h2 {
      font-family: var(--font-body);
      font-weight: 700;
      font-size: 20px;
      line-height: 100%;
      letter-spacing: 0px;
      margin: 24px 0 16px;
    }

    .input-wrap {
      width: 100%;
      height: 58px;
      border: solid 1px #E0E0E0;
      margin: 0 auto;
      position: relative;
      margin-bottom: 30px;
      border-radius: 8px;

      input {
        height: 23px;
        width: 215px;
        font-size: 40px;
        letter-spacing: 30px;
        background-color: transparent;
        border: none;
        text-align: left;
        padding: 0 10px;
        margin: 14px 0 5px 44px;
      }
      .underbars {
        height: 2px;
        display: flex;
        gap: 16px;
        justify-content: center;
        margin-right: 5px;
        .bar {
          width: 27.17px;
          height: 2px;
          background-color: #CCCCCC;
        }
        .bar.hide {
          visibility: hidden;
        }
      }
      .messages {
        display: none;
        position: absolute;
        bottom: -25px;
        left: 0px;
        width: 100%;
        font-family: var(--font-body);
        font-weight: 700;
        font-size: 12px;
        line-height: 100%;
        letter-spacing: 0px;
        text-align: center;
        color: red;
      }
      &.wrong {
        border: solid 1px red;
        .messages {
          display: block;
        }
      }
    }

    .logout-wrap span.or {
      display: block;
      position: relative;
      height: 29px;
      font-family: var(--font-body);
      font-weight: 400;
      font-size: 12px;
      color:#868E96;
      color: #666;
      &::after {
        content: '또는';
        display: inline-block;
        background: #fff;
        position: absolute;
        width: 40px;
        left: calc(50% - 20px);
      }
      &::before {
        content: '';
        display: block;
        width: 100%;
        height: 1px;
        background-color: #E8E8E8;
        position: absolute;
        top: 5px;
      }
    }   
  }
  .forgot {
    text-decoration: underline;
    font-family: var(--font-body);
    font-weight: 400;
    font-size: 14px;
    text-align: center;
    color: #888;
    margin-top: 20px;
  }
}
</style>