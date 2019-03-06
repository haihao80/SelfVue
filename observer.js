function Observer(data) {
  this.data = data;
  this.walk(data);
}

Observer.prototype = {
  //遍历data，添加监听
  walk: function() {
    Object.keys(this.data).forEach(key => {
      this.defineReactive(this.data, key, this.data[key]);
    });
  },
  defineReactive: function(data, key, val) {
    observe(val);
    
    let dep = new Dep();
    Object.defineProperty(data, key, {
      get: function() {
        if(Dep.target) {
          dep.add(Dep.target);
        }
        return val;
      },
      set: function(newVal) {
        if(val === newVal) 
          return;
        console.log(`数据变化${val} ==> ${newVal}`);
        //数据变化则notify
        val = newVal;
        dep.notify();
      },
      //不可再次添加监听
      configurable: false,
      enumerable: false
    })
  }
}

function observe(data) {
  if(!data || typeof data !== 'object') {
    return;
  }
  return new Observer(data);
}

function Dep() {
  this.subs = [];
}

Dep.prototype = {
  add: function(sub) {
    this.subs.push(sub);
  },

  notify: function() {
    this.subs.forEach((sub) => {
      sub.update();
    })
  }
}

