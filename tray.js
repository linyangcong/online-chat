
   const {ipcRenderer}=require('electron')
 
   const noImg="https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png"
  initIPCON()

  function initIPCON(){
    ipcRenderer.on('tray-msg', (e, param) => {
      const obj=JSON.parse(param)
      const tipBody= document.querySelector('.tipBody')
      tipBody.innerHTML=''
      if(obj.index=='renderTray'){
        const messageList= obj.param
        messageList.forEach(item=>{
          tipBody.appendChild(renderItem(item))
        })
      }
      
    })
  }
  function igAllFn(){
    ipcRenderer.send('tray-msg',JSON.stringify({index:'ignoreAll',type:'',data:{}}))
  }
  function renderItem(scoped){
    const userTips=createNode('div',undefined,[{attrName:'classList',attrValue:"userTips"}])

    const userImg=createNode('div',undefined,[{attrName:'classList',attrValue:'userImg'}])
    const img=createNode('img',undefined,[{attrName:'src',attrValue:scoped.img||noImg}])
    userImg.appendChild(img)

    const content=createNode('div',undefined,[{attrName:'classList',attrValue:'content'}])
    const userName=createNode('div',scoped.username||'姓名',[{attrName:'classList',attrValue:'userName'}])
    const text=createNode('div',scoped.text||'',[{attrName:'classList',attrValue:'text'}])
    content.appendChild(userName)
    content.appendChild(text)

    const tipsNum=createNode('div',undefined,[{attrName:'classList',attrValue:'tipsNum'}])
    const span=createNode('span',scoped.newMassage||1,[])
    tipsNum.appendChild(span)

    userTips.appendChild(userImg)
    userTips.appendChild(content)
    userTips.appendChild(tipsNum)
    userTips.onclick=function(){
      ipcRenderer.send('tray-msg',JSON.stringify({index:'findUser',type:'',data:{id:scoped.id,isMulty:scoped.isMulty}}))
    }
    return userTips
  }

  function createNode(nodeType,innerContent,attributes=[]){
    const dom=document.createElement(nodeType)
    if(innerContent)
    dom.innerHTML=innerContent
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