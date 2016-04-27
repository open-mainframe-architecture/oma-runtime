'super'.subclass({
  image$: 'Std.Runtime.Image'
}, I => {
  "use strict";
  I.know({
    //@ Load modules that this name bundles.
    //@param moduleSpecs_ {Std.Table|Object} mapping from module name to specification
    //@return {Std.Theater.Job} a promise to load bundle with this name
    bundle: function(moduleSpecs_) {
      return I.image$.loadBundle(this, moduleSpecs_).running();
    }
  });
})