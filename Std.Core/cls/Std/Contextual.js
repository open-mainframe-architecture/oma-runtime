function refine(I) {
  "use strict";
  I.know({
    // create iterator that walks over ancestor contexts until the root context has been reached
    walkAncestry: function () {
      return I.Loop.inject(this.homeContext, function (context) {
        if (context.homeContext !== context) {
          return context.homeContext;
        }
      });
    }
  });
}