const dbName = "WebRTC";
const dbVersion = 1;
// indexedDB兼容
const indexedDB=window.indexedDB ||window.webkitindexedDB ||window.msIndexedDB ||window.mozIndexedDB
//name:表名  key:主键 ,cursorIndex 索引
let store={
  userTable: {
    name: "chat",//事务名，仓库名
    key: "time",//主键
    // {type:'message',message:response.text,time:response.time,isIcon:false,username:response.username
    // fileDetail:{
      //   fileSize:(receivedDetail.fileSize/1024).toFixed(2),
      //   fileType:receivedDetail.fileType,
      //   fileName:receivedDetail.fileName||'未知文件',
      //   data:blobURL,
      //   }
    // }
    cursorIndex: [
      { name: "id", unique: false },
      { name:"username",unique: false},
      { name:'target',unnique:false},
      { name:'start',unique:false},
      { name:'isReceive',unique:false},
      { name:"type",unique: false},
      { name:"message",unique: false},
      { name:"time",unique: true},
      { name:"isIcon",unique: false},
      { name:"fileDetail",unique: false},
    ]
  }
}
async function initDB() {
  let request = indexedDB.open(dbName, dbVersion);
  request.onerror = function() {
    console.log("打开db异常");
  };

  request.onsuccess = function() {
    console.log("打开db成功");
  };
  request.onupgradeneeded = function(event) {
    let db = event.target.result;
    for (var t in store) {
      if (!db.objectStoreNames.contains(store[t].name)) {
        var objectStore = db.createObjectStore(store[t].name, {
          keyPath: store[t].key,
          autoIncrement: true
        });
        for (let i = 0; i < store[t].cursorIndex.length; i++) {
          const element = store[t].cursorIndex[i];
          objectStore.createIndex(element.name, element.name, {
            unique: element.unique
          });
        }
      }
    }
  };
}
// 打开数据库
 async function openDB() {
  return new Promise((resolve, reject) => {
    let request = indexedDB.open(dbName, dbVersion);

    request.onerror = function(event) {
      reject("打开db异常:" + event);
    };
    request.onsuccess = function(event) {
      resolve(event.target.result);
    };
  });
}
async function deleteDB(table) {
  let deleteQuest = indexedDB.deleteDatabase(table);
  deleteQuest.onerror = function() {
    return Promise.resolve(false);
  };
  deleteQuest.onsuccess = function() {
    return Promise.resolve(true);
  };
}

async function closeDB(db) {
  try {
    let d;
    if (!db) {
      d = await openDB();
    }
    let closeQuest = d.closeDB();
    return new Promise(resolve => {
      closeQuest.onerror = function() {
        resolve(false);
      };
      closeQuest.onsuccess = function() {
        resolve(true);
      };
    });
  } catch (error) {
    return Promise.resolve(false);
  }
}

async function insert(table, data) {
  try {
    let db = await openDB();
    let request = db
      .transaction(table.name, "readwrite")
      .objectStore(table.name)
      .add(data);
    return new Promise((resolve, reject) => {
      request.onerror = function() {
        reject("add data occurred error");
      };
      request.onsuccess = function() {
        resolve(true);
      };
    });
  } catch (error) {
    console.log(error);
    return Promise.resolve(false);
  }
}

async function update(table, data) {
  try {
    let db = await openDB();
    let request = db
      .transaction(table.name, "readwrite")
      .objectStore(table.name)
      .put(data);
    return new Promise(resolve => {
      request.onerror = function() {
        resolve(false);
      };
      request.onsuccess = function() {
        resolve(true);
      };
    });
  } catch (error) {
    return Promise.resolve(false);
  }
}

async function deleted(table, keyValue) {
  try {
    console.log(table,keyValue)
    let db = await openDB();
    let request = db
      .transaction(table.name, "readwrite")
      .objectStore(table.name)
      .delete(keyValue);
    return new Promise(resolve => {
      request.onerror = function() {
        resolve(false);
      };
      request.onsuccess = function() {
        resolve(true);
      };
    });
  } catch (error) {
    return Promise.resolve(false);
  }
}

async function clear(table) {
  let db = await openDB();
  let store = db.transaction(table.name, "readwrite").objectStore(table.name);
  store.clear();
}

async function get(table, keyValue, indexCursor) {
  try {
    let db = await openDB();
    let store = db
      .transaction(table.name, "readonly")
      .objectStore(table.name);
    let request;
    request = !keyValue
      ? store.openCursor()
      : indexCursor
      // 类似select * from table where indexCursor=keyValue
        ? store.index(indexCursor).getAll(keyValue)
        // 类似 select * top 1 from table
        : store.get(keyValue);
    let data = [];
    return new Promise(resolve => {
      request.onerror = function() {
        resolve("search Error");
      };
      request.onsuccess = function(event) {
        if (!keyValue && !indexCursor) {
          if (event.target.result) {
            data.push(event.target.result.value);
            event.target.result.continue();
          } else {
            resolve(data);
          }
        } else {
          resolve([event.target.result]);
        }
      };
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

async function handleDataByCursor(table, keyRange) {
  try {
    let kRange = keyRange || "";
    let db = await openDB();
    let store = db.transaction(table, "readwrite").objectStore(table),
      request;
    request = store.openCursor(kRange);
    return new Promise(resolve => {
      request.onerror = function() {
        resolve("the pointer can not get data,error was happen");
      };
      request.onsuccess = function(event) {
        let cursor = event.target.result;
        resolve(cursor);
      };
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

async function handleDataByIndex(table, keyRange, sursorIndex) {
  try {
    let kRange = keyRange || "";
    let db = await openDB();
    let store = db.transaction(table, "readwrite").objectStore(table),
      request;
    request = store.index(sursorIndex).openCursor(kRange);
    return new Promise(resolve => {
      request.onerror = function() {
        resolve("the pointer can get Data error");
      };
      request.onsuccess = function(event) {
        let cursor = event.target.result;
        if (cursor) {
          resolve(cursor);
        }
      };
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

async function createCursorIndex(table, cursorIndex, unique) {
  var db = await openDB();
  let store = db.transaction(table, "readwrite").objectStore(table);
  store.createIndex(cursorIndex, cursorIndex, {
    unique: unique
  });
  return Promise.resolve();
}
export default {
  // 数据库对象
  indexedDB,
  // 数据库表结构
  store,
  //初始化数据库
  initDB,
  // 链接数据库
  openDB,
  // 删除表
  deleteDB,
  // 关闭数据库
  closeDB,
  // 添加数据，add添加新值
  insert,
  // 更新
  update,
  // 删除数据
  deleted,
  // 清空数据
  clear,
  // 查询数据 表名 索引值 索引 key  没有value key为key 而不是索引
  get,
  //   通过游标操作数据, callback中要有游标移动方式
  handleDataByCursor,
  // 通过索引游标操作数据, callback中要有游标移动方式
  handleDataByIndex,
  // 创建游标索引
  createCursorIndex
};