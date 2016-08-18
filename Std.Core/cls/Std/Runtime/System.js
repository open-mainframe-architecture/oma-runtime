function refine(I) {
  "use strict";
  I.refine({
    //@ Avoid selection of promised service provider.
    selectProvider: function(serviceClass) {
      const provider = I.$former.selectProvider.call(this, serviceClass);
      // a promise to provide the service is not an actual service provider
      if (!I.isThenable(provider)) {
        return provider;
      }
    },
    //@ Enhance service registration with promised providers.
    updateProvider: function(serviceClass, provider) {
      // either register implementation or a promise to implement the service
      I.$former.updateProvider.call(this, serviceClass, provider);
      if (I.isThenable(provider)) {
        provider.then(implementation => {
          // update registered service provider again when implementation is available
          I.$former.updateProvider.call(this, serviceClass, implementation);
        });
      }
    }
  });
  I.know({
    //@ Schedule closure after control has been given back to global event loop.
    //@param callback {function} code to schedule
    //@return nothing
    asap: function(callback) {
      setTimeout(callback, 0);
    },
    //@ Warn about a situation. The warning is intended for developers, not for end users.
    //@param situation {*} JavaScript object or value that describes situation
    //@return nothing
    warn: I.doNothing
  });
}