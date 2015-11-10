'Expression'.subclass(function(I) {
  "use strict";
  // I describe ASTs of type references.
  I.am({
    Abstract: false
  });
  I.know({
    popEvaluation: I.returnArgument2,
    pushEvaluation: function(evaluator) {
      var name = this.sourceText;
      var definition = evaluator.lookupDefinition(name) || this.bad('name', name);
      evaluator.pushExpressions(definition.express());
    }
  });
})