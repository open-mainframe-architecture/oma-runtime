'Object'.subclass(String, function (I) {
  "use strict";
  // I describe a JavaScript string.
  I.access({
    // logical object at path given by this string
    logic: function () {
      return I._.Root.resolve(this.valueOf());
    },
    // get provider of service whose name is given by this string
    provider: function () {
      return I.$.$rt.provide(this.valueOf());
    }
  });
  I.know({
    // walk over individual characters of this string
    walk: function () {
      return I._.Array._.walk(this.valueOf());
    }
  });
})