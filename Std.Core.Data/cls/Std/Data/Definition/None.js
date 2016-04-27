//@ An AST that evaluates the none type.
'Expression'.subclass(I => {
  "use strict";
  I.am({
    Abstract: false
  });
  I.know({
    pushEvaluation: function(evaluation) {
      return evaluation.typespace.noneType;
    }
  });
})