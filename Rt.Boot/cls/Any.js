//@ I am the root class with two instances: null and undefined.
'Any'.subclass(function (I) {
  "use strict";
  I.am({
    //@ I am abstract despite my primitive, and mostly useless, instances.
    Abstract: true,
    //@ I am not final, because I have several subclasses.
    Final: false,
    //@ I am not a runtime service.
    Service: false
  });
  I.share({
    //@ Create a methodless table.
    //@return {Rt.Table} new table
    createTable: function () {
      return I._.Rt._.Table.create();
    },
    //@ Define an immutable property value of it.
    //@param it {Object} JavaScript object
    //@param key {string} property name
    //@param value {Any} property value
    //@return nothing
    defineConstant: function (it, key, value) {
      var descriptor = { value: value, configurable: false, enumerable: false, writable: false };
      Object.defineProperty(it, key, descriptor);
    },
    //@ Find the most specific behavior that describes it.
    //@param it {Any} JavaScript object or value
    //@return {Std.Logic.Behavior} behavior object
    describe: function (it) {
      return it === null || it === void 0 ? I.$ : I.$.downcast(Object(it));
    },
    //@ Do and return nothing.
    //@return nothing
    doNothing: function () { },
    //@ Is it null, undefined, a boolean, a number or a string?
    //@param it {Any} JavaScript object or value
    //@return {boolean} true if it is a basic thing, otherwise false
    isBasic: function (it) {
      switch (typeof it) {
        case 'undefined': case 'boolean': case 'number': case 'string':
          return true;
        case 'object':
          return it === null;
      }
      return false;
    },
    //@ Is it not null and not undefined?
    //@param it {Any} JavaScript object or value
    //@return {boolean} true if it is defined (not null and not undefined), otherwise false
    isDefined: function (it) {
      return it !== null && it !== void 0;
    },
    //@ Test whether it owns a property, even when it does not have a hasOwnProperty method.
    //@param it {Any} JavaScript object or value
    //@param key {string} property name
    //@return {boolean} true if it owns the named property, otherwise false
    isPropertyOwner: function (it, key) {
      return it !== null && it !== void 0 && Object.prototype.hasOwnProperty.call(it, key);
    },
    //@ Always return false.
    //@return {boolean} false
    returnFalse: function () {
      return false;
    },
    //@ Always return receiver.
    //@return {Any} this receiver
    returnThis: function () {
      return this;
    },
    //@ Slice elements of array-like object, e.g. arguments.
    //@param array {Any} array-like object
    //@param begin {integer?} offset where to start slicing (default 0)
    //@param end {integer?} first offset not included in slice (default array.length)
    //@return {Array} new array with sliced elements
    slice: Function.prototype.call.bind(Array.prototype.slice)
  });
})