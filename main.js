
// Modules to control application life and create native browser window
const {app, BrowserWindow,session,systemPreferences ,desktopCapturer,ipcMain,Menu,Tray,screen } = require('electron')
let process=require('process')
const path = require('path')
const isMac = process.platform === 'darwin'
let mainWindow,trayMenuWin
let trayList=[],trayIds=[]
let tray = null,twinkle=false,isLeave=true,trayTimer,trayPosistion={x:0,y:0,width:360,height:(36+20)*0+28+(28+10*2)+14}
let trayUrl=require('path').join(__dirname, './assets/tip.png')
let hideTray=require('path').join(__dirname, './assets/hideTip.png')
// app.commandLine.appendSwitch('js-flags', '--expose_gc --max-old-space-size=512')
// app.commandLine.appendSwitch('ignore-certificate-errors')
// app.disableHardwareAcceleration()
function createWindow () {
  // Create the browser window.
  Menu.setApplicationMenu(null)
   mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minHeight:600,
    minWidth:800,
    frame:false,
    icon: path.join(__dirname, 'favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  mainWindow.loadFile('index.html')
  // Open the DevTools.
  mainWindow.webContents.openDevTools()
  // const desc=systemPreferences.getMediaAccessStatus("screen") 
   let sessionIn= session.defaultSession;
  sessionIn.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(true)
  })
}

function createTrayMenu(){
   trayMenuWin = new BrowserWindow({
    modal: true,
    autoHideMenuBar: true,
    disableAutoHideCursor: true, 
    frame: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  trayMenuWin.loadFile('./trayMenu.html');
  trayMenuWin.webContents.openDevTools()
}

app.whenReady().then(() => {
  createWindow()
  createTrayMenu()
  initTray()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  mainWindow.webContents.on('destroyed',function(){
    closeAll()
  })
})
app.on('window-all-closed', function () {
  closeAll()
})

// 
ipcMain.on('window-msg',(event,param)=>{
  const obj=JSON.parse(param)
  if(obj.index=='contextMenus'){
    let  template=[]
    if(obj.type=='base'){
      template = [
        {label: '打开控制台',click: () => { openDev(mainWindow)}},
        { type: 'separator' },

        {label: '刷新',click: () => { event.sender.send('main-msg', JSON.stringify({index:'reload'})) }},
        { label: '最小化',click: () => {  minimize(event.sender)} },
        { label: '最小到托盘',click: () => {minTray() } },
        { label: '关闭',click: () => {  event.sender.send('main-msg', JSON.stringify({index:'close'})) } }
      ]
    }else if(obj.type=='userList'){
      template=[
        {label: '创建群聊',click: () => { event.sender.send('main-msg',JSON.stringify({index:'createdWS'}))}},
        // {label: '删除聊天记录',click: () => { event.sender.send('main-msg', 'deleteHistory',key)}}
      ]
    }
    else if(obj.type=='message'){
      template=[
        {label:'引用\n'+obj.data,click:()=>{
          // event.sender.
          event.sender.send('main-msg',JSON.stringify({index:'quote',data:obj.data}))
        }}
      ]
    }
    const menu = Menu.buildFromTemplate(template)
    menu.popup(BrowserWindow.fromWebContents(event.sender))
  }
  else if(obj.index=='minus'){
    minimize(event.sender)
  }else if(obj.index=='closeToTray'){
    minTray(event.sender)
  }else if(obj.index=='close'){
    closeAll()
  }else if(obj.index=='twinkle'){
    twinkle=true    
      const key=trayIds.indexOf(obj.data.start)
      trayIds.push(obj.data.start)
      trayList.push(obj.data)
      if(key!=-1){
        trayIds.splice(key,1)
        trayList.splice(key,1)
      }
      trayMenuWin.webContents.send('tray-msg',JSON.stringify({index:'renderTray',param:trayList}))
      trayPosistion.height+=(36+20)*trayIds.length
    startTwinkle(event.sender)
  }else if(obj.index=='handleVideo'){
    desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
      mainWindow.webContents.send('SET_SOURCE', sources[0].id)
      // for (const source of sources) {
      //   // console.log(source.name,'3333333')
      //   if (source.name === 'have a chat') {
      //     mainWindow.webContents.send('SET_SOURCE', source.id)
      //     return
      //   }
      // }
    })
  }
})

