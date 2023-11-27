import { app, dialog, BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'
import { getMainWindow } from '../helpers'

let dialogShown = false

autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = false

function confirmUpdate(info) {
  dialog.showMessageBox(getMainWindow(), {
    'type': 'question',
    'title': 'Update available',
    'message': `Update to ${info.version} ?`,
    'detail': `current version: ${app.getVersion()}`,
    'buttons': ['no', 'yes'],
    'cancelId': 0,
  })
  .then((result) => {
    dialogShown = true
    if (result.response === 0) { return }
    autoUpdater.autoDownload = true
    autoUpdater.on('update-available', (info) => {
      console.log('updating...')
    })
    autoUpdater.checkForUpdates()
  })
}

if (app.isPackaged) {
  autoUpdater.checkForUpdates()
  autoUpdater.on('update-available', (info) => {
    showUpdateMessage(`${app.name} ${app.getVersion()}<br/>update available: ${info.version}`)
    if(!dialogShown) confirmUpdate(info)
  })
  autoUpdater.on('update-not-available', (info) => {
    showUpdateMessage(`${app.name} ${app.getVersion()}`)
  })
  autoUpdater.on('update-downloaded', (info) => {
    showUpdateMessage(`version ${info.version} downloaded.`)
    autoUpdater.quitAndInstall()
  })
}

export function showUpdateMessage(message) {
  getMainWindow().webContents.send('showUpdateMessage', message)
}