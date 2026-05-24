const { app, shell, ipcMain } = require('electron')
const { quit } = require('./common')
const setupFcm = require('./setupFcm.js')
const setupLocalServer = require('./setupLocalServer.js')
const { setBadge } = require('./badge.js')

const connectedSockets = []
const transferMessage = message => connectedSockets.filter(ws => ws.readyState === ws.OPEN).forEach(ws => {
  ws.send(JSON.stringify(message))
})

let executeJs = () => {}

const localServerCallbacks = {
  onConnected: ws => connectedSockets.push(ws),
  onDisconnected: ws => connectedSockets.indexOf(ws) >= 0 && connectedSockets.splice(connectedSockets.indexOf(ws), 1),
  onMessage: message => {
    if (Buffer.isBuffer(message)) {
      try { message = JSON.parse(message.toString()) } catch (error) { return }
    }
    ({
      'reset-fcm': () => resetFcm(),
      'room-connection': ({ roomId }) => executeJs(`hitalk.setConnectedRoomIdOnOtherSession('${roomId}')`),
    }[message.type] || (() => {}))(message)
  }
}

const resetFcm = () => {
  setupFcm({
    onReceivedToken: token => {
      executeJs(`hitalk.callChatWebToken({method: 'POST', token: '${token}'})`)
    },
    onReceivedMessage: ({ notification }) => {
      executeJs(`hitalk.onReceivedFcmMessage(${JSON.stringify(notification)})`)
      transferMessage({ ...notification, type: 'fcm' })
    }
  })
}

module.exports = async ({win, appVersion, tray, rebuildTrayMenu, icons}) => {
  executeJs = js => win.webContents.executeJavaScript(js)

  const localServer = await setupLocalServer(localServerCallbacks)

  let loggedIn = false
  const processLogInOut = (isLogin) => {
    loggedIn = isLogin
    tray.setImage(isLogin ? icons.icon : icons.logoutIcon)
    rebuildTrayMenu(isLogin)
  }

  const ipcHandlers = [
    ['ready', () => {
      processLogInOut(true)
      executeJs(`localStorage.setItem('appVersion', '${appVersion}')`)
      executeJs(`hitalk.writeLocalServerPort(${localServer.address().port})`)
    }],
    ['reset-fcm', resetFcm],
    ['change-entry', (_, param) => win.loadURL(param)],
    ['open-external', (_, param) => shell.openExternal(param)],
    ['show-window', () => win.show()],
    ['quit', () => quit(app)],
    ['focus-fix', () => win.blur() && win.focus()],
    ['clear-local-storage-and-cookie', () => {
      win.webContents.session.clearStorageData({ storages: ['localstorage', 'cookies'] })
        .then(() => { }).catch(() => {})
    }],
    ['logout', () => {
      processLogInOut(false)
      connectedSockets.forEach(ws => ws.close())
      connectedSockets.splice(0, connectedSockets.length)
    }],
    ['set-tray-icon', (_, { locked }) => {
      if (!loggedIn) return
      tray.setImage(locked ? icons.lockedIcon : icons.icon)
    }],
    ['set-badge', (_, param) => setBadge(win, tray, icons, param)],
  ]

  ipcHandlers.forEach(([key, handler]) => ipcMain.on(key, handler))
}