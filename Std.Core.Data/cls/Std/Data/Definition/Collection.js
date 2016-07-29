//@ A dictionary or list type expression.
'Expression'.subclass(I => {
  "use strict";
  I.have({
    //@{Std.Data.Definition.Expression} expression for element type
    elementExpression: null
  });
  I.know({
    //@param source {string} normalized source of macro application
    //@param expression {Std.Data.Definition.Expression} element type expression
    build: function(source, expression) {
      I.$super.build.call(this, source);
      this.elementExpression = expression;
    },
    popEvaluation: function(evaluation, elementType, preliminary) {
      preliminary.setElement(this.elementExpression, elementType);
    }
  });
})