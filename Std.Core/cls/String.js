//@ I am the class of JavaScript strings.
'Object'.subclass(String, {
  // runtime system required for service providers
  system$: 'Std.Runtime.System'
}, I => {
  "use strict";
  const Array = I._.Array;
  I.access({
    //@{Std.Logical?} get logical object at path given by this string or nothing
    logic: function() {
      // this is a String object, not a string value
      return I.resolveLogical(this.valueOf());
    },
    //@{Any?} get provider of service whose name is given by this string or nothing
    provider: function() {
      // this is a String object, not a string value
      return I.system$.provide(this.valueOf());
    }
  });
  I.know({
    //@ Walk over individual characters of this string.
    //@return {Std.Iterator} iterator over characters
    walk: function() {
      return Array._.walk(this);
    }
  });
})