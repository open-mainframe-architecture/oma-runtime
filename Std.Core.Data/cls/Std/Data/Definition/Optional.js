//@ An AST for an optional type.
'Expression'.subclass(function(I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    //@{Std.Data.Definition.Expression} expression for mandatory type
    mandatoryExpression: null
  });
  I.know({
    //@param source {string} source text
    //@param expression {Std.Data.Definition.Expression} mandatory type
    build: function(source, expression) {
      I.$super.build.call(this, source);
      this.mandatoryExpression = expression;
    },
    //@return {Std.Data.Definition.Expression} expression for mandatory type
    asMandatory: function() {
      return this.mandatoryExpression;
    },
    popEvaluation: function(evaluation, type) {
      return I._.Type._.Optional._.normalize(evaluation.typespace, this, type);
    },
    pushEvaluation: function(evaluation) {
      evaluation.pushExpressions(this.mandatoryExpression);
    },
    substitute: function(variables_) {
      var expression = this.mandatoryExpression;
      var sub = expression.substitute(variables_);
      return expression === sub ? this : I.AST.createOptional(sub);
    }
  });
})