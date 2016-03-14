//@ An AST for a type definition represents a type expression or macro.
'BaseObject'.subclass(function(I) {
  "use strict";
  I.have({
    //@{string} normalized source
    sourceText: null
  });
  I.know({
    //@param source {string} normalized source of type definition
    build: function(source) {
      I.$super.build.call(this);
      this.sourceText = source;
    },
    //@ Express this definition without variables, which ensures it can be evaluated.
    //@param parameters {[Std.Data.Definition.Expression]} expression parameters
    //@return {Std.Data.Definition.Expression} an expression
    express: I.burdenSubclass,
    //@ Get normalized source of this type definition.
    //@return {string} source text
    unparse: function() {
      return this.sourceText;
    }
  });
  I.setup({
    //@{Std.Data.Language} one parser caches all ASTs of type definitions
    AST: function() {
      return I._.Language.create();
    }
  });
})