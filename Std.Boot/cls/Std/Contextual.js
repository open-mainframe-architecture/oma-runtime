//@ A contextual object is part of a context hierarchy.
'Trait'.subclass(I => {
  "use strict";
  I.have({
    //@{Std.Context} context where this contextual is situated
    homeContext: null,
    //@{string} unique key of this contextual within the home context
    contextKey: null
  });
  I.know({
    //@ Build new contextual.
    //@param context {Std.Context} context of this contextual
    //@param key {string} key of this contextual
    //@return nothing
    buildContextual: function(context, key) {
      this.homeContext = context;
      this.contextKey = key;
    },
    //@ Get context where this contextual resides.
    //@return {Std.Context} a context
    getContext: function() {
      return this.homeContext;
    },
    //@ Get distance to root context.
    //@return {integer} distance to root context
    getContextualDepth: function() {
      const home = this.homeContext;
      return this === home ? 0 : home.getContextualDepth() + 1;
    },
    //@ Get unique key of this contextual in the context.
    //@return {string} key of contextual
    getKey: function() {
      return this.contextKey;
    },
    //@ Is this a root context? A root context is its own parent context.
    //@return {boolean} true if this is a root, otherwise false
    isRootContext: function() {
      return this === this.homeContext;
    },
    //@ By default, a contextual resolves to itself.
    //@return {Std.Contextual} resolved contextual
    resolutionResult: I.returnThis,
    //@ Produce resolution context of this contextual that resolves more path elements.
    //@return {Std.Context?} resolution context if available
    resolutionContext: I.doNothing,
    //@ Resolve array with path elements.
    //@param path {[string]} path elements
    //@return {Std.Contextual?} resolved contextual or nothing
    resolve: function(path) {
      const n = path.length;
      let contextual = this;
      for (let i = 0; contextual && i < n; ++i) {
        const context = contextual.resolutionResult().resolutionContext();
        // relaxed find for first path element and strict lookup for subsequent path elements
        contextual = context && (i ? context.lookup(path[i]) : context.find(path[i]));
      }
      if (contextual) {
        return contextual.resolutionResult();
      }
    }
  });
})