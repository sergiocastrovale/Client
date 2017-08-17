import { app, BrowserWindow,ipcMain,Menu,Tray,remote  } from 'electron'
const path = require('path')
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}



let mainWindow,model

const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
    mainWindow.show()

  }
  if(model){
    model.hide()
  }
})

if (shouldQuit) {
  app.quit()
}

let appIcon = null;
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`
const modelURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`


function createModel () {
  if(model){
    model.show()
  }else{
      model = new BrowserWindow({
        height: 150,
        useContentSize: false,
        width: 100,
        alwaysOnTop:true,
        transparent: true,
        frame:false,
        alwaysOnTop:true
      })
     model.loadURL(modelURL)
  }
  
  model.on('closed', () => {
    model = null
  })
}



function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 800,
    useContentSize: true,
    width: 1280,
    transparent: true,
    frame:false,
    minWidth:1002,
    minHeight:720,
    alwaysOnTop:true
  })

  mainWindow.loadURL(winURL)
  mainWindow.on('closed', () => {
    mainWindow = null
  })
  // mainWindow.openDevTools();
  appIcon = new Tray(__static+'/icon.ico');
  var contextMenu = Menu.buildFromTemplate([
    { label: '退出校朋',
      role: 'close',
      click: function() { 
        app.quit();
      }
    }
  ]);
  appIcon.setToolTip('校朋');
  appIcon.setContextMenu(contextMenu);
  appIcon.on('click',()=>{
    mainWindow.show()
    model.hide()
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
//小化
ipcMain.on('hide-window', () => {
    mainWindow.minimize();
});
//最大化
ipcMain.on('show-window', () => {
    mainWindow.maximize();
});
//显示主进程
ipcMain.on('show-main', (event, arg) => {
    mainWindow.show()
    if(model){

      model.hide()
    }
    
});
//还原
ipcMain.on('orignal-window', () => {
    mainWindow.setSize(1280,800);
});

//隐藏主进程
ipcMain.on('window-all-closed', (event, arg) => {
    mainWindow.hide();
    if(model){
       event.sender.send('youmenu', 'you')
       model.show()
       
    }else{
      createModel();
    }
    
});
//重新加载
ipcMain.on('reload', () => {
    mainWindow.reload()

});

ipcMain.on('createModel', createModel)

ipcMain.on('weixin-closed', () => {
  if (process.platform !== 'darwin') {
    model.hide()
  }
})



