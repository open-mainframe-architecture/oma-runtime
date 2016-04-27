//@ A Node.js runtime environment.
'Service'.subclass(['Std.Core.Runtime'], I => {
  "use strict";
  /*global require*/
  I.am({
    Abstract: false
  });
  I.know({
    createSubsidiaryEmitter: function() {
      return require('child_process').fork(require.main.filename);
    },
    destroySubsidiaryEmitter: function(emitter) {
      emitter.kill();
    }
  });
  I.nest({
    //@ Streams that cross between Node.js environments.
    Crossover: 'Environment.Service._.Crossover'.subclass(I => {
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