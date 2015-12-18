'Expression'.subclass(function (I) {
  "use strict";
  // I describe ASTs of type variables.
  I.am({
    Abstract: false
  });
  I.know({
    // should not occur, because variables are substituted before evaluation
    pushEvaluation: I.shouldNotOccur,
    substitute: function (variables_) {
      return variables_[this.sourceText] || this.bad('variable', this.sourceText);
    }
  });
})