//@ An AST that evaluates a type name.
'Expression'.subclass(function (I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.know({
    popEvaluation: I.returnArgument2,
    pushEvaluation: function (evaluator) {
      var name = this.sourceText;
      var definition = evaluator.lookupDefinition(name) || this.bad('name', name);
      evaluator.pushExpressions(definition.express());
    }
  });
})