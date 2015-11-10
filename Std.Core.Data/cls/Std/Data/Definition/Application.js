'Expression'.subclass(function(I) {
  "use strict";
  // I describe ASTs for applications of type macros.
  I.am({
    Abstract: false
  });
  I.have({
    macroName: null,
    macroParameters: null
  });
  I.know({
    build: function(source, name, parameters) {
      I.$super.build.call(this, source);
      this.macroName = name;
      this.macroParameters = parameters;
    },
    popEvaluation: I.returnArgument2,
    pushEvaluation: function(evaluator) {
      var name = this.macroName;
      var definition = evaluator.lookupDefinition(name) || this.bad('name', name);
      evaluator.pushExpressions(definition.express(this.macroParameters));
    },
    substitute: function(variables_) {
      var parameters = this.macroParameters;
      var subs = I.substituteExpressions(parameters, variables_);
      return subs === parameters ? this : I.Cache.createApplication(this.macroName, subs);
    }
  });
})