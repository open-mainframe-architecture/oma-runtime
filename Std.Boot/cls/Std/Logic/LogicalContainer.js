//@ A container with logical objects.
'Dictionary+Logical+Context'.subclass(I => {
  "use strict";
  const Logical = I._.Logical;
  const KEY = /^(?:\$_|\$|_|(?:\$?[A-Za-z][-@A-Za-z0-9]*_?))$/;
  I.know({
    //@param baseDictionary {Std.Dictionary} base dictionary
    //@param homeContext {Std.Context} logical context
    //@param contextKey {string} logical key
    //@param module {Std.Logic.Module} defining module
    build: function(baseDictionary, homeContext, contextKey, module) {
      I.$super.build.call(this, baseDictionary);
      this.buildLogical(homeContext, contextKey, module);
    },
    contains: function(it) {
      return Logical.describes(it) && this.lookup(it.getKey()) === it;
    },
    store: function(it, ix) {
      // check every attempt to store a logical in this container
      this.assert(this.checkStorage(it, ix));
      return I.$super.store.call(this, it, ix);
    },
    //@ Test whether a logical object can be stored in this container.
    //@param it {Std.Logical} logical object to store
    //@param ix {string} key of logical object
    //@return {boolean} true if it can be stored, otherwise false
    checkStorage: function(it, ix) {
      return Logical.describes(it) && KEY.test(ix) && !I.isPropertyOwner(this._, ix) &&
        it.getContext() === this && it.getKey() === ix;
    }
  });
})