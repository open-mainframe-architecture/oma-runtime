function refine(I) {
  "use strict";
  /*global performance*/
  // I improve runtime systems of browser and (most) web worker environments.
  var uptimeOffset = I.$.$rt.getUptime() - performance.now() / 1000;
  I.refine({
    getUptime: function () {
      // improve on Date.now() implementation with performance.now()
      return performance.now() / 1000 + uptimeOffset;
    }
  });
}