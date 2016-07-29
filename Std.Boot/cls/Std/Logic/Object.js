//@ A logic object lives in a context and it has a unique key in this context.
'Std.Object'.subclass(I => {
  "use strict";
  I.am({
    Abstract: true
  });
  I.have({
    //@{Std.Logic.Context} context where this logic object is situated
    logicContext: null,
    //@{string} unique key of this logic object within the context
    logicKey: null
  });
  I.know({
    //@param context {Std.Logic.Context} logic context
    //@param key {string} logic key
    build: function(context, key) {
      I.$super.build.call(this);
      this.logicContext = context;
      this.logicKey = key;
    },
    //@ Get context where this logic object resides.
    //@return {Std.Logic.Context} a context
    getContext: function() {
      return this.logicContext;
    },
    //@ Get unique key of this logic object in the context.
    //@return {string} unique, nonempty key
    getKey: function() {
      return this.logicKey;
    },
    //@ Compute unique name of this logic object.
    //@return {string} dot-separated path from root namespace to this logic object
    getName: function() {
      const home = this.logicContext, key = this.logicKey;
      return home.logicContext === home ? key : `${home.getName()}.${key}`;
    },
    //@ Get the namespace in which this logic object is contained, either directly or indirectly.
    //@return {Std.Logic.Namespace} most specific namespace that contains this logic object
    getNamespace: function() {
      let context = this.logicContext;
      while (!context.isNamespace()) {
        context = context.logicContext;
      }
      return context;
    },
    //@ Test whether this is a class.
    //@return {boolean} true if this logic object is a class, otherwise false
    isClass: I.returnFalse,
    //@ Test whether this is a module.
    //@return {boolean} true if this logic object is a module, otherwise false
    isModule: I.returnFalse,
    //@ Test whether this is a namespace.
    //@return {boolean} true if this logic object is a namespace, otherwise false
    isNamespace: I.returnFalse
  });
})