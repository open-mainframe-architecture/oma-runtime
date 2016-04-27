//@ A context is a contextual object that indexes contextual objects.
'Contextual+Indexable'.subclass(I => {
  "use strict";
  I.have({
    //@{integer} discrete distance of this context to the root context
    contextDepth: -1
  });
  I.know({
    //@ Get distance to root context.
    //@return {integer} number of ancestors on path to root
    getContextualDepth: function() {
      if (this.contextDepth >= 0) {
        // cached depth
        return this.contextDepth;
      }
      // compute and cache depth
      this.contextDepth = I.$super.getContextualDepth.call(this);
      return this.contextDepth;
    },
    //@return this context
    resolutionContext: I.returnThis,
    //@ Create ancestor contexts from this context to the context where the keys lead.
    //@param keys {[string]} path to context
    //@param factory {Std.Closure} factory closure creates a new context if necessary
    //@return {Std.Context} existing or new context
    makeContexts: function(keys, factory) {
      let context = this;
      for (let key of keys) {
        const contextual = context.lookup(key);
        // if necessary, call factory closure to create new context
        context = contextual ? contextual.resolutionContext() : factory(context, key);
        this.assert(I.$mixin.describes(context));
      }
      return context;
    }
  });
})