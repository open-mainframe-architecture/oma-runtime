'super'.subclass({
  $image: 'Rt.Image'
}, function (I) {
  "use strict";
  I.know({
    bundle: function (moduleSpecs_) {
      return I.$image.loadBundle(this.valueOf(), moduleSpecs_).running();
    }
  });
})