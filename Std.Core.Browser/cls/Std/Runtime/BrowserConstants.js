//@ Browser-specific runtime constants.
'Constants'.subclass(I => {
  "use strict";
  /*global window,document*/
  I.am({
    Abstract: false
  });
  I.access({
    bundleLocation: I.returnWith(function() {
      const scripts = document.getElementsByTagName('script');
      // script locates loader of runtime bundle
      const pathElements = scripts[scripts.length - 1].src.split('/');
      // take trailing elements for relative path to bundle loader from document base
      return pathElements.slice(pathElements.lastIndexOf('_')).join('/');
    }),
    globalScope: I.returnWith(window)
  });
})