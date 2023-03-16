
// const ffi = require('ffi-napi');

// window.ffiNapi = ffi.Library(__dirname + '\\DLL\\linyc_demo.dll', {
//     'add': ['int', ['int', 'int']],
//     'MouseMove':['int', ['int', 'int']],
// });

// const result = libm.add(1, 1);
// const result1 = libm.add(10, 2);
// const result2 = libm.add(123, 23);
// [1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9,5,6,7,8,9].forEach(async (item,index)=>{
//   await libm.MouseMove(50*index,10*index)
// })
// add minus multiply divide MouseMove MouseLeftDown MouseLeftUp MouseRightDown MouseRightUp
// window.addEventListener("online",function(){
//   alert("网络连接了")
// })
// window.addEventListener("offline",function(){
//   alert('网络断开了')
// })
const { ipcRenderer } = require('electron');
const {emotionLists ,toolIcon} =require('./emotions')
// imnm  nport recordDetail from './utils/record.js'
import{ http,download,toast } from './utils/http.js'
// import indexdDB from './utils/indexedDB.js'
let fileStream=''
let windowShow=true
let mediaRecorder
let wavesurfer
  // let formData = new FormData();
  const myHostname='localhost'//"www.linyc.online"
  const myWsName=`ws://${myHostname}:6503`
  const myHttpName='http://'+myHostname+':6503'
  let WSConnection
  let settingList=[
    {key:0,label:'关于我们'},
    // {key:0,label:''},
  ]
  const userNoImg='https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
  let userLists=[],filterUserLists=[],userSelected='',userInfo
  let isClosed=true
  let receivedDetail={},receiveBuffer=[],receivedSize=0
  let chatMain=''
  let sendFile='',sendFileType=''
  let  peerConfig={
    iceServers: [     // Information about ICE servers - Use your own!
      {
        urls: "turn:" + myHostname,  // A TURN server
        username: "linyc",
        credential: "02117513zh"
      },
      {
        urls: "stun:" + myHostname,  // A TURN server
        username: "linyc",
        credential: "02117513zh"
      },
    ]
  }
  initLogin()
  // 链接indexedDB
  // indexdDB.initDB()
  initIPCON()
  function initIPCON(){
    ipcRenderer.on('main-msg', (e, param) => {
      const obj=JSON.parse(param)
      if(obj.index=='reload'){
        window.location.reload()
      }
      else if(obj.index=='close'){
        window.localStorage.removeItem('userInfo')
        ipcRenderer.send('window-msg',JSON.stringify({index:'close'}))
      }
      else if(obj.index=='createdWS'){
        selectedUserPanel()
      }
      else if(obj.index=='hideWin'){
        windowShow=false
      }
      else if(obj.index=='showWin'){
        windowShow=true
      }else if(obj.index=='findUser'){
        // console.log(obj,'12222222222222')
        // if(obj.data.isMulty){
        // }
        let key=0
        userLists.forEach((item,indexs)=>{
          if(item.id==obj.data.id){
            key=indexs
          }
        })
        choiceUser(key)
      }
      else if(obj.index=='quote'){
       const inputPanel=document.querySelector('.inputPanel')
       const inputQuote=createQoute(obj.data)
       if(inputQuote){
        inputPanel.innerHTML='<br>'
       inputPanel.appendChild(inputQuote)
      }
      }
      else if(obj.index=='deleteHistory'){
        // 根据userSelected id查找数据
        // 如果key匹配到id，数据都是
        //自身 start/username 目标 target/id
        // indexedDB_operation('get',key,'id').then(list=>{
        //   // 接收的数据
        //   new Promise(resolve=>{
        //     const tempArr=[]
        //     (list[0]||[]).forEach((item,indexs)=>{
        //       if(item.start==key)
        //       tempArr.push(item)
        //       if(indexs+1==list.length)
        //       resolve(tempArr)
        //     })
        //   }).then(res=>{
        //     if(res.length){
        //       deletedUserList(res,key,'id')
        //     }
        //   })
        // })
        // // 接收该用户的数据条目
        // indexedDB_operation('get',key,'start').then( list=>{
        //   new Promise(resolve=>{
        //     const tempArr=[]
        //       (list[0]||[]).forEach((item,indexs)=>{
        //         if(item.id==key)
        //         tempArr.push(item)
        //         if(indexs+1==list.length)
        //         resolve(tempArr)
        //       })

        //   }).then(res=>{
        //     if(res.length){
        //       deletedUserList(res,key,'start')
        //     }
        //   })
        // })
        
      }
    })
  }
  function createQoute(id){
    const messNode=document.querySelector('#'+id)
    if(messNode){
     const cloneNode= messNode.cloneNode(true)
     const delNode=cloneNode.querySelector('.inputQuote')
     if(delNode)delNode.remove()
      cloneNode.style={}
      const name=messNode.previousSibling.innerText
      //自身 start/username 目标 target/id
      const inputQ= createNode('div',name+':',[{attrName:'classList',attrValue:'inputQuote'},{attrName:'id',attrValue:'q'+id}])
      inputQ.appendChild(cloneNode)
      inputQ.setAttribute("contenteditable", "false");
      inputQ['onclick']=locateMessage.bind(null,id)
       return inputQ
    }else{
      return false
    }
  }
  function locateMessage(id,event){
    const chatMain=document.querySelector('.chatMain')
    const scollNode=chatMain.querySelector('#'+id)
    chatMain.scrollTop=scollNode.offsetTop-50
  }
