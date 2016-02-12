function refine(I) {
  "use strict";
  I.know({
    //@ Create iterator that walks over ancestor contexts until the root context has been reached.
    //@return {Std.Iterator} iterator over contexts (last one is root context)
    walkAncestry: function () {
      return I.Loop.inject(this.homeContext, nextParent);
    }
  });
  function nextParent(context) {
    if (context.homeContext !== context) {
      return context.homeContext;
    }
  }
}