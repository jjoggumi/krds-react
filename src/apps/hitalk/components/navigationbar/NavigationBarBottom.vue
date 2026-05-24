<template>
  <div class="tab-nav-bottom-wrap">
    <div class="profile-thumbnail" :style="profileImage"></div>
    <button v-if="isTeacher && !isUnderElectron" class="icon time-setting" @click="openTimeSetting"><span>상담 가능 시간 설정</span></button>
    <button v-if="isUnderElectron" class="icon setting" :class="{'on': showSetting}" @click="toggleSetting"></button>
    <div class="option-list" v-if="showSetting" v-click-outside="toggleSetting">
      <ul>
        <li v-for="setting in settings" :key="setting[0]" @click="onClickSettingItem(setting)">
          <span>{{ setting[0] }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import {URLProps} from "@/enums";
import {mapMutations, mapActions, mapState} from "vuex";
import {ElectronHandlable} from "@/apps/hitalk/mixins";
import { useScreenLockController } from "@/apps/hitalk/utils/screenLock"
import { useElectronController } from "@/apps/hitalk/utils";

const electronController = useElectronController();
const screenLockController = useScreenLockController();

export default {
  name: "NavigationBarBottom",
  mixins: [ElectronHandlable],
  computed:{
    ...mapState('storeHitalk', [
      "isShowTimeSetting",
      "loginUser"
    ]),
    profileImage() {
      if(!this.loginUser) return `background-image: url(${URLProps.DEFAULT_PROFILE_IMAGE_URL})`;
      return `background-image: url(${this.loginUser.userPhoto || URLProps.DEFAULT_PROFILE_IMAGE_URL})`;
    },
    isTeacher(){
      if(!this.loginUser) return false;
      return this.loginUser.userType === 'TEACHER';
    }
  },
  data () {
    return {
      showSetting: false,
      settings: [
        ['하이클래스 열기', () => { this.openExternal(document.location.origin) }],
        ['잠금모드 (Ctrl + L)', () => { screenLockController.lockScreen() }],
        ['로그아웃 (Alt + N)', () => {
          electronController.logout()
        }],
        ['종료 (Alt + X)', () => { this.quit() }],
      ]
  }},
  methods:{
    ...mapMutations('storeHitalk',[
      "toggleTimeSetting",
    ]),
    openTimeSetting() {
      this.toggleTimeSetting();
    },
    toggleSetting(){
      if (this.showSetting) {
        this.detachElectronSettingFromBody();
        this.showSetting = false;
      } else {
        this.showSetting = true;
        this.$nextTick(() => {
          this.attachElectronSettingOntoBody();
        });
      }
    },
    onClickSettingItem(setting) {
      setting[1] && setting[1]();
      this.toggleSetting()
    },
    attachElectronSettingOntoBody() {
      const electronSetting = document.querySelector('.electron-setting-popup');
      if(electronSetting) {
        electronSetting.parentNode.removeChild(electronSetting);
        document.body.appendChild(electronSetting);
      }
    },
    detachElectronSettingFromBody() {
      const electronSetting = document.querySelector('.electron-setting-popup');
      const originalParent = document.querySelector('.tab-nav-bottom-wrap');
      if (electronSetting && originalParent) {
        electronSetting.parentNode.removeChild(electronSetting);
        originalParent.appendChild(electronSetting);
      }
    },
    handleKeydown(event) {
      if (event.altKey && event.key === 'n') {
        document.location.href = '/logout';
      } else if (event.altKey && event.key === 'x') {
        this.quit();
      } else if (event.ctrlKey && event.key === 'l') {
        screenLockController.lockScreen();
      }
    }
  },
  async mounted () {
    await new Promise(r => setTimeout(r, 1000));
    if (this.isUnderElectron) {
      this.attachElectronSettingOntoBody();
    }
    screenLockController.setApp(this);
    window.addEventListener('keydown', this.handleKeydown);
    this.settings.push([`Version: ${this.appVersion}`, () => {}]);
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleKeydown);
  }
}
</script>

<style>
/*.left-wrap .tab-nav-bottom-wrap button.icon.setting::before {
  width: 29px;
  height: 29px;
  background: url(/img/icons_hitalk.2d663167.png) right -190px / 200px auto no-repeat;
}
 electron-exclusive.scss로 이동
body.on-electron .electron-setting-popup {
  position: fixed;
  left: 90px;
  bottom: 2px;
  width: 189px;
  height: 150px;
  border-radius: 10px;
  border: solid 1px #e0e0e0;
  z-index: 999 !important;
  background: #fff;
}

.electron-setting-popup ul {
  padding-top: 15px;
  padding-left: 20px;
}

.electron-setting-popup ul li {
  margin-bottom: 12px;
  cursor: pointer;
}

.electron-setting-popup ul li span {
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 15px;
  line-height: 100%;
  letter-spacing: 0px;
  color: #969696;
} */
</style>