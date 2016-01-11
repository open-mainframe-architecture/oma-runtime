'Void'.subclass(function (I) {
  "use strict";
  // I am the root class Void whose two instances are null and undefined.
  I.am({
    Abstract: true,
    Final: false,
    Service: false
  });
  I.share({
    // runtime table creation
    createTable: function () {
      return I._.Rt._.Table.create();
    },
    // define immutable property value
    defineConstant: function (it, key, value) {
      var descriptor = { value: value, configurable: false, enumerable: false, writable: false };
      Object.defineProperty(it, key, descriptor);
    },
    // determine most specific class that describes it
    describe: function (it) {
      return it === null || it === void 0 ? I.$ : I.$.downcast(Object(it));
    },
    // do and return nothing
    doNothing: function () { },
    // is it null, undefined, a boolean, a number or a string?
    isBasic: function (it) {
      switch (typeof it) {
        case 'undefined': case 'boolean': case 'number': case 'string':
          return true;
        case 'object':
          return it === null;
      }
      return false;
    },
    // it is defined, if it's not null and not undefined
    isDefined: function (it) {
      return it !== null && it !== void 0;
    },
    // test property ownership when owner might not have hasOwnProperty method
    isPropertyOwner: function (it, key) {
      return it !== null && it !== void 0 && Object.prototype.hasOwnProperty.call(it, key);
    },
    // reuse closure that always returns false
    returnFalse: function () {
      return false;
    },
    // reuse method closure that always returns receiver
    returnThis: function () {
      return this;
    },
    // slice closure arguments
    slice: Function.prototype.call.bind(Array.prototype.slice)
  });
})