//@ A runtime image loads modules from bundles.
'BaseObject+Role'.subclass(['Std.Core.Theater'], {
  data$: 'Std.Data',
  env$: 'Std.Runtime.Environment'
}, function(I) {
  "use strict";
  I.am({
    Abstract: false,
    Service: true
  });
  I.have({
    //@{Std.Data.Value.Record} record value of Runtime.Image type
    imageValue: null
  });
  I.play({
    install: function(json) {
      if (this.imageValue) {
        this.bad();
      }
      this.imageValue = I.data$.unmarshal(json, 'Runtime.Image');
      console.log(this.imageValue, this.$rt.getUptime());
      this.bad('I', 'am', 'having', 'an', 'offday');
    },
    loadBundle: function(name, moduleSpecs_) {
    },
  });
})