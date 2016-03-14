//@ A director manages itself. It is the root actor in a theater.
'BaseObject+Manager'.subclass(function(I) {
  "use strict";
  I.am({
    Abstract: false,
    Service: true
  });
  I.know({
    assessDamage: function(job, exception) {
      // TODO: should not happen, but what if...
    }
  });
})