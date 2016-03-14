//@ An AST for a type variable.
'Expression'.subclass(function(I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.know({
    //@ This should not occur, because variables are substituted before evaluation.
    pushEvaluation: I.shouldNotOccur,
    substitute: function(variables_) {
      return variables_[this.sourceText] || this.bad(this.sourceText);
    }
  });
})