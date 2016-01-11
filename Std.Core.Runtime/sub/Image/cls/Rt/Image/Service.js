'Std.BaseObject+Std.Role'.subclass(['Std.Core.Theater'], {
  data$: 'Std.Data',
  env$: 'Rt.Env'
}, function (I) {
  "use strict";
  // I describe a runtime image that loads modules from bundles.
  I.am({
    Abstract: false,
    Service: true
  });
  I.have({
    imageValue: null
  });
  I.play({
    launch: function (json) {
      if (this.imageValue) {
        this.bad();
      }
      this.imageValue = I.data$.unmarshal(json, 'App.Image');
      console.log(this.imageValue, this.$rt.getUptime());
    },
    loadBundle: function (name, moduleSpecs_) {

    },
  });
})