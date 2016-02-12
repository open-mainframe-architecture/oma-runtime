function refine(I) {
  "use strict";
  I.know({
    //@ Schedule closure after control has been given back to global event loop.
    //@param closure {Rt.Closure} code to schedule
    //@return nothing
    asap: function (closure) {
      // setImmediate would be better, but it is not universally supported
      setTimeout(closure, 0);
    },
    //@ Enumerate providers of a service.
    //@param service {string|Std.Logic.Namespace|Std.Logic.Class} service to enumerate
    //@param visit {Rt.Closure} called with provider and one-based index of service provider
    //@return {boolean} false if some visit returned false, otherwise true
    enumerateProviders: function (service, visit) {
      var serviceClass = I.resolveService(service);
      if (serviceClass) {
        var providers = this.serviceRegistry.lookup(serviceClass.getName());
        if (providers) {
          return providers.enumerate(visit, 1);
        }
      }
      return true;
    },
    //@ Get uptime in number of seconds.
    //@return {number} number of seconds since this runtime system booted
    getUptime: function () {
      return (Date.now() - this.bootTimestamp.getTime()) / 1000;
    },
    //@ Get provider for service.
    //@param service {string|Std.Logic.Namespace|Std.Logic.Class} service to enumerate
    //@return {Any?} service provider or nothing if service is not provided
    provide: function (service) {
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