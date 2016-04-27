//@ A composed value is an immutable list, dictionary or record value.
'Any'.subclass(I => {
  "use strict";
  const Difference = I._.Difference;
  I.know({
    //@{Std.Data.Type.Dictionary|Std.Data.Type.List|Std.Data.Type.Record} concrete type of value
    $type: null,
    //@{Std.Data.Definition.Expression} type expression restricts concrete type of this value
    $expr: null,
    //@{Std.Table|[any]} frozen table or array with child values
    _: null,
    //@ Assert conditions.
    //@param ... {any} truthy condition to test
    //@return true
    //@except when one of the conditions is falsy
    $assert: I.assert,
    //@ Determine difference with other value of same type and expression.
    //@param that {Std.Data.AbstractValue} other value
    //@return {Std.Data.Difference} difference between this and other value
    $difference: burdenValueClass,
    //@ Enumerate child values.
    //@param visit {Std.Closure} called with child value and index
    //@return {boolean} false if a child visit returned false, otherwise true
    $each: I.returnTrue,
    //@ Test deep equality with other value of same type and expression.
    //@param that {Std.Data.AbstractValue} other value
    //@return {boolean} true if this and other value are equal, otherwise false
    $equals: I.returnFalse,
    //@ Get child value at index.
    //@param index {string|integer} record field name, dictionary entry name or list index
    //@return {any?} data value or nothing
    $get: function(index) {
      return this._[index];
    },
    //@ Create value that updates child values in this value.
    //@param values_ {Std.Table} updated child values
    //@return {Std.Data.AbstractValue} new value
    $update: burdenValueClass
  });
  I.share({
    //@ An abstract value method.
    //@return never
    burdenValueClass: burdenValueClass,
    //@ Perform deep comparison.
    //@param lhs {any} JavaScript object or value on left-hand side
    //@param rhs {any} JavaScript object or value on right-hand side
    //@return {Std.Data.Difference} difference between left and right value
    compareValues: function(lhs, rhs) {
      // replace left-hand side with bottom
      return !I.isValue(rhs) ? Difference._.Bottom :
        // identical values are equal values
        lhs === rhs ? Difference._.Zero :
          I.isComposedValue(lhs) && I.isComposedValue(rhs) &&
            // compare values of same type and expression
            lhs.$expr === rhs.$expr && lhs.$type === rhs.$type ? lhs.$difference(rhs) :
            // replace left-hand side with right value
            Difference.create(rhs);
    },
    //@ Get immutable array or table from composed value. Otherwise decompose to null.
    //@param it {any|Std.Data.AbstractValue} composed value or other JavaScript object/value
    //@return {[any]|Std.Table?} immutable array, immutable table or nothing
    decomposeValues: function(it) {
      return I.isComposedValue(it) ? it._ : null;
    },
    //@ Test deep equality.
    //@param lhs {any} JavaScript object or value on left-hand side
    //@param rhs {any} JavaScript object or value on right-hand side
    //@return {boolean} true if left and right-hand side are equal data values, otherwise false
    equalValues: function(lhs, rhs) {
      return lhs === rhs ? I.isValue(lhs) :
        I.isComposedValue(lhs) && I.isComposedValue(rhs) &&
        lhs.$expr === rhs.$expr && lhs.$type === rhs.$type && lhs.$equals(rhs);
    },
    //@ Is it a basic boolean, number or string value?
    //@param it {any} JavaScript object or value
    //@return {boolean} true if it is a boolean, string or finite number, otherwise false
    isBasicValue: function(it) {
      return it === false || it === true || typeof it === 'string' || I.isFiniteNumber(it);
    },
    //@ Is it a composed dictionary, list or record value?
    //@param it {any} JavaScript object or value
    //@return {boolean} true if it is a composed data value, otherwise false
    isComposedValue: function(it) {
      return I.$.describes(it);
    },
    //@ Is it any data value, including null?
    //@param it {any} JavaScript object or value
    //@return {boolean} true if it is null, basic or a composed value, otherwise false
    isValue: function(it) {
      return it === null || I.isBasicValue(it) || I.isComposedValue(it);
    }
  });
  function burdenValueClass() { //jshint validthis:true
    this.$assert(false);
  }
})