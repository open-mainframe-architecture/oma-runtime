//@ Improve runtime system implementation in web browser and (most) worker environments.
function refine(I) {
  "use strict";
  /*global performance*/
  var uptimeOffset = I.$.$rt.getUptime() - performance.now() / 1000;
  I.refine({
    //@ Replace Date.now implementation with high-resolution time.
    getUptime: function() {
      return performance.now() / 1000 + uptimeOffset;
    }
  });
}