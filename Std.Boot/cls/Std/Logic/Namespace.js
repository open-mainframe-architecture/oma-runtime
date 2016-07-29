//@ A namespace holds classes, modules and nested namespaces.
'Container'.subclass(I => {
  "use strict";
  I.am({
    Abstract: false,
    Final: true
  });
  I.know({
    build: function(parentNamespace, key, module) {
      I.$super.build.call(this, parentNamespace, key, module, parentNamespace);
      parentNamespace.update(key, this);
    },
    isNamespace: I.returnTrue,
    //@ Create ancestor containers from this namespace to the container where the keys lead.
    //@param keys {[string]} path to container
    //@param factory {function} factory closure creates a new container if necessary
    //@return {Std.Logic.Container} existing or new container
    makeContainers: function(keys, factory) {
      const makeContainer = (container, key) => container.select(key) || factory(container, key);
      return keys.reduce(makeContainer, this);
    },
    //@ Resolve path to logic object.
    //@param keys {[string]} logic keys to resolve
    //@return {Std.Logic.Object?} resolved logic object or nothing
    resolveKeys: function(keys) {
      const n = keys.length;
      let object = this._[keys[0]];
      for (let i = 1; object && i < n; ++i) {
        object = object.select(keys[i]);
      }
      return object;
    },
  });
})