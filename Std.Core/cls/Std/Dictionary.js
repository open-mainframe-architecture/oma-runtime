function refine(I) {
  "use strict";
  I.know({
    walkUnsafe: function() {
      // collect indices in an array and walk over array elements
      return Object.getOwnPropertyNames(this._).walk();
    }
  });
}