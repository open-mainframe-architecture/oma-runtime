function refine(I) {
  "use strict";
  I.share({
    // immutable, empty table is prototype for all tables
    EmptyTable: I._.Rt._.Table.getPrototype(),
    // convenient access to iterator subroutines
    Loop: I._.Std._.Iterator._,
    // collect distinct characters in table
    charset: function (characters) {
      var table = I.createTable();
      for (var i = 0, n = characters.length; i < n; ++i) {
        table[characters.charAt(i)] = true;
      }
      return table;
    },
    // compile the source of a JavaScript closure body
    compileClosure: function (body) {
      return new GlobalEval(body);
    },
    // define property whose value is obtained with getter closure
    defineGetter: function (it, key, getter) {
      var descriptor = { configurable: true, enumerable: false, get: getter };
      Object.defineProperty(it, key, descriptor);
    },
    // enumerate JavaScript properties until visit returns false
    enumerate: function (it, visit) {
      for (var key in it) {
        if (visit(it[key], key) === false) {
          return false;
        }
      }
      return true;
    },
    // does it have at least one enumerable property?
    hasEnumerables: function (it) {
      for (var ignore in it) { //jshint ignore:line
        return true;
      }
      return false;
    },
    // is it an opaque ArrayBuffer or a typed view on an ArrayBuffer?
    isBinary: function (it) {
      return it instanceof ArrayBuffer || ArrayBuffer.isView(it);
    },
    // is it a runtime exception or a standard failure?
    isError: function (it) {
      return I._.Rt._.Exception.describes(it) || I._.Std._.Failure.describes(it);
    },
    // is it a finite number? this excludes NaN and Infinity from the number type
    isFiniteNumber: function (it) {
      return typeof it === 'number' && isFinite(it);
    },
    // get opaque ArrayBuffer from typed array view, otherwise leave it as is
    opaqueBytes: function (it) {
      if (ArrayBuffer.isView(it)) {
        var buffer = it.buffer, bytes = it.byteLength;
        return bytes === buffer.byteLength ? buffer : buffer.slice(it.byteOffset, bytes);
      }
      return it;
    },
    // reuse closure that returns first argument
    returnArgument: function (argument) {
      return argument;
    },
    // reuse closure that returns second argument
    returnArgument2: function (first, second) {
      return second;
    },
    // reuse closure that returns third argument
    returnArgument3: function (first, second, third) {
      return third;
    },
    // reuse closure that always returns null
    returnNull: function () {
      return null;
    },
    // reuse closure that always returns true
    returnTrue: function () {
      return true;
    }
  });
  // prevent jshint from complaining about a form of eval
  var GlobalEval = Function;
}