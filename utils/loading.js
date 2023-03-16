class Waiting {
  constructor(container) {
    container = document.querySelector(container) || document.body;
    var box = document.createElement('div');
    box.className = 'PCwaiting local';
    if (!container) {
      box.style.position = 'fixed';
    }
    box.innerHTML = `
    <style>
    .PCwaiting{
      position:absolute;
      top:0;
      bottom:0;
      left:0;
      right:0;
      background:rgba(0,0,0,.5);
      z-index:8888
    }
    .PCwaiting.local{
      width:100%;
      height:100%;
      border-radius:3px;
    }
    .PCwaiting:after {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      width: 5px;
      height: 5px;
      margin-top: -2px;
      margin-left: -2px;
      text-align: center;
      -webkit-border-radius: 100%;
      border-radius: 100%; 
      box-shadow:0 0 3px; 
      -webkit-transition: all, 0.5s, linear; 
      transition: all, 0.5s, linear; 
      -webkit-animation: am-wait 1s linear infinite; 
      animation: am-wait 1s linear infinite;
      box-shadow:
      0     -20px 0 2px   rgba(255,255,255,1), 
      -14px -14px 0 1.5px rgba(255,255,255,0.9),
      -20px 0px   0 1px   rgba(255,255,255,0.8),   
      -14px 14px  0 1px   rgba(255,255,255,0.7),
      0     20px  0 0.5px rgba(255,255,255,0.6),
      14px  14px  0 0.5px rgba(255,255,255,0.5),
      20px  0px   0 0.5px rgba(255,255,255,0.4),
      14px  -14px 0 0.5px rgba(255,255,255,0.2)
    }
    @-webkit-keyframes am-wait {100% {-webkit-transform: rotate(1turn);transform: rotate(1turn);}}@keyframes am-wait {100% {-webkit-transform: rotate(1turn);transform: rotate(1turn);}
      </style>
    `;

    // 
//0     -15px 0 1px     #fff, 
// -20px -20px 0 1px   #fff,
// -15px 0px   0 1px     #fff,   
// -20px 20px  0 1px   #fff,
// 0     15px  0 1px     #fff,
// 20px  20px  0 1px   #fff,
// 15px  0px   0 1px     #fff,
// 20px  -20px 0 1px     #fff,
// 0px   0px   0 2px     #fff

    // 0     -20px 0 2px     #fff, 
    //   -14px -14px 0 1.5px   #fff,
    //   -20px 0px   0 1px     #fff,   
    //   -14px 14px  0 1px   #fff,
    //   0     20px  0 0.5px     #fff,
    //   14px  14px  0 0.5px   #fff,
    //   20px  0px   0 0.5px     #fff

    this.waitingContainer = container;
    if (container.tagName === 'BODY') {
      box.style.position = 'fixed';
    }
    this.waitingBox = box;
  }

  show() {
    this.waitingContainer.appendChild(this.waitingBox);
    return this;
  }

  hide() {
    this.waitingBox.parentNode == this.waitingContainer && this.remove();
    return this;
  }
  remove() {
    this.waitingContainer.removeChild(this.waitingBox);
  }
}

export default  {
  entity: '',
  select: function(container) {
    return new Waiting(container);
  },
  show: function(container) {
    const flag=document.querySelector('.PCwaiting')
    if(flag){
      this.entity && this.entity.hide();
      return false
    }
    return this.entity = new Waiting(container).show();
  },
  hide: function() {
    this.entity && this.entity.hide();
  }
};
