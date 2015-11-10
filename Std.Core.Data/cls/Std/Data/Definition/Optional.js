'Expression'.subclass(function(I) {
  "use strict";
  // I describe ASTs of optional types.
  I.am({
    Abstract: false
  });
  I.have({
    mandatoryExpression: null
  });
  I.know({
    build: function(source, expression) {
      I.$super.build.call(this, source);
      this.mandatoryExpression = expression;
    },
    asMandatory: function() {
      return this.mandatoryExpression;
    },
    popEvaluation: function(evaluator, type) {
      return I._.Type._.Optional._.normalize(evaluator.typespace, this, type);
    },
    pushEvaluation: function(evaluator, stack) {
      evaluator.pushExpressions(this.mandatoryExpression);
    },
    substitute: function(variables_) {
      var expression = this.mandatoryExpression;
      var sub = expression.substitute(variables_);
      return expression === sub ? this : I.Cache.createOptional(sub);
    }
  });
})