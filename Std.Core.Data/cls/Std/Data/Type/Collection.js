'Composition'.subclass(function (I) {
  "use strict";
  I.have({
    elementExpression: null,
    elementType: null
  });
  I.know({
    isPreliminary: function () {
      return !this.elementExpression;
    },
    setElement: function (expression, type) {
      if (this.elementExpression) {
        this.bad();
      }
      this.elementExpression = expression;
      this.elementType = type;
    }
  });
})