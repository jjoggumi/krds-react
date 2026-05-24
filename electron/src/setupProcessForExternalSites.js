const { shell } = require('electron')

const logoImage = "data:image/png;base64,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"

module.exports = ( { win, EntryURL }) => {
    const EntryHost = EntryURL.replace('/hitalk', '')

    win.webContents.on('will-navigate', (event, url) => {
      const toOpenExternalUrls = [
        'https://accounts.kakao.com/weblogin',
        'https://account.i-screammedia.com/user/findID.do',
        'https://stageaccount.i-screammedia.com/user/findID.do',
        'https://accounts.google.com/signin/v2/usernamerecovery',
        'https://accounts.google.com/lifecycle/flows/signup'
      ]
      if (toOpenExternalUrls.some((toOpenExternalUrl) => url.startsWith(toOpenExternalUrl))) {
        event.preventDefault();
        shell.openExternal(url);
      }
    });

    win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      const headers = { ...details.responseHeaders };
      delete headers['content-security-policy'];
      delete headers['Content-Security-Policy'];
      callback({ cancel: false, responseHeaders: headers });
    });

    win.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });

    win.webContents.on('did-finish-load', () => {
      if (win.webContents.getURL().startsWith(EntryHost))
        return win.webContents.executeJavaScript('document.querySelector(".hitalk-electron-logo-wrap") && document.querySelector(".hitalk-electron-logo-wrap").remove()');
      win.webContents.executeJavaScript(`
        const div = document.createElement('div');
        const img = document.createElement('img');
        div.appendChild(img);
        document.body.appendChild(div);

        div.style = 'position: fixed; top: 0; left: 0; width: 100%; height: 80px; background: #fff; border-top: 1px solid #eee; border-bottom: 1px solid #eee; z-index: 999999;';
        div.className = 'hitalk-electron-logo-wrap';
        img.src = '${logoImage}';
        img.style = 'width: 107px; height: 51px; position: absolute; top: 14px; left: 48px; cursor: pointer;';
        img.onclick = () => { document.location = '${EntryURL}';}

        [
        ['i-screammedia.com/login', () => {
          document.body.style = 'padding-top: 80px; overflow: hidden;';
          document.querySelector('.header_int.hea_login').remove();
          document.querySelector('.footer_int').remove();
        }],
        ['oauth2.hiclass.net/login', () => {
          document.body.style = 'padding-top: 80px; overflow: hidden;';
          document.querySelector('.logo-wrap').remove();
        }],
        ['naver.com', () => { document.body.style.paddingTop = '80px'; }],
        ['apple.com', () => { document.querySelector('.ac-localnav-wrapper').remove(); }]]
          .forEach(([host, func]) => { window.location.href.includes(host) && func();});`)
    })
}