function initLogin(){
  renderRPC()
  const loginTitle=createNode('div','客服系统',[{attrName:'classList',attrValue:'loginTitle'}])

  const loginUserName=createNode('div',undefined,[{attrName:'classList',attrValue:'loginUserName flex-rows'}])
  const loginUserLabel=createNode('div','手机号',[{attrName:'classList',attrValue:'loginUserLabel'}])
  const loginUserValue=createNode('input',undefined,[
    {attrName:'classList',attrValue:'loginUserValue'},
    {attrName:'id',attrValue:'mobile'},
    {attrName:'placeholder',attrValue:'请输入注册手机号'},
    {attrName:'value',attrValue:''},//默认账号
  ])
  loginUserValue.onkeyup=goKeyUP
  loginUserName.appendChild(loginUserLabel)
  loginUserName.appendChild(loginUserValue)

  const loginPassword=createNode('div',undefined,[{attrName:'classList',attrValue:'loginPassword flex-rows'}])
  const loginPassLable=createNode('div','密码',[{attrName:'classList',attrValue:'loginPassLable'}])
  const loginPassValue=createNode('input',undefined,[
    {attrName:'classList',attrValue:'loginPassValue'},
    {attrName:'id',attrValue:'password'},
    {attrName:'placeholder',attrValue:'请输入密码'},
    {attrName:'value',attrValue:''},//默认密码
  ])
  loginPassValue.onkeyup=goKeyUP
  loginPassword.appendChild(loginPassLable)
  loginPassword.appendChild(loginPassValue)

  const loginLink=createNode('div',undefined,[{attrName:'classList',attrValue:'loginLink flex-rows'}])
  const loginForget=createNode('div','忘记密码',[{attrName:'classList',attrValue:'loginForget'}])
  loginForget.onclick=function(){
    // loginTitle.innerHTML='找回密码'
    toast('warning','功能暂未开发，敬请期待')
  }
  const loginReg=createNode('div','注册新用户',[{attrName:'classList',attrValue:'loginReg'}])
  loginReg.onclick=function(){
    loginTitle.innerHTML='注 册'
  const loginMain =document.querySelector('.loginMain')
  const userName=createNode('div',undefined,[{attrName:'classList',attrValue:'loginUserName flex-rows'}])
  const userNameLable=createNode('div','昵称',[{attrName:'classList',attrValue:'loginUserLabel'}])
  const userNameValue=createNode('input',undefined,[{attrName:'classList',attrValue:'loginUserValue'},{attrName:'id',attrValue:'nickName'},{attrName:'placeholder',attrValue:'请输入用户名'}])
  userName.appendChild(userNameLable)
  userName.appendChild(userNameValue)

  loginPassLable.innerHTML='验证密码'
  const validPass=createNode('div',undefined,[{attrName:'classList',attrValue:'loginPassword flex-rows'}])
  const validPassLable=createNode('div','密码',[{attrName:'classList',attrValue:'loginPassLable'}])
  const validPassValue=createNode('input',undefined,[{attrName:'classList',attrValue:'loginPassValue'},{attrName:'id',attrValue:'validPass'},{attrName:'placeholder',attrValue:'请再次输入密码'}])
  validPass.appendChild(validPassLable)
  validPass.appendChild(validPassValue)

  const userImg=createNode('div',undefined,[{attrName:'classList',attrValue:'loginPassword flex-rows'}])
  const userImgLable=createNode('div','头像',[{attrName:'classList',attrValue:'loginPassLable'}])
  const userImgValue=createNode('div',undefined,[{attrName:'classList',attrValue:'userAvater'}])
  const userImgFile=createNode('div','+',[{attrName:'id',attrValue:'userAvater'}])
  userImgFile.onclick=openFile
  userImgValue.appendChild(userImgFile)
  userImg.appendChild(userImgLable)
  userImg.appendChild(userImgValue)

  loginMain.insertBefore(userName,loginUserName)
  loginMain.insertBefore(validPass,loginPassword)
  loginMain.insertBefore(userImg,validPass)
    // loginPassword.append(validPass)
    loginBtn.innerHTML='注 册'
    loginUserLabel.innerHTML='手机号'
    loginUserValue.placeholder='请输入手机号'

    loginLink.style.display='none'
  }
  loginLink.appendChild(loginForget)
  loginLink.appendChild(loginReg)

  const loginOperation=createNode('div',undefined,[{attrName:'classList',attrValue:'loginOperation'}])
  const loginBtn=createNode('div','登 录',[{attrName:'classList',attrValue:'loginBtn'}])
  loginBtn.onclick=goLogin
  loginOperation.appendChild(loginBtn)

  const loginMain=createNode('div',undefined,[{attrName:'classList',attrValue:'loginMain'}])
  loginMain.appendChild(loginTitle)
  loginMain.appendChild(loginUserName)
  loginMain.appendChild(loginPassword)
  loginMain.appendChild(loginLink)
  loginMain.appendChild(loginOperation)

  const loginBottom=createNode('div','脚步标注内容...',[{attrName:'classList',attrValue:'loginBottom'}])

  const loginPanel=document.querySelector('.login')
  loginPanel.appendChild(loginMain)
  loginPanel.appendChild(loginBottom)
}
function clickRightMenu(e){
    e.preventDefault()
    e.stopPropagation()
    ipcRenderer.send('window-msg',JSON.stringify({index:'contextMenus',type:'base'}))
}
function clickRightMenu_userList(e){
  e.preventDefault()
  e.stopPropagation()
  const id=e.currentTarget.id
  ipcRenderer.send('window-msg',JSON.stringify({index:'contextMenus',type:'userList',data:id}))
}
function clickRight_message(e){
  e.preventDefault()
  e.stopPropagation()
  const id=e.currentTarget.id
  ipcRenderer.send('window-msg',JSON.stringify({index:'contextMenus',type:'message',data:id}))
}
  function renderRPC(){
    document.querySelector('.login').addEventListener('contextmenu',clickRightMenu)
    document.querySelector('.page').addEventListener('contextmenu',clickRightMenu)
    
    // window.addEventListener('contextmenu', clickRightMenu)
    document.querySelector('.closedAll').onclick=function(){
      // const isReceive=confirm('确认退出并关闭所有窗口吗？')
      // if(isReceive){
      //   window.localStorage.removeItem('userInfo')
        ipcRenderer.send('window-msg',JSON.stringify({index:'closeToTray'}))
      // }
    }
    document.querySelector('.min').onclick=function(){
      ipcRenderer.send('window-msg',JSON.stringify({index:'minus'}))
    }
   }
  async function deletedUserList(list,value,key){
    await (list||[]).forEach(item=>{
      // indexedDB_operation('delete',item.time)
    })
  //  const lists= await indexedDB_operation('get',value,key)
   await userLists.map(user=>{
    if(user[key]==value){
      user.history=[]
      user.newMassage=0
    }
    return user
   })
   filterUserLists=userLists
   }
  //  创建群聊用户页面
  function selectedUserPanel(){
    const hasModal=document.querySelector('.modal')
    if(hasModal){
      hasModal.remove()
    }
    const modal=createNode('div',undefined,[{attrName:'classList',attrValue:'modal flex-rows'}])
    const panel=createNode('div',undefined,[{attrName:'classList',attrValue:'selectedUser'}])
    const title=createNode('div','创建群聊',[{attrName:'classList',attrValue:'selectedUserTitle'}])
    const list=createNode('div',undefined,[{attrName:'classList',attrValue:'selectedUserMain'}])
    for(let i =0;i<userLists.length;i++){
      if(!userLists[i].isMulty){
        const item=createNode('div',undefined,[{attrName:'classList',attrValue:'selectedUserItem'}])
        const input=createNode('input',undefined,[{attrName:'type',attrValue:'checkbox'},{attrName:'name',attrValue:userLists[i].img},{attrName:'id',attrValue:userLists[i].id}])
        const name=createNode('label',userLists[i].username,[{attrName:'for',attrValue:userLists[i].time}])
        item.appendChild(input)
        item.appendChild(name)
        list.appendChild(item)
      }
    }
    const carncel=createNode('button','取消',[{attrName:'onclick',attrValue:'selectedEnd',param:0}])
    const OK=createNode('button','确定',[{attrName:'onclick',attrValue:'selectedEnd',param:1}])
    const btnDIV=createNode('div',undefined,[{attrName:'classList',attrValue:'btnDiv flex-rows'}])
    btnDIV.appendChild(carncel)
    btnDIV.appendChild(OK)

    panel.appendChild(title)
    panel.appendChild(list)
    panel.appendChild(btnDIV)
    modal.appendChild(panel)
    modal.style.display='flex'
    document.body.appendChild(modal)
  }
  async function selectedEnd(index){
    const modal=document.querySelector('.modal')
    if(index){
    let tempArr=[]
    let imgList=[]
    const mulId=Date.now()
    new Promise(async resolve=>{
      new Promise( async res=>{
        await document.querySelectorAll(".selectedUserItem input").forEach(async el=>{
          if(el.checked){
          await  tempArr.push(el.id)
          await imgList.push(el.name)
          }
        })
        await res(true)
      }).then(async ress=>{
        if(ress){
         // if(tempArr.length<2){
        //   toast('warning','请选择至少两人!')
        //   return false
        //  }
        tempArr.push(userInfo.mobile)
        imgList.push(userInfo.img)
        const response=await createMulImg('./assets/bg.jpg',imgList)
        const res=await http(myHttpName+'/uploadFile','POST',{obj:response,name:mulId},true)
       await resolve(res)
    }
      })
    }).then(async res=>{
          let avater=''
         
          if(res.code==200){
            avater=res.obj
          }else{
            // 上传多人群聊头像失败，启用默认头像
            avater=userNoImg
          }
          const data={
            time: mulId,
            userList:tempArr,
            username:userInfo.name,
            start: userInfo.mobile,
            target: userSelected.username|| ('群聊'+mulId),
            id:mulId,
            type: "connectMul",
            img:avater,
          }
          userLists.forEach(async item=>{
            if(tempArr.includes(item.id)&&item.id!=userInfo.mobile){
              if(!item.sendData||item.sendData.readyState!='open'){
                await connectPeersData(item)
                await createDataICE(item)
                await createOffer(item,'dataConnection')
                let timer=setInterval(() => {
                  if(item.sendData&&item.sendData.readyState=='open'){
                    item.sendData.send(JSON.stringify(data))
                  clearInterval(timer)
                }
                }, 500);
                }else{
                  item.sendData.send(JSON.stringify(data))
                }
            }
          })
           handlmulChatRequest(data)
    })
    }else{
      // todo 重置表单
      
    }
    modal.style.display='none'
  }
    // 初始化事件
