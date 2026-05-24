const { app, shell, Tray, Menu, ipcMain } = require('electron')
const { quit } = require('./common')

let contextMenu = null

const rebuildContextMenu = (loggedIn, tray, win) => {
  const executeJs = js => win.webContents.executeJavaScript(js)

  contextMenu = Menu.buildFromTemplate([...[
    { label: '열기', click: () => win.show() },
    { label: '하이클래스 열기', click: () => shell.openExternal('https://www.hiclass.net') }], 
    ...(loggedIn ? [
      { label: '잠금모드', click: () => executeJs('lockScreen()') },
      { label: '로그아웃', click: () => {
        executeJs('logout()');
      } }]
        : [
      { label: '잠금모드', enabled: false },
      { label: '로그인', click: () => {
        executeJs('document.location = "/"');
        win.show();
      } }
    ]),
    ...[{ type: 'separator' }, { label: '종료', click: () => quit(app) }]
  ])
  tray.setContextMenu(contextMenu)
}

module.exports = (context) => {
  const tray = new Tray(context.icons.logoutIcon)

  tray.setToolTip('하이톡')
  tray.on('right-click', () => contextMenu && tray.popUpContextMenu(contextMenu))
  tray.on('double-click', () => { context.win.show(); context.win.focus(); })
  rebuildContextMenu(false, tray, context.win)
  
  context.tray = tray
  context.rebuildTrayMenu = (loggedIn) => 
    rebuildContextMenu(loggedIn, tray, context.win)
}