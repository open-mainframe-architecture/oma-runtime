'super'.subclass({
  constants$: 'Std.Runtime.Constants'
}, function(I) {
  "use strict";
  I.know({
    //@ Test source status of runtime implementation.
    //@return {boolean} true if runtime implementation is minified, otherwise false
    isMinified: /\.min\.js$/.test(I.constants$.bundleLocation) ? I.returnTrue : I.returnFalse
  });
})