//@ An AST that evaluates a list type.
'Collection'.subclass(function(I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.know({
    pushEvaluation: function(evaluation) {
      evaluation.pushExpressions(this.elementExpression);
      return I._.Type._.List.create(evaluation.typespace, this);
    },
    substitute: function(variables_) {
      var expression = this.elementExpression;
      var sub = expression.substitute(variables_);
      return expression === sub ? this : I.AST.createList(sub);
    }
  });
})