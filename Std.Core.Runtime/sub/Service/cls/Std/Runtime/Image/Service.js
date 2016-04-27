'BaseObject+Role'.subclass(['Std.Core.Theater.Remote'], {
  // standard datatypes
  data$: 'Std.Data',
  // runtime environment
  environment$: 'Std.Runtime.Environment',
  // use HTTP client to get source of runtime image
  http$: 'Std.HTTP.Client'
}, I => {
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
    //@ Assign specification of this image service.
    //@param value {Std.Data.Value.Record} Runtime.Image record value
    //@promise nothing
    //@except when image has already been assigned
    assignSpecification: I.remotely(['Runtime.Image'], function(value) {
      this.assert(!this.imageValue);
      this.imageValue = value;
      console.log(value.constants.publish, this.$rt.getUptime());
    }),
    //@ Execute main class with parameters.
    //@param className {string} class name to run
    //@param argv {[string]} run with given parameters
    //@promise nothing
    //@except when the image has not been assigned
    executeMain: function(className, argv) {
      this.assert(this.imageValue);
    },
    //@ Load modules from bundle.
    //@param bundleName {string} name of bundle to load
    //@param moduleSpecs_ {Std.Table|Object} mapping from module name to specification
    //@promise nothing
    loadBundle: function(bundleName, moduleSpecs_) {

    },
    //@ Load modules if they're not already loaded.
    //@param moduleNames {[string]} names of module to load
    //@promise nothing
    //@except when the image has not been assigned
    loadModules: function(moduleNames) {
      this.assert(this.imageValue);
    },
    //@ Create and start child environment with same image.
    //@param manager {Std.Theater.Agent} manager of subsidiary
    //@param purpose {string} descriptive purpose of subsidiary
    //@promise {Std.Theater.Agent} agent of new subsidiary
    startSubsidiary: function(manager, purpose) {
      this.assert(this.imageValue);
      return I.environment$.startSubsidiary(manager, purpose)
        .propels(subsidiary => subsidiary.provideRemote(I.$)
          .propels(remoteImage => remoteImage.assignSpecification(this.imageValue))
          .propels(subsidiary));
    }
  });
})