//@ Worker-specific runtime constants.
'Constants'.subclass(function(I) {
  "use strict";
  /*global self,location*/
  I.am({
    Abstract: false
  });
  I.access({
    bundleLocation: I.returnWith(location.href),
    globalScope: I.returnWith(self),
    parentEmitter: I.returnWith(self)
  });
})