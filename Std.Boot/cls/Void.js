//@ I am the root class with two defunct instances: null and undefined.
'Void'.subclass(I => {
  "use strict";
  I.am({
    Abstract: true,
    Final: false
  });
  const Root = I._.Root, Table = I._.Std._.Table;
  const hasOwnProperty = Object.prototype.hasOwnProperty;
  I.share({
    ///@ An abstract method burdens a subclass with the implementation.
    //@return never
    burdenSubclass: () => I.fail('subclass responsibility'),
    //@ Create a methodless table.
    //@param base {Std.Table?} base table to extend or nothing
    //@return {Std.Table} new table
    createTable: base => base ? Object.create(base) : Table.create(),
    //@ Always do and return nothing.
    //@return nothing
    doNothing: () => { },
    //@ Fail with an error message.
    //@param message {string} error message
    //@return never
    fail: message => { throw new Error(message); },
    //@ Fail with an error message unless condition holds.
    //@param message {string} error message
    //@param condition {*} condition to test
    //@return nothing
    //@exception when condition is falsey
    failUnless: (message, condition) => { if (!condition) { I.fail(message); } },
    //@ Is it a closure?
    //@param it {*} JavaScript object or value
    //@return {boolean} true if it is a JavaScript function, otherwise false
    isClosure: it => typeof it === 'function',
    //@ Is it not null and not undefined?
    //@param it {*} JavaScript object or value
    //@return {boolean} true if it is defined (not null and not undefined), otherwise false
    isDefined: it => it !== null && it !== void 0,
    //@ Test whether it owns a property, even when it does not have a hasOwnProperty method.
    //@param it {*} JavaScript object or value
    //@param key {string} property name
    //@return {boolean} true if it owns the named property, otherwise false
    isPropertyOwner: (it, key) => I.isDefined(it) && hasOwnProperty.call(it, key),
    //@ Is it a string?
    //@param it {*} JavaScript object or value
    //@return {boolean} true if it is a JavaScript string, otherwise false
    isString: it => typeof it === 'string',
    //@ Lock an immutable property value of it.
    //@param it {object} JavaScript object
    //@param key {string} property name
    //@param value {*} property value
    //@return nothing
    lockProperty: (it, key, value) => {
      Reflect.defineProperty(it, key, {
        value: value, configurable: false, enumerable: false, writable: false
      });
    },
    //@ Resolve full qualified name of a logic object, e.g. a class.
    //@param name {string} name to resolve
    //@return {Std.Logic.Object?} a logic object or nothing
    resolveLogicName: name => Root.resolveKeys(name.split('.')),
    //@ Always return false.
    //@return false
    returnFalse: () => false,
    //@ Always return receiver.
    //@return {*} JavaScript object or value
    returnThis: function() { return this; },
    //@ Always return true.
    //@return true
    returnTrue: () => true,
    //@ Return function that always returns constant.
    //@param constant {*|function} JavaScript object/value or closure to compute constant
    //@return {function} closure that returns constant
    returnWith: constant => I.returnThis.bind(I.isClosure(constant) ? constant() : constant),
    //@ This method should never be invoked.
    //@return never
    shouldNotOccur: () => I.fail('bad state')
  });
})