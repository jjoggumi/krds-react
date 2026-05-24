const { HitalkStompHandler, loadConfig } = require('./common');

const main = async () => {
  const config = loadConfig();
  const handlers = config.users.map(([userId, token]) => new HitalkStompHandler(userId, token, config.roomId, config.stompServerUrl));
  const idxs = [...new Array(handlers.length).keys()];
  const connecteds = idxs.map(idx => [idx, false]);
  handlers.forEach((handler, idx) => {
    handler.connect().then(() => {
      connecteds[idx] = [idx, true];
    });
  })

  setInterval(() => {
    const unconnecteds = connecteds.filter(c => !c[1]);
    if (unconnecteds.length > 0) {
      console.log('unconnecteds', unconnecteds.map(c => c[0]).join(','));
    } else {
      console.log('all connected');
      process.exit(0);
    }
  }, 1000);
}

main()