const { asyncWaitFor, HitalkStompHandler, loadConfig } = require('../includes/common');

const main = async () => {
  const config = loadConfig();

  const handlers = new Array(config.sizeOfConnections).fill(null).map((_, i) => 
    new HitalkStompHandler(config.users[i % config.users.length][0], config.users[i % config.users.length][1], config.roomId, config.stompServerUrl)
  );
  const connectedHandlers = []

  console.log('Number of handlers: ', handlers.length);
  console.log('Message template: ', config.messageTemplate);
  console.log(`${config.messagesPerSecond} messages per second will be sent after ${config.waitingSecondsForStart} seconds...`);

  let startTime = new Date().getTime();
  let idx = 0;

  setTimeout(() => {
    console.log('Starting to send messages...');
    setInterval(() => {
      console.log(`Sending ${config.messagesPerSecond} messages at ${new Date().toISOString()}`);
      Array.from({ length: config.messagesPerSecond }, () => Math.random() * 1000).sort().forEach(s => {
        setTimeout(() => {
          connectedHandlers[Math.floor(Math.random() * connectedHandlers.length)]
            .sendStompMessage(config.messageTemplate.replace('{idx}', idx++).replace('{timestamp}', Date.now()), 'CHAT')
        }, s)
      });
    }, 1000);
  }, config.waitingSecondsForStart * 1000);

  for(let i = 0; i < handlers.length; i++) {
    const handler = handlers[i];
    await handler.connect({ skipSubscribe: true });
    await asyncWaitFor(() => handler.connected);
    connectedHandlers.push(handler);
    if (i > 0 && i % config.reportInterval === 0) {
      let elapsedTime = new Date().getTime() - startTime;
      console.log(`Connected ${i} connections in\t${elapsedTime}\tms`);
      startTime = new Date().getTime();
    }
  }
}

main()