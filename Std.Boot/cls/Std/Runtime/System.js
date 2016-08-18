//@ The runtime system manages service providers.
'Object'.subclass(I => {
  "use strict";
  I.am({
    Final: true
  });
  I.have({
    //@{date} moment when this runtime was created
    bootTimestamp: null,
    //@{Map<Std.Logic.Class,object>} registry maps service class to provider
    serviceRegistry: null
  });
  I.know({
    unveil: function() {
      I.$super.unveil.call(this);
      this.serviceRegistry = new Map();
      this.register(I.$, this);
    },
    //@ Get module that booted runtime system.
    //@return {Std.Logic.Module} boot module
    getBootModule: I.returnWith(I.$module),
    //@ Get moment when runtime system was created.
    //@return {data} JavaScript date
    getBootTimestamp: function() {
      return this.bootTimestamp;
    },
    //@ Get provider for service.
    //@param service {string|Std.Logic.Namespace|Std.Logic.Class} service to provide
    //@return {object?} service provider or nothing if service is not provided
    provide: function(service) {
      return this.selectProvider(this.resolveService(service));
    },
    //@ Register service provider.
    //@param service {string|Std.Logic.Namespace|Std.Logic.Class} provided service
    //@param provider {object} implementation of service
    //@return {object?} registered provider or nothing if service is invalid
    register: function(service, provider) {
      const serviceClass = this.resolveService(service);
      if (serviceClass) {
        const registry = this.serviceRegistry, registeredProvider = registry.get(serviceClass);
        if (registeredProvider) {
          // if service is already provided, return with existing provider
          return registeredProvider;
        }
        this.updateProvider(serviceClass, provider);
        return provider;
      }
    },
    //@ Resolve service description to class.
    //@param service {string|Std.Logic.Namespace|Std.Logic.Class} service description
    //@return {Std.Logic.Class?} service class or nothing
    resolveService: function(service) {
      const object = I.isString(service) ? I.resolveLogicName(service) : service;
      const serviceClass = object && object.isNamespace() ? object.select('Service') : object;
      if (serviceClass && serviceClass.isClass()) {
        return serviceClass;
      }
    },
    //@ Collect providers for service requirements.
    //@param requirements {object|Std.Table} identify service classes
    //@return {Std.Table} new table, with same keys, that identifies providers
    //@except when a required service cannot be not provided
    satisfy: function(requirements) {
      const satisfactions = I.createTable();
      for (let key in requirements) {
        const service = requirements[key];
        satisfactions[key] = this.provide(service) || I.fail(`bad service ${service}`);
      }
      return satisfactions;
    },
    //@ Select registered provider of service class.
    //@param serviceClass {Std.Logic.Class} service class to provide
    //@return {object?} service provider or nothing if service is not provided
    selectProvider: function(serviceClass) {
      return this.serviceRegistry.get(serviceClass);
    },
    //@ Register provider of service class.
    //@param serviceClass {Std.Logic.Class} service class
    //@param provider {object} service provider to register
    //@return nothing
    updateProvider: function(serviceClass, provider) {
      this.serviceRegistry.set(serviceClass, provider);
    },
    //@ Current uptime in number of seconds.
    //@return {number} number of seconds since this runtime system booted
    uptime: function() {
      return (Date.now() - this.bootTimestamp.getTime()) / 1000;
    }
  });
  I.setup(() => {
    // $rt instance constant conveys runtime system singleton
    I._.Object.lockInstanceConstants({ $rt: I.$.create() });
  });
})