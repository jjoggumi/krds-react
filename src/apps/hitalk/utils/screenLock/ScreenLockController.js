import LockPasswordModal from './LockPasswordModal';
import LockScreen from './LockScreen';
import Vue from 'vue';
import { useElectronController } from '..';

const electronController = useElectronController();
const setTrayIcon = param => electronController.sendIpcMessage('set-tray-icon', param);

export default class ScreenLockController {
  constructor() {
    this.context = {};
    setTrayIcon({ locked: false });
    this.loadContext().then(() => {
      this.context.screenLock = false;
      this.saveContext();
      window.lockScreen = () => this.lockScreen();
    })
  }

  async setApp(app) {
    this.app = app;
    window.slc = this;
  }

  async loadContext() {
    const db = await this.openDatabase();
    const request = db.transaction('screenLockContext', 'readonly')
      .objectStore('screenLockContext').get(localStorage.uuid || 'default');
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
      this.context = request.result || {};
      resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveContext() {
    const db = await this.openDatabase();
    const request = db.transaction('screenLockContext', 'readwrite')
      .objectStore('screenLockContext').put(this.context, localStorage.uuid || 'default');
    return new Promise((resolve, reject) => {
      request.onsuccess = resolve;
      request.onerror = reject;
    });
  }

  openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('hitalkScreenLockDB', 1);
      request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('screenLockContext')) {
        db.createObjectStore('screenLockContext');
      }
      };
      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = () => reject(request.error);
    });
  }

  clearContext() {
    this.context = {};
    this.saveContext();
  }

  async showConfirm() {
    if (!this.app || this.context.modal) return;
    electronController.sendIpcMessage('show-window');
    const { isConfirmed } = await slc.app.$hiClass.confirm(`잠금모드를 이용하시기 위해서<br>
      비밀번호 설정이 필요합니다.`, null, {
        customClass:{popup:'hc-confirm only-text'},
        reverseButtons: true,
        confirmButtonText: '비밀번호 설정',
        cancelButtonText: '취소'
      }).catch(() => ({ isConfirmed: false }));
    if ( !isConfirmed ) return;
    this.showLockPasswordModal();
  }

  toasted(message) {
    if(!this.app) return;
    this.app.$toasted.show(message);
  }
  showLockPasswordModal() {
    const closeModal = () => {
      this.context.modal.$destroy();
      document.body.removeChild(this.context.modal.$el);
      this.context.modal = null;
    };

    this.context.modal = new Vue({
      render: h => h(LockPasswordModal, {
      props: {
        onPasswordSet: (password) => {
          this.context.password = password;
          this.toasted('잠금모드 암호가 설정되었습니다.')
          this.saveContext();
          closeModal();
        },
        onClose: closeModal
      }})
    }).$mount(document.createElement('div'));
    document.body.appendChild(this.context.modal.$el);
  }

  showLockScreen() {
    const screen = new Vue({
      render: h => h(LockScreen, {
      props: {
        tryUnlock: async (password) => {
          if (password !== this.context.password) return false;
          this.context.screenLock = false;
          this.saveContext();
          screen.$destroy();
          document.body.removeChild(screen.$el);
          setTrayIcon({ locked: false });
          this.restoreRoomlistLayout();
          return true;
        },
        logout: () => {
          this.context.screenLock = false;
          setTrayIcon({ locked: false });
          this.saveContext();
          document.location = '/logout';
        },
        resetPassword: () => {
          setTrayIcon({ locked: false });
          this.clearContext();
          document.location = '/logout';
        }
      }})
    }).$mount(document.createElement('div'));
    document.body.appendChild(screen.$el);
    setTrayIcon({ locked: true });
    this.goRoomlistLayout();
  }
  
  lockScreen() {
    if (this.context.screenLock) return;
    if (!this.hasPassword()) {
      return this.showConfirm();
    }
    this.context.screenLock = true;
    this.saveContext();
    this.showLockScreen();
  }

  isScreenLocked() {
    return this.context.screenLock || false;
  }

  hasPassword() {
    return !!this.context.password;
  }

  goRoomlistLayout() {
    if (window.app) {
      app.$store.commit('storeHitalk/setConnectRoomItem', {})
      app.$store.commit('storeHitalk/setIsChatRoomLoad', false)
      app.$store.commit('storeHitalk/hideChatLayout')
      app.$store.commit('storeHitalk/setTabRoom')
      app.$store.commit('storeHitalk/closeAllPopups')
    }
    document.querySelectorAll('.swal2-container').forEach(el => el.remove());
  }

  async restoreRoomlistLayout() {
    if (window.app) {
      await app.$store.dispatch('storeHitalk/callChatUserList')
      app.$store.dispatch('storeHitalk/callChatRooms')
      app.$store.commit('storeHitalk/setTabRoom')
    }
  }
}