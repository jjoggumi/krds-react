import { build } from 'electron-builder'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import dotenv from 'dotenv'
import { saveEntryURL, defaultStoreFileName } from './src/store.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, `../.env.${process.env.MODE || 'production'}`) })
const defaultEntryURL = process.env.VUE_APP_BASE_UI_URI + '/hitalk'

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'))
const output = `dist/${process.env.MODE || 'production'}`
const artifactName = packageJson.build.artifactName + (['dev', 'board', 'stage'].includes(process.env.MODE) ? `-${process.env.MODE}` : '') + '-${version}.${ext}'

const prepareDefaultEntryURL = (url, requestedPlatforms) => {
  console.log('prepareDefaultEntryURL', url, requestedPlatforms)
  requestedPlatforms.forEach(platform => {
    const unpackedDir = path.join(__dirname, `${output}/${platform}-unpacked`)
    if (fs.existsSync(unpackedDir))
      saveEntryURL(url, path.join(unpackedDir, defaultStoreFileName))
  })
}
build({
  config: {
    ...packageJson.build,
    artifactName,
    afterPack: ({ packager }) => {
      const platformNameMap = { windows: 'win', linux: 'linux', mac: 'mac' }
      prepareDefaultEntryURL(defaultEntryURL, [platformNameMap[packager.platform.name]]);
    },
    directories: { output }
  },
}).then(() => {
  console.log('Build completed successfully');
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