async function init(){
 
  // 初始化websocket
 await initWS()
 initTool();
}
function createMulImg(imgSrc1, arr) { 
  
  //imgSrc1 背景图片（二维码）链接
  //arr 合成的小图片的数组[链接1,链接2.....]
 return new Promise(resolve=>{
    
  var canvas = document.createElement("canvas");
  canvas.width = 58;
  canvas.height = 58;
  var context = canvas.getContext("2d");

  context.rect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#fff";
  context.fill();

  var myImage = new Image();
  myImage.src = imgSrc1; //背景图片  你自己本地的图片或者在线图片
  myImage.crossOrigin = 'Anonymous';

  myImage.onload = async () => {
      context.drawImage(myImage, 0, 0, 58, 58);
      var base64
     await arr.forEach(async (item,index)=>{
        let myImage2 = new Image();
        myImage2.src = item; //你自己本地的图片或者在线图片
        myImage2.crossOrigin = 'Anonymous';

        myImage2.onload =async () => {
            // 设置填充的颜色
            context.fillStyle = "white";
            // 区分每一个图片的位置
            let left = 0
            let top = 0
            if(index==0){
              top=2
              left=2
            }else{
              left=4+16*Math.floor(index%3)
              top=4+16*Math.floor(index/3)
            }
            // 绘制图片
          await  context.drawImage(myImage2, left, top, 16, 16);
             base64 = canvas.toDataURL("image/png"); //"image/png" 这里注意一下
            if(arr.length==index+1)
            resolve(base64)
        }
      })
  }
  
  })
}
function openFile(){
  // if(!document.querySelector('#mobile').value){
  //   toast('warning','请输入手机号在上传文件')
  //   return false
  // }
 const file= createNode('input',undefined,[{attrName:'type',attrValue:'file'},{attrName:'name',attrValue:'userImage'}])
 file.onchange=handlFile
 file.click()
}
function handlFile(event){
  const file = event.target.files[0];
  if(file.size>1024*50){
    toast('warning','头像不得大于50kb')
    return
  }
  const uploadReader = new FileReader();
  uploadReader.readAsDataURL(file);
  uploadReader.onload = function (e) {
    fileStream=e.target.result
};
}
 function createNode(nodeType,innerContent,attributes=[]){
  const dom=document.createElement(nodeType)
  if(innerContent){
    if(typeof innerContent=='string')
      dom.innerHTML=innerContent
    else{
      // nodeObject
      dom.appendChild(innerContent)
    }
}
  if(attributes.length)
  attributes.forEach(item=>{
    if(item.attrName.substr(0,2)=='on'){
      dom[item.attrName]=eval(item.attrValue).bind(null,item.param)
  }
    else
    dom[item.attrName]=item.attrValue
  })
  return dom
}
async function choiceUser(index){
  // let findeKey=0
 await initRight()
  const userItem=document.querySelectorAll('.Item')
  
  filterUserLists.forEach(async (item,indexs)=>{
    if(indexs==index){
      // findeKey=indexs
      userSelected=item
      userSelected.newMassage=0
      let tempNode=document.querySelectorAll('.userAvatar')[index].firstChild
      tempNode.classList=''
      tempNode.innerHTML=''
      userItem[indexs].classList='Item this_selected flex-rows'
      resizeMessagePanel()
      // 避免自己跟自己开启通讯通道
        if(userSelected.id==userInfo.mobile){
          return false
        }
      if(userSelected.type!='mul'){
      if(!item.sendData||item.sendData.readyState!='open'){
      await connectPeersData(item)
      await createDataICE(item)
      await createOffer(item,'dataConnection')
      }
    }
    }else{
      userItem[indexs].classList='Item flex-rows'
    }
  })
  
}
function goKeyUP(event){
  if(event.keyCode==13){
    goLogin()
  }
}
async function goLogin(){
  const event =document.querySelector('.loginBtn')
  if(event.innerText=='注 册'){
    const userName=document.querySelector('#mobile').value
    const userPass=document.querySelector('#password').value
    const nickName=document.querySelector('#nickName').value
    const validPass=document.querySelector('#validPass').value
    
    const res=await http(myHttpName+'/uploadFile','POST',{obj:fileStream,name:userName},true)
    
    if(!userPass.trim()){
      toast('error','密码不能为空以及空格')
      return false
    }
    if(!userName.trim()){
      toast('error','手机号不能为空')
      return false
    }
    if(userPass==validPass){
      const param={mobile:userName,name:nickName,password:userPass,image:''}
      if(res.code==200){
        param.img=res.obj
      }
      
      const response=await http(myHttpName+'/register','POST',param,true)
       if(response.code==200){
      toast('success',response.msg)
      setTimeout(function(){
        window.location.reload()
      },2000)
    }else{
      toast('error',response.msg)
    }
    }else{
      toast('error','验证密码不一致')
    }
  }else if(event.innerText=='登 录'){
    const userName=document.querySelector('#mobile').value
    const userPass=document.querySelector('#password').value
  const response=await http(myHttpName+'/login','POST',{mobile:userName,password:userPass},true)
  if(response.code==200){
    toast('success',response.msg)
    userInfo=response.result
    localStorage.setItem('userInfo',JSON.stringify(response.result))
    document.querySelector('.login').style.display="none"
    document.querySelector('.page').style.display='flex'
    init()
  }else{
    toast('error',response.msg)
  }
}
}
// type:'insert','delete','update','get',
//  async function indexedDB_operation(type,data,indexCursor) {
//   if(type=='get'){
//       const result=await indexdDB.get({ name: 'chat' }, data,indexCursor)
//       if(indexCursor){
//         const first=result[0]
//         return first?(first.length?result:[]):[]
//       }else{
//         return result[0]?result:[]
//       }
//   }
//   else if(type=='insert'){
//     indexdDB.insert(
//       { name: 'chat' },
//       { ...data,id:userInfo.mobile}
//     );
//   }
//   else if(type=='delete'){
//     indexdDB.deleted({ name: 'chat' }, data);
//   }
//   else if(type=='update'){
//     indexdDB.update(
//       { name: 'chat' },
//       { id:userInfo.mobile,type:'ff',message:'eee',time:Date.now(),isIcon:true,username:'lin.yc',fileDetail:{fileType:'doc',data:[]}}
//     );
//   }
// }
// 点击用户时数据时 调用该方法，重新渲染对话框
 function resizeMessagePanel(){
  chatMain.innerHTML=''
   userSelected.history.forEach(item=>{
    if(item.type=='voice')
      createWavesurfer(item,item.fileDetail.data)
    else
    chatMain.append(sendOrRecieveData(item))
    
  })
}
// 发送数据时，接收到数据时对话框尾部追加数据
function sendOrRecieveData(scoped,voiceWave){
  let messageItem=''
  if(scoped.type=='tips'){
    messageItem=createNode('div',undefined,[{attrName:'classList',attrValue:'chatPanel_tips'}])
    const tips=createNode('div',new Date(scoped.message).toLocaleString(),[])
    messageItem.append(tips)
  }
  else{
   messageItem=createNode('div',undefined,[{attrName:'classList',attrValue:'messageItem flex-rows'},{attrName:'style',attrValue:scoped.start==userInfo.mobile?'float:right;justify-content: flex-end':''}])
  const msgAter=createNode('img',undefined,[{attrName:'src',attrValue:scoped.img||userNoImg},{attrName:'style',attrValue:scoped.start==userInfo.mobile?'float:right':''}])
  
  const msgMain=createNode('div',undefined,[{attrName:'classList',attrValue:'message'},{attrName:'style',attrValue:scoped.start==userInfo.mobile?'float:right;padding-right:10px':''}])
  const msgUserName=createNode('div',scoped.username,[{attrName:'classList',attrValue:'userName'},{attrName:'style',attrValue:scoped.start==userInfo.mobile?'text-align:right':''}])
  msgMain.append(msgUserName)
  if(scoped.fileDetail&&scoped.fileDetail.fileType=='voice'){
    scoped.type='voice'
  }
  if(scoped.isIcon){
    const img=createNode('img',undefined,[
      {attrName:'src',attrValue:scoped.message},
      {attrName:'classList',attrValue:'messageBody'},
      {attrName:'id',attrValue:'m'+scoped.time},
      {attrName:'style',attrValue:scoped.start==userInfo.mobile?'float:right;color:white;background:#1890ff':''}
    ])
    img.oncontextmenu=clickRight_message
    msgMain.append(img)
  }else if(scoped.type=='file'){
    const fileContent=createNode('a',undefined,[
      {attrName:'classList',attrValue:'messageBody'},
      {attrName:'id',attrValue:'m'+scoped.time},
      {attrName:'style',attrValue:scoped.start==userInfo.mobile?'float:right;color:white;background:#1890ff;text-align:center; width: 120px;':'text-align:center; width: 120px;'},
    ])
    fileContent.onclick=downloadFile.bind(null,scoped.fileDetail.fileName,scoped.fileDetail.data)
    const img=createNode('img',undefined,[
      // {attrName:'src',attrValue:'https://www.linyc.online:8080/img/fileIcon/file-'+scoped.fileDetail.fileType+'-fill.png'},
      {attrName:'src',attrValue:'http://121.5.69.13/img/fileIcon/file-'+scoped.fileDetail.fileType+'-fill.png'},
      {attrName:'style',attrValue:'width:56px'}
    ])
    const title=createNode('div',scoped.fileDetail.fileName,[{attrName:'classList',attrValue:'fileFont'}])
    const size=createNode('div','大小:'+scoped.fileDetail.fileSize+'kb',[{attrName:'classList',attrValue:'fileFont'}])
    fileContent.append(img)
    fileContent.append(title)
    fileContent.append(size)
    fileContent.oncontextmenu=clickRight_message
    msgMain.append(fileContent)
  }
  else if(scoped.type=='voice'){
        const msgBody=createNode('div',undefined,[
          {attrName:'classList',attrValue:'messageBody voice'},
          {attrName:'id',attrValue:'m'+scoped.time},
          {attrName:'style',attrValue:scoped.start==userInfo.mobile?'float:right;background:#1890ff':''}
        ])
        // if(!voiceWave){
        //   createWavesurfer(scoped,scoped.fileDetail.data)
        // }
        // else
        msgBody.appendChild(voiceWave)
        msgMain.append(msgBody)
  }
  // 消息
  else{
    const msgBody=createNode('div',scoped.message,[
      {attrName:'classList',attrValue:'messageBody'},
      {attrName:'id',attrValue:'m'+scoped.time},
      {attrName:'style',attrValue:scoped.start==userInfo.mobile?'float:right;color:white;background:#1890ff':''}
    ])
    msgBody.oncontextmenu=clickRight_message
    const inputQuote=msgBody.querySelector('.inputQuote')
    // if(scoped.message.indexOf(`contenteditable="false"`)!=-1&&scoped.message.indexOf(`class="inputQuote"`)!=-1){
      if(inputQuote){
        inputQuote['onclick']=locateMessage.bind(null,inputQuote.id.split('q')[1])
    }
    msgMain.append(msgBody)
  }
  
  if(scoped.start==userInfo.mobile){
  messageItem.append(msgMain)
  messageItem.append(msgAter)
}else{
  messageItem.append(msgAter)
  messageItem.append(msgMain)
}
}
  return messageItem
}

