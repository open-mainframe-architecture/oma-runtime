'BaseObject'.subclass(function(I) {
  "use strict";
  // I describe ASTs that define type expressions and macros.
  I.have({
    // normalized source
    sourceText: null
  });
  I.know({
    build: function(source) {
      I.$super.build.call(this);
      this.sourceText = source;
    },
    // turn this definition into an expression that can be evaluated
    express: I.burdenSubclass,
    // get normalized source of this definition
    unparse: function() {
      return this.sourceText;
    }
  });
  I.setup(function() {
    // share parser for type definition language, which caches all ASTs
    I.share({
      Cache: I._.Definition._.Language.create()
    });
  });
})