'AbstractType'.subclass(function(I) {
  "use strict";
  I.have({
    valueConstructor: null
  });
  I.know({
    createPrototype: I.burdenSubclass,
    createValue: function(expression, values) {
      if (!this.valueConstructor) {
        var prototype = this.createPrototype();
        I.defineConstant(prototype, '$type', this);
        this.valueConstructor = function Value(constructionExpression, constructionValues) {
          I.defineConstant(this, '$expr', constructionExpression);
          I.defineConstant(this, '_', Object.freeze(constructionValues));
          Object.freeze(this);
        };
        this.valueConstructor.prototype = prototype;
      }
      return new this.valueConstructor(expression, values);
    }
  });
})