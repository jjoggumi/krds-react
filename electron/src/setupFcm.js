const firebase = {
  apiKey: "AIzaSyBMlftT-MLM_4uNXKH_nKHvAJBokKtGDys",
  appID: "1:1028665832919:web:ba9018e7cdba9aea568792",
  projectID: "newclass-bb938"
};

const { register, listen } = require('push-receiver-v2');

module.exports = async ({onReceivedToken, onReceivedMessage}) => {
  const credentials = await register({firebase});
  listen(credentials, onReceivedMessage);
  onReceivedToken(credentials.fcm.token);
}