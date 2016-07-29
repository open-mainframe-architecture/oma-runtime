//@ A composed value is an immutable list, dictionary or record value.
'Void'.subclass(I => {
  "use strict";
  I.access({
    //@{iterable} iterable indices of child values
    $indices: I.burdenSubclass
  });
  I.know({
    //@{Std.Data.Type.Dictionary|Std.Data.Type.List|Std.Data.Type.Record} concrete type of value
    $type: null,
    //@{Std.Data.Definition.Expression} type expression restricts concrete type of this value
    $expr: null,
    //@{Std.Table|[*]} frozen table or array with child values
    _: null,
    //@ Compare with other value of same type and expression.
    //@param that {Std.Data.Value.Object} other value
    //@return {Std.Data.Difference} difference between this and other value
    $compare: I.burdenSubclass,
    //@ Test deep equality with other value of same type and expression.
    //@param that {Std.Data.Value.Object} other value
    //@return {boolean} true if this and other value are equal, otherwise false
    $equals: I.burdenSubclass,
    //@ Select child value at index.
    //@param index {string|integer} record field name, dictionary entry name or list index
    //@return {*} data value
    $select: I.burdenSubclass,
    //@ Create value that updates child values in this value.
    //@param values {Std.Table} updated child values
    //@return {Std.Data.Value.Object} new value
    $update: I.burdenSubclass
  });
})