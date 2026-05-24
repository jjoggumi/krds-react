Object.assign(global, { WebSocket: require('ws') });
const Stomp = require("stompjs");
const UUID = require('uuid');
const fs = require('fs');
const path = require('path');

const asyncWaitFor = condition => {
  return new Promise(resolve => {
    const checkCondition = () => {
      if (condition()) {
        resolve();
      } else {
        setTimeout(checkCondition, 10);
      }
    };
    checkCondition();
  });
}

class HitalkStompHandler {
  constructor(userId, token, roomId, stompServerUrl = 'wss://devchat.hiclass.net/connect/websocket') {
    this.stompClient = null;
    this.userId = userId;
    this.token = token;
    this.roomId = roomId;
    this.stompServerUrl = stompServerUrl;
    this.connected = false;
    this.sentMessages = [];
  }

  connect({skipSubscribe = false} = {}) {
    return new Promise(resolve => {
      this.stompClient = Stomp.client(this.stompServerUrl)
      this.stompClient.reconnect_delay = 2000;
      this.stompClient.debug = () => {};
      this.stompClient.heartbeat.incoming = 20000;
      this.stompClient.heartbeat.outgoing = 20000;
      this.stompClient.connect({ Authorization: `Bearer ${this.token}` }, async () => {
        if (!skipSubscribe) {
          await this.subscribeRoom();
        }
        this.connected = true;
        resolve();
    })});
  }

  subscribeRoom() {
    return this.stompClient.subscribe(`/topic/${this.roomId}`, this.onReceiveMessage.bind(this), { id: this.roomId + "/" + this.userId });
  }

  sendStompMessage(content, contentType = "CHAT") {
    return new Promise(resolve => {
      const tempId = UUID.v4();
      this.sentMessages.push(tempId);
      this.stompClient.send(`/app/${this.roomId}`, {}, JSON.stringify({ sender: this.userId, contentType, content, tempId }));
      asyncWaitFor(() => !this.sentMessages.includes(tempId)).then(resolve);
    })
  }

  onReceiveMessage(message) {
    const strMessage = JSON.stringify(message);
    if (strMessage.indexOf('DISCONNECT') !== -1) {
      console.log('Received DISCONNECT message, ', strMessage);
      return;
    }
    if (strMessage.indexOf('err') !== -1) {
      console.log('Received error message, ', strMessage);
      return;
    }
    const { tempId } = JSON.parse(message.body);
    this.sentMessages = this.sentMessages.filter(id => id !== tempId);
    console.log('onReceiveMessage', this.sentMessages.length);
  }
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const loadConfig = () => {
  return JSON.parse(fs.readFileSync(path.resolve(process.argv[2]), 'utf8'));
}

module.exports = {
  HitalkStompHandler,
  asyncWaitFor,
  wait,
  loadConfig
}