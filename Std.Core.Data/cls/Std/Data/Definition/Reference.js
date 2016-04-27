//@ An AST that evaluates a type name.
'Expression'.subclass(I => {
  "use strict";
  I.am({
    Abstract: false
  });
  I.know({
    popEvaluation: I.returnArgument2,
    pushEvaluation: function(evaluation) {
      const name = this.sourceText;
      const definition = evaluation.typespace.getDefinition(name);
      evaluation.pushExpressions(definition.express());
    }
  });
})