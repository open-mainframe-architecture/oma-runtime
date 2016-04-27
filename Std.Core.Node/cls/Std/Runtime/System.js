//@ Improve runtime system implementation in Node.js environment.
function refine(I) {
  "use strict";
  /*global process,setImmediate*/
  const MOMENT = process.hrtime(), OFFSET = I.$.$rt.getUptime();
  I.refine({
    //@ Replace setTimeout implementation with setImmediate.
    asap: function(closure) {
      setImmediate(closure);
    },
    //@ Replace Date.now implementation with high-resolution time.
    getUptime: function() {
      const since = process.hrtime(MOMENT);
      return since[0] + since[1] / 1e9 + OFFSET;
    }
  });
}