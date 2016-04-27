//@ Node-specific runtime constants.
'Constants'.subclass(I => {
  "use strict";
  /*global global,require,process*/
  I.am({
    Abstract: false
  });
  I.access({
    bundleLocation: I.returnWith(require.main.filename),
    globalScope: I.returnWith(global),
    parentEmitter: process.send ? I.returnWith(process) : I.doNothing
  });
})