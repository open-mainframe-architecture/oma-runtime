//@ A datatype describes data values.
'BaseObject'.subclass(function (I) {
  "use strict";
  I.am({
    Abstract: true
  });
  I.have({
    //@{Std.Data.Typespace} typespace creates this type
    typespace: null,
    //@{Std.Data.Definition.Expression} type expression restricts this type
    typeExpression: null
  });
  I.know({
    //@param typespace {Std.Data.Typespace} typespace of this type
    //@param expression {Std.Data.Definition.Expression} expression of this type
    build: function (typespace, expression) {
      I.$super.build.call(this);
      this.typespace = typespace;
      this.typeExpression = expression;
    },
    //@ Get mandatory type if this type is optional. Otherwise get this type.
    //@return {Std.Data.AbstractType} this type
    asMandatory: I.returnThis,
    //@ Test whether a value obeys the rules of this type.
    //@param value {any} JavaScript object or value
    //@return {boolean} true if value obeys rules of this type, otherwise false
    describesValue: I.burdenSubclass,
    //@ Test whether this type is preliminary. A preliminary type is still being evaluated.
    //@return {boolean} true if this type is preliminary and cannot be used, otherwise false
    isPreliminary: I.returnFalse,
    //@ Compute JSON representation of data value.
    //@param value {any} JavaScript object or value
    //@param expression {Std.Data.Definition.Expression} inferred type expression
    //@return {any} JSON representation
    marshalValue: I.burdenSubclass,
    //@ Compute data value from JSON representation
    //@param json {any} JSON representation
    //@param expression {Std.Data.Definition.Expression} inferred type expression
    //@return {any} data value
    unmarshalJSON: I.burdenSubclass
  });
})