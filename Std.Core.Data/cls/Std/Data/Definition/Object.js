//@ A type definition object is a type expression or macro.
'Std.Object'.subclass(I => {
  "use strict";
  I.am({
    Abstract: true
  });
  I.have({
    //@{string} normalized source of this definition
    sourceText: null
  });
  I.know({
    //@param source {string} normalized source of type definition
    build: function(source) {
      I.$super.build.call(this);
      this.sourceText = source;
    },
    //@ Express this definition without variables, which ensures it can be evaluated.
    //@param parameters {[Std.Data.Definition.Expression]?} expression parameters
    //@return {Std.Data.Definition.Expression} an expression
    express: I.burdenSubclass,
    //@ Get normalized source of this type definition.
    //@return {string} source text
    unparse: function() {
      return this.sourceText;
    }
  });
})