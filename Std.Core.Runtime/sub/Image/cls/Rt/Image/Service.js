//@ A runtime image loads modules from bundles.
'Std.BaseObject+Std.Role'.subclass(['Std.Core.Theater'], {
  data$: 'Std.Data',
  env$: 'Rt.Env'
}, function (I) {
  "use strict";
  I.am({
    Abstract: false,
    Service: true
  });
  I.have({
    //@{Std.Data.Value.Record} record value of App.Image type
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
      console.log(name, typeof name);
    },
  });
})