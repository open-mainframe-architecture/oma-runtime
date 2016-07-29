//@ A type composition describes composed values, i.e. dictionaries, lists and records.
'Type.Object'.subclass(I => {
  "use strict";
  I.have({
    //@{function} constructor for new values of this type
    valueConstructor: null
  });
  I.know({
    //@ Create prototypical value of this type.
    //@return {Std.Data.Value.Object} prototypical value
    createPrototype: I.burdenSubclass,
    //@ Create composed value of this type.
    //@param expression {Std.Data.Definition.Expression} type expression
    //@param values {Std.Table|[*]} table or array with children of new value
    //@return {Std.Data.Value.Object} new value
    createValue: function(expression, values) {
      if (!this.valueConstructor) {
        this.valueConstructor = function Value(typeExpression, childValues) {
          I.lockProperty(this, '$expr', typeExpression);
          I.lockProperty(this, '_', Object.freeze(childValues));
          Object.freeze(this);
        };
        this.valueConstructor.prototype = this.createPrototype();
        I.lockProperty(this.valueConstructor.prototype, '$type', this);
      }
      return Reflect.construct(this.valueConstructor, [expression, values]);
    }
  });
})