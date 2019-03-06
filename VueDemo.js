function Vue(options) {
  let self = this;
  this.data = options.data;
  this.el = options.el;
  this.vm = this;
  this.methods = options.methods;
  Object.keys(this.data).forEach((key) => {
    self.proxyKeys(key);
  })
  observe(this.data);
  // el.innerHTML = this.data[exp];
  // new Watcher(this, exp, function(val) {
  //   el.innerHTML = val;
  // })
  new Compile(this);
  if(options.mounted)
    options.mounted.call(this);
  return this;
}

Vue.prototype = {
  proxyKeys: function(key) {
    Object.defineProperty(this, key, {
      enumerable: false,
      configurable: false,
      get: function() {
        return this.data[key];
      },
      set: function(val) {
        this.data[key] = val;
      }
    })
  }
}