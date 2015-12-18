'Collection'.subclass(function (I) {
  "use strict";
  // I describe ASTs for dictionary types.
  I.am({
    Abstract: false
  });
  I.know({
    pushEvaluation: function (evaluator) {
      evaluator.pushExpressions(this.elementExpression);
      return I._.Type._.Dictionary.create(evaluator.typespace, this);
    },
    substitute: function (variables_) {
      var expression = this.elementExpression;
      var sub = expression.substitute(variables_);
      return expression === sub ? this : I.Cache.createDictionary(sub);
    }
  });
})