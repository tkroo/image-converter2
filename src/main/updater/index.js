import { app, dialog, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import { getMainWindow } from '../helpers'
// import downicon from '../../../resources/download-circle.png?asset'

let dialogShown = false
const currentVersion = app.getVersion()

autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = false

ipcMain.handle('showUpdateMessage', showUpdateMessage)
ipcMain.handle('checkForUpdates', checkForUpdates)

function showUpdateMessage(message) {
  getMainWindow().webContents.send('showUpdateMessage', message)
}
function sendUpDateInfo(info) {
  info.currentVersion = currentVersion
  // console.log('info', info)
  getMainWindow().webContents.send('sendUpDateInfo', info)
}

// function confirmUpdate(info) {
//   const options = {
//     type: 'question',
//     title: 'imageconverter2 update available',
//     message: `Update to version ${info.version} ?`,
//     detail: `current version: ${app.getVersion()}`,
//     buttons: ['no', 'yes'],
//     cancelId: 0,
//     icon: downicon
//   }
//   dialog.showMessageBox(getMainWindow(), options)
//   .then((result) => {
//     dialogShown = true
//     if (result.response === 0) return    
//     downloadAndUpdate(true)
//   })
// }

// function downloadAndUpdate() {
//   autoUpdater.autoDownload = true
//   autoUpdater.checkForUpdates(true)
// }

export function checkForUpdates(autoDownloadBool = false) {
  autoUpdater.autoDownload = autoDownloadBool
  autoUpdater.on('update-available', (info) => {
    sendUpDateInfo(info)
    showUpdateMessage(`${app.name} ${app.getVersion()}<br/>update available: ${info.version}`)
    // if(!dialogShown) confirmUpdate(info)
  })
  autoUpdater.on('update-not-available', (info) => {
    sendUpDateInfo(info)
    showUpdateMessage(`${app.name} ${app.getVersion()}`)
  })
  autoUpdater.on('update-downloaded', (info) => {
    sendUpDateInfo(info)
    showUpdateMessage(`version ${info.version} downloaded.`)
    autoUpdater.quitAndInstall()
  })
  autoUpdater.checkForUpdates()
}
