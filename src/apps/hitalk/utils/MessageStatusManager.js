import MessageStatus from "@/enums/modules/MessageStatus";
const uuid = require('uuid');

const DBVERSION = 2;
const USER_MESSAGES = [
  MessageStatus.CHAT,
  MessageStatus.PHOTO,
  MessageStatus.PHOTOMULTI,
  MessageStatus.STICKER,
  MessageStatus.FILE,
  MessageStatus.VIDEO,
  MessageStatus.SHARE
]

const getOpenRequest = () => {
  const request = indexedDB.open('MessageDB', DBVERSION);
  request.onupgradeneeded = event => {
    const db = event.target.result;
    if (!db.objectStoreNames.contains('messages')) {
      const objectStore = db.createObjectStore('messages', { keyPath: 'tempId' });
      objectStore.createIndex('roomId', 'roomId', { unique: false });
    }
  };
  return request;
}

export default class MessageStatusManager {
  registNewMessage(roomId, message) {
    return new Promise((resolve, reject) => {
      if (!USER_MESSAGES.includes(message.contentType) || message.tempId) {
        return resolve(message);
      }
      const tempId = uuid.v4();
      const timestamp = new Date().getTime();
      
      const request = getOpenRequest();

      request.onsuccess = event => {
        const db = event.target.result;
        
        const transaction = db.transaction(['messages'], 'readwrite');
        const objectStore = transaction.objectStore('messages');
        const addRequest = objectStore.add({ ...message, tempId, roomId, timestamp });

        addRequest.onsuccess = () => {
          resolve({ ...message, tempId });
        };

        addRequest.onerror = event => {
          console.error('Error adding message to IndexedDB:', event.target.errorCode);
          reject(event.target.errorCode);
        };
      };

      request.onerror = event => {
        console.error('Error opening IndexedDB:', event.target.errorCode);
        reject(event.target.errorCode);
      };
    });
  }

  deletePendingMessage({tempId}) {
    return new Promise((resolve, reject) => {
      const request = getOpenRequest();

      request.onsuccess = event => {
        const db = event.target.result;
        const transaction = db.transaction(['messages'], 'readwrite');
        const objectStore = transaction.objectStore('messages');
        const deleteRequest = objectStore.delete(tempId);

        deleteRequest.onsuccess = () => {
          resolve();
        };

        deleteRequest.onerror = event => {
          console.error('Error deleting message:', event.target.errorCode);
          reject(event.target.errorCode);
        };
      };

      request.onerror = event => {
        console.error('Error opening IndexedDB:', event.target.errorCode);
        reject(event.target.errorCode);
      };
    });
  }

  fetchPendingMessages() {
    return new Promise((resolve, reject) => {
      const request = getOpenRequest();
      
      request.onsuccess = event => {
        const db = event.target.result;
        const transaction = db.transaction(['messages'], 'readwrite');
        const objectStore = transaction.objectStore('messages');
        const request = objectStore.openCursor();
        const messages = [];
        request.onsuccess = event => {
          const cursor = event.target.result;
          if (cursor) {
            messages.push(cursor.value);
            cursor.continue();
          } else {
            messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            resolve(messages);
          }
        };

        request.onerror = event => {
          console.error('Error fetching messages:', event.target.errorCode);
          reject(event.target.errorCode);
        };
      };

      request.onerror = event => {
        console.error('Error opening IndexedDB:', event.target.errorCode);
        reject(event.target.errorCode);
      };
    });
  }
}