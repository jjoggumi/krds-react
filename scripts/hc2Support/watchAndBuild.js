const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const packageRoot = path.resolve(__dirname, '../..');
const distPath = path.resolve(packageRoot, 'hc2', 'dist');
const manifestPath = path.resolve(distPath, '.vite', 'manifest.json');
const assetPath = path.resolve(distPath, 'assets');

const targetPath = path.resolve(packageRoot, 'public', 'react');

let isBuilding = false;
const servingEnvSettingStr = os.platform() === 'win32' ? 'set SERVING=1 && ' : 'export SERVING=1 && ';

const executeOnHC2 = (command) => new Promise((resolve, reject) => {
  exec(command, { cwd: path.resolve(packageRoot, 'hc2') }, (err, stdout, stderr) => {
    if (err) {
      console.error(stderr);
      reject(err);
    } else {
      console.log(stdout);
      resolve(stdout);
    }
  });
})

const buildHC2 = ({mode, isServing}) => {
  if (isBuilding) return;
  const mappedMode = { development: 'dev'}[mode] || mode;
  isBuilding = true;
  executeOnHC2(`${isServing? servingEnvSettingStr : ''}npx vite build ${mode && `--mode ${mappedMode}`}`)
    .then(() => postBuild())
    .finally(() => { isBuilding = false });
};

const moveAllFiles = (src, dest) => {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  executeForAllFiles(src, file => {
    const srcFile = path.join(src, file);
    const destFile = path.join(dest, file);
    fs.copyFileSync(srcFile, destFile);
    fs.unlinkSync(srcFile);
  })
}

const removeAllFiles = (dir) => executeForAllFiles(dir, file => fs.unlinkSync(path.join(dir, file)))
const executeForAllFiles = (dir, callback) => {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(callback)
}

const replaceViteDist = (html) => {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  
  const entry = Object.values(manifest).find(f => f.isEntry && f.src && f.src.endsWith('hc2.js'));
  const jsFile = entry ? entry.file.replace('assets/', '') : '';

  // helper: manifest 내부에서 특정 소스명이나 파일명을 포함하는 항목의 출력 파일명을 찾는다.
  const findOutputFor = (needle) => {
    const found = Object.entries(manifest).find(([key, val]) => {
      if (key && key.includes(needle)) return true;
      if (val && val.src && val.src.includes(needle)) return true;
      if (val && val.file && val.file.includes(needle)) return true;
      return false;
    });
    return found ? found[1].file.replace('assets/', '') : '';
  }

  // 기존 entry.css 배열에 의존하는 방식과 함께, manifest 전역 검색으로 보완한다.
  const cssPathArr = entry ? entry.css || [] : [];
  console.log('Manifest full:', manifest);
  console.log('Entry css array:', cssPathArr);

  const twCss = (cssPathArr.find(p => p.includes('hc-tailwind')) || findOutputFor('hc-tailwind'))?.replace('assets/', '') || '';
  const hc2Css = (cssPathArr.find(p => p.includes('hc2')) || findOutputFor('hc2'))?.replace('assets/', '') || '';
  const hcCommonCss = (cssPathArr.find(p => p.includes('hc-common')) || findOutputFor('hc-common'))?.replace('assets/', '') || '';

  const reactCss = {
    tailwindCss: twCss ? `/react/${twCss}` : null,
    hcCommonCss: hcCommonCss ? `/react/${hcCommonCss}` : null
  }

  return html.replace(
    /<!-- VITE DIST BEGIN -->([\s\S]*?)<!-- VITE DIST END -->/g,
    `<!-- VITE DIST BEGIN -->
    <script type="module" crossorigin src="/react/${jsFile}"></script>
    <script>window.__REACT_ASSETS__ = ${JSON.stringify(reactCss)}</script>
    ${hc2Css ? `<link rel="stylesheet" crossorigin href="/react/${hc2Css}">` : ''}
    <!-- VITE DIST END -->`
  )
}

const postBuild = () => {
  removeAllFiles(targetPath);
  moveAllFiles(assetPath, targetPath);
}

const prepareHC2 = () => executeOnHC2('npm install')

const watchHC2 = (mode) => {
  require('chokidar').watch('hc2', {ignored: p => p.includes('node_modules') || p.includes('dist')})
    .on('change', () => buildHC2({mode, isServing: true}))
  prepareHC2()
    .then(() => buildHC2({mode, isServing: true}))
};

module.exports = {
  buildHC2,
  watchHC2,
  replaceViteDist,
  prepareHC2,
  safeBuildHC2: mode => prepareHC2().then(() => buildHC2({mode, isServing: false}))
}