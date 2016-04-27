//@ Browser-specific runtime constants.
'Constants'.subclass(['Std.Core.HTTP'], I => {
  "use strict";
  /*global window,document*/
  const URL = I._.HTTP._.URL;
  I.am({
    Abstract: false
  });
  I.access({
    bundleLocation: I.returnWith(function() {
      const scripts = document.getElementsByTagName('script');
      // script locates loader of runtime bundle
      const activeScript = scripts[scripts.length - 1];
      const pathElements = [...URL._.decode(activeScript.src).walkPath()];
      // take trailing elements for relative path to bundle loader from document base
      return pathElements.slice(pathElements.lastIndexOf('_')).join('/');
    }),
    globalScope: I.returnWith(window)
  });
})