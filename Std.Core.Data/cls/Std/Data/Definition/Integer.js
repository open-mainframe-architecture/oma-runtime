//@ An integer type expression.
'Expression'.subclass(I => {
  "use strict";
  I.am({
    Abstract: false
  });
  I.know({
    pushEvaluation: function(evaluation) {
      return evaluation.typespace.integerType;
    }
  });
})