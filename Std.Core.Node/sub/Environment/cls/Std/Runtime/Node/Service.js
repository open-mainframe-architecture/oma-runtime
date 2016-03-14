//@ A Node.js runtime environment.
'Environment.Service'.subclass(['Std.Core.Runtime'], function(I) {
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
    //@ Message streams between Node.js environments.
    MessageStream: 'Environment.Service._.MessageStream'.subclass(function(I) {
      I.am({
        Abstract: false
      });
      I.know({
        install: function(receiver) {
          this.emitter.on('message', receiver);
        },
        receive: I.returnArgument,
        send: function(it) {
          this.emitter.send(it);
        }
      });
    })
  });
})