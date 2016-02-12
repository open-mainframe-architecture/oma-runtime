'super'.subclass({
  image$: 'Rt.Image'
}, function (I) {
  "use strict";
  I.know({
    //@ Load modules that this name bundles.
    //param moduleSpecs_ {Rt.Table|Object} mapping from module name to specification
    //@return {Std.Theater.Job} a promise to load bundle with this name
    bundle: function (moduleSpecs_) {
      return I.image$.loadBundle(this, moduleSpecs_).running();
    }
  });
})