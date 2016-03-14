//@ Environment-specific runtime constants.
'BaseObject'.subclass(function(I) {
  "use strict";
  I.am({
    Abstract: true,
    Service: true
  });
  I.access({
    //@{string} get location of runtime bundle loader, e.g. encoded URL or file path
    bundleLocation: I.burdenSubclass,
    //@{Any} get scope with global variables
    globalScope: I.burdenSubclass,
    //@{Any?} get environment-specific emitter of parent environment or nothing
    parentEmitter: I.doNothing
  });
})