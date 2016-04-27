//@ I am the root class with two defunct instances: null and undefined.
'Any'.subclass(I => {
  "use strict";
  const Root = I._.Root, Failure = I._.Std._.Failure, Table = I._.Std._.Table;
  const PRIMITIVES = { undefined: true, boolean: true, number: true, string: true };
  I.am({
    Abstract: true,
    Final: false,
    Service: false
  });
  I.share({
    //@ Assert conditions. The receiver is the origin of a failure, if any.
    //@param ... {any} truthy condition to test
    //@return this receiver
    //@except when one of the conditions is falsey
    assert: function() {
      const n = arguments.length;
      for (let i = 0; i < n; ++i) {
        if (!arguments[i]) {
          throw Failure.create(this, i + 1);
        }
      }
      return this;
    },
    //@ Create a methodless table.
    //@return {Std.Table} new table
    createTable: function() {
      return Table.create();
    },
    //@ Define an immutable property value of it.
    //@param it {Object} JavaScript object
    //@param key {string} property name
    //@param value {any} property value
    //@return nothing
    defineConstant: function(it, key, value) {
      Object.defineProperty(it, key, {
        value: value, configurable: false, enumerable: false, writable: false
      });
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
    //@ Does it have at least one enumerable property?
    //@param it {any} JavaScript object or value
    //@return {boolean} true if at least one property is enumerable, otherwise false
    hasEnumerables: function(it) {
      for (let ignore in it) { //jshint ignore:line
        return true;
      }
      return false;
    },
    //@ Is it a closure?
    //@param it {any} JavaScript object or value
    //@return {boolean} true if it is a JavaScript function, otherwise false
    isClosure: function(it) {
      return typeof it === 'function';
    },
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
      return it === null || PRIMITIVES[typeof it] || false;
    },
    //@ Test whether it owns a property, even when it does not have a hasOwnProperty method.
    //@param it {any} JavaScript object or value
    //@param key {string} property name
    //@return {boolean} true if it owns the named property, otherwise false
    isPropertyOwner: function(it, key) {
      return it !== null && it !== void 0 && Object.prototype.hasOwnProperty.call(it, key);
    },
    //@ Resolve full qualified name of a logical object, e.g. a class.
    //@param name {string} name to resolve
    //@return {Std.Logical?} a logical or nothing
    resolveLogical: function(name) {
      return Root.resolve(name);
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