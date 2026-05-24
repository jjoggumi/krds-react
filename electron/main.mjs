import path from 'path'
import { fileURLToPath } from 'url'
import { app, BrowserWindow } from 'electron'
import electronUpdater from 'electron-updater'
import { Context } from './src/context.js'
import { loadEntryURL, processFirstExecution } from './src/store.mjs'
import { quit } from './src/common.js'
import startWatchdogForUninstalling from './src/watchdog.js'

const context = new Context({
  homePath: path.dirname(fileURLToPath(import.meta.url)),
  EntryURL: loadEntryURL()
})

const processArguments = () => {
  const handlers = [
    ['host', (val) => context.EntryURL = `${val}/hitalk`],
    ['port', (val) => context.EntryURL = `http://localhost:${val}/hitalk`],
  ]

  const executeEachArg = val => {
    const [ _, func ] = handlers.find(([arg]) => val.startsWith(`--${arg}`)) || []
    func && func(val.replace(`--${_}=`, ''))
  }

  process.argv.forEach(executeEachArg)
}

const setupCustomScheme = () => {
  if (process.defaultApp && process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('hitalk', process.execPath, [path.resolve(process.argv[1])]);
  } else {
    app.setAsDefaultProtocolClient('hitalk');
  }
}

const setupAutoUpdater = ({ autoUpdater }) => {
  autoUpdater.on('checking-for-update', () => console.log('checking for update'))
  autoUpdater.on('update-available', () => console.log('update is available'))
  autoUpdater.on('update-not-available', () => console.log('this is the latest version'))
  autoUpdater.on('error', err => console.log('an error occurred: ' + err))
  autoUpdater.on('update-downloaded', () => autoUpdater.quitAndInstall())
  autoUpdater.checkForUpdatesAndNotify()
}

const main = () => {
  setupAutoUpdater(electronUpdater)
  setupCustomScheme()
  processArguments()
  startWatchdogForUninstalling()
  
  app.setAppUserModelId('net.hiclass.hitalk.app')
  app.on('activate', () => BrowserWindow.getAllWindows().length === 0 && context.createWindow())
  app.on('window-all-closed', () => process.platform !== 'darwin' && quit(app))
  app.whenReady().then(async () => {
    await processFirstExecution(() => context.twinkleDummyWindow())
    context.createWindow()
  })
}

!app.requestSingleInstanceLock() ? quit(app) : main()