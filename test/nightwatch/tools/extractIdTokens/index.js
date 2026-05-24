const { HiClass } = require('../../includes');

const fs = require('fs');
const path = require('path');

const config_path = (process.argv.slice(2).find(a => a.includes('--config-path=')) || '').split('=')[1];
let localConfig = {}

const assertInputPath = () => {
  if (!config_path) {
    throw new Error('"--config-path" is required');
  }
}

const loadTargetListFromInputPath = () => {
  const filePath = path.resolve(config_path);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  localConfig = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

const extractIdToken = (hiClass, [username, password]) =>
  new Promise(resolve => {
    hiClass.loginStudent({username, password, host: localConfig.host});
    hiClass.browser.execute(() => [localStorage.getItem('uuid'), localStorage.getItem('idToken')],
      [], result => {
        hiClass.logout();
        resolve(result.value);
    });
  });

const saveTokensToFile = (tokens) => {
  const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15);
  const fileName = `extractIdTokens.result.${timestamp}.json`;
  const filePath = path.resolve(__dirname, fileName);
  fs.writeFileSync(filePath, JSON.stringify(tokens, null, 2), 'utf-8');
  console.log(`Tokens saved to ${filePath}`);
};

module.exports = {
  '요청된 username/password 배열에 대해 uuid, idTokens 추출': async (browser) => {
    assertInputPath();
    loadTargetListFromInputPath();
    
    const hiclass = new HiClass(browser);
    saveTokensToFile(await Promise.all(localConfig.targets.map(target => extractIdToken(hiclass, target))));
  }
}