//@ An AST that evaluates a dictionary type.
'Collection'.subclass(I => {
  "use strict";
  const Type = I._.Type;
  I.am({
    Abstract: false
  });
  I.know({
    pushEvaluation: function(evaluation) {
      evaluation.pushExpressions(this.elementExpression);
      return Type._.Dictionary.create(evaluation.typespace, this);
    },
    substitute: function(variables_) {
      const expression = this.elementExpression, sub = expression.substitute(variables_);
      return expression === sub ? this : I.AST.createDictionary(sub);
    }
  });
})