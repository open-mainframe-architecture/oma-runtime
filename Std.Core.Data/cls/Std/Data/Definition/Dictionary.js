//@ A dictionary type expression.
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
    substitute: function(variables) {
      const expression = this.elementExpression, sub = expression.substitute(variables);
      return expression === sub ? this : I.Data.TypeDefinitionLanguage.createDictionary(sub);
    }
  });
})