const MAX_HEARTBEAT_INTERVAL = 5000;

export default class ElectronController {
  constructor() {
    this.context = {
      secretButtonCount: 0,
      webSocketConnection: null,
      lastHeartbeat: 0,
      localServerPort: 0,
      heartbeatChecker: null,
    }
    window.logout = () => this.logout();
  }

  isUnderElectron() {
    return window.electronAPI || window.location.search.includes('electron');
  }

  increaseSecretButtonCount() {
    if (!this.isUnderElectron()) return 0;
    this.context.secretButtonCount++;
    return this.context.secretButtonCount;
  }

  resetSecretButtonCount() {
    this.context.secretButtonCount = 0;
  }

  openExternal = url => this.sendIpcMessage('open-external', url);
  quit = () => this.sendIpcMessage('quit');
  showWindow = () => this.sendIpcMessage('show-window');

  setReady(hitalk) {
    window.hitalk = hitalk;
    this.sendIpcMessage('ready');
    this.sendIpcMessage('reset-fcm');
  }

  sendIpcMessage(type, param) {
    if (!this.isUnderElectron()) return;
    window.electronAPI.sendMessage(type, param);
  }

  getAppVersion() {
    if (!this.isUnderElectron()) return '';
    return localStorage.getItem('appVersion') || '';
  }

  async connectToDesktopApplication(port, { onConnected, onMessage, onDisconnected}) {
    if (!port || port === 0 || this.isUnderElectron()) return;

    if (this.context.webSocketConnection) {
      this.context.webSocketConnection.close();
    }

    if (this.context.heartbeatChecker) {
      clearInterval(this.context.heartbeatChecker);
    }

    this.context.webSocketConnection = new WebSocket(`ws://localhost:${port}`);
    
    this.context.webSocketConnection.onopen = () => {
      this.context.lastHeartbeat = Date.now();
      this.context.heartbeatChecker = setInterval(() => {
        if (Date.now() - this.context.lastHeartbeat > MAX_HEARTBEAT_INTERVAL) {
          clearInterval(this.context.heartbeatChecker);
          this.context.heartbeatChecker = null;
          try {
            this.context.webSocketConnection.close();
          } catch (e) {
            // Ignore error
          }
          this.context.webSocketConnection = null;
          onDisconnected();
        }
      }, 1000);
      onConnected();
    }
    this.context.webSocketConnection.onmessage = event => {
      const data = JSON.parse(event.data);
      if (data.type === 'heartbeat') {
        this.context.lastHeartbeat = Date.now();
      } else if (data.type === 'fcm') {
        onMessage(data);
      }
    }
    this.context.webSocketConnection.onclose = onDisconnected;
  }

  isConnectedToDesktopApplication = () => this.context.webSocketConnection !== null;

  setLocalServerPort = port => {
    this.context.localServerPort = port;
  }

  shouldNotShowNotification = () => !this.isUnderElectron() && this.isConnectedToDesktopApplication();

  sendMessageForResetingFcmToLocalServer = () => {
    if (!this.context.webSocketConnection) return;
    this.context.webSocketConnection.send(JSON.stringify({type: 'reset-fcm'}));
  }

  sendMessageOfRoomConnectionToLocalServer = (roomId) => {
    if (!this.context.webSocketConnection) return;
    this.context.webSocketConnection.send(JSON.stringify({type: 'room-connection', roomId}));
  }

  clearLocalStorageAndCookie = () => {
    if (!this.isUnderElectron()) return;
    window.electronAPI.sendMessage('clear-local-storage-and-cookie');
  }

  logout = () => {
    window.hitalk && window.hitalk.$store.dispatch('storeHitalk/callChatWebToken', {method: 'DELETE', token: ''});
    this.clearLocalStorageAndCookie();
    this.sendIpcMessage('logout');
    document.location.href = '/logout';
  }

  setBadge = text => {
    if (!this.isUnderElectron()) return;
    this.sendIpcMessage('set-badge', { text });
  }

  checkVersion = ({ hitalkDesktop = {} }) => {
    if (!this.isUnderElectron() || !hitalkDesktop.versionMin) return;
    const thisVersion = this.getAppVersion();
    if (thisVersion < hitalkDesktop.versionMin) {
      this.showVersionUpdateDialog(hitalkDesktop)
    }
  }

  showVersionUpdateDialog = ({ optionMessage }) => {
    if (!this.isUnderElectron()) return;
    const DEFAULT_MESSAGE = '중요한 업데이트 사항이 있습니다.<br>지금 스토어에서 업데이트를 진행해 주세요.'
    window.app.$hiClass.alert(optionMessage || DEFAULT_MESSAGE).then(() => {
      window.open('ms-windows-store://pdp/?ProductId=9PL2NB9G2M0T')
      this.sendIpcMessage('quit')
    })
  }
}