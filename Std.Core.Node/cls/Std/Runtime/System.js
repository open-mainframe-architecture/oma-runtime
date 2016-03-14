//@ Improve runtime system implementation in Node.js environment.
function refine(I) {
  "use strict";
  /*global process,setImmediate*/
  var sinceMoment = process.hrtime();
  var uptimeOffset = I.$.$rt.getUptime();
  I.refine({
    //@ Replace setTimeout implementation with setImmediate.
    asap: function(closure) {
      setImmediate(closure);
    },
    //@ Replace Date.now implementation with high-resolution time.
    getUptime: function() {
      var sincePeriod = process.hrtime(sinceMoment);
      // adjust for different epochs
      return sincePeriod[0] + uptimeOffset + sincePeriod[1] / 1e9;
    }
  });
}