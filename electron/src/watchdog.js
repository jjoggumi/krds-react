const fs = require('fs');
const path = require('path');
const { spawn  } = require('child_process');
const os = require('os');

let intarvalId = null;

const postUninstallProcesses = {
  win32: () => {
    const exePath = path.dirname(process.execPath);
    const deleteScriptPath = path.join(exePath, 'deleteAll.bat');
    fs.writeFileSync(deleteScriptPath, `
      @echo off
      timeout /t 1  >nul 2>&1
      rd /q /s "${path.join(exePath, 'resources')}" >nul 2>&1
      del /q /s "${exePath}\\*.*" >nul 2>&1`);
    spawn('cmd', ['/c', deleteScriptPath], 
      { detached: true, stdio: 'ignore', windowsHide: true }).unref();
  }
}

const checkExistenceOfExeFile = () => {
  try {
    if (fs.existsSync(process.execPath)) return;
    clearInterval(intarvalId);
    (postUninstallProcesses[os.platform()] || (() => {})) ();
    process.exit(0);
  }
  catch (error) {
    console.error('Error checking existence of exe file:', error);
  }
}

module.exports = () => {
  intarvalId = setInterval(() => {
    checkExistenceOfExeFile();
  }, 5 * 1000);
}