//@ Common runtime environment of web browsers and workers.
'Environment.Service'.subclass(['Std.Core.Runtime'], {
  constants$: 'Std.Runtime.Constants'
}, function(I) {
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
    }
  });
  I.nest({
    //@ Message streams between web browser/worker and worker/worker environments.
    MessageStream: 'Environment.Service._.MessageStream'.subclass(function(I) {
      I.am({
        Abstract: false
      });
      I.know({
        install: function(receiver) {
          this.emitter.addEventListener('message', receiver);
        },
        receive: function(webEvent) {
          return webEvent.data;
        },
        send: function(it) {
          this.emitter.postMessage(it);
        }
      });
    })
  });
})