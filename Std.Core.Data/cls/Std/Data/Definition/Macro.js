'AbstractDefinition'.subclass(function(I) {
  "use strict";
  // I describe ASTs of type macros.
  I.am({
    Abstract: false
  });
  I.have({
    macroArguments: null,
    macroExpression: null
  });
  I.know({
    build: function(source, formalArguments, expression) {
      I.$super.build.call(this, source);
      this.macroArguments = formalArguments;
      this.macroExpression = expression;
    },
    // turn this macro into body expression with substituted variables
    express: function(parameters) {
      var variables_ = I.createTable();
      var formals = this.macroArguments;
      for (var i = 0, j = 0, n = formals.length; i < n; i += 2, ++j) {
        variables_[formals[i]] = parameters && parameters[j] || formals[i + 1];
      }
      return this.macroExpression.substitute(variables_);
    }    
  });
})