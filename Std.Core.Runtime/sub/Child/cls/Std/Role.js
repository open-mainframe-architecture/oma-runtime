'super'.subclass({
  // proxy to subsidiary agent in parent environment
  subsidiary$: 'Std.Runtime.Environment.Subsidiary'
}, I => {
  "use strict";
  I.refine({
    warn: function(incident) {
      I.$former.warn.call(this, incident);
      // parent environment reports feedback about incident
      I.subsidiary$.feedbackIncident(incident).run();
    }
  });
})