'Expression'.subclass(function (I) {
  "use strict";
  // I describe ASTs for dictionary and list types.
  I.have({
    elementExpression: null
  });
  I.know({
    build: function (source, expression) {
      I.$super.build.call(this, source);
      this.elementExpression = expression;
    },
    popEvaluation: function (evaluator, elementType, preliminary) {
      preliminary.setElement(this.elementExpression, elementType);
    }
  });
})