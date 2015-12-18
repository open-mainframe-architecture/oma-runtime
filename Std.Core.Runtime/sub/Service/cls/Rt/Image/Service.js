'Std.BaseObject+Std.Role'.subclass({
  $data: 'Std.Data',
  $env: 'Rt.Env'
}, function (I) {
  "use strict";
  // I describe runtime images that load modules from bundles.
  I.am({
    Abstract: false,
    Service: true
  });
  I.have({
    launchValue: null
  });
  I.play({
    launch: function (json) {
      if (this.launchValue) {
        this.bad();
      }
      this.launchValue = I.$data.unmarshal(json, 'App.Launch');
    },
    loadBundle: function (name, moduleSpecs_) {

    },
  });
})