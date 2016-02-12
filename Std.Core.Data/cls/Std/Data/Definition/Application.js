//@ An AST for the application of a type macro.
'Expression'.subclass(function (I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    //@{string} name of applied macro
    macroName: null,
    //@{[Std.Data.Definition.Expression]} macro parameter expressions
    macroParameters: null
  });
  I.know({
    //@param source {string} normalized source of macro application
    //@param name {string} macro name
    //@param parameters {[Std.Data.Definition.Expression]} macro parameters
    build: function (source, name, parameters) {
      I.$super.build.call(this, source);
      this.macroName = name;
      this.macroParameters = parameters;
    },
    popEvaluation: I.returnArgument2,
    pushEvaluation: function (evaluator) {
      var name = this.macroName;
      var definition = evaluator.lookupDefinition(name) || this.bad('name', name);
      evaluator.pushExpressions(definition.express(this.macroParameters));
    },
    substitute: function (variables_) {
      var parameters = this.macroParameters;
      var subs = I.substituteExpressions(parameters, variables_);
      return subs === parameters ? this : I.AST.createApplication(this.macroName, subs);
    }
  });
})