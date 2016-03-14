//@ I am the class of JavaScript strings.
'Object'.subclass(String, function(I) {
  "use strict";
  I.access({
    //@{Std.Logical?} logical object at path given by this string or nothing
    logic: function() {
      // this is a String object, not a string value
      return I._.Root.resolve(this.valueOf());
    },
    //@{Any?} provider of service whose name is given by this string or nothing
    provider: function() {
      // this is a String object, not a string value
      return I.$.$rt.provide(this.valueOf());
    }
  });
  I.know({
    //@ Walk over individual characters of this string.
    //@return {Std.Iterator} iterator over characters
    walk: function() {
      return I._.Array._.walk(this);
    }
  });
})