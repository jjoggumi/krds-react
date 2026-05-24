const { asyncWaitFor, HitalkStompHandler, loadConfig } = require('../includes/common');
const fs = require('fs');
const path = require('path');

const main = async () => {
  const config = loadConfig();

  const handlers = config.users.map(([userId, token]) => new HitalkStompHandler(userId, token, '', config.stompServerUrl));

  console.log('Number of accounts: ', handlers.length);

  let startTime = new Date().getTime();
  const reports = [];
  for(let i = 0; i < config.sizeOfConnections; i++) {
    const handler = handlers[i % handlers.length];
    await handler.connect({ skipSubscribe: true });
    await asyncWaitFor(() => handler.connected);
    if (i > 0 && i % config.reportInterval === 0) {
      let elapsedTime = new Date().getTime() - startTime;
      console.log(`Connected ${i} accounts in\t${elapsedTime}\tms`);
      reports.push([i, elapsedTime]);
      startTime = new Date().getTime();
    }
  }

  const filePath = path.join(__dirname, 'reports.csv');
  fs.writeFileSync(filePath, "Connections,Elapsed Time\n" + reports.map(report => report.join(',')).join('\n'), 'utf8');
  console.log(`Reports saved to ${filePath}`);
//  process.exit(0);
}

main()