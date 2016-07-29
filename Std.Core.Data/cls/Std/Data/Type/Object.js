//@ A datatype object describes data values.
'Std.Object'.subclass(I => {
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
    build: function(typespace, expression) {
      I.$super.build.call(this);
      this.typespace = typespace;
      this.typeExpression = expression;
    },
    //@ Get mandatory type if this type is optional. Otherwise get this type.
    //@return {Std.Data.Type.Object} this type
    asMandatory: I.returnThis,
    //@ Test whether this type is a boolean type.
    //@return {boolean} true if this is a boolean type, otherwise false
    isBoolean: I.returnFalse,
    //@ Test whether this type is a dictionary type.
    //@return {boolean} true if this is a dictionary type, otherwise false
    isDictionary: I.returnFalse,
    //@ Test whether this type is an enumeration type.
    //@return {boolean} true if this is an enumeration type, otherwise false
    isEnumeration: I.returnFalse,
   //@ Test whether this type is an integer type.
    //@return {boolean} true if this is an integer type, otherwise false
    isInteger: I.returnFalse,
    //@ Test whether this type is a list type.
    //@return {boolean} true if this is a list type, otherwise false
    isList: I.returnFalse,
    //@ Test whether this type is a none type.
    //@return {boolean} true if this is a none type, otherwise false
    isNone: I.returnFalse,
    //@ Test whether this type is a number type.
    //@return {boolean} true if this is a number type, otherwise false
    isNumber: I.returnFalse,
    //@ Test whether this type is an optional type.
    //@return {boolean} true if this is an optional type, otherwise false
    isOptional: I.returnFalse,
    //@ Test whether this type is preliminary. A preliminary type is still being evaluated.
    //@return {boolean} true if this type is preliminary and cannot be used, otherwise false
    isPreliminary: I.returnFalse,
    //@ Test whether this type is a record type with field descriptors.
    //@return {boolean} true if this is a record type, otherwise false
    isRecord: I.returnFalse,
    //@ Test whether this type is a string type.
    //@return {boolean} true if this is a string type, otherwise false
    isString: I.returnFalse,
    //@ Test whether this type is a union type with type alternatives.
    //@return {boolean} true if this is a union type, otherwise false
    isUnion: I.returnFalse,
    //@ Test whether this type is a wildcard type.
    //@return {boolean} true if this is a wildcard type, otherwise false
    isWildcard: I.returnFalse,
    //@ Compute JSON representation of data value.
    //@param value {*} JavaScript object or value
    //@param expression {Std.Data.Definition.Expression} inferred type expression
    //@return {*} JSON representation
    marshalValue: I.burdenSubclass,
    //@ Test whether a value is a member of this type.
    //@param value {*} JavaScript object or value
    //@return {boolean} true if value is member of this type, otherwise false
    testMembership: I.burdenSubclass,
    //@ Compute data value from JSON representation
    //@param json {*} JSON representation
    //@param expression {Std.Data.Definition.Expression} inferred type expression
    //@return {*} data value
    unmarshalJSON: I.burdenSubclass
  });
})