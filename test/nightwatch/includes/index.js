const Hitalk = require('./hitalk');
const login = require('./login');
const HiClass = require('./hiclass');
const { createBrowser } = require('./common');

const HiClassOnNewBrowser = async () => {
  const client = await createBrowser();
  return new HiClass(client);
}

module.exports = {
  HiClass,
  Hitalk,
  login,
  HiClassOnNewBrowser
}