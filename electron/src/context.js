const path = require('path')
const fs = require('fs')
const { app, BrowserWindow } = require('electron')
const { createImageFromSVG, replaceAsarPath } = require('./iconUtils.js')
const setupTray = require('./setupTray.js')
const setupIpcMessageHandlers = require('./setupIpcMessageHandlers.js')
const setupProcessForExternalSites = require('./setupProcessForExternalSites.js')

const loadVersionFrom = homePath =>
  JSON.parse(fs.readFileSync(path.join(homePath, 'package.json'), 'utf-8')).version

const getIcons = homePath => ({
  icon: path.join(homePath, 'resource', 'images', 'icon.ico'),
  lockedIcon: path.join(homePath, 'resource', 'images', 'icon-locked.ico'),
  logoutIcon: path.join(homePath, 'resource', 'images', 'icon-logout.ico'),
  png: path.join(homePath, 'resource', 'images', 'icon.png'),
  svg: path.join(homePath, 'resource', 'images', 'icon.svg')
})

class Context {
  constructor({homePath, EntryURL}) {
    this.homePath = homePath
    this.EntryURL = EntryURL
    this.appVersion = loadVersionFrom(homePath)
    this.icons = getIcons(homePath)
    this.win = null
  }

  async createWindow() {
    this.win = new BrowserWindow(await this.getBrowserWindowOptions())
    this.setupNoCachePatterns()
    this.setupOnClosed()
    this.setupOnLoaded()

    setupTray(this)
    setupProcessForExternalSites(this)
    setupIpcMessageHandlers(this)

    app.on('second-instance', () => this.win.show())
    this.win.loadURL(this.EntryURL)
  }

  getBrowserWindowOptions = async () => ({
    width: 1260, height: 720, minWidth: 450, minHeight: 630,
    webPreferences: {
      preload: path.join(this.homePath, 'preload.js'),
      enableRemoteModule: false
    },
    resizable: true, frame: true, fullscreenable: true,
    autoHideMenuBar: true,
    icon: await createImageFromSVG(replaceAsarPath(this.icons.svg), 96)
  })

  setupNoCachePatterns() {
    const filter = { urls: ['https://download.hiclass.net/static/version/*/version.json'] }
    this.win.webContents.session.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
      details.requestHeaders['Cache-Control'] = 'no-store'
      details.requestHeaders['Pragma'] = 'no-cache'
      callback({ requestHeaders: details.requestHeaders })
    })
  }

  setupOnClosed() {
    this.win.on('close', (e) => {
      if (!app.isQuitting) {
        e.preventDefault()
        this.win.hide()
      }
      return false
    })
  }

  setupOnLoaded() {
    this.win.webContents.on('did-finish-load', () => {
      this.win.webContents.executeJavaScript(`sessionStorage.setItem("initialized", true)`)
    })
  }

  async twinkleDummyWindow() {
    const dummy = new BrowserWindow({ width: 0, height: 0, frame: false,
      icon: await createImageFromSVG(replaceAsarPath(this.icons.svg), 96)
    })
    await new Promise(r => setTimeout(r, 100))
    dummy.hide()
    await new Promise(r => setTimeout(r, 10))
    setTimeout(() => dummy.close(), 20)
  }
}

module.exports = { Context }