function initTool(){
  
  const imgContent1=createNode('div',undefined,[{attrName:'classList',attrValue:'toolImg'}])
  imgContent1.onclick=toolClick
  const img1=createNode('img',undefined,[{attrName:'alt',attrValue:'0'},{attrName:'style',attrValue:'width:32px'},{attrName:'src',attrValue:userInfo.img||userNoImg}])
  imgContent1.appendChild(img1)
  const content1=createNode('div',undefined,[])
  content1.appendChild(imgContent1)

  const imgContent2=createNode('div',undefined,[{attrName:'classList',attrValue:'toolImg'}])
  imgContent2.onclick=toolClick
  const img2=createNode('img',undefined,[{attrName:'alt',attrValue:'1'},{attrName:'src',attrValue:'./assets/chat.jpg'}])
  imgContent2.appendChild(img2)
  content1.appendChild(imgContent2)


  const imgContent11=createNode('div',undefined,[{attrName:'classList',attrValue:'toolImg'}])
  const img11=createNode('img',undefined,[{attrName:'alt',attrValue:'2'},{attrName:'src',attrValue:'./assets/setting.jpg'}])
  imgContent11.appendChild(img11)
  imgContent11.onclick=toolClick
  const content2=createNode('div',undefined,[])
  content2.appendChild(imgContent11)

  const toolPanel=document.querySelector('.tool')
  toolPanel.appendChild(content1)
  toolPanel.appendChild(content2)
}
function toolClick(event){
  event.preventDefault()
  const key=event.target.getAttribute('alt')
  if(key=='0'){
    
    const userMain=createNode('div',undefined,[{attrName:'classList',attrValue:"userMain flex-columns"}])
    const userPanel=createNode('div',undefined,[{attrName:'classList',attrValue:'userPanel flex-rows'}])
    const userAvatar=createNode('img',undefined,[{attrName:'src',attrValue:userInfo.img||userNoImg},{attrName:'classList',attrValue:'userAvatar '}])
    const userDetail=createNode('div',undefined,[{attrName:'classList',attrValue:'userDetail'}])
    const userName=createNode('div',userInfo.name,[{attrName:'classList',attrValue:'userName '}])
    const userMobile=createNode('div','账号：'+userInfo.mobile,[{attrName:'classList',attrValue:'userMobile '}])
    // 密码
    const userPass=createNode('div',undefined,[{attrName:'classList',attrValue:' flex-rows userPass'}])
    const userPassLabel=createNode('div','密码：',[{attrName:'classList',attrValue:''}])
    const userPassBTN=createNode('div','修改',[{attrName:'classList',attrValue:'passReset'}])
    userPassBTN.onclick=changePassWord.bind(null,userMain)
    userPass.appendChild(userPassLabel)
    userPass.appendChild(userPassBTN)

    const logon=createNode('div','退出',[{attrName:'classList',attrValue:'logon '}])
    logon.onclick=logo
    userDetail.appendChild(userName)
    userDetail.appendChild(userMobile)
    userDetail.appendChild(userPass)
    userPanel.appendChild(userAvatar)
    userPanel.appendChild(userDetail)

    userMain.appendChild(userPanel)
    userMain.appendChild(logon)
    setTimeout(function(){
      document.querySelector('.page').addEventListener('click',closeUserPanel,false)
    },200)
    document.body.appendChild(userMain)
    return false
  }else if(key=='2'){
    const settingPanel=createNode('div',undefined,[
      {attrName:'classList',attrValue:'settingPanel flex-columns'},
    ])
    settingList.forEach(item=>{
      const settingDom=createNode('div',item.label,[{attrName:'classList',attrValue:'settingList'},{attrName:'key',attrValue:item.key}])
      settingDom.onclick=settingFn
      settingPanel.appendChild(settingDom)
    })
    setTimeout(function(){
      document.querySelector('.page').addEventListener('click',closeUserPanel,false)
    },200)
    const width=event.target.offsetWidth
    const top=event.target.offsetTop-settingPanel.offsetHeight/2
    const left=event.target.offsetLeft+width+10
    settingPanel.style=`top:${top}px;left:${left}px`
    document.body.appendChild(settingPanel)
    return false
  }
  const toolPanel=document.querySelectorAll('.tool img')
  toolPanel.forEach((item,index)=>{
    if(index!=0){
    if(key==index){
      item.src=item.src.split('.')[0]+'.png'
    }else{
      item.src=item.src.split('.')[0]+'.jpg'
    }
  }
  })
}
function changePassWord(userMain,event){
  if(userMain)userMain.remove()
  const passPanel=createNode('div',undefined,[{attrName:'classList',attrValue:'passPanel flex-columns'}])
  // title
 const title= createNode('div','修改密码',[{attrName:'classList',attrValue:'title'}])

 const passMain=createNode('div',undefined,[{attrName:'classList',attrValue:'flex-columns passMain'}])

 const passContent=createNode('div',undefined,[{attrName:'classList',attrValue:'flex-rows passContent'}])
 const passLabel=createNode('div','密码：',[{attrName:'classList',attrValue:'passLabel'}])
 const pass=createNode('input',undefined,[{attrName:'classList',attrValue:'pass'},{attrName:'placeholder',attrValue:'请再次输入密码'}])
 passContent.appendChild(passLabel)
 passContent.appendChild(pass)

 const validPassContent=createNode('div',undefined,[{attrName:'classList',attrValue:'flex-rows validPassContent'}])
 const validPassLabel=createNode('div','确认密码：',[{attrName:'classList',attrValue:'validPassLabel'}])
 const validPass=createNode('input',undefined,[{attrName:'classList',attrValue:'validPass'},{attrName:'placeholder',attrValue:'请输入密码'}])
 validPassContent.appendChild(validPassLabel)
 validPassContent.appendChild(validPass)

 const btnGroup=createNode('div',undefined,[{attrName:'classList',attrValue:'flex-rows btnGroup'}])
 const ok=createNode('span','提交',[{attrName:'classList',attrValue:'submit'}])
 ok.onclick=closeChangePass.bind(null,1,passPanel,pass,validPass)
 const cancel=createNode('span','取消',[{attrName:'classList',attrValue:''}])
 cancel.onclick=closeChangePass.bind(null,0,passPanel)
 btnGroup.appendChild(ok)
 btnGroup.appendChild(cancel)
 
 passMain.appendChild(passContent)
 passMain.appendChild(validPassContent)
 passMain.appendChild(btnGroup)

 passPanel.appendChild(title)
 passPanel.appendChild(passMain)

 document.body.appendChild(passPanel)


}
async function closeChangePass(index,dialog,passwordNode,validPasswordNode,event){
  if(index){
    debugger
    if(validPasswordNode.value==passwordNode.value){
      const param={
        mobile:userInfo.mobile,
        newPassword:validPasswordNode.value
      }
    const response= await http(myHttpName+'/resetPassword','POST',param,true)
      if(response.code==200){
        toast('success',response.msg)
      }else{
        toast('error',response.msg)
      }
    }else{
      toast('error','密码不一致','20%')
      return false
    }
    
  }
  // 关闭弹窗
  if(dialog){
    dialog.remove()
  }
}
function settingFn(event){
  toast('','功能暂未开发')
}
function closeUserPanel(){
  if(document.querySelector('.userMain'))
  document.querySelector('.userMain').remove()
  if(document.querySelector('.settingPanel'))
  document.querySelector('.settingPanel').remove()
  document.querySelector('.page').removeEventListener('click',closeUserPanel,false)
}
function logo(){
  window.localStorage.removeItem('userInfo')
  window.location.reload()
}
function initLeft(userList){
  const leftPanel=document.querySelector(".leftPanel")
  leftPanel.innerHTML=''
  const ItemList=document.querySelectorAll('.Item')
  if(ItemList.length)
  ItemList.forEach(item=>{
    item.removeEventListener('contextmenu',clickRightMenu_userList)
  })
  userList.forEach((item,index)=>{
    const userAttrs=[
      {attrName:'classList',attrValue:'Item flex-rows'},
      {attrName:'id',attrValue:item.id},
      {attrName:'style',attrValue:'justify-content: flex-start;align-items:flex-start'},
      {attrName:'onclick',attrValue:'choiceUser',param:index }
    ]
    // list
    const userItem=createNode('div',undefined,userAttrs)
    userItem.addEventListener('contextmenu',clickRightMenu_userList)
    // userAvatar
    const userAvatar=createNode('div',undefined,[{attrName:'classList',attrValue:'userAvatar'}])
    // float tag
    const userBadge=createNode('span',item.newMassage,[])
    userAvatar.append(userBadge)
    // user img
    const userImg=createNode('img',undefined,[{attrName:'src',attrValue:item.img||userNoImg}])
    userAvatar.append(userImg)
    userItem.append(userAvatar)

    const userMessage=createNode('div',undefined,[{attrName:'classList',attrValue:'userMessage'}])
    const title=createNode('div',item.username==userInfo.name?'(我)'+item.username:item.username,[{attrName:'classList',attrValue:'title'}])

    const lastMessage=createNode('div',undefined,[{attrName:'classList',attrValue:'lastMessage'},{attrName:'title',attrValue:item.username}])
    userMessage.append(title)
    userMessage.append(lastMessage)

    userItem.append(userMessage)
    

    leftPanel.append(userItem)
  })
  initChatDialog()
}
async function initRight(){
  const rightPanel=document.querySelector('.rightPanel')
  rightPanel.innerHTML=''
  const chatNode=await initChatPanel()
  const inputNode=await initInputPanel()
  rightPanel.append(chatNode)
  rightPanel.append(inputNode)
  chatMain=document.querySelector('.chatMain')
  
}
function initChatDialog(){
  let flag=document.querySelector('.mediaPanel')
  if(flag){
    document.querySelector('.head').lastChild.innerHTML='正在与'+userSelected.username||''+'进行通话'
    return
  }
  const mediaPanel=createNode('div',undefined,[{attrName:'classList',attrValue:'mediaPanel flex-columns'}])
    const mediaHead=createNode('div',undefined,[{attrName:'classList',attrValue:'head'}])
    const title=createNode('div','正在与'+userSelected.username+'进行通话',[
      {attrName:'classList',attrValue:'flex-rows'},
      {attrName:'style',attrValue:'height:100%;justify-content: center;'},
      {attrName:'onclick',attrValue:'clickMedia'},
      {attrName:'onmousemove',attrValue:'moveMedia'},
    ])
    const closed=createNode('span','X',[{attrName:'classList',attrValue:'closed'},{attrName:'onclick',attrValue:'closedModal'}])
    mediaHead.append(closed)
    mediaHead.append(title)
    mediaPanel.append(mediaHead)
    const mediaContainer=createNode('div',undefined,[{attrName:'classList',attrValue:'media'}])
    const media=createNode('video',undefined,[{attrName:'autoplay',attrValue:'true'},{attrName:'controls',attrValue:'controls'}])
    mediaContainer.append(media)
    mediaPanel.append(mediaContainer)
    document.body.appendChild(mediaPanel)
}
function initChatPanel(){
  const chatPanel= createNode('div',undefined,[{attrName:'classList',attrValue:'chatMain'}])
  chatPanel.onclick=function(){
    document.querySelector('.toastTools').style="display:none"
  }
  return chatPanel
}
function initInputPanel(){
  const inputPanel=`<div contenteditable class='inputPanel' placeholder='请输入...' ></div>`//onkeyup='inputKeyUp'
  const inputMain= createNode('div',inputPanel,[{attrName:'classList',attrValue:'inputMain flex-columns'}])
  const toolMain= createNode('div',undefined,[{attrName:'classList',attrValue:'toolPanel flex-rows'}])
  const toastTool=createNode('div',undefined,[{attrName:'classList',attrValue:'toastTools'}])
  for(let key in emotionLists){
    const iconSpan=createNode('span',undefined,[])
    const icon=createNode('img',undefined,[
      {attrName:'src',attrValue:emotionLists[key]},
      {attrName:'name',attrValue:key},
      {attrName:'onclick',attrValue:'hidePanel',param:'.toastTools,'+key}
    ])
    iconSpan.append(icon)
    toastTool.append(iconSpan)
  }
  
  toolIcon.forEach((item)=>{
    const toolIcon1= createNode('img',undefined,[
      {attrName:'src',attrValue:item.value},
      {attrName:'title',attrValue:item.label},
      {attrName:'onclick',attrValue:'toolOpen',param:item.key}
    ])
    if(item.key=='stop_record'){
      toolIcon1.style="display:none"
    }
    toolMain.append(toolIcon1)
  })
  const child=inputMain.firstChild
  // toolMain.append(toastTool)
  inputMain.insertBefore(toolMain,child)
  inputMain.insertBefore(toastTool,child)
  const inputDom=inputMain.querySelector('.inputPanel')
  inputDom.onkeyup=inputKeyUp
  // inputDom.onkeydown=inputKeyDown
  return inputMain
}
function downloadFile(filename,content,event){
    let eleLink=createNode('a',undefined,[
      {attrName:'style',attrValue:'display:none'},
      {attrName:'href',attrValue:content},
    ])
    eleLink.download = filename;
    document.body.appendChild(eleLink);
    eleLink.click();
    document.body.removeChild(eleLink);
}
function hidePanel(param){
 let temArr= param.split(',')
  document.querySelector(temArr[0]).style='display:none'
  // 发送表情名称--key
  handleSendButton(temArr[1])
}
function toolOpen(param,event){
  if(param=='smile'){
    document.querySelector('.toastTools').style='display:block'
  }else if(param=='media'){
    if(userSelected.type=='mul'){
      toast('error','多人群聊暂不支持视频')
      return false
    }
    document.querySelector('.mediaPanel').style='display:flex !important'
    if(event){
      initChatDialog()
      askPeerConnection()
    }
   
  }else if(param=='file'){
    // if(userSelected.type=='mul'){
    //   toast('error','多人群聊暂不文件传输')
    //   return false
    // }
    const fileNode=createNode('input',undefined,[{attrName:'type',attrValue:'file'},{attrName:'onchange',attrValue:'getChoiceFile'}])
    fileNode.click()
  }else if(param=='start_record'){
    startRecord()
  }else if(param=='stop_record'){
    mediaRecorder&&mediaRecorder.stop()
  }
}
function startRecord(){
  navigator.mediaDevices.getUserMedia({audio: true}).then(stream=>{
    let chunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();
    // 最大发送60s的语音
    let step=60,voiceTimer
    // 录音开始事件监听（即调用 mediaRecorder.start()时会触发该事件）
    mediaRecorder.onstart = () =>{
          console.log("record start")
          voiceTimer= setInterval(function(){
            step--
            if(step<=0){
              mediaRecorder&&mediaRecorder.stop()
            }
          },1000)
          const toolPanel= document.querySelector(".toolPanel")
          const start_record= toolPanel.querySelector("img[title='开始录音']")
          const stop_record= toolPanel.querySelector("img[title='停止录音']")
          stop_record.style="display:block"
          start_record.style="display:none"
      }
  
    // 录音可用事件监听，发生于mediaRecorder.stop()调用后，mediaRecorder.onstop 前
      mediaRecorder.ondataavailable = (e) =>{
          chunks.push(e.data)
      }
      
      // 录音结束事件监听，发生在mediaRecorder.stop()和 mediaRecorder.ondataavailable 调用后
      mediaRecorder.onstop = () =>{
        voiceTimer&&clearInterval(voiceTimer)
        console.log("record end")
        const toolPanel= document.querySelector(".toolPanel")
        const start_record= toolPanel.querySelector("img[title='开始录音']")
        const stop_record= toolPanel.querySelector("img[title='停止录音']")
        stop_record.style="display:none"
        start_record.style="display:block"
        // 获取到录音的blob
      // let blob = new Blob(chunks,{type:"audio/webm;codecs=opus"}); 
      let blob = new Blob(chunks); 
      //  将blob转换为file对象，名字可以自己改，一般用于需要将文件上传到后台的情况
      let file = new window.File([blob],"record.webm");
      const time=Date.now()
      const voiceData={
        type: "voice",
      id:userSelected.id,
      target:userSelected.username,
      start:userInfo.mobile,
      username:userInfo.name,
      time,
      img:userInfo.img,
    }
      createWavesurfer(voiceData,file).then(res=>{
        if(res){
          sendVoice(voiceData,file)
        }
      })
      
    }
  })
}
function createWavesurfer(voiceData,blob){
  return new Promise(resolve=>{
    const voiceWave= createNode('div',undefined,[{attrName:'classList',attrValue:'voiceWave voiceWave'+voiceData.time}])
      voiceWave.onclick=audioFn
      chatMain.append(sendOrRecieveData(voiceData,voiceWave))
       wavesurfer = WaveSurfer.create({
        container: ".voiceWave"+voiceData.time,
        waveColor: '#aaa',
        progressColor: '#ccc',
        cursorWidth:0
      });
      wavesurfer.loadBlob(blob)
      wavesurfer.on('ready', function () {
        noiseReduction(wavesurfer.backend.buffer)
         voiceData.durations=wavesurfer.getDuration().toFixed(0)
         const voidDom=createNode('div',voiceData.durations,[{attrName:'classList',attrValue:'voiceTime'},{attrName:'style',attrValue:voiceData.start==userInfo.mobile?'left:-20px':''}])
         document.querySelector('#m'+voiceData.time).append(voidDom)
         resolve(true)
    });
    wavesurfer.on('finish', function () {
      wavesurfer.stop()
  });
  })
  
}
function sendVoice(voiceData,file){
  userSelected.history.push(voiceData)
  if(userSelected.type=='mul'){
    userLists.forEach(item=>{
      if(userSelected.userList.includes(item.id)){
        // item.sendData.send(JSON.stringify(voiceData))
        fileTransfer(file,'voice',item,'multy',voiceData.time,voiceData.durations)
      }
    })
  }else{
    // userSelected.sendData.send(JSON.stringify(voiceData))
    fileTransfer(file,'voice',userSelected,undefined,voiceData.time,voiceData.durations)
  }
}
function noiseReduction(buffer){
  const originalBuffer = buffer;
for (let i = 0; i < originalBuffer.numberOfChannels; i++) {
  // 拿到声道数据
  const x = originalBuffer.getChannelData(i);
  // 对数据进行降噪处理
  const z = wasm_denoise_stream_perf(x);
  x.set(z)
}
}
function audioFn(){
  if(wavesurfer.isPlaying()){
    wavesurfer.stop()
  }else{
    wavesurfer.play()
  }
}
function askPeerConnection(){
  WSSend({
    time: Date.now(),
    username:userInfo.name,
    start: userInfo.mobile,
    target: userSelected.username,
    id:userSelected.id,
    type: "will-communication"
  })
 if(document.querySelector('.wait_loading')){
   document.querySelector('.wait_loading').style="display:block"
   return
 }
 const askLoading=createNode('div',undefined,[{attrName:'classList',attrValue:'wait_loading'}])
 const closeBtn=createNode('div','关闭',[{attrName:'classList',attrValue:'close_btn'}])
 closeBtn.onclick=function(){
  askLoading.style="display:none"
  askLoading.setAttribute('dataFlag','closed')
 }
 askLoading.append(closeBtn)
 askLoading.setAttribute('dataFlag','open')
document.body.append(askLoading)
}
function closedModal(){
  document.querySelector('.mediaPanel').style="display:none !important"
}

