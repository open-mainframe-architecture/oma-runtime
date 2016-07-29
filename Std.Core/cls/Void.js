function refine(I) {
  "use strict";
  // prevent jshint from complaining about a form of eval
  const Compilation = Function;
  I.share({
    //@{Std.Table} an immutable, empty table
    EmptyTable: Object.freeze(I._.Std._.Table.create()),
    //@{Std.Table} convenient access to subroutines from Std.Iterator package
    Loop: I._.Std._.Iterator._,
    //@ Compile the source of a strict JavaScript closure body.
    //@param body {string} source code of closure body
    //@return {function} closure with compiled body
    compileClosure: body => new Compilation(`"use strict";${body}`),
    //@ Define property whose value is obtained with getter closure.
    //@param it {object} JavaScript object
    //@param key {string} property name
    //@param getter {function} getter closure
    //@return nothing
    defineGetter: (it, key, getter) => {
      Reflect.defineProperty(it, key, {
        get: getter, configurable: true, enumerable: false
      });
    },
    // Does it have at least one enumerable property, possibly inherited?
    //@param it {*} JavaScript object or value
    //@return {boolean} true if it has an enumerable property, otherwise false
    hasEnumerables: it => {
      for (let ignore in it) { //jshint ignore:line
        return true;
      }
      return false;
    },
    //@ Is it a boolean?
    //@return {boolean} true if it is true or false, otherwise false
    isBoolean: it => it === true || it === false,
    //@ Is it a runtime exception?
    //@param it {*} JavaScript object or value
    //@return {boolean} true if it is a runtime exception, otherwise false
    isError: it => it instanceof Error,
    //@ Is it a finite number? NaN and Infinity are not finite numbers.
    //@param it {*} JavaScript object or value
    //@return {boolean} true if it is a finite number, otherwise false
    isFiniteNumber: it => typeof it === 'number' && isFinite(it),
    //@ Test whether it appears to be a JavaScript iterator.
    //@param it {*} JavaScript object or value
    //@return {boolean} true if it is an object with a next method, otherwise false
    isIteratorLike: it => !!it && I.isClosure(it.next),
    //@ Test whether it is a table container.
    //@param it {*} JavaScript object or value
    //@return {boolean} true if it is a table, otherwise false
    isTable: Object.prototype.isPrototypeOf.bind(I._.Std._.Table.getPrototype()),
    //@ Always return first argument.
    //@param argument {*} JavaScript object or value
    //@return {*} first argument
    returnArgument: argument => argument,
    //@ Always return second argument.
    //@param ignore {*} JavaScript object or value
    //@param argument {*} JavaScript object or value
    //@return {*} second argument
    returnArgument2: (ignore, argument) => argument,
    //@ Always return third argument.
    //@param ignore1 {*} JavaScript object or value
    //@param ignore2 {*} JavaScript object or value
    //@param argument {*} JavaScript object or value
    //@return {*} third argument
    returnArgument3: (ignore1, ignore2, argument) => argument,
    //@ Always return null.
    //@return null
    returnNull: () => null,
    //@ Slice elements of array-like object, e.g. arguments.
    //@param array {*} array-like object
    //@param begin {integer?} offset where to start slicing (default 0)
    //@param end {integer?} first offset not included in slice (default array.length)
    //@return {[*]} new array with sliced elements
    sliceArray: Function.prototype.call.bind(Array.prototype.slice),
    //@ If necessary, throw and catch exception. Otherwise pass existing exception.
    //@param error {error|*} existing exception or error message
    //@return {error} runtime exception
    throw: error => {
      if (I.isError(error)) {
        return error;
      } else {
        try { throw new Error(error); } catch (exception) { return exception; }
      }
    }
  });
}