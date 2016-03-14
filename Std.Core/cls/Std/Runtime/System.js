function refine(I) {
  "use strict";
  I.know({
    //@ Schedule closure after control has been given back to global event loop.
    //@param closure {Std.Closure} code to schedule
    //@return nothing
    asap: function(closure) {
      // setImmediate would be better, but it is not universally supported
      setTimeout(closure, 0);
    },
    //@ Enumerate providers of a service.
    //@param service {string|Std.Logic.Namespace|Std.Logic.Class} service to enumerate
    //@param visit {Std.Closure} called with provider and one-based numeric index
    //@return {boolean} false if some visit returned false, otherwise true
    enumerateProviders: function(service, visit) {
      var serviceClass = I.resolveService(service);
      if (serviceClass) {
        var providers = this.serviceRegistry.lookup(serviceClass.getName());
        if (providers) {
          return providers.enumerate(visit, 1);
        }
      }
      return true;
    },
    //@ Get provider for service.
    //@param service {string|Std.Logic.Namespace|Std.Logic.Class} service to enumerate
    //@return {Any?} service provider or nothing if service is not provided
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