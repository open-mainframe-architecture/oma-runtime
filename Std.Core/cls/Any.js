function refine(I) {
  "use strict";
  I.share({
    //@{Rt.Table} an immutable, empty table is the prototype of all tables
    EmptyTable: I._.Rt._.Table.getPrototype(),
    //@{Rt.Table} convenient access to subroutines from Std.Iterator package
    Loop: I._.Std._.Iterator._,
    //@ Collect distinct characters in table.
    //@param characters {string} string with characters
    //@return {Rt.Table} table that maps distinct characters to true
    charset: function (characters) {
      var table = I.createTable();
      for (var i = 0, n = characters.length; i < n; ++i) {
        table[characters.charAt(i)] = true;
      }
      return table;
    },
    //@ Compile the source of a JavaScript closure body.
    //@param body {string} source code of closure body
    //@return {Rt.Closure} parameterless closure with compiled body
    compileClosure: function (body) {
      return new GlobalEval(body);
    },
    //@ Define property whose value is obtained with getter closure.
    //@param it {Any} JavaScript object
    //@param key {string} property name
    //@param getter {Rt.Closure} getter closure
    //@return nothing
    defineGetter: function (it, key, getter) {
      var descriptor = { configurable: true, enumerable: false, get: getter };
      Object.defineProperty(it, key, descriptor);
    },
    //@ Enumerate JavaScript properties until visit returns false.
    //@param it {Any} JavaScript object
    //@param visit {Rt.Closure} called with property value and name
    //@return {boolean} false if some visit returned false, otherwise true
    enumerate: function (it, visit) {
      for (var key in it) {
        if (visit(it[key], key) === false) {
          return false;
        }
      }
      return true;
    },
    //@ Does it have at least one enumerable property?
    //@param it {any} JavaScript object or value
    //@return {boolean} true if at least one property is enumerable, otherwise false
    hasEnumerables: function (it) {
      for (var ignore in it) { //jshint ignore:line
        return true;
      }
      return false;
    },
    //@ Is it an opaque ArrayBuffer or a typed view on an ArrayBuffer?
    //@param it {any} JavaScript object or value
    //@return {boolean} true if it a buffer or buffer view, otherwise false
    isBinary: function (it) {
      return it instanceof ArrayBuffer || ArrayBuffer.isView(it);
    },
    //@ Is it a runtime exception or a standard failure?
    //@param it {any} JavaScript object or value
    //@return {boolean} true if it is an exception or failure, otherwise false
    isError: function (it) {
      return I._.Rt._.Exception.describes(it) || I._.Std._.Failure.describes(it);
    },
    //@ Is it a finite number? NaN and Infinity are not finite numbers.
    //@param it {any} JavaScript object or value
    //@return {boolean} true if it is a finite number, otherwise false
    isFiniteNumber: function (it) {
      return typeof it === 'number' && isFinite(it);
    },
    //@ Is it a runtime table?
    //@param it {any} JavaScript object or value
    //@return {boolean} true if it is a table, otherwise false
    isTable: Object.prototype.isPrototypeOf.bind(I._.Rt._.Table.getPrototype()),
    //@ Get opaque ArrayBuffer from typed array view or leave it as is.
    //@param it {any} JavaScript object or value
    //@return {any} arraybuffer if it is a buffer view, otherwise just it
    opaqueBytes: function (it) {
      if (ArrayBuffer.isView(it)) {
        var buffer = it.buffer, bytes = it.byteLength;
        return bytes === buffer.byteLength ? buffer : buffer.slice(it.byteOffset, bytes);
      }
      return it;
    },
    //@ Return first argument.
    //@param argument {any} first argument
    //@return {any} first argument
    returnArgument: function (argument) {
      return argument;
    },
    //@ Return second argument.
    //@param ignore {any} ignored first argument
    //@param argument {any} second argument
    //@return {any} second argument
    returnArgument2: function (ignore, argument) {
      return argument;
    },
    //@ Return third argument.
    //@param ignore1 {any} ignored first argument
    //@param ignore2 {any} ignored second argument
    //@param argument {any} third argument
    //@return {any} third argument
    returnArgument3: function (ignore1, ignore2, argument) {
      return argument;
    },
    //@ Always return null.
    //@return null
    returnNull: function () {
      return null;
    },
    //@ Always return true.
    //@return true
    returnTrue: function () {
      return true;
    }
  });
  // prevent jshint from complaining about a form of eval
  var GlobalEval = Function;
}