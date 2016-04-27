//@ The runtime system manages service providers.
'BaseObject'.subclass(I => {
  "use strict";
  const Class = I._.Logic._.Class, Dictionary = I._.Dictionary, Namespace = I._.Logic._.Namespace;
  I.am({
    Final: true,
    Service: true
  });
  I.have({
    //@{Std.Timestamp} moment when this runtime was created
    bootTimestamp: null,
    //@{Std.Dictionary} registry maps service to provider
    serviceRegistry: null
  });
  I.know({
    unveil: function() {
      I.$super.unveil.call(this);
      this.serviceRegistry = Dictionary.create();
      this.register(this);
    },
    //@ Get moment when runtime system was created.
    //@return {Std.Timestamp} JavaScript date
    getBootTimestamp: function() {
      return this.bootTimestamp;
    },
    //@ Get uptime in number of seconds.
    //@return {number} number of seconds since this runtime system booted
    getUptime: function() {
      return (Date.now() - this.bootTimestamp.getTime()) / 1000;
    },
    //@ Test whether this runtime system provides a service.
    //@param service {string|Std.Logic.Namespace|Std.Logic.Class} service to test
    //@return {boolean} true if service is provided, otherwise false
    provides: function(service) {
      const serviceClass = I.resolveService(service);
      return !!serviceClass && this.serviceRegistry.containsIndex(serviceClass.getName());
    },
    //@ Register new service provider.
    //@param provider {Any} implementation of services
    //@return {Any} provider
    register: function(provider) {
      const registry = this.serviceRegistry;
      // get concrete class of provider and enumerate its services
      I.describe(provider).enumerateServices(provider, serviceClass => {
        const serviceName = serviceClass.getName();
        if (!registry.lookup(serviceName)) {
          registry.store(provider, serviceName);
        }
      });
      return provider;
    },
    //@ Collect providers for service requirements.
    //@param requirements_ {Std.Table} identify service classes
    //@return {Std.Table} new table, with same keys, that identifies providers
    //@except when a required service cannot be not provided
    satisfy: function(requirements_) {
      const registry = this.serviceRegistry;
      const satisfactions_ = I.createTable();
      for (let key in requirements_) {
        const service = requirements_[key], serviceClass = I.resolveService(service);
        const serviceName = serviceClass && serviceClass.getName();
        satisfactions_[key] = registry.lookup(serviceName) || this.assert(false);
      }
      return satisfactions_;
    },
    //@ Warn about a situation. The warning is entended for developers, not for end users.
    //@param situation {any} JavaScript object or value that describes situation, e.g. failure
    //@return nothing
    warn: I.doNothing
  });
  I.share({
    //@ Resolve service description to class.
    //@param service {string|Std.Logic.Namespace|Std.Logic.Class} service description
    //@return {Std.Logic.Class?} service class or nothing
    resolveService: function(service) {
      const logical = typeof service === 'string' ? I.resolveLogical(service) : service;
      const serviceClass = Namespace.describes(logical) ? logical.lookup('Service') : logical;
      if (Class.describes(serviceClass) && serviceClass.isService()) {
        return serviceClass;
      }
    }
  });
  I.setup(() => {
    // $rt instance constant conveys runtime system singleton
    I._.BaseObject.lockInstanceConstants({ $rt: I.$.create() });
  });
})