'Expression'.subclass(function(I) {
  "use strict";
  // I describe ASTs of number types.
  I.am({
    Abstract: false
  });
  I.know({
    pushEvaluation: function(evaluator) {
      return evaluator.typespace.numberType;
    }
  });
})