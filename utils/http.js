import loadingObj from './loading.js'
export async function http(url,method,data,isLoading){
  let urlString=''
  let config={
    method: method,
    headers: {'Content-Type': 'application/json'},
    // mode: 'cors', 
    // cache: 'no-cache',
    // credentials: 'same-origin',
    // redirect: 'follow', 
    // referrerPolicy: 'no-referrer',
    body:JSON.stringify(data) 
  }
  if(method.toUpperCase()=='GET'){ 
    delete config.body
    let tempArr=[]
    for(let i in data){
      tempArr.push(`${i}=${data[i]}`)
    }
    urlString=url+"?"+tempArr.join('&')
  }else if(method.toUpperCase()=='POST'){
    urlString=url
  }
    if(isLoading){
      loadingObj.show()
    }
    const response = await fetch(urlString, config);
    if(isLoading){
      loadingObj.hide()
    }
    return response.json(); 
}

// 通用下载方法
export function download(url, params, filename,isLoading) {

  let header='application/octet-stream'//'application/x-www-form-urlencoded'
  let config={
    transformRequest: [(params) => { return tansParams(params) }],
    headers: { 'Content-Type': header },
    responseType: 'blob',
    method:'POST',
    data:JSON.stringify(params)
  }
  if(isLoading)
  loadingObj.show()
  return fetch(url,config).then(async (data) => {
    const isLogin = await blobValidate(data);
    if (isLogin) {
    //  let url_blob= URL.createObjectURL(blob)
    //  console.log(url_blob)
    //  const tempA=document.createElement('a')
    //  tempA.style="display:none"
    //  tempA.href=url_blob
    //  tempA.download = filename;
    // document.body.appendChild(tempA);
    // tempA.click();
    // document.body.removeChild(tempA);
    loadingObj.hide()
    let myFile = new File([data], filename);
    const fileReader = new FileReader();
    fileReader.readAsDataURL(myFile);
    fileReader.onload = (e) => {
        console.log(e.target);
        let url = e.target.result;
        let a = document.createElement('a');
        document.body.appendChild(a);
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
    fileReader.onerror = (error) => {
        console.log(error);
    };
    } else {
      const resText = await data.text();
      const rspObj = JSON.parse(resText);
      const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode['default']
      loadingObj.hide()
      Message.error(errMsg);
    }
  }).catch((r) => {
    loadingObj.hide()
    Message.error('下载文件出现错误，请联系管理员！')
  })
}
export async function blobValidate(data) {
  try {
    const text = await data.text();
    JSON.parse(text);
    return false;
  } catch (error) {
    return true;
  }
}

export function toast(type, text, margin_top, hold_time, z_index) {
  const div =createNode('div',text,[
    {attrName:'classList',attrValue:'popupStyle'},
  ])
  if (type == "success") {
    div.style.backgroundColor = "#67C23A";
    div.style.color = "#fff";
  } else if (type == "error") {
    div.style.backgroundColor = "#F56C6C";
    div.style.color = "#fff";
  } else if(type == "warning"){
    div.style.backgroundColor = "#E6A23C";
    div.style.color = "#fff";
  } else{
    div.style.backgroundColor = "#909399";
    div.style.color = "#fff";
  }
  const divContainer=createNode('div',undefined,[
    {attrName:'classList',attrValue:'toastContain'},
    {attrName:'style',attrValue:`z-index:${z_index ? z_index : "9999"};top:${margin_top ? margin_top : "10%"};display:block`}
  ])
  divContainer.appendChild(div)
  document.body.appendChild(divContainer);
  setTimeout(
  () => {divContainer.remove();},
  hold_time ? hold_time :2000
  );
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

