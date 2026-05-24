const looksSame = require('looks-same')
const path = require("path")
const fs = require("fs")
const config_path = (process.argv.slice(2).find(a => a.includes('--config-path=')) || '').split('=')[1]
const baseImagePaths = []
const diffLogs = {}
let config = {}

const assertInputPath = () => {
  if (!config_path) {
    throw new Error('"--config-path" is required')
  }
}

const loadTargetFolderFromInputPath = () => {
  const filePath = path.resolve(config_path)
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`)
  }
  config = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

const setBaseImagePaths = () => {
  const getBaseImagePaths = (path) => {
    fs.readdirSync(path).forEach(file => {
      const fullPath = path.concat('/', file)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        getBaseImagePaths(fullPath)
      } else if (fullPath.match(/\.(png|jpg|jpeg)$/i)) {
        baseImagePaths.push(fullPath.split(config.baseFolder).pop())
      }
    })
  }

  const fullPath = config.screenshots.concat('/', config.baseFolder)
  getBaseImagePaths(fullPath)
}

const getImageDifference = async () => {
  for (const compareFolderName of config.compareFolders) {
    diffLogs[compareFolderName] = []

    for (const imagePath of baseImagePaths) {
      const baseImage = config.screenshots.concat('/', config.baseFolder, imagePath)
      const compareImage = config.screenshots.concat('/', compareFolderName, imagePath)

      if (!fs.existsSync(compareImage)) {
        diffLogs[compareFolderName].push(`❌이미지가 존재하지 않음: ${compareImage}`)
        continue
      }

      const {equal, diffImage} =
        await looksSame(fs.readFileSync(baseImage), fs.readFileSync(compareImage), {tolerance: 100, createDiffImage: true})

      diffLogs[compareFolderName].push(`isEqual: ${equal ? equal : `${equal} 😱❗`}\nbasePath: ${baseImage}\ncomparePath: ${compareImage}`)

      if (!equal) {
        if (!fs.existsSync(`${config.output}/${compareFolderName}`)) {
          fs.mkdirSync(`${config.output}/${compareFolderName}`, { recursive: true })
        }
        await diffImage.save(`${config.output}/${compareFolderName}/${imagePath.split('/').pop()}`)
      }
    }
  }
}

const saveLogs = () => {
  for (let [folderName, logs] of Object.entries(diffLogs)) {
    const path = `${config.output}/${folderName}/diffLogs.txt`

    fs.writeFile(path, logs.join('\n\n'), (err) => {
      err ? console.error('log 파일 저장 실패:', err) : console.log('log 파일 저장 성공:', path)
    })
  }
}

const execute = async () => {
  assertInputPath()
  loadTargetFolderFromInputPath()
  setBaseImagePaths()
  await getImageDifference() // await 사용 가능
  saveLogs()
}

execute().catch(err => console.error(err))