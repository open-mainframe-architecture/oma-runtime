//@ A Node.js runtime environment.
'Service'.subclass(['Std.Core.Runtime'], {
  constants$: 'Std.Runtime.Constants'
}, I => {
  "use strict";
  /*global require*/
  I.am({
    Abstract: false
  });
  I.know({
    createSubsidiaryEmitter: function() {
      return require('child_process').fork(I.constants$.bundleLocation);
    },
    destroySubsidiaryEmitter: function(emitter) {
      emitter.kill();
    },
    spawnCrossover: function(manager, emitter) {
      return I.Crossover.spawn(manager, emitter);
    }
  });
  I.nest({
    //@ Streams that cross between Node.js environments.
    Crossover: 'Service.$._.Crossover'.subclass(I => {
      I.am({
        Abstract: false
      });
      I.know({
        install: function(emitter, receiver) {
          emitter.on('message', receiver);
        },
        receive: I.returnArgument,
        send: function(emitter, it) {
          emitter.send(it);
        }
      });
    })
  });
})