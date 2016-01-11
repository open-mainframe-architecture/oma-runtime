'Expression'.subclass(function (I) {
  "use strict";
  // I describe an AST for wildcard types.
  I.am({
    Abstract: false
  });
  I.know({
    pushEvaluation: function (evaluator) {
      return evaluator.typespace.wildcardType;
    }
  });
})