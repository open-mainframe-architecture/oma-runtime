//@ A type composition describes composed values, i.e. dictionaries, lists and records.
'AbstractType'.subclass(I => {
  "use strict";
  I.have({
    //@{Std.Closure} constructor for new values of this type
    valueConstructor: null
  });
  I.know({
    //@ Create prototypical value of this type.
    //@return {Std.Data.AbstractValue} prototypical value
    createPrototype: I.burdenSubclass,
    //@ Create value of this type.
    //@param expression {Std.Data.Definition.Expression} type expression
    //@param values {Std.Table|[any]} table or array with children of new value
    //@return {Std.Data.AbstractValue} new value
    createValue: function(expression, values) {
      let Constructor = this.valueConstructor;
      if (!Constructor) {
        this.valueConstructor = Constructor = function Value(typeExpression, childValues) {
          I.defineConstant(this, '$expr', typeExpression);
          I.defineConstant(this, '_', Object.freeze(childValues));
          Object.freeze(this);
        };
        I.defineConstant(Constructor.prototype = this.createPrototype(), '$type', this);
      }
      return new Constructor(expression, values);
    }
  });
})