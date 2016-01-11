function refine(I) {
  "use strict";
  /*global process, setImmediate*/
  // I improve the runtime system in a Node.js environment.
  var sinceMoment = process.hrtime();
  var uptimeOffset = I.$.$rt.getUptime();
  I.refine({
    // improve on setTimeout implementation
    asap: function (closure) {
      setImmediate(closure);
    },
    // improve on Date.now() implementation with process.hrtime()
    getUptime: function () {
      var sincePeriod = process.hrtime(sinceMoment);
      // adjust for different epochs
      return sincePeriod[0] + uptimeOffset + sincePeriod[1] / 1e9;
    }
  });
}