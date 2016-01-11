'Dictionary+Logical+Context'.subclass(function (I) {
  "use strict";
  // I describe a container that holds logical objects.
  I.know({
    build: function (baseDictionary, homeContext, contextKey, module) {
      I.$super.build.call(this, baseDictionary);
      this.buildLogical(homeContext, contextKey, module);
    },
    contains: function (it) {
      return I._.Logical.describes(it) && this.lookup(it.getKey()) === it;
    },
    store: function (it, ix) {
      // check every attempt to store a logical in this container
      if (!this.checkStorage(it, ix)) {
        this.bad('storage', ix);
      }
      return I.$super.store.call(this, it, ix);
    },
    // fail if it cannot be stored in this container
    checkStorage: function (it, ix) {
      return I._.Logical.describes(it) &&
        Identifier.test(ix) && !I.isPropertyOwner(this._, ix) &&
        it.getContext() === this && it.getKey() === ix;
    }
  });
  var Identifier = /^(?:\$_|\$|_|(?:\$?[A-Za-z][-@A-Za-z0-9]*_?))$/;
})