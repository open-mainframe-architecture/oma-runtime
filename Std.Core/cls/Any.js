function refine(I) {
  "use strict";
  const Table = I._.Std._.Table;
  const Exception = I._.Std._.Runtime._.Exception, Failure = I._.Std._.Failure;
  // prevent jshint from complaining about a form of eval
  const Compilation = Function;
  I.share({
    //@{Std.Table} an immutable, empty table is the prototype of all tables
    EmptyTable: I._.Std._.Table.getPrototype(),
    //@{Std.Table} convenient access to subroutines from Std.Iterator package
    Loop: I._.Std._.Iterator._,
    //@ Collect distinct characters in table.
    //@param characters {string} string with characters
    //@return {Std.Table} table that maps distinct characters to true
    charset: function(characters) {
      const table = I.createTable();
      for (let ch of characters) {
        table[ch] = true;
      }
      return table;
    },
    //@ Compile the source of a strict JavaScript closure body.
    //@param body {string} source code of closure body
    //@return {Std.Closure} parameterless closure with compiled body
    compileClosure: function(body) {
      return new Compilation(`"use strict";${body}`);
    },
    //@ Define property whose value is obtained with getter closure.
    //@param it {Any} JavaScript object
    //@param key {string} property name
    //@param getter {Std.Closure} getter closure
    //@return nothing
    defineGetter: function(it, key, getter) {
      Object.defineProperty(it, key, {
        get: getter, configurable: true, enumerable: false
      });
    },
    //@ Enumerate JavaScript properties until visit returns false.
    //@param it {Any} JavaScript object
    //@param visit {Std.Closure} called with property value and name
    //@return {boolean} false if some visit returned false, otherwise true
    enumerate: function(it, visit) {
      for (let key in it) {
        if (visit(it[key], key) === false) {
          return false;
        }
      }
      return true;
    },
    //@ Obtain standard failure.
    //@param origin {any} origin of new failure
    //@param reason {Std.Failure|Std.Runtime.Exception} existing failure or runtime exception
    //@return {Std.Failure} existing or new failure
    failHere: function(origin, reason) {
      return Failure.describes(reason) ? reason : Failure.create(origin, reason);
    },
    //@ Is it an opaque ArrayBuffer or a typed view on an ArrayBuffer?
    //@param it {any} JavaScript object or value
    //@return {boolean} true if it a buffer or buffer view, otherwise false
    isBinary: function(it) {
      return it instanceof ArrayBuffer || ArrayBuffer.isView(it);
    },
    //@ Is it a runtime exception or a standard failure?
    //@param it {any} JavaScript object or value
    //@return {boolean} true if it is an exception or failure, otherwise false
    isErroneous: function(it) {
      return Exception.describes(it) || Failure.describes(it);
    },
    //@ Is it a finite number? NaN and Infinity are not finite numbers.
    //@param it {any} JavaScript object or value
    //@return {boolean} true if it is a finite number, otherwise false
    isFiniteNumber: function(it) {
      return typeof it === 'number' && isFinite(it);
    },
    //@ Is it a table?
    //@param it {any} JavaScript object or value
    //@return {boolean} true if it is a table, otherwise false
    isTable: function(it) {
      return Table.describes(it);
    },
    //@ Get opaque ArrayBuffer from typed array view or leave it as is.
    //@param it {any} JavaScript object or value
    //@return {any} arraybuffer if it is a buffer view, otherwise just it
    opaqueBytes: function(it) {
      if (ArrayBuffer.isView(it)) {
        const buffer = it.buffer, bytes = it.byteLength;
        return bytes === buffer.byteLength ? buffer : buffer.slice(it.byteOffset, bytes);
      }
      return it;
    },
    //@ Always return first argument.
    //@param argument {any} JavaScript object or value
    //@return {any} first argument
    returnArgument: function(argument) {
      return argument;
    },
    //@ Always return second argument.
    //@param ignore {any} JavaScript object or value
    //@param argument {any} JavaScript object or value
    //@return {any} second argument
    returnArgument2: function(ignore, argument) {
      return argument;
    },
    //@ Always return third argument.
    //@param ignore1 {any} JavaScript object or value
    //@param ignore2 {any} JavaScript object or value
    //@param argument {any} JavaScript object or value
    //@return {any} third argument
    returnArgument3: function(ignore1, ignore2, argument) {
      return argument;
    },
    //@ Always return null.
    //@return null
    returnNull: function() {
      return null;
    },
    //@ Always return true.
    //@return true
    returnTrue: function() {
      return true;
    },
    //@ Return function that always returns constant.
    //@param constant {any|Std.Closure} JavaScript object/value or closure to compute constant
    //@return {Std.Closure} closure that returns constant
    returnWith: function(constant) {
      return I.returnThis.bind(I.isClosure(constant) ? constant() : constant);
    }
  });
}