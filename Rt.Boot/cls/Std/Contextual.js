'Trait'.subclass(function(I) {
  "use strict";
  // I describe contextual objects that are part of a context hierarchy.
  I.have({
    // context where this contextual is situated
    homeContext: null,
    // unique key of this contextual within the home context
    contextKey: null
  });
  I.know({
    buildContextual: function(context, key) {
      this.homeContext = context;
      this.contextKey = key;
    },
    getContext: function() {
      return this.homeContext;
    },
    getContextualDepth: function() {
      var home = this.homeContext;
      return this === home ? 0 : home.getContextualDepth() + 1;
    },
    getKey: function() {
      return this.contextKey;
    },
    isRootContext: function() {
      return this === this.homeContext;
    },
    // produce resolution result of this contextual
    resolution: I.returnThis,
    // produce resolution context of this contextual that resolves more path elements
    resolutionContext: I.doNothing,
    // resolve array with path elements
    resolve: function(path) {
      var contextual = this;
      for (var i = 0, n = path.length; contextual && i < n; ++i) {
        var context = contextual.resolution().resolutionContext();
        // relaxed find for first path element and strict lookup for subsequent path elements
        contextual = context && (i ? context.lookup(path[i]) : context.find(path[i]));
      }
      if (contextual) {
        return contextual.resolution();
      }
    }
  });
})