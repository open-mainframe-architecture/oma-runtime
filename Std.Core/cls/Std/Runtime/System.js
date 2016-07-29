function refine(I) {
  "use strict";
  I.know({
    //@ Schedule closure after control has been given back to global event loop.
    //@param closure {function} code to schedule
    //@return nothing
    asap: function(closure) {
      // setImmediate would be better, but it is not universally supported
      setTimeout(closure, 0);
    },
    //@ Get provider for service.
    //@param service {string|Std.Logic.Namespace|Std.Logic.Class} service to enumerate
    //@return {object?} service provider or nothing if service is not provided
    provide: function(service) {
      const serviceClass = this.resolveService(service);
      if (serviceClass) {
        const provider = this.serviceRegistry.get(serviceClass);
        if (provider) {
          return provider;
        }
      }
    },
    //@ Warn about a situation. The warning is intended for developers, not for end users.
    //@param situation {*} JavaScript object or value that describes situation
    //@return nothing
    warn: I.doNothing
  });
}