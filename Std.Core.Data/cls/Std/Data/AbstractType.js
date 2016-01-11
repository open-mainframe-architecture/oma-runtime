'BaseObject'.subclass(function (I) {
  "use strict";
  // I describe a datatype that knows how to compose values.
  I.am({
    Abstract: true
  });
  I.have({
    // this type belongs to a typespace
    typespace: null,
    // this type resulted from an expression evaluation
    typeExpression: null
  });
  I.know({
    build: function (typespace, expression) {
      I.$super.build.call(this);
      this.typespace = typespace;
      this.typeExpression = expression;
    },
    // get mandatory type if this type is optional, otherwise get this type
    asMandatory: I.returnThis,
    // test whether a value obeys the rules of this type
    describesValue: I.burdenSubclass,
    // a preliminary type cannot be used, because it is still being evaluated
    isPreliminary: I.returnFalse,
    // compute JSON representation of data value
    marshalValue: I.burdenSubclass,
    // construct data value from JSON representation
    unmarshalJSON: I.burdenSubclass
  });
  I.share({
    // deep equality if necessary
    equalValues: function (lhs, rhs) {
      return lhs === rhs ? I.isValue(lhs) :
        I.isComposedValue(lhs) && I.isComposedValue(rhs) &&
        lhs.$expr === rhs.$expr && lhs.$type === rhs.$type && lhs.$equals(rhs);
    },
    // is it a basic boolean, number or string value?
    isBasicValue: function (it) {
      return it === false || it === true || typeof it === 'string' || I.isFiniteNumber(it);
    },
    // is it a composed dictionary, list or record value?
    isComposedValue: I._.AbstractValue.describes.bind(I._.AbstractValue),
    // is it any typed value, including null?
    isValue: function (it) {
      return it === null || I.isBasicValue(it) || I.isComposedValue(it);
    }
  });
})