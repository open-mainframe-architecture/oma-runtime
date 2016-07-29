//@ Improve runtime system implementation in web browser and (most) worker environments.
'super'.subclass({
  system$: 'Std.Runtime.System'
}, I => {
  "use strict";
  /*global performance*/
  const correction = I.system$.uptime() - performance.now() / 1000;
  I.refine({
    //@ Replace Date.now implementation with high-resolution time.
    uptime: function() {
      return performance.now() / 1000 + correction;
    }
  });
})