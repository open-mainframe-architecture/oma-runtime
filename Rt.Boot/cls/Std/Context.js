'Contextual+Indexable'.subclass(function (I) {
  "use strict";
  // I describe contextual objects that hold contextual objects.
  I.have({
    // distance of this context to the root context
    contextDepth: -1
  });
  I.know({
    getContextualDepth: function () {
      if (this.contextDepth >= 0) {
        // cached depth
        return this.contextDepth;
      }
      // compute and cache depth
      this.contextDepth = I.$super.getContextualDepth.call(this);
      return this.contextDepth;
    },
    resolutionContext: I.returnThis,
    // create ancestor contexts from this context to the context where the keys lead
    makeContexts: function (keys, factory) {
      var context = this;
      for (var i = 0, n = keys.length; i < n; ++i) {
        var contextual = context.lookup(keys[i]);
        // if necessary, call factory closure to create new context
        context = contextual ? contextual.resolutionContext() : factory(context, keys[i]);
        if (!I.$mixin.describes(context)) {
          this.bad('context', keys[i]);
        }
      }
      return context;
    }
  });
})