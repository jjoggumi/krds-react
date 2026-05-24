const {
  createOverlayIconWithText,
  createDotAttachedImage,
  replaceAsarPath
 } = require('./iconUtils');

let lastText = '';

const setWin32OverlayIcon = (win, text) => {
  if (text) {
    const overlay = createOverlayIconWithText(text);
    win.setOverlayIcon(overlay, `${text}`);
    if (lastText !== text) {
      win.flashFrame(true);
      setTimeout(() => {
        win.flashFrame(false);
      }, 5000);
    }
    lastText = text;
  } else {
    win.setOverlayIcon(null, '');
  }
}

module.exports = {
  setBadge: async (win, tray, icons, { text }) => {
    if ((text || '').length === 0) {
      win.setOverlayIcon(null, '')
      tray.setImage(icons.icon);
      lastText = ''
      return;
    }
    if (process.platform === 'win32') {
      setWin32OverlayIcon(win, text);
      tray.setImage(
        await createDotAttachedImage(replaceAsarPath(icons.png), 32));
    }
  }
}