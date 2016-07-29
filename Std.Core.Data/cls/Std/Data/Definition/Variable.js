//@ A type variable.
'Expression'.subclass(I => {
  "use strict";
  I.am({
    Abstract: false
  });
  I.know({
    //@ This should not occur, because variables are substituted before evaluation.
    pushEvaluation: I.shouldNotOccur,
    substitute: function(variables) {
      return variables[this.sourceText] || I.fail('free variable');
    }
  });
})