//@ An optional type expression.
'Expression'.subclass(I => {
  "use strict";
  const Type = I._.Type;
  I.am({
    Abstract: false
  });
  I.have({
    //@{Std.Data.Definition.Expression} expression of mandatory type
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
      return Type._.Optional._.normalize(evaluation.typespace, this, type);
    },
    pushEvaluation: function(evaluation) {
      evaluation.pushExpressions(this.mandatoryExpression);
    },
    substitute: function(variables_) {
      const expression = this.mandatoryExpression, sub = expression.substitute(variables_);
      return expression === sub ? this : I.Data.TypeDefinitionLanguage.createOptional(sub);
    }
  });
})