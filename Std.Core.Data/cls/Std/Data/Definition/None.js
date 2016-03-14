//@ An AST that evaluates the none type.
'Expression'.subclass(function(I) {
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