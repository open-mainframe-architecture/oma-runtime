//@ An AST that evaluates the wildcard type.
'Expression'.subclass(function (I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.know({
    pushEvaluation: function (evaluator) {
      return evaluator.typespace.wildcardType;
    }
  });
})