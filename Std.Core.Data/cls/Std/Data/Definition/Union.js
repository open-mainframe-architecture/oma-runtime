'Expression'.subclass(function(I) {
  "use strict";
  // I describe ASTs of union types.
  I.am({
    Abstract: false
  });
  I.have({
    alternativeExpressions: null
  });
  I.know({
    build: function(source, alternatives) {
      I.$super.build.call(this, source);
      this.alternativeExpressions = alternatives;
    },
    popEvaluation: function(evaluator, alternativeTypes) {
      return I._.Type._.Union._.normalize(evaluator.typespace, this, alternativeTypes);
    },
    pushEvaluation: function(evaluator) {
      evaluator.pushExpressions(this.alternativeExpressions);
    },
    substitute: function(variables_) {
      var alternatives = this.alternativeExpressions;
      var subs = I.substituteExpressions(alternatives, variables_);
      return subs === alternatives ? this : I.Cache.createUnion(subs);
    }
  });
})