ipcRenderer.on('SET_SOURCE', async (event, sourceId) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: sourceId,
          minWidth: 1280,
          maxWidth: 1280,
          minHeight: 720,
          maxHeight: 720
        }
      }
    })
    
    handleStream(userSelected,stream)
  } catch (e) {
    console.log(e)
  }
})

async function handleStream (scoped,stream) {
  await connectPeersMedia(scoped)
  stream.getTracks().forEach(
        // 这里添加数据源，调起onnegotiationneeded
         track => scoped['mediaConnection'].addTransceiver(track, {streams: [stream]})
        // 注意:通过触发一个negotiationneeded事件，向连接添加一个跟踪将触发重新协商。
      );
  const video = document.querySelector('.media>video')
  video.srcObject = stream
  video.onloadedmetadata = (e) => video.play()
}
async function invite() {
  ipcRenderer.send('window-msg',JSON.stringify({index:'handleVideo'}))
  }
let onMove=false
function clickMedia(param,event){
  onMove=onMove?false:true
}
function moveMedia(param,event){
  if(onMove){
  const mediaPanel=document.querySelector('.mediaPanel')
  mediaPanel.style.left=(event.clientX-100)+'px'
  mediaPanel.style.top=(event.clientY-15)+'px'
}
}
function getChoiceFile(param,e){
  const file=e.target.files[0]
    if(!file){
      console.log('没选择文件，默认退出')
      return 
    }
    let fileType=''
    switch(file.type){
      case 'image/png':
        fileType='image';break;
      case 'image/jpeg':
        fileType='image';break;
      case 'text/plain':
        fileType='text';break;
      case 'application/pdf':
        fileType='pdf';break;
      case 'application/msword':
        fileType='word';break;
      case 'application':
        if(file.type.indexOf('sheet')!=-1){fileType='excel'};
        break;
      default:fileType='unknown';break;
    }
    // 使用rtc channel点对点传输文件
    sendFile=file
    sendFileType=fileType
    if(userSelected.type=='mul'){
      userLists.forEach(item=>{
        if(userSelected.userList.includes(item.id)&&item.id!=userSelected.id)
        fileTransfer(sendFile,sendFileType,item,'multy')
      })
      
  }else{
  // let timer=setInterval(() => {
    // if(sendFile&&sendFileType&&userSelected.sendData?.readyState=='open'){
    fileTransfer(sendFile,sendFileType,userSelected,undefined)
    // clearInterval(timer)
  // }
  // }, 500);
}
}
async function fileTransfer(file,fileType,scoped,flag,time,durations){
  let reader = new FileReader();
 // 加入一包64kb
 let kbit=64*1024
 // 完整包的偏移量
 let offset=0
 let arrayBufferData=[]
 await reader.addEventListener('load', (e)=>{
  scoped.sendData.send(e.target.result);//传输读取到的流，64kb一个包
 arrayBufferData.push(e.target.result)
 offset+=e.target.result.byteLength
 if(offset<file.size){//判断流偏移是否大于文件流的大小
  reader.readAsArrayBuffer(file.slice(offset,offset+kbit))//当前流偏移位置小于文件流长度，那么继续读取传输
 }
 else{//文件传输完，获取上一个聊天记录的接收时间，如果大于1分钟，那么输出当前时间
   let haveLast=scoped.history[scoped.history.length-1]
   if(haveLast){
     if((new Date()-haveLast.time)/1000/60>1){//大于一分钟，输出当前时间到聊天面板中
      const tip={type:'tips',message:new Date().getTime(),isIcon:false}
      // indexedDB_operation('insert',tip)
      scoped.history.push(tip)
    }
   }
  //  文件。否则音频
    const data={
      type: "file",
      id:scoped.id,
      target:scoped.username,
      start:flag=='multy'?userSelected.id:userInfo.mobile,
      username:userInfo.name,
      time: Date.now(),
      img:userInfo.img,
      fileDetail: {
       fileType,
       fileSize:(file.size/1024).toFixed(2),
       fileName:file.name||'未知文件',
       data:URL.createObjectURL(new Blob(arrayBufferData)),
      }
     }
  if(fileType!='voice'){
    if(flag=='multy')
    userSelected.history.push(data)
    else
    scoped.history.push(data)//发送文件相关信息
  chatMain.append(sendOrRecieveData(data))
}
   sendFile=''
   sendFileType=''
 }
 })
 //A端开始分包传输-1.先告诉B端包的大小以及相关标识
 const data={
  start:flag=='multy'?userSelected.id:userInfo.mobile,
  username:userInfo.name,
  id:scoped.id,
  target:scoped.username,
  img:userInfo.img,
  size:file.size,
  type:'fileDetail',
  fileType,
  durations:durations,
  fileSize:file.size, 
  fileName:file.name,
  time:time||Date.now()
    }
await  scoped.sendData.send(JSON.stringify(data))
await reader.readAsArrayBuffer(file.slice(0,kbit))
}
  function inputKeyUp(event){
    // 默认事件-换行
    event.preventDefault()
    if(event.keyCode==13&&event.shiftKey)return
    else if(event.keyCode==13){
      const chatMain=document.querySelector('.chatMain')
     let inputPanel= document.querySelector('.inputPanel')
     const subText=inputPanel.innerHTML//.substring(0,inputPanel.innerText.length-1)
     const contentText=subText.split('<div><br></div>')[0]
      handleSendButton(contentText)
      inputPanel.innerHTML=''
      chatMain.scrollTop =chatMain.scrollHeight;
    }
  }
  // function inputKeyDown(event){
  //   if(event.keyCode==13){
  //     return ''
  //   }
  // }
 function handleSendButton (value) {
  if(userSelected.username==userInfo.name){
    toast('warning','请不要发送信息给自己')
    return false
  }
    if(!value){
      // 没输入信息时候不让发送
      toast('warning','请输入内容在发送')
      return false
    }
    const isIcon=emotionLists[value]
    let haveLast=userSelected.history[userSelected.history.length-1]
    if(haveLast){
      if((Date.now()-haveLast.time)/1000/60>1){
        const data={type:'tips',message:Date.now(),isIcon:false}
      userSelected.history.push(data)
      // indexedDB_operation('insert',data)
      chatMain.append(sendOrRecieveData({type:'tips',message:Date.now(),isIcon:false}))
    }
    }
    const db_data={
      target:userSelected.username,
      id:userSelected.id,
      username:userInfo.name,
      start:userInfo.mobile,
      text:value,
      type:'message',
      message:isIcon?isIcon:value,
      time:Date.now(),
      isIcon,img:userInfo.img
    }
    if(userSelected.type == 'mul'){
      db_data.type='mulChat'
      db_data.isMulty=true
      db_data.userList=userSelected.userList
      db_data.start=userSelected.id
      // WSSend(db_data)
      userLists.forEach(async item=>{
        if(userSelected.userList.includes(item.id)&&item.id!=userInfo.mobile){
          if(!item.sendData||item.sendData.readyState!='open'){
            await connectPeersData(item)
            await createDataICE(item)
            await createOffer(item,'dataConnection')
            let timer=setInterval(() => {
              if(item.sendData&&item.sendData.readyState=='open'){
                item.sendData.send(JSON.stringify(db_data))
              clearInterval(timer)
            }
            }, 500);
            }else{
              item.sendData.send(JSON.stringify(db_data))
            }
        }
      })
    }else{
      // indexedDB_operation('insert',db_data)
      userSelected.sendData.send(JSON.stringify(db_data))
    }
    userSelected.history.push(db_data)
    chatMain.append(sendOrRecieveData(db_data))
  }
   function initWS(){
    let serverUrl;
  serverUrl =`${myWsName}?id=${userInfo.mobile}&username=${userInfo.name}&img=${userInfo.img}`
  WSConnection = new WebSocket(serverUrl, "json");
  WSConnection.onmessage =async (evt)=> {
    let msg = JSON.parse(evt.data);
    let isopen=false,
    scoped=await userLists.find(item=>item.id==msg.start);
    switch(msg.type) {
      case "userlist": 
      getUserList(msg);
      break;
      case "offer": 
        handleOfferMsg(scoped,msg);break;
      case "answer":
        handleAnswer(scoped,msg);break;
      case "media-ICE":
        handleMediaICE(scoped,msg);break;
      case "data-ICE":
        handleDataICE(scoped,msg);break;
      case "will-communication":
          try{
            filterUserLists.forEach((item,index)=>{
            if(item.username==msg.username){
              document.querySelectorAll('.Item')[index].click()
              const isReceive=confirm('是否接听')
              if(isReceive){
                WSSend({
                  type:'communication',
                  username:userInfo.name,
                  start: userInfo.mobile,
                  target: userSelected.username,
                  id:msg.id,
                })
              }
            }
          })
          }catch(err){console.log(err)}
          break;
      case "communication":
          isopen= document.querySelector('.wait_loading').getAttribute('dataFlag')
          if(isopen=='open') {
            document.querySelector('.wait_loading').style="display:none";
            invite();
          }
          break;
      default:
        // 流或者blob
        // receiveBuffer.push(evt.data)
        log_error("Unknown message received:");
        log_error(msg);
        break;
    }
    WSConnection.onopen = function() {
      console.log('ws open')
      
  };
  WSConnection.onerror = function(e) {
    console.log('链接异常',e)
  }
  };
   }
   function handlmulChatRequest(msg){
    let name=[]
    userLists.forEach(item=>{
      if(msg.userList.includes(item.id)){
        name.push(item.username)
      }
    })
    name.push(userInfo.name)
    userLists.push({username:name.toString(),id:msg.id,history:[],newMassage:0,img:msg.img,type:'mul',userList:msg.userList})
    initLeft(userLists)
   }
  async function createOffer(scoped,connectionName){
    if(connectionName=='dataConnection'){
      if(!scoped[connectionName]){
      await connectPeersData(scoped)
      await createDataICE(scoped)
    }
    }else{
      connectionName='mediaConnection'
      if(!scoped[connectionName]){
      await connectPeersMedia(scoped)
      await creaatMediaICE(scoped)
    }
    }
    try {
      
      if (scoped[connectionName].signalingState != "stable") {
        log("连接状态还不是stable,请等待...")
        return;
      }
      const offerSDP = await scoped[connectionName].createOffer({"iceRestart":true});
      await scoped[connectionName].setLocalDescription(offerSDP);
      WSSend({
        username:userInfo.name,
        start: userInfo.mobile,
        target: scoped.username,
        id:scoped.id,
        type: "offer",
        connectionName,
        sdp: scoped[connectionName].localDescription
      });
    } catch(err) {
      reportError(err);
    }
  }
  function creaatMediaICE(scoped){
    scoped['mediaConnection'].onicecandidate =event=>{
    if (event.candidate)
    WSSend({
      type: "media-ICE",
      start:userInfo.mobile,
      username:userInfo.name,
      target: scoped.username,
      id: scoped.id,
      candidate: event.candidate
    });
  }
}
function createDataICE(scoped){
  scoped['dataConnection'].onicecandidate =event=>{
      if (event.candidate)
      WSSend({
        type: "data-ICE",
        start:userInfo.mobile,
        username:userInfo.name,
        target: scoped.username||scoped.username,
        id: scoped.id||scoped.id,//用户没打开对话框
        candidate: event.candidate
    });
  }
  }
  async function handleDataICE(scoped,msg) {
    if(!scoped['dataConnection']){
      await connectPeersData(scoped)
    }
    var candidate = new RTCIceCandidate(msg.candidate);
    try {
      await scoped['dataConnection'].addIceCandidate(candidate)
    } catch(err) {
      reportError(err);
    }
  }
  async function handleMediaICE(scoped,msg){
    if(!scoped['mediaConnection']){
      await connectPeersMedia(scoped)
    }
    var candidate = new RTCIceCandidate(msg.candidate);
    try {
      await scoped['mediaConnection'].addIceCandidate(candidate)
    } catch(err) {
      reportError(err);
    }
  }
  async function getUserList(msg){
    userLists=[]
    msg.users.forEach( item=>{
      if(item.id!=userInfo.mobile){
          // indexedDB_operation('get',item.id,'id').then(response=>{
          //   const result=response[0]
          //   if(result){
          //   userLists.push({username:item.username,id:item.id,img:item.img,history:result,newMassage:0})
          // }else{
            userLists.push({username:item.username,id:item.id,img:item.img,history:[],newMassage:0})
          // }
          filterUserLists=userLists
            initLeft(filterUserLists);
          // }).catch(error=>{
          //   userLists.push({username:item.username,id:item.id,img:item.img,history:[],newMassage:0})
          //   filterUserLists=userLists
          //   initLeft(filterUserLists);
          // })
      }
    })
  }
   
  async function handleAnswer(scoped,msg){
    var desc = new RTCSessionDescription(msg.sdp);
    await scoped[msg.connectionName].setRemoteDescription(desc).catch(reportError);
  }
