const { wait, HitalkStompHandler, loadConfig } = require('../includes/common');

const main = async () => {
  const config = loadConfig();

  const handlers = config.users.map(([userId, token]) => new HitalkStompHandler(userId, token, config.roomId, config.stompServerUrl));

  await Promise.all(handlers.map(handler => handler.connect()));

  for (let i = 0; i < config.messageCounts;) {
    for (handler of handlers) {
      handler.sendStompMessage(`#${i++}, ${new Date().toISOString()}`);
      if ((config.userMessageInterval || 0) > 0) {
        await wait(config.userMessageInterval);
      }
    }
    await wait(config.groupInterval);
  }

}

main()