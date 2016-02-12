//@ An AST that evaluates a union type.
'Expression'.subclass(function (I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    //@{[Std.Data.Definition.Expression]} expressions of union alternatives
    alternativeExpressions: null
  });
  I.know({
    //@param source {string} source text
    //@param alternatives {[Std.Data.Definition.Expression]} alternative expressions
    build: function (source, alternatives) {
      I.$super.build.call(this, source);
      this.alternativeExpressions = alternatives;
    },
    popEvaluation: function (evaluator, alternativeTypes) {
      return I._.Type._.Union._.normalize(evaluator.typespace, this, alternativeTypes);
    },
    pushEvaluation: function (evaluator) {
      evaluator.pushExpressions(this.alternativeExpressions);
    },
    substitute: function (variables_) {
      var alternatives = this.alternativeExpressions;
      var subs = I.substituteExpressions(alternatives, variables_);
      return subs === alternatives ? this : I.AST.createUnion(subs);
    }
  });
})