function extend(base, mixin) {
  for (var fn in mixin.prototype) {
    base.prototype[fn] = mixin.prototype[fn];
  }
}

module.exports.extend = extend;