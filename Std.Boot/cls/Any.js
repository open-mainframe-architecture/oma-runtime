//@ I am the root class with two defunct instances: null and undefined.
'Any'.subclass(function(I) {
  "use strict";
  I.am({
    Abstract: true,
    Final: false,
    Service: false
  });
  I.share({
    //@ Create a methodless table.
    //@return {Std.Table} new table
    createTable: function() {
      return I._.Std._.Table.create();
    },
    //@ Define an immutable property value of it.
    //@param it {Object} JavaScript object
    //@param key {string} property name
    //@param value {any} property value
    //@return nothing
    defineConstant: function(it, key, value) {
      var descriptor = { value: value, configurable: false, enumerable: false, writable: false };
      Object.defineProperty(it, key, descriptor);
    },
    //@ Find the most specific behavior that describes it.
    //@param it {any} JavaScript object or value
    //@return {Std.Logic.Behavior} behavior object
    describe: function(it) {
      return it === null || it === void 0 ? I.$ : I.$.downcast(Object(it));
    },
    //@ Always do and return nothing.
    //@return nothing
    doNothing: function() { },
    //@ Is it not null and not undefined?
    //@param it {any} JavaScript object or value
    //@return {boolean} true if it is defined (not null and not undefined), otherwise false
    isDefined: function(it) {
      return it !== null && it !== void 0;
    },
    //@ Is it null, undefined, a boolean, a number or a string?
    //@param it {any} JavaScript object or value
    //@return {boolean} true if it is a primitive thing, otherwise false
    isPrimitiveThing: function(it) {
      switch (typeof it) {
        case 'undefined': case 'boolean': case 'number': case 'string':
          return true;
        case 'object':
          return it === null;
      }
      return false;
    },
    //@ Test whether it owns a property, even when it does not have a hasOwnProperty method.
    //@param it {any} JavaScript object or value
    //@param key {string} property name
    //@return {boolean} true if it owns the named property, otherwise false
    isPropertyOwner: function(it, key) {
      return it !== null && it !== void 0 && Object.prototype.hasOwnProperty.call(it, key);
    },
    //@ Create a portrait of it. A portrait reveals information to assist logging/debugging.
    //@param it {any} JavaScript object or value
    //@return {any|Object} primitive or JSON-like representation
    portray: function(it) {
      return I.isPrimitiveThing(it) ? it :
        I._.Std._.Illustrative.describes(it) ? it.createPortrait() :
          'a ' + I.describe(it).getName();
    },
    //@ Always return false.
    //@return false
    returnFalse: function() {
      return false;
    },
    //@ Always return receiver.
    //@return {any} JavaScript object or value
    returnThis: function() {
      return this;
    },
    //@ Slice elements of array-like object, e.g. arguments.
    //@param array {any} array-like object
    //@param begin {integer?} offset where to start slicing (default 0)
    //@param end {integer?} first offset not included in slice (default array.length)
    //@return {Array} new array with sliced elements
    slice: Function.prototype.call.bind(Array.prototype.slice)
  });
})