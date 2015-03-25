function extend(base, mixin) {
  for (var fn in mixin.prototype) {
    base.prototype[fn] = mixin.prototype[fn];
    console.log(fn);
  }
}

module.exports.extend = extend;