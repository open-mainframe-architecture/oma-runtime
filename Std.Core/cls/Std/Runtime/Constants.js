//@ Environment-specific runtime constants.
'Object'.subclass(I => {
  "use strict";
  I.am({
    Abstract: true
  });
  I.access({
    //@{string} get location of runtime bundle loader
    bundleLocation: I.burdenSubclass,
    //@{object} get scope with global variables
    globalScope: I.burdenSubclass,
    //@{object?} get environment-specific emitter of parent environment or nothing
    parentEmitter: I.doNothing
  });
})