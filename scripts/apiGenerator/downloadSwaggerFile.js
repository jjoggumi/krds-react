const fs = require('fs');
const https = require('https');
const path = require('path');

module.exports = async ({ swagger_url, swagger_json }) => {
  const outputPath = path.join(__dirname, swagger_json);
  try {
    const res = await new Promise((resolve, reject) => {
      https.get(swagger_url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to fetch Swagger file. Status code: ${res.statusCode}`));
          res.resume();
          return;
        }
        resolve(res);
      }).on('error', (err) => {
        reject(err);
      });
    });

    const data = await new Promise((resolve, reject) => {
      let chunks = '';
      res.on('data', (chunk) => {
        chunks += chunk;
      });
      res.on('end', () => resolve(chunks));
      res.on('error', (err) => reject(err));
    });

    await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.promises.writeFile(outputPath, data);
    console.log('Swagger file saved successfully.');
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
}