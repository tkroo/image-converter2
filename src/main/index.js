import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import fs from 'node:fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import {
  appTmpDir,
  selectOutDir,
  openDirectory,
  getConfig,
  setConfig,
  editConfig,
  initConfig,
  resetFormatOptions,
} from './helpers'

import { handleFile, createDirectories } from './convert'

let mainWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    icon: process.platform === 'linux' ? { icon } : {},
    webPreferences: {
      webSecurity: is.dev ? false : true,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: join(__dirname, '../preload/index.js'),
      additionalArguments: []
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    is.dev && mainWindow.webContents.openDevTools()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })
  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.handle('dialog:selectOutDir', selectOutDir)
  ipcMain.handle('dialog:openDirectory', openDirectory)
  ipcMain.handle('dialog:getConfig', getConfig)
  ipcMain.handle('dialog:setConfig', setConfig)
  ipcMain.handle('dialog:resetConfig', resetConfig)
  ipcMain.handle('dialog:editConfig', editConfig)
  ipcMain.handle('dialog:handleFile', handleFile)
  ipcMain.handle('dialog:createDirectories', createDirectories)

  initConfig()
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', async(e) => {
  fs.rmSync(appTmpDir, { recursive: true, force: true })
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
function resetConfig() {
  resetFormatOptions()
  mainWindow.reload()
}