function connectPeersData(scoped){
  scoped['dataConnection'] = new RTCPeerConnection(peerConfig);
  scoped.sendData = scoped['dataConnection'].createDataChannel("tansformData",{ordered: true});
  scoped.sendData.binaryType = 'arraybuffer'
  scoped.sendData.onopen =()=>{
  onsendChannelStateChange()
  isClosed=false
  };
  scoped.sendData.onclose = ()=>{
        onsendChannelStateChange()
        isClosed=true
    }
  
    scoped['dataConnection'].ondatachannel = event=>{
    scoped.receiveChannel = event.channel;
    scoped.receiveChannel.onmessage = handleReceiveMessage;
    scoped.receiveChannel.onopen    = ()=>console.log('onopen接收通道状态：'+scoped.receiveChannel.readyState);
    scoped.receiveChannel.onclose   = ()=>{
      // 需要重置页面
      console.log('发送端通道关闭',scoped.receiveChannel)
      };
  };
}
function connectPeersMedia(scoped){
  scoped['mediaConnection'] = new RTCPeerConnection(peerConfig);
  scoped['mediaConnection'].onsignalingstatechange = handleSignalingStateChangeEvent;//可能由于对setLocalDescription()或 的调用而发生 setRemoteDescription()
  // 音轨被添加进peer时
  scoped['mediaConnection'].onnegotiationneeded = createOffer;//音视频轨道添加时触发
  scoped['mediaConnection'].ontrack = handleTrackEvent;//监听接收的轨道赋值到指定媒体中是调用
}
 function handleTrackEvent(event) {
   toolOpen('media')
   initChatDialog()
  document.querySelector(".media>video").srcObject =event.streams[0];
 
}
function WSSend(msg) {
  var msgJSON = JSON.stringify(msg);
  WSConnection.send(msgJSON);
}
function handleSignalingStateChangeEvent() {
  
  log("WebRTC状态是: " + userSelected['mediaConnection'].signalingState);
  switch(userSelected['mediaConnection'].signalingState) {
      case "closed":
      log('webrtc状态关闭closed')
      break;
      case "have-local-offer":
        break;
      case "stable":
        isClosed=true;
        break;
      default:break;
  }
}
async function handleOfferMsg(scoped,msg) {
  const connectionName=msg.connectionName
  if(connectionName=='dataConnection'){
    await connectPeersData(scoped)
    await createDataICE(scoped)
  }
    else{
   await connectPeersMedia(scoped);
   await creaatMediaICE(scoped)
  }
   
  var desc = new RTCSessionDescription(msg.sdp);
  if (scoped[connectionName].signalingState != "stable") {
    await Promise.all([
      scoped[connectionName].setLocalDescription({type: "rollback"}),
      scoped[connectionName].setRemoteDescription(desc)
    ]);
    return;
  } else {
    await scoped[connectionName].setRemoteDescription(desc);
  }
  const answer=await scoped[connectionName].createAnswer()
  await scoped[connectionName].setLocalDescription(answer);
  WSSend({
    username: userInfo.name,
    start:userInfo.mobile,
    target: msg.username,
    id:msg.start,
    type: "answer",
    connectionName,
    sdp: scoped[connectionName].localDescription
  });
}
function handleReceiveMessage(event){
    isClosed=false
    // 接收用户索引
    let domIndex=0
    // 接收消息数量
    let newMassage=0
    // 消息类型
    let messType=''
    //收到消息自动到最下
    const chatMain=document.querySelector('.chatMain') 
    if(typeof event.data=='string'){
      // 经过序列化的数据
      let response=JSON.parse(event.data)
      
    switch(response.type){
      
      case "remoteMove":
        // if(window.ffiNapi){
        //   window.ffiNapi.MouseMove(response.x,response.y)
        // }
        break;
      case "connectMul":
        handlmulChatRequest(response)
          break;
      case 'fileDetail': 
        receivedDetail=JSON.parse(event.data);
        break;
      case "mulChat":
      case "message":
        if(emotionLists[response.text]){
          userLists.forEach((item,index)=>{
          if(item.id==response.start){
            domIndex=index
            messType='表情'
            let haveLast=item.history[item.history.length-1]
            if(haveLast){
              if((response.time-haveLast.time)/1000/60>1){
                const db_data={type:'tips',message:new Date(response.time).getTime(),isIcon:false,time:Date.now()}
              item.history.push(db_data)
              if(chatMain&&userSelected.id==response.start)
              chatMain.append(sendOrRecieveData(db_data))
            }
            }
            const db_data1={...response,message:emotionLists[response.text],isReceive:true}
            // indexedDB_operation('insert',db_data1)
            item.history.push(db_data1)
            if(chatMain&&userSelected.id==response.start)
            chatMain.append(sendOrRecieveData(db_data1))
             if(item.id==userSelected.id){
              newMassage=0
            }
            else{
              let num= document.querySelectorAll('.userAvatar')[domIndex].firstChild.textContent
              num.replace('+','')
              newMassage=1+(parseInt(num||0))
            // $emit('changeTipCount')
            }
          }
        })
        }
        else{
          try{
        userLists.forEach((item,index)=>{
          if(item.id==response.start){
            let haveLast=item.history[item.history.length-1]
            if(haveLast){
              if((response.time-haveLast.time)/1000/60>1){
                const db_data={type:'tips',message:new Date(response.time).getTime(),isIcon:false,time:response.time}
                item.history.push(db_data)
                if(chatMain&&userSelected.id==response.start)
                chatMain.append(sendOrRecieveData(db_data))
            }
            }
            domIndex=index
            messType=response.text
            const db_data1={...response,isReceive:true}
            // indexedDB_operation('insert',db_data1)
            item.history.push(db_data1)
            if(chatMain&&userSelected.id==response.start)
            chatMain.append(sendOrRecieveData(db_data1))
             if(item.id==userSelected.id){
              //  $emit('changeTipCount',item.newMassage,true)
              newMassage=0
            }
            else{
             let num= document.querySelectorAll('.userAvatar')[domIndex].firstChild.textContent
             num.replace('+','')
             newMassage=1+(parseInt(num||0))
            // $emit('changeTipCount')
            }
            throw new Error()
          }
        })
      }catch(err){ }
      }
      if(chatMain&&userSelected.id==response.start)
      chatMain.scrollTop =chatMain.scrollHeight;
      if(!windowShow){
        ipcRenderer.send('window-msg',JSON.stringify({index:'twinkle',data:{newMassage,...response}}))
      }
        break;
      case "stop-share":
        document.querySelector('.media').pause();
        closedModal()
        toast('warning','对方关闭了共享')
        break;
      case "withdraw":
        // 撤回消息
        messType='对方撤回一条消息'
        AcceptWithdraw(response)
        break;
      case "closed-video":
        // document.getElementById("received_video").srcObject=undefined
        document.querySelector('.media').pause();
        closedModal()
        toast('warning','对方关闭了共享')
        break;
      case "voice":

        break;
    }
    }else if(typeof event.data=='object'){
      // arrayBuffer
      receiveBuffer.push(event.data)
        receivedSize += event.data.byteLength||event.data.size;//谷歌与火狐的属性名称不一样
        if(receivedDetail.fileSize==receivedSize){
          if(receivedDetail.fileType!='voice'){
          const blobURL=URL.createObjectURL(new Blob(receiveBuffer))
          // 如果有multyId，那么使用他进行判断，如果没有那么说明是一对一通话，那么使用start
          debugger
          userLists.forEach(item=>{
          if(item.id==receivedDetail.start){
            messType='文件'
            const db_data={
              ...receivedDetail,
              isReceive:true,
              type: "file",
              fileDetail:{
              fileSize:(receivedDetail.fileSize/1024).toFixed(2),
              fileType:receivedDetail.fileType,
              fileName:receivedDetail.fileName||'未知文件',
              data:blobURL,
              },
            }
            item.history.push(db_data)
            // indexedDB_operation('insert',db_data)

            if(!windowShow){
              ipcRenderer.send('window-msg',JSON.stringify({index:'twinkle',data:{newMassage,...response}}))
            }
            if(chatMain&&item.id==receivedDetail.start){
            chatMain.append(sendOrRecieveData(db_data))
            chatMain.scrollTop =chatMain.scrollHeight;
          }
            receivedSize=0
            receiveBuffer=[]
          }
        })
      }else{
          userLists.forEach(item=>{
          if(item.id==receivedDetail.start){
            messType='语音'
            const blob=new Blob(receiveBuffer)
            const db_data={
              ...receivedDetail,
              isReceive:true,
              type: "voice",
              fileDetail:{
              fileSize:(receivedDetail.fileSize/1024).toFixed(2),
              fileType:receivedDetail.fileType,
              fileName:receivedDetail.fileName||'语音',
              data:blob,
              },
            }
            if(chatMain&&item.id==receivedDetail.start){
              createWavesurfer(db_data,blob)
              chatMain.scrollTop =chatMain.scrollHeight;
            }
            item.history.push(db_data)
            // indexedDB_operation('insert',db_data)
            if(!windowShow){
              ipcRenderer.send('window-msg',JSON.stringify({index:'twinkle',data:{newMassage,...response}}))
            }
            receivedSize=0
            receiveBuffer=[]
          }
        })
      }
        }
    }
    if(newMassage){
      const span_dom=document.querySelectorAll('.userAvatar')[domIndex].firstChild
      span_dom.innerHTML=newMassage>99?'99+':newMassage
      span_dom.classList='noticeNum'
    }
    document.querySelectorAll('.lastMessage')[domIndex].innerHTML=messType.replace(/<s?img[^>]*>/gi, '【图片】'); 
}
// function AcceptWithdraw(msgObj){
//   const chatMain=document.querySelector('.chatMain') 
  
