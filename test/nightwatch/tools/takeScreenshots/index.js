const { HiClass } = require('../../includes')
const path = require("path")
const fs = require("fs")
const { execSync } = require("child_process")

const config_path = (process.argv.slice(2).find(a => a.includes('--config-path=')) || '').split('=')[1]
let localConfig = {}
let currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim().split('/').pop()
const targets = {}

const assertInputPath = () => {
  if (!config_path) {
    throw new Error('"--config-path" is required')
  }
}

const loadTargetListFromInputPath = () => {
  const filePath = path.resolve(config_path)
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`)
  }
  localConfig = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  for (let [key, value] of Object.entries(localConfig.targets)) {
    if (!fs.existsSync(value)) continue
    targets[key] = JSON.parse(fs.readFileSync(value, 'utf-8'))
  }
}

const takeScreenshots = (browser) => {
  for (let [key, target] of Object.entries(targets)) {
    const filePath = `${localConfig.output}/${currentBranch}/${key}`

    const executeAction = ({action, selector, value}) => {
      if ((action || "") === "") return
      console.log(`executeAction: ${action}, ${selector}, ${value}`)
      const actions = {
        'navigateTo': () => browser.navigateTo(value),
        'pause': () => browser.pause(value),
        'default': () => browser.element(selector)[action](value),
        'waitForElementPresent': () => browser.waitForElementPresent(selector),
        'scrollToElement': () => {
          browser.execute(function(selector) {
            const element = document.querySelector(selector)
            if (element) { element.scrollIntoView({behavior: 'smooth'}) }
          }, [selector])
        }
      }
      return (actions[action] || actions.default)()
    }

    target.forEach(({name, path, after=[], wait=''}, idx) => {
      browser.perform(done => {
        console.log(name)
        path.forEach(executeAction)
        browser.pause(700)
        browser.saveScreenshot(`${filePath}/${key}_${idx}_${name}.png`, () => {
          after.forEach(executeAction)
          done()
        })
      })
    })
  }
}

module.exports = {
  '스크린샷 생성' (browser) {
    assertInputPath()
    loadTargetListFromInputPath()
    const hiclass = new HiClass(browser)
    hiclass.loginTeacher(browser.globals.teacher)
    browser.waitForElementVisible('.main-myclass__list .main-myclass__item:nth-child(1)', 30 * 1000)
    takeScreenshots(browser)
  }
}