//@ An AST for the application of a type macro.
'Expression'.subclass(I => {
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
    build: function(source, name, parameters) {
      I.$super.build.call(this, source);
      this.macroName = name;
      this.macroParameters = parameters;
    },
    popEvaluation: I.returnArgument2,
    pushEvaluation: function(evaluation) {
      const name = this.macroName;
      const definition = evaluation.typespace.getDefinition(name);
      evaluation.pushExpressions(definition.express(this.macroParameters));
    },
    substitute: function(variables_) {
      const parameters = this.macroParameters;
      const subs = I.substituteExpressions(parameters, variables_);
      return subs === parameters ? this : I.AST.createApplication(this.macroName, subs);
    }
  });
})