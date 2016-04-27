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
    //@ Get provider for service.
    //@param service {string|Std.Logic.Namespace|Std.Logic.Class} service to enumerate
    //@return {Any?} service provider or nothing if service is not provided
    provide: function(service) {
      const serviceClass = I.resolveService(service);
      if (serviceClass) {
        const provider = this.serviceRegistry.lookup(serviceClass.getName());
        if (provider) {
          return provider;
        }
      }
    }
  });
}