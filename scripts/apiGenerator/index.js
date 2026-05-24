const config = require('./config');
const downloadSwaggerFile = require('./downloadSwaggerFile');
const generateApi = require('./generateApi');
const copySelectedFiles = require('./copySelectedFiles');

const output_path = process.argv[2] || (() => {
  console.error('Usage: node index.js <output_path>');
  process.exit(1);
})();

(async () => {
  await downloadSwaggerFile(config);
  await generateApi(config);
  await copySelectedFiles(config, output_path);
})()