ipcMain.on('tray-msg',(event,param)=>{
  const obj=JSON.parse(param)
  if(obj.index=='findUser'){
    mainWindow.webContents.send('main-msg', JSON.stringify(obj))
    showWindow()

  }
  else if(obj.index=='tray-msg'){
    tray.setToolTip('这是客服系统')
    twinkle=false
    trayList=[]
    trayIds=[]
    mainWindow.webContents.send('main-msg',JSON.stringify({index:'showWin'}));
  }
})
function initTray(){
  tray = new Tray(trayUrl)
  const contextMenu = Menu.buildFromTemplate([
    { label: '.\n 关于客服 \n .', type: 'normal' },
    { label: '. \n 退出 \n .', type: 'normal',click:()=>{
      closeAll()
    } },
  ])
  tray.on('click', function () {
    showWindow()
  });
  tray.setToolTip('这是客服系统')
  tray.setContextMenu(contextMenu)
  tray.on('mouse-move',trayMove )
}
function trayMove(event,point){
  if(trayList.length==0)return false
  if( isLeave == true ) { // 从其他地方第一次移入菜单时，开始显示菜单页，然后在菜单内移动时不重复再显示菜单
    trayMenuWin.show();
  }
  isLeave = false;
let trayBounds = tray.getBounds();
if(!trayPosistion.x)
trayPosistion.x = trayBounds.x - ( 360 / 2)
if(!trayPosistion.y)
trayPosistion.y = trayBounds.y - trayPosistion.height


trayMenuWin.setBounds(trayPosistion);
checkTrayLeave(event,point)
}

function checkTrayLeave(event,point) {
  clearInterval(trayTimer)
  trayTimer = setInterval(() => {
      let trayBounds = trayMenuWin.getBounds();
      let point = screen.getCursorScreenPoint();
      // 判断是否再托盘内
      if(!(trayBounds.x < point.x && trayBounds.y < point.y && point.x < (trayBounds.x + trayBounds.width) && point.y < (trayBounds.y  + trayBounds.height))){
          // 触发 mouse-leave
          clearInterval(trayTimer);
          trayMenuWin.hide(); // 隐藏菜单栏
          isLeave = true;
      } else {
          // console.log('isOn');
      }
  }, 600)
}
function openDev(window){
  window.webContents.openDevTools()
}
function closeAll(){
  if (process.platform !== 'darwin') app.quit()
}
function minimize(sender){
  sender.send('main-msg',JSON.stringify({index:'hideWin'}))
  mainWindow.minimize()
}
function minTray(sender){
  sender.send('main-msg',JSON.stringify({index:'hideWin'}))
  mainWindow.hide()
}
function showWindow(){
  tray.setToolTip('这是客服系统')
  twinkle=false
  trayList=[]
  trayIds=[]
  mainWindow.webContents.send('main-msg',JSON.stringify({index:'showWin'}));
  mainWindow.show()
}
function startTwinkle(sender){
  showOnMessageIcon(true,true)
  tray.setToolTip('您有一条新消息，点击查看')
	// sender.send('ring')
  // mainWindow.flashFrame(twinkle)
}
const showOnMessageIcon =(index,isTwinkle)=>{
  twinkle = isTwinkle;
  const timer=setTimeout(function () {
    if (twinkle){
      // twinkle
          if (index) {
            index = false;
            tray.setImage(hideTray)
          } else {
            index = true;
            tray.setImage(trayUrl);
          }
          showOnMessageIcon(index,twinkle);
        }
      else{
        clearTimeout(timer)
        tray.setImage(trayUrl);
      }
  },300);
}