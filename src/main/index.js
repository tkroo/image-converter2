import { app, shell, BrowserWindow, dialog, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/256x256.png?asset'
import Store from 'electron-store'

const extraPath = 'foo'
const schema = {
  outputDirectory: {
    type: 'string'
  },
  appendString: {
    type: 'string',
    default: '_extra'
  },
  defaultFormat: {
    type: 'string',
    default: 'png'
  }
}

const store = new Store({ schema })
console.log(store.store)

let mainWindow

async function selectOutDir() {
  const { canceled, filePaths } = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
    properties: ['openDirectory']
  })
  if (!canceled) {
    store.set('outputDirectory', filePaths[0])
    return filePaths[0]
  } else {
    return getDefaultOutDir()
  }
}

async function getDefaultOutDir() {
  try {
    const out = store.get('outputDirectory')
    if (out) {
      return out
    } else {
      const tmp = join(app.getPath('desktop'), extraPath)
      store.set('outputDirectory', tmp)
      return tmp
    }
  } catch (err) {
    console.log(`error: ${err}`)
  }

  // const defaultDir = join(app.getPath('desktop'), extraPath)
  // store.set('outputDirectory', defaultDir)
  // console.log(store.get('outputDirectory'))
  // return defaultDir
}

async function openDirectory(event, path) {
  shell.openPath(path)
}

async function getConfig() {
  return store.store
}

async function setConfig(event, key, value) {
  store.set(key, value)
}

function initConfig() {
  getDefaultOutDir()
  let tempObj = store.store
  store.store = tempObj
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      webSecurity: is.dev ? false : true,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      additionalArguments: [app.getPath('temp')]
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    if (is.dev) {
      mainWindow.webContents.openDevTools()
    }
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

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
