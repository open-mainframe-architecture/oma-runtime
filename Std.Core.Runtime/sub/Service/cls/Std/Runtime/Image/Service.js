'RemoteRole'.subclass(['Std.Core.Theater.Remote'], {
  // runtime environment
  environment$: 'Std.Runtime.Environment',
  // use HTTP client to get source of runtime image
  http$: 'Std.HTTP.Client',
  // standard datatypes
  typespace$: 'Std.Data.Typespace'
}, I => {
  "use strict";
  I.have({
    //@{Std.Data.Value.Record} record value of Runtime.Image type
    imageValue: null
  });
  I.play({
    //@ Assign specification of this image service.
    //@param value {Std.Data.Value.Record} Runtime.Image record value
    //@promise nothing
    //@except when image has already been assigned
    assignSpecification: I.remotely('Runtime.Image =>', function(value) {
      I.failUnless('duplicate image', !this.imageValue);
      this.imageValue = value;
    }),
    //@ Execute main class with parameters.
    //@param className {string} class name to run
    //@param argv {[string]} run with given parameters
    //@promise nothing
    //@except when the image has not been assigned
    executeMain: function(className, argv) {
    },
    //@ Load modules from bundle.
    //@param bundleName {string} name of bundle to load
    //@param moduleSpecs {object|Std.Table} mapping from module name to specification
    //@promise nothing
    loadBundle: function(bundleName, moduleSpecs) {
    },
    //@ Load modules if they're not already loaded.
    //@param moduleNames {[string]} names of module to load
    //@promise nothing
    //@except when the image has not been assigned
    loadModules: function(moduleNames) {
    },
    //@ Create and start child environment with same image.
    //@param manager {Std.Theater.Agent} manager of subsidiary
    //@param purpose {string} descriptive purpose of subsidiary
    //@promise {Std.Theater.Agent} agent of new subsidiary
    startSubsidiary: function(manager, purpose) {
      I.failUnless('image missing', this.imageValue);
      return I.environment$.startSubsidiary(manager, purpose)
        .propels(subsidiary => subsidiary.provideRemote(I.$)
          .propels(remoteImage => remoteImage.assignSpecification(this.imageValue))
          .propels(subsidiary));
    }
  });
})