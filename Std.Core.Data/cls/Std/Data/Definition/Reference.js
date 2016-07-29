//@ A type name reference.
'Expression'.subclass(I => {
  "use strict";
  I.am({
    Abstract: false
  });
  I.know({
    popEvaluation: I.returnArgument2,
    pushEvaluation: function(evaluation) {
      const name = this.sourceText;
      const definition = evaluation.typespace.selectDefinition(name);
      evaluation.pushExpressions(definition.express());
    }
  });
})