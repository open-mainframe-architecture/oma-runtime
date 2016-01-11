'Std.BaseObject'.subclass(function (I) {
  "use strict";
  // I describe how the runtime system manages service providers.
  I.am({
    Final: true,
    Service: true
  });
  I.have({
    // moment when this runtime was created
    bootTimestamp: null,
    // dictionary with service providers
    serviceRegistry: null
  });
  I.know({
    unveil: function () {
      I.$super.unveil.call(this);
      this.serviceRegistry = I._.Std._.Dictionary.create();
      this.register(this);
    },
    getBootTimestamp: function () {
      return this.bootTimestamp;
    },
    // test whether this runtime system provides a service
    provides: function (service) {
      var serviceClass = I.resolveService(service);
      return !!serviceClass && this.serviceRegistry.containsIndex(serviceClass.getName());
    },
    // register new service provider
    register: function (provider) {
      var registry = this.serviceRegistry;
      // get concrete class of provider and enumerate its services
      I.describe(provider).enumerateServices(provider, function (serviceClass) {
        var serviceName = serviceClass.getName();
        var providers = registry.lookup(serviceName);
        if (providers) {
          providers.push(provider);
        } else {
          registry.store([provider], serviceName);
        }
      });
      return provider;
    },
    // collect providers for service requirements
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
    // resolve service description to class
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