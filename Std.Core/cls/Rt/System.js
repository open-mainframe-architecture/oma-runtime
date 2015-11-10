function refine(I) {
  "use strict";
  I.know({
    // schedule closure after control has been given back to global event loop
    asap: function(closure) {
      // setImmediate would be better, but it is not universally supported
      setTimeout(closure, 0);
    },
    // enumerate all providers of a service
    enumerateProviders: function(service, visit) {
      var serviceClass = I.resolveService(service);
      if (serviceClass) {
        var providers = this.serviceRegistry.lookup(serviceClass.getName());
        if (providers) {
          return providers.enumerate(visit);
        }
      }
      return true;
    },
    // uptime in number of seconds
    getUptime: function() {
      return (Date.now() - this.bootTimestamp.getTime()) / 1000;
    },
    // get provider for service
    provide: function(service) {
      var serviceClass = I.resolveService(service);
      if (serviceClass) {
        var providers = this.serviceRegistry.lookup(serviceClass.getName());
        if (providers) {
          return providers[0];
        }
      }
    }
  });
}