//@ Improve runtime system implementation in Node.js environment.
'super'.subclass({
  system$: 'Std.Runtime.System'
}, I => {
  "use strict";
  /*global process,setImmediate*/
  // hidden instance state of runtime system singleton is confined to this script
  const moment = process.hrtime(), correction = I.system$.uptime();
  I.refine({
    //@ Replace setTimeout implementation with setImmediate.
    asap: function(callback) {
      setImmediate(callback);
    },
    //@ Replace Date.now implementation with high-resolution time.
    uptime: function() {
      const since = process.hrtime(moment);
      return since[0] + since[1] / 1e9 + correction;
    }
  });
})