//@ Common runtime environment of web browsers and workers.
'Service'.subclass(['Std.Core.Runtime'], {
  constants$: 'Std.Runtime.Constants'
}, I => {
  "use strict";
  /*global Worker*/
  I.know({
    createSubsidiaryEmitter: function() {
      // create worker that loads same version of runtime as this environment
      return new Worker(I.constants$.bundleLocation);
    },
    destroySubsidiaryEmitter: function(emitter) {
      // terminate worker to clean up
      emitter.terminate();
    },
    spawnCrossover: function(manager, emitter) {
      return I.Crossover.spawn(manager, emitter);
    }
  });
  I.nest({
    //@ Streams that cross between web browser/worker and worker/worker environments.
    Crossover: 'Service.$._.Crossover'.subclass(I => {
      I.am({
        Abstract: false
      });
      I.know({
        install: function(emitter, receiver) {
          emitter.addEventListener('message', receiver);
        },
        receive: function(webEvent) {
          return webEvent.data;
        },
        send: function(emitter, it) {
          emitter.postMessage(it);
        }
      });
    })
  });
})