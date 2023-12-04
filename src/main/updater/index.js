import { app, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import { getMainWindow } from '../helpers'

const currentVersion = app.getVersion()
const appName = app.getName()

autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = false

ipcMain.handle('checkForUpdates', checkForUpdates)

function sendUpDateInfo(info) {
  info.currentVersion = currentVersion
  info.appName = appName
  getMainWindow().webContents.send('sendUpDateInfo', info)
}
function sendUpDateDownloadProgress(msg) {
  getMainWindow().webContents.send('sendUpDateDownloadProgress', msg)
}

export function checkForUpdates(autoDownloadBool = false) {
  autoUpdater.autoDownload = autoDownloadBool

  autoUpdater.on('update-available', (info) => {
    sendUpDateInfo(info)
  })

  autoUpdater.on('update-not-available', (info) => {
    sendUpDateInfo(info)
  })

  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = 'downloaded ' + Math.round(progressObj.percent) + '%'
    // console.log('log_message', log_message)
    sendUpDateDownloadProgress(log_message)
  })

  autoUpdater.on('update-downloaded', (info) => {
    sendUpDateInfo(info)
    autoUpdater.quitAndInstall()
  })

  autoUpdater.checkForUpdates()
}
