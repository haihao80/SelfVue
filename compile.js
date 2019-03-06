function Compile(elm) {
  this.vm = elm;
  this.el = document.querySelector(elm.el);
  this.fragment = null;
  this.init();
}

Compile.prototype = {
  //初始化
  init: function() {
    if(this.el) {
      this.fragment = this.node2Fragment();
      this.compileElement(this.fragment);
      this.el.appendChild(this.fragment);
    }
    else {
      console.log('DOM结点未定义')
    }
  },
  //将el下的子元素转化为文档碎片
  node2Fragment: function() {
    let fragment = document.createDocumentFragment();
    let child = this.el.firstChild;
    if(child) {
      fragment.appendChild(child);
    }
    return fragment;
  },
  //
  compileElement: function(el) {
    let childNodes = el.childNodes;
    print(el)
    let self = this;
    [].slice.call(childNodes).forEach(function(node){
      var reg = /\{\{(.*?)\}\}/;//匹配" {{}} "
      var text = node.textContent;
      print(node)
      if(self.isElementNode(node)) {
        self.compile(node);
      }
      else if(self.isTextNode(node) && text.search(reg) > -1) {
        self.compileText(node, reg.exec(text)[1]);
      }
      if(node.childNodes && node.childNodes.length){
          self.compileElement(node);//// 继续递归遍历子节点
      }
    });
  },
  //初始化结点值，添加订阅
  compileText: function(node, exp) {
    let self = this;
    let initText = this.vm[exp];
    this.updateText(node, initText);
    new Watcher(this.vm, exp, function(val) {
      self.updateText(node, val);
    })

  },
  //编译双向数据绑定
  compileModel: function(node, vm, exp) {
    let self = this;
    let val = vm[exp];
    this.modelUpdater(node, val);
    new Watcher(vm, exp, function(val) {
      self.modelUpdater(node, val);
    });
    node.addEventListener('input', function(e) {
      let newVal = e.target.value;
      if(val === newVal) return;
      //双向数据绑定
      self.vm[exp] = newVal;
      val = newVal;
    })
  },
  //编译元素结点
  compile: function(node) {
    let attrs = node.attrs;
    let self = this;
    [].slice.call(attrs).forEach(function(attr) {
      let exp = attr.value;
      let attrName = attr.attrName;
      console.log(attrName)
      if(self.isDirective(attrName)) {
        console.log('directive')
        let attrNameSub = attrName.subString(2);
        if(self.isEventDirective(attrNameSub)) {
          console.log(`编译事件${exp}`)
          self.compileEvent(node, self.vm, exp, attrNameSub);
        }
        else {
          console.log(`编译Model${exp}`)
          self.compileModel(node, self.vm, exp);
        }
        node.removeAttr(attrName);
      }
    })
  },
  //编译事件响应函数
  compileEvent: function(node, vm, exp, dir) {
    let eventType  = dir.split(':')[1];
    let cb = vm.methods && vm.methods[exp];
    if(eventType && cb)
      node.addEventListener(eventType , cb.bind(vm), false);
  },
  updateText: function(node, val) {
    node.textContent = typeof val == 'undefined' ? '' : val;
  },
  modelUpdater: function(node, value) {
    node.value = typeof value == 'undefined' ? '' : value;
  },
  //是否为v-开头的属性
  isDirective: function(attrName) {
    return attrName.indexof('v-model') == 0;
  },
  //on:开头的属性
  isEventDirective:function(attrName) {
    return attrName.indexof('on:') == 0;
  },
  //是否为元素结点
  isElementNode: function(node) {
    return node.nodeType == 1;
  },
  //是否为文本结点
  isTextNode: function(node) {
    return node.nodeType == 3;
  }

}