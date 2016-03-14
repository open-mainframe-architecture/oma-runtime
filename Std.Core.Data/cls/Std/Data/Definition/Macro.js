//@ An AST for a macro definition.
'AbstractDefinition'.subclass(function(I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    //@{[string|Std.Data.Definition.Expression]} formal argument names and default expressions
    macroArguments: null,
    //@{Std.Data.Definition.Expression} expression for macro body
    macroExpression: null
  });
  I.know({
    //@param source {string} macro source
    //@param formalArguments {[string|Std.Data.Definition.Expression]} names and expressions
    //@param expression {Std.Data.Definition.Expression} macro body
    build: function(source, formalArguments, expression) {
      I.$super.build.call(this, source);
      this.macroArguments = formalArguments;
      this.macroExpression = expression;
    },
    express: function(parameters) {
      var variables_ = I.createTable();
      var formals = this.macroArguments;
      for (var i = 0, j = 0, n = formals.length; i < n; i += 2, ++j) {
        variables_[formals[i]] = parameters && parameters[j] || formals[i + 1];
      }
      // express this macro as body expression with substituted variables
      return this.macroExpression.substitute(variables_);
    }
  });
})