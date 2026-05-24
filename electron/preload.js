const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (channel, data) => ipcRenderer.send(channel, data),
  receiveMessage: (channel, callback) => ipcRenderer.on(channel, (_, ...args) => callback(...args))
});

contextBridge.exposeInMainWorld('electronInitializer', {
  asyncWaitFor: async (cond) => new Promise((resolve) => {
    const interval = setInterval(() => 
      cond() && resolve(clearInterval(interval)), 10)}),
  injectStyles: () => {
    document.head.appendChild(document.createElement('style')).textContent =
      '.hc-confirm { padding: 32px 30px !important; width: 400px !important; border-radius: 20px !important; }'
  },
  setupKeydownHandlers: api => {
    window.addEventListener('keydown', event => {
      if (event.altKey && event.key === 'x')
        api.sendMessage('quit')
    })
  }
})

contextBridge.executeInMainWorld({func: () => {
  const originalAlert = window.alert;
  window.alert = async (message) => {
    await new Promise(r => setTimeout(r, 100));
    originalAlert(message);
    electronAPI.sendMessage('focus-fix');
  }
}})

contextBridge.executeInMainWorld({func: async () => {
  await electronInitializer.asyncWaitFor(() => document.body && document.body.classList)
  document.body.classList.add('on-electron')
  electronInitializer.injectStyles()
  electronInitializer.setupKeydownHandlers(electronAPI)
}});

