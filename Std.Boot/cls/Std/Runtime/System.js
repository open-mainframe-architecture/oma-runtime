//@ The runtime system manages service providers.
'Object'.subclass(I => {
  "use strict";
  I.am({
    Final: true
  });
  I.have({
    //@{Std.Timestamp} moment when this runtime was created
    bootTimestamp: null,
    //@{Map} registry maps service to provider
    serviceRegistry: null
  });
  I.know({
    unveil: function() {
      I.$super.unveil.call(this);
      this.serviceRegistry = new Map();
      this.register(I.$, this);
    },
    //@ Get moment when runtime system was created.
    //@return {Std.Timestamp} JavaScript date
    getBootTimestamp: function() {
      return this.bootTimestamp;
    },
    //@ Test whether this runtime system provides a service.
    //@param service {string|Std.Logic.Namespace|Std.Logic.Class} service to test
    //@return {boolean} true if service is provided, otherwise false
    provides: function(service) {
      return this.serviceRegistry.has(this.resolveService(service));
    },
    //@ Register service provider.
    //@param service {string|Std.Logic.Namespace|Std.Logic.Class} provided service
    //@param provider {object} implementation of service
    //@return {object?} registered provider or nothing if provider cannot be registered
    register: function(service, provider) {
      const registry = this.serviceRegistry, serviceClass = this.resolveService(service);
      if (serviceClass) {
        if (!registry.has(serviceClass)) {
          registry.set(serviceClass, provider);
          return provider;
        } else {
          return registry.get(serviceClass);
        }
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
      const registry = this.serviceRegistry;
      const satisfactions = I.createTable();
      for (let key in requirements) {
        const serviceName = requirements[key], serviceClass = this.resolveService(serviceName);
        satisfactions[key] = registry.get(serviceClass) || I.fail(`bad service ${serviceName}`);
      }
      return satisfactions;
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