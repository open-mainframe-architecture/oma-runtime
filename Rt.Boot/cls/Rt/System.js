//@ The runtime system manages service providers.
'Std.BaseObject'.subclass(function (I) {
  "use strict";
  I.am({
    Final: true,
    //@ The runtime system registers itself as a provider.
    Service: true
  });
  I.have({
    //@{Rt.Timestamp} moment when this runtime was created
    bootTimestamp: null,
    //@{Std.Dictionary} registry maps service to one or more service providers
    serviceRegistry: null
  });
  I.know({
    unveil: function () {
      I.$super.unveil.call(this);
      this.serviceRegistry = I._.Std._.Dictionary.create();
      this.register(this);
    },
    //@ Get moment when runtime system was created.
    //@return {Rt.Timestamp} JavaScript date
    getBootTimestamp: function () {
      return this.bootTimestamp;
    },
    //@ Test whether this runtime system provides a service.
    //@param service {string|Std.Logic.Namespace|Std.Logic.Class} service to test
    //@return {boolean} true if service is provided, otherwise false
    provides: function (service) {
      var serviceClass = I.resolveService(service);
      return !!serviceClass && this.serviceRegistry.containsIndex(serviceClass.getName());
    },
    //@ Register new service provider.
    //@param provider {Any} implementation of services
    //@return {Any} provider
    register: function (provider) {
      var registry = this.serviceRegistry;
      // get concrete class of provider and enumerate its services
      I.describe(provider).enumerateServices(provider, function (serviceClass) {
        var serviceName = serviceClass.getName();
        var providers = registry.lookup(serviceName);
        if (providers) {
          // harmless to register twice or more
          if (providers.indexOf(provider) < 0) {
            providers.push(provider);
          }
        } else {
          registry.store([provider], serviceName);
        }
      });
      return provider;
    },
    //@ Collect providers for service requirements.
    //@param requirements_ {Rt.Table} identify service classes
    //@return {Rt.Table} new table, with same keys, that identifies providers
    //@except when a required service cannot be not provided
    satisfy: function (requirements_) {
      var registry = this.serviceRegistry;
      var satisfactions_ = I.createTable();
      for (var key in requirements_) {
        var service = requirements_[key];
        var serviceClass = I.resolveService(service);
        var serviceName = serviceClass && serviceClass.getName();
        var providers = registry.lookup(serviceName) || this.bad('requirement', service);
        satisfactions_[key] = providers[0];
      }
      return satisfactions_;
    }
  });
  I.share({
    //@ Resolve service description to class.
    //@param service {string|Std.Logic.Namespace|Std.Logic.Class} service description
    //@return {Std.Logic.Class?} service class or nothing
    resolveService: function (service) {
      var logical = typeof service === 'string' ? I._.Root.resolve(service) : service;
      var serviceClass;
      if (I._.Std._.Logic._.Namespace.describes(logical)) {
        serviceClass = logical.lookup('Service');
      } else {
        serviceClass = logical;
      }
      if (I._.Std._.Logic._.Class.describes(serviceClass) && serviceClass.isService()) {
        return serviceClass;
      }
    }
  });
  I.setup(function () {
    // $rt instance constant conveys runtime system singleton
    I._.Std._.BaseObject.lockInstanceConstants({ $rt: I.$.create() });
  });
})