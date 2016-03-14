//@ An AST that evaluates a type name.
'Expression'.subclass(function(I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.know({
    popEvaluation: I.returnArgument2,
    pushEvaluation: function(evaluation) {
      var name = this.sourceText;
      var definition = evaluation.typespace.getDefinition(name) || this.bad(name);
      evaluation.pushExpressions(definition.express());
    }
  });
})