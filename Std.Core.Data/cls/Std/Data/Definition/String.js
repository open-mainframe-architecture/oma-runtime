'Expression'.subclass(function (I) {
  "use strict";
  // I describe ASTs of string types.
  I.am({
    Abstract: false
  });
  I.know({
    pushEvaluation: function (evaluator) {
      return evaluator.typespace.stringType;
    }
  });
})