//     try{
//     userLists.forEach(items=>{
//       if(msgObj.username==items.username){
//           items.history.forEach((item,index)=>{
//             if(new Date(item.time).getTime()==msgObj.time){
//               const db_data={type:'tips',message:items.username+'撤回了一条消息',isIcon:false,time:Date.now()}
//               items.history.splice(index,1,db_data)
//               if(chatMain&&userSelected.id==msgObj.id){
//               chatMain.children[index].after(sendOrRecieveData(db_data))
//               chatMain.children[index].remove()
//             }
//               throw new Error()
//             }
//         })
//           // }
//       }
//     })
//     }catch(e){
//           // 
//         }
//   }
//  function  handleFileICE(scoped,msg) {
//   var candidate = new RTCIceCandidate(msg.candidate);
//   try {
//     scoped[''].addIceCandidate(candidate)
//   } catch(err) {
//     reportError(err);
//   }
// }
  function  onsendChannelStateChange(){
  if (userSelected.sendData) {
    console.log('发送通道状态：'+userSelected.sendData.readyState)
  }
}
  function reportError(errMessage) {
  log_error(`错误 ${errMessage.name}: ${errMessage.message}`);
}
function log(text) {
  var time = new Date();
  console.log("[" + time.toLocaleTimeString() + "."+(time-Date.parse(time)) +"] " + text);
}
 function log_error(text) {
  var time = new Date();
  console.trace("[" + time.toLocaleTimeString() + "] " + text);
}