const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
console.log(process.env.NODE_ENV);

const getHashOfFile = file => {
  return crypto.createHash('md5').update(fs.readFileSync(file)).digest('hex');
};

const resolveWildcardFile = (pattern, outputDir) => {
  const pair = [pattern.split('/').slice(0, -1).join('/'), pattern.split('/').slice(-1)[0]];
  const regex = new RegExp('^' + pair[1].replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
  const files = fs.readdirSync(outputDir + pair[0]).filter(file => regex.test(`${file}`));
  if (files.length === 0) {
    throw new Error(`No files found for pattern: ${pattern}, ${fs.readdirSync(outputDir + pair[0])}`);
  }
  return `${pair[0]}/${files[0]}`;
};


const main = ({outputDir, urlPrefix, outputFile}) => {
  const cacheTargets = JSON.parse(fs.readFileSync(path.join(__dirname, 'cacheTargets.json'), 'utf-8'));
  const result = cacheTargets['onBuild'].map(({file, alias, additional}) => {
    const resolvedFile = file.includes('*') ? resolveWildcardFile(file, outputDir) : file;
    return {
      url: `${urlPrefix}${resolvedFile}`,
      hash: getHashOfFile(path.join(outputDir, resolvedFile)),
      alias: (alias || []).length > 0 ? alias.map(a => `${urlPrefix}${a}`) : undefined,
      ...additional
    };
  });

  const outputFilePath = path.join(outputDir, outputFile);
  fs.writeFileSync(outputFilePath, JSON.stringify(result.concat(cacheTargets['defaultList']), null, 2));
}

const outputDir = process.argv[2];
const urlPrefix = process.argv[3] || process.env.VUE_APP_BASE_UI_URI;
const outputFile = process.argv[4] || 'cacheList.json';

if (require.main === module) {
  if (!outputDir || !urlPrefix || !outputFile) {
    console.error('Usage: node buildCacheList.js <outputDir> <urlPrefix> <outputFile>');
    process.exit(1);
  }

  main({outputDir, urlPrefix, outputFile});
}

module.exports = main;