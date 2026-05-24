const path = require('path');
const fs = require('fs').promises;

module.exports = async (config, output_path) => {
  const srcDir = path.join(__dirname, config.temp_path);
  await fs.mkdir(output_path, { recursive: true });
  (await fs.readdir(srcDir))
    .filter(file => config.using_modules.includes(file.split('.')[0]))
    .forEach(file => fs.copyFile(path.join(srcDir, file), path.join(output_path, file)));
};