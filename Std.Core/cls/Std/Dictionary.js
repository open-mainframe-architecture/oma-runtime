function refine(I) {
  "use strict";
  I.know({
    walkUnsafe: function () {
      return Object.getOwnPropertyNames(this._).walk();
    }
  });
}