//@ Browser-specific runtime constants.
'Constants'.subclass(['Std.Core.HTTP'], function(I) {
  "use strict";
  /*global window,document*/
  I.am({
    Abstract: false
  });
  I.access({
    bundleLocation: I.returnWith(function() {
      var scripts = document.getElementsByTagName('script');
      var activeScript = scripts[scripts.length - 1];
      // script locates loader of runtime bundle
      var pathElements = I._.HTTP._.URL._.decode(activeScript.src).getPathElements();
      // take last 5 elements of URL path for relative path to bundle loader from document base
      return pathElements.slice(pathElements.length - 5).join('/');
    }),
    globalScope: I.returnWith(window)
  });
})